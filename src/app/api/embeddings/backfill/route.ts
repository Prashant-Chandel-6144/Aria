import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { initVectorDb, upsertEntityEmbedding } from "@/lib/embeddings";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Initialize the vector database table
    await initVectorDb();

    // 2. Fetch all corsair_entities for the current user (connected accounts)
    const userAccounts = await prisma.corsairAccount.findMany({
      where: { tenantId: userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a: { id: string }) => a.id);

    if (accountIds.length === 0) {
      return NextResponse.json({
        message: "No connected accounts found. Connect integrations first.",
        count: 0,
      });
    }

    const entities = await prisma.corsairEntity.findMany({
      where: {
        accountId: { in: accountIds },
        entityType: { in: ["messages", "events", "calendar_event"] },
      },
    });

    let count = 0;

    for (const entity of entities) {
      const data = (entity.data || {}) as any;
      let text = "";

      if (entity.entityType === "messages") {
        const subject = data.subject || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "subject")?.value || "";
        const from = data.from || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "from")?.value || "";
        const to = data.to || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "to")?.value || "";
        const snippet = data.snippet || "";
        const body = data.body || "";

        text = `Subject: ${subject}\nFrom: ${from}\nTo: ${to}\nSnippet: ${snippet}\nBody: ${body}`;
      } else if (entity.entityType === "events" || entity.entityType === "calendar_event") {
        const summary = data.summary || "(No Title)";
        const description = data.description || "";
        const location = data.location || "";
        const start = data.start?.dateTime || data.start?.date || "";
        const end = data.end?.dateTime || data.end?.date || "";

        text = `Event: ${summary}\nLocation: ${location}\nDescription: ${description}\nStart: ${start}\nEnd: ${end}`;
      }

      if (text) {
        // Run embedding upsert
        await upsertEntityEmbedding(
          entity.id,
          entity.accountId,
          entity.entityType,
          text
        );
        count++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Vector database initialized and ${count} entities backfilled.`,
      count,
    });
  } catch (error: any) {
    console.error("Backfill failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize and backfill embeddings" },
      { status: 500 }
    );
  }
}
