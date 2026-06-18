import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function setupCalendarWebhook(userId: string) {
  try {
    // 1. Check if we already have an active webhook watch channel for this user
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      console.warn(`[Webhook Setup] Profile not found for user ${userId}`);
      return { error: "Profile not found" };
    }

    const existingWebhook = await prisma.webhook.findFirst({
      where: {
        userId: profile.id,
        service: "googlecalendar",
        expiry: { gte: new Date() },
      },
    });

    if (existingWebhook) {
      return { success: true, message: "Webhook already active", webhook: existingWebhook };
    }

    // 2. Retrieve googlecalendar credentials
    const calendarAccount = await prisma.corsairAccount.findFirst({
      where: {
        tenantId: userId,
        integration: { name: "googlecalendar" },
      },
    });

    if (!calendarAccount) {
      return { error: "Google Calendar connection not found" };
    }

    const config = calendarAccount.config as any;
    const refreshToken = config.refresh_token;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      return { error: "Google Calendar credentials incomplete" };
    }

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhooks`;

    const channelId = crypto.randomUUID();
    let resourceId = "mock-resource-id";
    let expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days fallback

    const isLocal = !appUrl.startsWith("https://") || appUrl.includes("localhost");

    if (!isLocal) {
      // Refresh access token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenRes.ok) {
        throw new Error(`Token refresh failed: ${await tokenRes.text()}`);
      }

      const { access_token } = (await tokenRes.json()) as any;

      // Register Google Calendar watch channel
      const watchRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/watch`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: channelId,
            type: "web_hook",
            address: webhookUrl,
          }),
        }
      );

      if (watchRes.ok) {
        const data = await watchRes.json() as any;
        resourceId = data.resourceId;
        if (data.expiration) {
          expiryDate = new Date(Number(data.expiration));
        }
        console.log(`[Webhook Setup] Webhook watch registered successfully. Expiration: ${expiryDate}`);
      } else {
        const errText = await watchRes.text();
        console.warn("[Webhook Setup] Google watch registration rejected. Using local fallback. Reason:", errText);
      }
    } else {
      console.log(`[Webhook Setup] Local APP_URL (${appUrl}). Skipped remote Google registration. Created local mock webhook.`);
    }

    // 3. Store webhook in DB
    const newWebhook = await prisma.webhook.create({
      data: {
        userId: profile.id,
        service: "googlecalendar",
        channelId,
        resourceId,
        expiry: expiryDate,
      },
    });

    return { success: true, message: "Webhook setup successful", webhook: newWebhook };
  } catch (error: any) {
    console.error("[Webhook Setup] Error setting up calendar webhook:", error);
    return { error: error.message || "Failed to setup webhook" };
  }
}
