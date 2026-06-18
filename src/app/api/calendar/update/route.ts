// ─── PATCH /api/calendar/update ───────────────────────────────────────────────
// Updates an existing calendar event for the authenticated user.
//
// Backend Implementation TODO:
// 1. Get the authenticated user session via auth.api.getSession()
// 2. Parse the request body for the event ID and updated fields:
//    - id (string, required) — the calendar event ID (maps to CorsairEntity.entityId)
//    - summary, description, location, start, end, allDay, colorId, attendees
//      (all optional — only send fields that changed)
// 3. Use corsair.withTenant(userId).googlecalendar.api.calendar.updateEvent()
//    to update the event in Google Calendar
// 4. The CorsairEntity record will be updated automatically via Corsair sync
//
// Expected Request Body:
// {
//   id: string,
//   summary?: string,
//   description?: string,
//   location?: string,
//   start?: string,
//   end?: string,
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

export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const {
      id,
      summary,
      description,
      location,
      start,
      end,
      allDay,
      colorId,
      attendees,
    } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing event ID" },
        { status: 400 }
      );
    }

    const eventData: any = {};
    if (summary !== undefined) eventData.summary = summary;
    if (description !== undefined) eventData.description = description;
    if (location !== undefined) eventData.location = location;
    if (start !== undefined) {
      eventData.start = allDay ? { date: start.split("T")[0] } : { dateTime: start };
    }
    if (end !== undefined) {
      eventData.end = allDay ? { date: end.split("T")[0] } : { dateTime: end };
    }
    if (colorId !== undefined) eventData.colorId = colorId;
    if (attendees !== undefined) {
      eventData.attendees = attendees.map((email: string) => ({ email }));
    }

    await ensureCorsairCredentials(userId);

    const result = await corsair
      .withTenant(userId)
      .googlecalendar.api.events.update({
        id,
        event: eventData,
      });

    return NextResponse.json({
      success: true,
      event: mapCorsairEventToCalendarEvent(result)
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/calendar/update:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
