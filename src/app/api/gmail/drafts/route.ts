import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { corsair } from "@/server/corsair";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const listResult = await corsair
      .withTenant(session.user.id!)
      .gmail.api.drafts.list({
        maxResults: 20,
      });

    const draftItems = listResult.drafts ?? [];

    const drafts = await Promise.all(
      draftItems.slice(0, 10).map(async (draft) => {
        if (!draft.id) return null;
        try {
          const full = await corsair
            .withTenant(session.user.id!)
            .gmail.api.drafts.get({
              id: draft.id,
              format: "metadata",
            });

          const msg = full.message ?? {};
          const headers_list = msg.payload?.headers ?? [];
          const getHeader = (name: string) =>
            headers_list.find(
              (h) =>
                h.name?.toLowerCase() === name.toLowerCase()
            )?.value ?? "";

          return {
            id: full.id ?? draft.id,
            messageId: msg.id,
            threadId: msg.threadId,
            snippet: msg.snippet ?? "",
            subject: getHeader("Subject") || "(no subject)",
            from: getHeader("From"),
            to: getHeader("To"),
            date: getHeader("Date"),
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      drafts: drafts.filter(Boolean),
    });
  } catch (error: any) {
    console.error("Gmail drafts fetch error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}
