import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { corsair } from "@/server/corsair";
import { auth } from "@/lib/auth";

/**
 * POST /api/gmail/mark
 * Body: { id: string; unread: boolean }
 *
 * Marks a Gmail message as read (removes UNREAD label) or unread (adds UNREAD label).
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let id: string;
  let unread: boolean | undefined;
  let starred: boolean | undefined;

  try {
    const body = await req.json();
    id = body.id;
    unread = body.unread !== undefined ? Boolean(body.unread) : undefined;
    starred = body.starred !== undefined ? Boolean(body.starred) : undefined;
    if (!id) throw new Error("Missing message id");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const addLabelIds: string[] = [];
    const removeLabelIds: string[] = [];

    if (unread !== undefined) {
      if (unread) addLabelIds.push("UNREAD");
      else removeLabelIds.push("UNREAD");
    }

    if (starred !== undefined) {
      if (starred) addLabelIds.push("STARRED");
      else removeLabelIds.push("STARRED");
    }

    await corsair
      .withTenant(session.user.id!)
      .gmail.api.messages.modify({
        id,
        addLabelIds,
        removeLabelIds,
      });

    return NextResponse.json({ success: true, id, unread, starred });
  } catch (error: any) {
    console.error("Gmail mark error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to update message" },
      { status: 500 }
    );
  }
}
