export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "@/server/corsair";
import { ensureCorsairCredentials } from "@/server/corsair-setup";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
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

  const body = await req.json();
  const { query } = body;
  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

  try {
    await ensureCorsairCredentials(userId);

    // Get user profile to link conversation
    let profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      profile = await prisma.userProfile.create({
        data: {
          userId,
          displayName: user?.name || "",
          avatarUrl: user?.image || "",
          gmailAddress: user?.email || "",
        },
      });
    }

    // Find or create active conversation
    let conversation = await prisma.agentConversation.findFirst({
      where: { userId: profile.id },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.agentConversation.create({
        data: {
          userId: profile.id,
          title: "Aria Assistant Chat",
        },
      });
    }

    // Store user message
    await prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: query,
      },
    });

    const tenantCorsair = corsair.withTenant(userId);
    const provider = new OpenAIAgentsProvider();
    const tools = provider.build({ corsair: tenantCorsair, tenantId: userId, tool });

    const agent = new Agent({
      name: "Aria-agent",
      model: "gpt-4o-mini",
      instructions:
        "You are Aria, an intelligent productivity assistant with access to the user's workspace (Gmail, Google Calendar, GitHub, etc.).\n\n" +
        "You have access to Corsair tools. Use list_operations to discover available APIs, get_schema to understand required arguments, and run_script to execute them. The `corsair` variable in run_script is already scoped to the current user.\n\n" +
        "### EMAIL ACTIONS & HUMAN-IN-THE-LOOP FLOW:\n" +
        "1. When a user asks you to compose, write, or send an email, you MUST NOT send it directly. Instead, you MUST first create a draft using `corsair.gmail.api.drafts.create({ draft: { message: { raw } } })`. Generate the MIME message raw text and base64url-encode it correctly (standard base64, replace + with -, / with _, remove trailing =).\n" +
        "2. Once the draft is successfully created, output the draft summary (To, Subject, Preview/Body) and finish your response with the exact token format: `[DRAFT_CREATED: <draft_id>]` where <draft_id> is the ID of the created draft. Do not include spaces inside the brackets. This token triggers the frontend approval panel.\n" +
        "3. If the user approves (e.g. they say 'Yes, send it', 'Approve draft', 'Go ahead'), look up the draft ID (either from your conversation history, or by listing drafts) and send the draft using `corsair.gmail.api.drafts.send({ id: '<draft_id>' })`. Confirm to the user that it has been sent.\n\n" +
        "For Google Calendar, use paths like `googlecalendar.api.events.getMany`, `googlecalendar.api.events.create`, etc. Example:\n" +
        "`const res = await corsair.googlecalendar.api.events.getMany({ timeMin: new Date().toISOString(), singleEvents: true }); return res.items;`\n\n" +
        "If you receive an AuthMissingError, 'not connected', or 'account not found' error for an integration, tell the user to connect that service on the Integrations page: /dashboard?tab=profile&sub=integrations\n\n" +
        "Answer their questions, perform actions, and format responses nicely in markdown. Keep it concise, helpful, and premium.",
      tools,
    });

    const result = await run(agent, query);

    // Store agent response
    await prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: result.finalOutput || "",
      },
    });

    // Touch conversation to update updatedAt
    await prisma.agentConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ response: result.finalOutput });
  } catch (error: any) {
    console.error("Agent execution failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to run agent" },
      { status: 500 }
    );
  }
}
