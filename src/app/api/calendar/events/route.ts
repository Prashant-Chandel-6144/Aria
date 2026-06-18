// ─── GET /api/calendar/events ─────────────────────────────────────────────────
// Fetches all calendar events for the authenticated user.
//
// Backend Implementation TODO:
// 1. Get the authenticated user session via auth.api.getSession()
// 2. Use corsair.withTenant(userId).googlecalendar.api.calendar.listEvents()
//    to fetch events from the connected Google Calendar account
// 3. Map the Corsair response to the CalendarEvent type defined in
//    src/features/calendar/types.ts
// 4. Support query params:
//    - timeMin (ISO 8601) — start of date range to fetch events
//    - timeMax (ISO 8601) — end of date range to fetch events
//    - maxResults (number) — limit the number of events returned
//    - pageToken (string) — for pagination
//
// Expected Response Shape:
// {
//   events: CalendarEvent[],
//   nextPageToken?: string
// }
//
// The CalendarEvent type maps directly to the CorsairEntity model in schema.prisma:
//   - CorsairEntity.entityType = "calendar_event"
//   - CorsairEntity.data (Json) contains the event details (summary, start, end, etc.)
//   - CorsairEntity.entityId = the Google Calendar event ID
//   - CorsairEntity.accountId = the CorsairAccount ID for the Google Calendar integration
// ──────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { corsair } from "@/server/corsair";
import { ensureCorsairCredentials, hasOAuthTokens } from "@/server/corsair-setup";
import { mapCorsairEventToCalendarEvent, type CalendarEvent } from "@/features/calendar/types";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { setupCalendarWebhook } from "@/server/calendar-webhook";

const CALENDAR_EVENT_TYPES = ["calendar_event", "events"] as const;

function mapDbEntityToCalendarEvent(entity: {
  id: string;
  entityId: string;
  accountId: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  data: unknown;
}): CalendarEvent {
  const data = (entity.data || {}) as Record<string, any>;
  const startStr =
    data.start?.dateTime || data.start?.date || data.start || "";
  const endStr = data.end?.dateTime || data.end?.date || data.end || "";
  const allDay =
    data.allDay !== undefined
      ? data.allDay
      : !data.start?.dateTime && !!data.start?.date;

  return {
    id: entity.id,
    entityId: entity.entityId,
    entityType: "calendar_event",
    accountId: entity.accountId,
    version: entity.version,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
    summary: data.summary || "(No Title)",
    description: data.description || undefined,
    location: data.location || undefined,
    start: startStr,
    end: endStr,
    allDay,
    status: data.status || "confirmed",
    organizer: data.organizer || undefined,
    attendees: data.attendees || undefined,
    recurrence: data.recurrence || undefined,
    colorId: data.colorId || undefined,
    htmlLink: data.htmlLink || undefined,
    conferenceData: data.conferenceData || undefined,
  };
}

function filterEventsByRange(
  events: CalendarEvent[],
  timeMin?: string,
  timeMax?: string
): CalendarEvent[] {
  let filtered = events;
  if (timeMin) {
    const minDate = new Date(timeMin).getTime();
    filtered = filtered.filter((e) => new Date(e.start).getTime() >= minDate);
  }
  if (timeMax) {
    const maxDate = new Date(timeMax).getTime();
    filtered = filtered.filter((e) => new Date(e.end).getTime() <= maxDate);
  }
  return filtered;
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin") || undefined;
  const timeMax = searchParams.get("timeMax") || undefined;

  await ensureCorsairCredentials(userId);

  const calendarAccount = await prisma.corsairAccount.findFirst({
    where: {
      tenantId: userId,
      integration: { name: "googlecalendar" },
    },
  });

  if (!calendarAccount || !hasOAuthTokens(calendarAccount.config)) {
    return NextResponse.json(
      {
        error: "Google Calendar is not connected. Connect it from Integrations in your profile.",
        events: [],
      },
      { status: 403 }
    );
  }

  // Setup webhook watch channel dynamically
  await setupCalendarWebhook(userId);

  try {
    // 1. Try to fetch live events from Google Calendar API via Corsair
    const response = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.getMany({
        timeMin,
        timeMax,
        singleEvents: true,
      });

    const liveEvents = response.items || [];

    const account = calendarAccount;

    for (const item of liveEvents) {
      if (!item.id) continue;
      const entityId = item.id;
      const uniqueId = `${account.id}_${entityId}`;

      await prisma.corsairEntity.upsert({
        where: { id: uniqueId },
        update: {
          data: item as any,
          version: String(item.sequence || 0),
          updatedAt: new Date(),
        },
        create: {
          id: uniqueId,
          accountId: account.id,
          entityId,
          entityType: "calendar_event",
          version: String(item.sequence || 0),
          data: item as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    const events = liveEvents.map(mapCorsairEventToCalendarEvent);
    return NextResponse.json({ events });
  } catch (liveError: any) {
    console.warn("Failed to fetch live events, falling back to database cache:", liveError);

    try {
      const dbEvents = await prisma.corsairEntity.findMany({
        where: {
          entityType: { in: [...CALENDAR_EVENT_TYPES] },
          account: {
            tenantId: userId,
            integration: { name: "googlecalendar" },
          },
        },
      });

      const events = filterEventsByRange(
        dbEvents.map(mapDbEntityToCalendarEvent),
        timeMin,
        timeMax
      );

      return NextResponse.json({ events });
    } catch (dbError: any) {
      console.error("Database fallback also failed:", dbError);
      return NextResponse.json(
        { error: "Failed to fetch calendar events from live API and database fallback." },
        { status: 500 }
      );
    }
  }
}
