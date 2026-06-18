import { setupCorsair } from "corsair";
import { corsair } from "./corsair";

/**
 * Sync OAuth client credentials from env into Corsair before API calls.
 * Without this, token refresh fails with "No client id or client secret"
 * even when the user has connected their account.
 */
export async function ensureCorsairCredentials(tenantId?: string): Promise<void> {
  try {
    await setupCorsair(corsair, {
      ...(tenantId ? { tenantId } : {}),
      credentials: {
        googlecalendar: {
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        gmail: {
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
    });
  } catch (err) {
    console.error("Failed to sync Corsair credentials:", err);
  }
}

export function hasOAuthTokens(config: unknown): boolean {
  if (!config || typeof config !== "object") return false;
  const c = config as Record<string, unknown>;
  return !!(c.access_token || c.refresh_token);
}
