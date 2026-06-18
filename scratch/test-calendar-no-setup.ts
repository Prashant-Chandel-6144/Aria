import "dotenv/config";
import { corsair } from "../src/server/corsair";

const TENANT_ID = "seoaFQgIk8wdmmKKX2wG4Ge1saSm3pQR";

async function main() {
  try {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    console.log("Fetching live events WITHOUT setupCorsair...");
    const response = await corsair
      .withTenant(TENANT_ID)
      .googlecalendar.api.events.getMany({
        timeMin,
        timeMax,
        singleEvents: true,
      });
    console.log("Live events count:", response.items?.length ?? 0);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
