import "dotenv/config";
import { prisma } from "../src/lib/db";
import { corsair } from "../src/server/corsair";
import { setupCorsair } from "corsair";

const TENANT_ID = "seoaFQgIk8wdmmKKX2wG4Ge1saSm3pQR";

async function main() {
  try {
    await setupCorsair(corsair, {
      credentials: {
        googlecalendar: {
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        gmail: {
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
    });

    const account = await prisma.corsairAccount.findFirst({
      where: {
        tenantId: TENANT_ID,
        integration: { name: "googlecalendar" },
      },
      include: { integration: true },
    });
    console.log("Calendar account:", account?.id, "config keys:", Object.keys(account?.config ?? {}));

    const events = await prisma.corsairEntity.findMany({
      where: {
        entityType: { in: ["calendar_event", "events"] },
        account: { tenantId: TENANT_ID },
      },
    });
    console.log("Cached events count:", events.length);
    if (events[0]) {
      console.log("Sample event data keys:", Object.keys((events[0].data as object) ?? {}));
      console.log("Sample summary:", (events[0].data as any)?.summary);
    }

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    console.log("Fetching live events...");
    const response = await corsair
      .withTenant(TENANT_ID)
      .googlecalendar.api.events.getMany({
        timeMin,
        timeMax,
        singleEvents: true,
      });
    console.log("Live events count:", response.items?.length ?? 0);
    if (response.items?.[0]) {
      console.log("First live event:", response.items[0].summary);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
