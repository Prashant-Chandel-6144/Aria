// ─── POST /api/calendar/create ────────────────────────────────────────────────
// Creates a new calendar event for the authenticated user.
//
// Backend Implementation TODO:
// 1. Get the authenticated user session via auth.api.getSession()
// 2. Parse the request body for event details:
//    - summary (string, required) — event title
//    - description (string, optional)
//    - location (string, optional)
//    - start (ISO 8601 string, required) — event start time
//    - end (ISO 8601 string, required) — event end time
//    - allDay (boolean, optional) — whether this is an all-day event
//    - colorId (string, optional) — Google Calendar color ID
//    - attendees (array of { email: string }, optional)
// 3. Use corsair.withTenant(userId).googlecalendar.api.calendar.createEvent()
//    to create the event in the user's Google Calendar
// 4. This will also create a CorsairEntity record in the database via Corsair sync
//
// Expected Request Body:
// {
//   summary: string,
//   description?: string,
//   location?: string,
//   start: string,
//   end: string,
//   allDay?: boolean,
//   colorId?: string,
//   attendees?: { email: string }[]
// }
//
// Expected Response:
// { success: true, event: CalendarEvent }
// ──────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { corsair } from "@/server/corsair";
import { ensureCorsairCredentials } from "@/server/corsair-setup";
import { mapCorsairEventToCalendarEvent } from "@/features/calendar/types";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }
    const {
      summary,
      description,
      location,
      start,
      end,
      allDay,
      colorId,
      attendees,
    } = await req.json();

    const eventData = {
      summary,
      description,
      location,
      start: allDay ? { date: start.split("T")[0] } : { dateTime: start },
      end: allDay ? { date: end.split("T")[0] } : { dateTime: end },
      colorId,
      attendees: attendees ? attendees.map((email: string) => ({ email })) : undefined,
    };

    const userId = session.user.id;
    await ensureCorsairCredentials(userId);

    const result = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.create({
        event: eventData as any,
      });

    if (result && result.status === "confirmed") {
      return NextResponse.json({ success: true, event: mapCorsairEventToCalendarEvent(result) });
    } else {
      return NextResponse.json(
        { success: false, error: result },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error in POST /api/calendar/create:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
