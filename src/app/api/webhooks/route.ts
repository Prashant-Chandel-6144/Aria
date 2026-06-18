import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "corsair";
import { corsair } from "@/server/corsair";
import { prisma } from "@/lib/db";
import { upsertEntityEmbedding } from "@/lib/embeddings";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Classifies an email's priority using a cheap LLM.
 */
async function classifyEmailPriority(subject: string, body: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that prioritizes emails.
Analyze the subject and body of the following email and classify its priority level as one of: "HIGH", "MEDIUM", "LOW".
- HIGH: Urgent requests, meetings, important updates, messages requiring immediate action, or personal communications.
- MEDIUM: Newsletters you signed up for, normal work threads, non-urgent queries.
- LOW: Automated notifications, promotions, transactional receipts, social alerts, junk/spam.

Respond with exactly one word: HIGH, MEDIUM, or LOW.`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\nBody: ${body}`,
        },
      ],
      temperature: 0,
      max_tokens: 10,
    });

    const result = response.choices[0]?.message?.content?.trim().toUpperCase();
    if (["HIGH", "MEDIUM", "LOW"].includes(result || "")) {
      return result!;
    }
    return "MEDIUM";
  } catch (error) {
    console.error("OpenAI email classification failed:", error);
    return "MEDIUM";
  }
}

export async function POST(req: NextRequest) {
  const headers = Object.fromEntries(req.headers.entries());
  const text = await req.text();
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());

  try {
    // 1. Process incoming webhook via Corsair
    const result = await processWebhook(corsair, headers, text, searchParams);
    console.log("Corsair processed webhook:", {
      plugin: result.plugin,
      action: result.action,
    });

    // 2. Scan for any entities created/updated in the last 15 seconds
    const recentEntities = await prisma.corsairEntity.findMany({
      where: {
        entityType: { in: ["messages", "events", "calendar_event"] },
        updatedAt: { gte: new Date(Date.now() - 15 * 1000) },
      },
    });

    for (const entity of recentEntities) {
      const data = (entity.data || {}) as any;

      if (entity.entityType === "messages") {
        // Email processing
        const subject = data.subject || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "subject")?.value || "";
        const from = data.from || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "from")?.value || "";
        const to = data.to || data.payload?.headers?.find((h: any) => h.name?.toLowerCase() === "to")?.value || "";
        const snippet = data.snippet || "";
        const body = data.body || "";

        // Check if already prioritized
        let priority = data.priority;
        if (!priority) {
          // LLM email prioritizing
          priority = await classifyEmailPriority(subject, snippet || body);
          
          // Store priority back to the entity's data column
          const updatedData = { ...data, priority };
          await prisma.corsairEntity.update({
            where: { id: entity.id },
            data: { data: updatedData },
          });
          console.log(`Email ${entity.id} prioritized as ${priority}`);
        }

        // Generate and upsert vector embedding
        const textToEmbed = `Subject: ${subject}\nFrom: ${from}\nTo: ${to}\nSnippet: ${snippet}\nBody: ${body}`;
        await upsertEntityEmbedding(
          entity.id,
          entity.accountId,
          "messages",
          textToEmbed
        );
      } else if (entity.entityType === "events" || entity.entityType === "calendar_event") {
        // Calendar event processing
        const summary = data.summary || "(No Title)";
        const description = data.description || "";
        const location = data.location || "";
        const start = data.start?.dateTime || data.start?.date || "";
        const end = data.end?.dateTime || data.end?.date || "";

        const textToEmbed = `Event: ${summary}\nLocation: ${location}\nDescription: ${description}\nStart: ${start}\nEnd: ${end}`;
        await upsertEntityEmbedding(
          entity.id,
          entity.accountId,
          entity.entityType,
          textToEmbed
        );
        console.log(`Calendar event ${entity.id} embedded successfully.`);
      }
    }

    return NextResponse.json(result.response || { success: true });
  } catch (error: any) {
    console.error("Webhook route error:", error);
    return NextResponse.json({ error: error.message || "Webhook error" }, { status: 500 });
  }
}
