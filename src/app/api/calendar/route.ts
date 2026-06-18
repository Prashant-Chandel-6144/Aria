// ─── GET /api/calendar ────────────────────────────────────────────────────────
// Legacy route — fetches calendar availability for the authenticated user.
//
// Backend Implementation TODO:
// 1. Get the authenticated user session via auth.api.getSession()
// 2. Use corsair.withTenant(userId).googlecalendar.api.calendar.getAvailability()
//    to check free/busy status for a given time range
// 3. Accept query params:
//    - timeMin (ISO 8601) — start of the time range
//    - timeMax (ISO 8601) — end of the time range
//
// This route is separate from /api/calendar/events — it only returns availability
// (free/busy blocks), not full event details.
//
// Expected Response Shape:
// {
//   availability: {
//     busy: { start: string, end: string }[]
//   }
// }
//
// Schema reference:
// - Corsair stores calendar data in the CorsairEntity table (schema.prisma)
// - CorsairEntity.entityType = "calendar_availability" or "calendar_event"
// - CorsairAccount links the user's tenant to the Google Calendar integration
// ──────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { corsair } from "@/server/corsair";
import { ensureCorsairCredentials } from "@/server/corsair-setup";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
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
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: "Missing timeMin or timeMax query parameters" },
        { status: 400 }
      );
    }

    await ensureCorsairCredentials(userId);

    const response = await corsair
      .withTenant(userId)
      .googlecalendar.api.calendar.getAvailability({
        timeMin,
        timeMax,
        items: [{ id: "primary" }],
      });

    const calendars = response.calendars || {};
    const busy = calendars.primary?.busy || Object.values(calendars)[0]?.busy || [];

    return NextResponse.json({
      availability: {
        busy: busy.map((b: any) => ({
          start: b.start || "",
          end: b.end || "",
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/calendar availability:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
