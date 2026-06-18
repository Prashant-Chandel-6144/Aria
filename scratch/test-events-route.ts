import "dotenv/config";
import { prisma } from "../src/lib/db";
import { corsair } from "../src/server/corsair";
import { mapCorsairEventToCalendarEvent } from "../src/features/calendar/types";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const userId = "seoaFQgIk8wdmmKKX2wG4Ge1saSm3pQR";
const currentDate = new Date();

const rangeStart = startOfWeek(startOfMonth(currentDate));
const rangeEnd = endOfWeek(endOfMonth(currentDate));
const timeMin = rangeStart.toISOString();
const timeMax = rangeEnd.toISOString();

console.log("Range:", timeMin, "to", timeMax);

async function testLive() {
  const response = await corsair
    .withTenant(userId)
    .googlecalendar.api.events.getMany({
      timeMin,
      timeMax,
      singleEvents: true,
    });
  const events = (response.items || []).map(mapCorsairEventToCalendarEvent);
  console.log("Live events:", events.length, events.map(e => e.summary));
}

async function testFallback() {
  const dbEvents = await prisma.corsairEntity.findMany({
    where: {
      entityType: "calendar_event",
      account: { tenantId: userId },
    },
  });
  console.log("Fallback calendar_event count:", dbEvents.length);

  const dbEvents2 = await prisma.corsairEntity.findMany({
    where: {
      entityType: { in: ["calendar_event", "events"] },
      account: { tenantId: userId },
    },
  });
  console.log("Fallback both types count:", dbEvents2.length);
}

async function main() {
  try {
    await testLive();
  } catch (e) {
    console.error("Live failed:", e);
    await testFallback();
  }
  await prisma.$disconnect();
}

main();
