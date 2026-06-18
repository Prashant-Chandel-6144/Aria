import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { corsair } from "@/server/corsair";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Support pagination via ?pageToken=<token> & advanced search query via ?q=<query>
  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get("pageToken") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  try {
    // List inbox messages — 10 per page
    const listResult = await corsair
      .withTenant(session.user.id!)
      .gmail.api.messages.list({
        maxResults: 10,
        labelIds: q ? undefined : ["INBOX"],
        pageToken,
        q,
      });

    const messageIds = listResult.messages ?? [];
    const nextPageToken: string | null = (listResult as any).nextPageToken ?? null;

    // Fetch full metadata for all 10 messages in parallel
    const messages = await Promise.all(
      messageIds.map(async (msg) => {
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
              (h) => h.name?.toLowerCase() === name.toLowerCase()
            )?.value ?? "";

          // Try to get priority from the local cache if available
          let priority = null;
          try {
            const dbEntity = await prisma.corsairEntity.findFirst({
              where: {
                entityId: msg.id,
                entityType: "messages",
              },
              select: { data: true },
            });
            priority = (dbEntity?.data as any)?.priority || null;
          } catch (dbErr) {
            // Fail silently, fallback to null priority
          }

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
            priority,
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
    console.error("Gmail inbox fetch error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch inbox messages" },
      { status: 500 }
    );
  }
}
