// Types mirroring the Prisma CorsairEntity/CorsairEvent schema
// for Google Calendar data stored via Corsair integration

export interface CalendarEvent {
  id: string;
  // Maps to CorsairEntity.entityId
  entityId: string;
  // Maps to CorsairEntity.entityType = "calendar_event"
  entityType: "calendar_event";
  // Maps to CorsairEntity.accountId
  accountId: string;
  // Maps to CorsairEntity.version
  version: string;
  // Timestamps from CorsairEntity
  createdAt: string;
  updatedAt: string;
  // The event data, stored in CorsairEntity.data (Json)
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO 8601 datetime
  end: string;   // ISO 8601 datetime
  allDay?: boolean;
  status: "confirmed" | "tentative" | "cancelled";
  organizer?: {
    email: string;
    displayName?: string;
    self?: boolean;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus: "accepted" | "declined" | "tentative" | "needsAction";
    self?: boolean;
  }[];
  recurrence?: string[];
  colorId?: string;
  htmlLink?: string;
  conferenceData?: {
    entryPoints?: {
      entryPointType: string;
      uri: string;
      label?: string;
    }[];
  };
}

export type CalendarView = "month" | "week" | "day";

export interface CalendarEventColor {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

// Color map for event categories
export const EVENT_COLORS: Record<string, CalendarEventColor> = {
  "1": { bg: "bg-sky-100 dark:bg-sky-500/15", border: "border-sky-300 dark:border-sky-500/30", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  "2": { bg: "bg-emerald-100 dark:bg-emerald-500/15", border: "border-emerald-300 dark:border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  "3": { bg: "bg-violet-100 dark:bg-violet-500/15", border: "border-violet-300 dark:border-violet-500/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "4": { bg: "bg-amber-100 dark:bg-amber-500/15", border: "border-amber-300 dark:border-amber-500/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "5": { bg: "bg-rose-100 dark:bg-rose-500/15", border: "border-rose-300 dark:border-rose-500/30", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  "6": { bg: "bg-indigo-100 dark:bg-indigo-500/15", border: "border-indigo-300 dark:border-indigo-500/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  "7": { bg: "bg-orange-100 dark:bg-orange-500/15", border: "border-orange-300 dark:border-orange-500/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  default: { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", dot: "bg-primary" },
};

export function getEventColor(colorId?: string): CalendarEventColor {
  if (colorId && EVENT_COLORS[colorId]) return EVENT_COLORS[colorId];
  return EVENT_COLORS.default;
}

export function mapCorsairEventToCalendarEvent(evt: any): CalendarEvent {
  const startStr = evt.start?.dateTime || evt.start?.date || "";
  const endStr = evt.end?.dateTime || evt.end?.date || "";
  const allDay = !evt.start?.dateTime && !!evt.start?.date;

  return {
    id: evt.id || "",
    entityId: evt.id || "",
    entityType: "calendar_event",
    accountId: evt.accountId || "",
    version: evt.version || "",
    createdAt: evt.created || new Date().toISOString(),
    updatedAt: evt.updated || new Date().toISOString(),
    summary: evt.summary || "(No Title)",
    description: evt.description,
    location: evt.location,
    start: startStr,
    end: endStr,
    allDay,
    status: evt.status || "confirmed",
    organizer: evt.organizer ? {
      email: evt.organizer.email || "",
      displayName: evt.organizer.displayName,
      self: evt.organizer.self
    } : undefined,
    attendees: evt.attendees ? evt.attendees.map((att: any) => ({
      email: att.email || "",
      displayName: att.displayName,
      responseStatus: att.responseStatus || "needsAction",
      self: att.self
    })) : undefined,
    recurrence: evt.recurrence,
    colorId: evt.colorId,
    htmlLink: evt.htmlLink,
    conferenceData: evt.conferenceData
  };
}
