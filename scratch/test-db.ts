import "dotenv/config";
import { prisma } from "../src/lib/db";

async function main() {
  try {
    const counts = await prisma.corsairEntity.groupBy({
      by: ["entityType"],
      _count: {
        id: true,
      },
    });
    console.log("CorsairEntity counts by type:", counts);

    const entities = await prisma.corsairEntity.findMany({
      take: 10,
    });
    console.log("Sample entities:", entities);

    const accounts = await prisma.corsairAccount.findMany({
      include: {
        integration: true,
      }
    });
    console.log("Connected accounts:", accounts);
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
