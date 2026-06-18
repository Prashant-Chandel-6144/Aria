"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasOAuthTokens } from "@/server/corsair-setup";
import { headers } from "next/headers";

export async function getProfileData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Fetch user, profile, and preferences
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userProfile: true,
      userPreference: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Auto-initialize profile if it doesn't exist
  let profile = user.userProfile;
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId,
        displayName: user.name || "",
        avatarUrl: user.image || "",
        gmailAddress: user.email || "",
      },
    });
  }

  // Auto-initialize preferences if they don't exist
  let preference = user.userPreference;
  if (!preference) {
    preference = await prisma.userPreference.create({
      data: {
        userId,
        theme: "system",
        readingPaneEnabled: true,
        readingPanePosition: "right",
        autoAdvance: false,
        defaultSendDelay: 5,
      },
    });
  }

  // Fetch connected integrations from CorsairAccount
  const connectedAccounts = await prisma.corsairAccount.findMany({
    where: { tenantId: userId },
    select: {
      id: true,
      createdAt: true,
      config: true,
      integration: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    },
    profile: {
      id: profile.id,
      displayName: profile.displayName || "",
      avatarUrl: profile.avatarUrl || "",
      gmailAddress: profile.gmailAddress || "",
    },
    preference: {
      id: preference.id,
      theme: preference.theme || "system",
      emailSignature: preference.emailSignature || "",
      readingPaneEnabled: preference.readingPaneEnabled,
      readingPanePosition: preference.readingPanePosition || "right",
      autoAdvance: preference.autoAdvance,
      defaultSendDelay: preference.defaultSendDelay ?? 5,
      keyboardShortcuts: preference.keyboardShortcuts || null,
    },
    integrations: connectedAccounts
      .filter((account: any) => hasOAuthTokens(account.config))
      .map((account: any) => account.integration.name),
  };
}

export async function updateProfile(data: {
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  gmailAddress?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Update user name / image if provided
  if (data.name !== undefined || data.avatarUrl !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && { image: data.avatarUrl }),
      },
    });
  }

  // Update userProfile
  await prisma.userProfile.update({
    where: { userId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.gmailAddress !== undefined && { gmailAddress: data.gmailAddress }),
    },
  });

  return { success: true };
}

export async function updatePreferences(data: {
  theme?: string;
  emailSignature?: string;
  readingPaneEnabled?: boolean;
  readingPanePosition?: string;
  autoAdvance?: boolean;
  defaultSendDelay?: number;
  keyboardShortcuts?: any;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  await prisma.userPreference.update({
    where: { userId },
    data: {
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.emailSignature !== undefined && { emailSignature: data.emailSignature }),
      ...(data.readingPaneEnabled !== undefined && { readingPaneEnabled: data.readingPaneEnabled }),
      ...(data.readingPanePosition !== undefined && { readingPanePosition: data.readingPanePosition }),
      ...(data.autoAdvance !== undefined && { autoAdvance: data.autoAdvance }),
      ...(data.defaultSendDelay !== undefined && { defaultSendDelay: data.defaultSendDelay }),
      ...(data.keyboardShortcuts !== undefined && { keyboardShortcuts: data.keyboardShortcuts }),
    },
  });

  return { success: true };
}

export async function disconnectIntegration(integrationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // Delete the corresponding CorsairAccount record by locating the integration by name
  const integration = await prisma.corsairIntegration.findFirst({
    where: { name: integrationId },
  });

  if (integration) {
    await prisma.corsairAccount.deleteMany({
      where: {
        tenantId: userId,
        integrationId: integration.id,
      },
    });
  }

  return { success: true };
}
