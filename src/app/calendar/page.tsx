import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CalendarViewComponent } from "@/components/Calendar/CalendarView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return <CalendarViewComponent isInline={false} />;
}
