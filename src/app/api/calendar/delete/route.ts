// ─── DELETE /api/calendar/delete ──────────────────────────────────────────────
// Deletes a calendar event for the authenticated user.
//
// Backend Implementation TODO:
// 1. Get the authenticated user session via auth.api.getSession()
// 2. Parse the request body for the event ID:
//    - id (string, required) — the calendar event ID (maps to CorsairEntity.entityId)
// 3. Use corsair.withTenant(userId).googlecalendar.api.calendar.deleteEvent()
//    to delete the event from Google Calendar
// 4. The CorsairEntity record will be removed automatically via Corsair sync
//
// Expected Request Body:
// { id: string }
//
// Expected Response:
// { success: true }
// ──────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import { corsair } from "@/server/corsair";
import { ensureCorsairCredentials } from "@/server/corsair-setup";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 },
    );
  }
  const { id } = await _req.json();
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing event ID" },
      { status: 400 },
    );
  }
  try {
    await ensureCorsairCredentials(userId);
    await corsair.withTenant(userId).googlecalendar.api.events.delete({ id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 400 },
    );
  }
  
}
