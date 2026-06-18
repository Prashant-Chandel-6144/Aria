import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    let conversation = await prisma.agentConversation.findFirst({
      where: { userId: profile.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!conversation) {
      // Create default conversation if none exists
      conversation = await prisma.agentConversation.create({
        data: {
          userId: profile.id,
          title: "Aria Assistant Chat",
        },
        include: {
          messages: true,
        },
      });
    }

    const messages = conversation.messages.map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Failed to load chat history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load chat history" },
      { status: 500 }
    );
  }
}
