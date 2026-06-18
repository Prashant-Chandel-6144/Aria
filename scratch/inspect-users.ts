import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });
  console.log("Users:", users);

  for (const user of users) {
    const accounts = await prisma.corsairAccount.findMany({
      where: { tenantId: user.id },
      include: { integration: true },
    });
    if (accounts.length === 0) continue;
    console.log(`\nUser ${user.email} (${user.id}):`);
    for (const a of accounts) {
      const config = a.config as Record<string, unknown>;
      const hasTokens = !!(config?.access_token || config?.refresh_token);
      console.log(`  - ${a.integration.name}: hasTokens=${hasTokens}`);
    }
  }
  await prisma.$disconnect();
}

main();
