"use client";

import React from "react";
import { withAuth } from "@/lib/auth-guards";
import { CalendarViewComponent } from "@/components/Calendar/CalendarView";

function CalendarPage() {
  return <CalendarViewComponent isInline={false} />;
}

export default withAuth(CalendarPage);
