import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const events = await prisma.corsairEntity.findMany({
    where: {
      account: { tenantId: "seoaFQgIk8wdmmKKX2wG4Ge1saSm3pQR" },
      entityType: { in: ["calendar_event", "events"] },
    },
    select: { entityType: true, entityId: true, data: true },
  });
  for (const e of events) {
    const d = e.data as any;
    console.log(e.entityType, d.summary, JSON.stringify(d.start));
  }
  await prisma.$disconnect();
}

main();
