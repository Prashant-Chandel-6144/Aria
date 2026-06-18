import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { corsair } from "@/server/corsair";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get("pageToken") ?? undefined;

  try {
    const listResult = await corsair
      .withTenant(userId)
      .gmail.api.messages.list({
        maxResults: 10,
        labelIds: ["SENT"],
        pageToken,
      });

    const messageIds = listResult.messages ?? [];
    const nextPageToken: string | null = (listResult as any).nextPageToken ?? null;

    const messages = await Promise.all(
      messageIds.map(async (msg) => {
        if (!msg.id) return null;
        try {
          const full = await corsair
            .withTenant(userId)
            .gmail.api.messages.get({
              id: msg.id,
              format: "metadata",
            });

          const headers_list = full.payload?.headers ?? [];
          const getHeader = (name: string) =>
            headers_list.find(
              (h) => h.name?.toLowerCase() === name.toLowerCase()
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
      nextPageToken,
    });
  } catch (error: any) {
    console.error("Gmail sent fetch error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch sent messages" },
      { status: 500 }
    );
  }
}
