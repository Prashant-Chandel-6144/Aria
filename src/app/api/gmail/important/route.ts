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
      .gmail.api.messages.list({
        maxResults: 20,
        labelIds: ["IMPORTANT"],
      });

    const messageIds = listResult.messages ?? [];

    const messages = await Promise.all(
      messageIds.slice(0, 10).map(async (msg) => {
        if (!msg.id) return null;
        try {
          const full = await corsair
            .withTenant(session.user.id!)
            .gmail.api.messages.get({
              id: msg.id,
              format: "metadata",
            });

          const headers_list = full.payload?.headers ?? [];
          const getHeader = (name: string) =>
            headers_list.find(
              (h) =>
                h.name?.toLowerCase() === name.toLowerCase()
            )?.value ?? "";

          return {
            id: full.id ?? msg.id,
            threadId: full.threadId,
            snippet: full.snippet ?? "",
            subject: getHeader("Subject") || "(no subject)",
            from: getHeader("From"),
            to: getHeader("To"),
            date: getHeader("Date"),
            labelIds: full.labelIds ?? [],
            isUnread: (full.labelIds ?? []).includes("UNREAD"),
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      messages: messages.filter(Boolean),
    });
  } catch (error: any) {
    console.error("Gmail important fetch error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch important messages" },
      { status: 500 }
    );
  }
}
