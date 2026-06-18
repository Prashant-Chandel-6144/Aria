"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Plus,
  Search,
  Home,
  LayoutGrid,
  Columns3,
  AlignJustify,
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/toggle-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  CalendarEvent,
  CalendarView,
  getEventColor,
} from "@/features/calendar/types";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { LogoutButton } from "@/components/logout-button";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  getHours,
  getMinutes,
  differenceInMinutes,
  parseISO,
} from "date-fns";

// ─── Utility helpers ─────────────────────────────────────────────────────────
function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((evt) => {
    const start = parseISO(evt.start);
    const end = parseISO(evt.end);
    if (evt.allDay) {
      const dayStart = startOfDay(day);
      return dayStart >= startOfDay(start) && dayStart < startOfDay(end);
    }
    return isSameDay(start, day);
  });
}

function formatTime(iso: string): string {
  const d = parseISO(iso);
  return format(d, "h:mm a");
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

// ─── Mini Sidebar Calendar ───────────────────────────────────────────────────
function MiniCalendar({
  currentDate,
  selectedDate,
  onSelectDate,
  events,
}: {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  events: CalendarEvent[];
}) {
  const [miniMonth, setMiniMonth] = useState(currentDate);
  const monthStart = startOfMonth(miniMonth);
  const monthEnd = endOfMonth(miniMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setMiniMonth(subMonths(miniMonth, 1))}
          className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-semibold text-foreground">
          {format(miniMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setMiniMonth(addMonths(miniMonth, 1))}
          className="p-1 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="text-center text-[10px] font-medium text-muted-foreground/60 py-1"
          >
            {wd}
          </div>
        ))}
      </div>
      {/* Days */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const inMonth = isSameMonth(day, miniMonth);
          const selected = isSameDay(day, selectedDate);
          const today = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "relative flex items-center justify-center h-7 w-full rounded-lg text-[11px] font-medium transition-all duration-150",
                !inMonth && "text-muted-foreground/30",
                inMonth && !selected && !today && "text-foreground/80 hover:bg-accent/50",
                today && !selected && "bg-primary/10 text-primary font-bold",
                selected && "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
              )}
            >
              {format(day, "d")}
              {dayEvents.length > 0 && !selected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((evt, i) => (
                    <span
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full",
                        getEventColor(evt.colorId).dot
                      )}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Upcoming events sidebar ─────────────────────────────────────────────────
function UpcomingEvents({
  events,
  onSelect,
}: {
  events: CalendarEvent[];
  onSelect: (evt: CalendarEvent) => void;
}) {
  const now = new Date();
  const upcoming = events
    .filter((evt) => parseISO(evt.start) >= now && !evt.allDay)
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime())
    .slice(0, 5);

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
        Upcoming
      </h3>
      {upcoming.length === 0 ? (
        <p className="text-xs text-muted-foreground/50">No upcoming events</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((evt) => {
            const color = getEventColor(evt.colorId);
            return (
              <button
                key={evt.id}
                onClick={() => onSelect(evt)}
                className={cn(
                  "w-full text-left p-2.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md",
                  color.bg,
                  color.border
                )}
              >
                <p
                  className={cn(
                    "text-xs font-semibold truncate",
                    color.text
                  )}
                >
                  {evt.summary}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(parseISO(evt.start), "EEE, MMM d")} ·{" "}
                  {formatTime(evt.start)}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Event Detail Dialog ─────────────────────────────────────────────────────
function EventDetailDialog({
  event,
  open,
  onClose,
  onDelete,
}: {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onDelete: (eventId: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  if (!event) return null;
  const color = getEventColor(event.colorId);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(event.id);
      toast.success("Event deleted", {
        description: `"${event.summary}" has been removed from your calendar.`,
      });
      onClose();
    } catch (err: unknown) {
      toast.error("Failed to delete event", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn("w-1 h-10 rounded-full shrink-0 mt-0.5", color.dot)}
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold leading-tight">
                {event.summary}
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {event.allDay
                  ? format(parseISO(event.start), "EEEE, MMMM d, yyyy")
                  : `${format(parseISO(event.start), "EEEE, MMMM d, yyyy")} · ${formatTimeRange(event.start, event.end)}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <Badge
              variant={
                event.status === "confirmed"
                  ? "default"
                  : event.status === "tentative"
                  ? "secondary"
                  : "destructive"
              }
              className="capitalize text-[10px]"
            >
              {event.status}
            </Badge>
            {event.allDay && (
              <Badge variant="outline" className="text-[10px]">
                All Day
              </Badge>
            )}
          </div>

          {/* Time */}
          {!event.allDay && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <span>{formatTimeRange(event.start, event.end)}</span>
              <span className="text-muted-foreground/40">
                ({differenceInMinutes(parseISO(event.end), parseISO(event.start))} min)
              </span>
            </div>
          )}

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Video call */}
          {event.conferenceData?.entryPoints?.[0] && (
            <div className="flex items-center gap-2.5 text-sm">
              <Video className="h-4 w-4 shrink-0 text-sky-500" />
              <a
                href={event.conferenceData.entryPoints[0].uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 dark:text-sky-400 hover:underline underline-offset-2 truncate"
              >
                {event.conferenceData.entryPoints[0].label ||
                  "Join video call"}
              </a>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center gap-2 mb-2.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-xs font-medium text-muted-foreground">
                  {event.attendees.length} attendee
                  {event.attendees.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-1.5">
                {event.attendees.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                        att.responseStatus === "accepted"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                          : att.responseStatus === "tentative"
                          ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                          : att.responseStatus === "declined"
                          ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {(att.displayName || att.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {att.displayName || att.email}
                        {att.self && (
                          <span className="ml-1 text-muted-foreground/50">
                            (you)
                          </span>
                        )}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium capitalize shrink-0",
                        att.responseStatus === "accepted" && "text-emerald-600 dark:text-emerald-400",
                        att.responseStatus === "tentative" && "text-amber-600 dark:text-amber-400",
                        att.responseStatus === "declined" && "text-rose-600 dark:text-rose-400",
                        att.responseStatus === "needsAction" && "text-muted-foreground/50"
                      )}
                    >
                      {att.responseStatus === "needsAction"
                        ? "pending"
                        : att.responseStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Organizer */}
          {event.organizer && (
            <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground/60">
              Organized by{" "}
              <span className="font-medium text-muted-foreground">
                {event.organizer.displayName || event.organizer.email}
              </span>
              {event.organizer.self && " (you)"}
            </div>
          )}

          {/* Delete action */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              id="delete-event"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Month View ──────────────────────────────────────────────────────────────
function MonthView({
  currentDate,
  events,
  onSelectEvent,
  onSelectDay,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (evt: CalendarEvent) => void;
  onSelectDay: (d: Date) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="px-2 py-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider text-center"
          >
            <span className="hidden md:inline">{wd}</span>
            <span className="md:hidden">{wd.slice(0, 3)}</span>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const allDayEvents = dayEvents.filter((e) => e.allDay);
          const timedEvents = dayEvents.filter((e) => !e.allDay);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={cn(
                "border-b border-r border-border/20 p-1 min-h-[80px] md:min-h-[100px] cursor-pointer transition-colors hover:bg-accent/20 group/cell",
                !inMonth && "bg-muted/20"
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-center mb-0.5">
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
                    !inMonth && "text-muted-foreground/30",
                    inMonth && !today && "text-foreground/70 group-hover/cell:text-foreground",
                    today &&
                      "bg-primary text-primary-foreground font-bold shadow-sm shadow-primary/20"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              {/* Events */}
              <div className="space-y-0.5">
                {allDayEvents.map((evt) => {
                  const color = getEventColor(evt.colorId);
                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className={cn(
                        "w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border transition-all hover:shadow-sm",
                        color.bg,
                        color.border,
                        color.text
                      )}
                    >
                      {evt.summary}
                    </button>
                  );
                })}
                {timedEvents.slice(0, 2).map((evt) => {
                  const color = getEventColor(evt.colorId);
                  return (
                    <button
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(evt);
                      }}
                      className={cn(
                        "w-full text-left flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate transition-all hover:bg-accent/40 group/evt"
                      )}
                    >
                      <span
                        className={cn("w-1.5 h-1.5 rounded-full shrink-0", color.dot)}
                      />
                      <span className="text-muted-foreground font-medium">
                        {formatTime(evt.start).replace(" ", "")}
                      </span>
                      <span className="text-foreground/70 font-medium truncate group-hover/evt:text-foreground">
                        {evt.summary}
                      </span>
                    </button>
                  );
                })}
                {timedEvents.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDay(day);
                    }}
                    className="text-[10px] font-medium text-primary hover:underline pl-1"
                  >
                    +{timedEvents.length - 2} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ───────────────────────────────────────────────────────────────
function WeekView({
  currentDate,
  events,
  onSelectEvent,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (evt: CalendarEvent) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Day headers */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="border-r border-border/20" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "text-center py-2.5 border-r border-border/20",
                isToday(day) && "bg-primary/5"
              )}
            >
              <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "text-lg font-bold mt-0.5 leading-none",
                  isToday(day) ? "text-primary" : "text-foreground/80"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        {/* All-day events row */}
        {days.some((d) => getEventsForDay(events, d).some((e) => e.allDay)) && (
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/30">
            <div className="border-r border-border/20 flex items-center justify-center">
              <span className="text-[9px] font-medium text-muted-foreground/40 uppercase">
                All Day
              </span>
            </div>
            {days.map((day) => {
              const allDayEvts = getEventsForDay(events, day).filter(
                (e) => e.allDay
              );
              return (
                <div
                  key={day.toISOString()}
                  className="border-r border-border/20 p-1 min-h-[28px]"
                >
                  {allDayEvts.map((evt) => {
                    const color = getEventColor(evt.colorId);
                    return (
                      <button
                        key={evt.id}
                        onClick={() => onSelectEvent(evt)}
                        className={cn(
                          "w-full text-left px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border transition-all hover:shadow-sm mb-0.5",
                          color.bg,
                          color.border,
                          color.text
                        )}
                      >
                        {evt.summary}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Time grid */}
      <div className="flex-1 relative">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div className="border-r border-border/20 h-14 flex items-start justify-end pr-2 -mt-2">
                <span className="text-[10px] font-medium text-muted-foreground/40">
                  {format(new Date(2000, 0, 1, hour), "h a")}
                </span>
              </div>
              {/* Day columns */}
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-r border-b border-border/10 h-14 relative",
                    isToday(day) && "bg-primary/[0.02]"
                  )}
                >
                  {/* Render timed events */}
                  {getEventsForDay(events, day)
                    .filter((e) => !e.allDay)
                    .filter((e) => {
                      const h = getHours(parseISO(e.start));
                      return h === hour;
                    })
                    .map((evt) => {
                      const color = getEventColor(evt.colorId);
                      const startDate = parseISO(evt.start);
                      const endDate = parseISO(evt.end);
                      const minuteOffset = getMinutes(startDate);
                      const duration = differenceInMinutes(endDate, startDate);
                      const topPx = (minuteOffset / 60) * 56; // 56px = h-14
                      const heightPx = Math.max((duration / 60) * 56, 20);
                      return (
                        <button
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className={cn(
                            "absolute left-0.5 right-0.5 rounded-md border px-1.5 py-0.5 text-left transition-all hover:shadow-md hover:z-20 overflow-hidden z-10",
                            color.bg,
                            color.border
                          )}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                          }}
                        >
                          <p
                            className={cn(
                              "text-[10px] font-semibold truncate leading-tight",
                              color.text
                            )}
                          >
                            {evt.summary}
                          </p>
                          {heightPx > 30 && (
                            <p className="text-[9px] text-muted-foreground truncate">
                              {formatTimeRange(evt.start, evt.end)}
                            </p>
                          )}
                        </button>
                      );
                    })}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Now indicator */}
        {days.some((d) => isToday(d)) && (() => {
          const now = new Date();
          const currentHour = getHours(now);
          if (currentHour < 6 || currentHour > 20) return null;
          const todayIndex = days.findIndex((d) => isToday(d));
          const minutesFromStart = (currentHour - 6) * 60 + getMinutes(now);
          const topPx = (minutesFromStart / 60) * 56;
          return (
            <div
              className="absolute left-0 right-0 pointer-events-none z-30"
              style={{ top: `${topPx}px` }}
            >
              <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                <div />
                {days.map((day, i) => (
                  <div key={day.toISOString()} className="relative">
                    {i === todayIndex && (
                      <>
                        <div className="absolute left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Day View ────────────────────────────────────────────────────────────────
function DayView({
  currentDate,
  events,
  onSelectEvent,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (evt: CalendarEvent) => void;
}) {
  const dayEvents = getEventsForDay(events, currentDate);
  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);
  const hours = Array.from({ length: 15 }, (_, i) => i + 6);

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Day header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl text-xl font-bold",
              isToday(currentDate)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-foreground"
            )}
          >
            {format(currentDate, "d")}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {format(currentDate, "EEEE")}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(currentDate, "MMMM yyyy")} ·{" "}
              {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {allDayEvents.map((evt) => {
              const color = getEventColor(evt.colorId);
              return (
                <button
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all hover:shadow-sm",
                    color.bg,
                    color.border,
                    color.text
                  )}
                >
                  {evt.summary}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hour grid */}
      <div className="flex-1 relative">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_1fr] border-b border-border/10"
          >
            <div className="flex items-start justify-end pr-3 -mt-2 h-14">
              <span className="text-[10px] font-medium text-muted-foreground/40">
                {format(new Date(2000, 0, 1, hour), "h a")}
              </span>
            </div>
            <div className="relative h-14 border-l border-border/20">
              {timedEvents
                .filter((e) => getHours(parseISO(e.start)) === hour)
                .map((evt) => {
                  const color = getEventColor(evt.colorId);
                  const startDate = parseISO(evt.start);
                  const endDate = parseISO(evt.end);
                  const minuteOffset = getMinutes(startDate);
                  const duration = differenceInMinutes(endDate, startDate);
                  const topPx = (minuteOffset / 60) * 56;
                  const heightPx = Math.max((duration / 60) * 56, 24);
                  return (
                    <button
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className={cn(
                        "absolute left-1 right-2 rounded-lg border px-3 py-1.5 text-left transition-all hover:shadow-lg hover:z-20 overflow-hidden z-10",
                        color.bg,
                        color.border
                      )}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-xs font-semibold truncate",
                            color.text
                          )}
                        >
                          {evt.summary}
                        </p>
                        {evt.conferenceData && (
                          <Video className="h-3 w-3 shrink-0 text-sky-500" />
                        )}
                      </div>
                      {heightPx > 35 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {formatTimeRange(evt.start, evt.end)}
                          {evt.location && ` · ${evt.location}`}
                        </p>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}

        {/* Now indicator */}
        {isToday(currentDate) && (() => {
          const now = new Date();
          const currentHour = getHours(now);
          if (currentHour < 6 || currentHour > 20) return null;
          const minutesFromStart = (currentHour - 6) * 60 + getMinutes(now);
          const topPx = (minutesFromStart / 60) * 56;
          return (
            <div
              className="absolute left-[60px] right-0 pointer-events-none z-30"
              style={{ top: `${topPx}px` }}
            >
              <div className="relative">
                <div className="absolute left-0 right-0 h-[2px] bg-rose-500 rounded-full" />
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/30" />
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Create Event Dialog ─────────────────────────────────────────────────────
function CreateEventDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setStart("");
    setEnd("");
    setLocation("");
    setDescription("");
    setSelectedColor(undefined);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!start || !end) {
      setError("Start and end times are required");
      return;
    }

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          start: new Date(start).toISOString(),
          end: new Date(end).toISOString(),
          colorId: selectedColor,
        }),
      });
      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }
      if (!res.ok) throw new Error(data?.error ?? `Failed to create event (Status: ${res.status})`);
      toast.success("Event created", {
        description: `"${title.trim()}" has been added to your calendar.`,
      });
      resetForm();
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create event";
      setError(msg);
      toast.error("Failed to create event", { description: msg });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Add a new event to your calendar
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Error */}
          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Title
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name"
              className="w-full bg-muted/30 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all"
            />
          </div>
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Start
              </label>
              <input
                id="event-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full bg-muted/30 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                End
              </label>
              <input
                id="event-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full bg-muted/30 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all"
              />
            </div>
          </div>
          {/* Location */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Location
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full bg-muted/30 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all"
            />
          </div>
          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <textarea
              id="event-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              className="w-full bg-muted/30 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/45 transition-all resize-none"
            />
          </div>
          {/* Color picker */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Color
            </label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5", "6", "7"].map((cid) => {
                const color = getEventColor(cid);
                return (
                  <button
                    key={cid}
                    onClick={() => setSelectedColor(cid)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                      color.dot,
                      selectedColor === cid
                        ? "border-foreground/60 scale-110 ring-2 ring-primary/20"
                        : "border-transparent hover:border-foreground/30"
                    )}
                  />
                );
              })}
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating…
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Calendar View Component ───────────────────────────────────────────
export function CalendarViewComponent({ isInline = false }: { isInline?: boolean }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calendar events state — populated from /api/calendar/events
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Compute the visible date range based on current view
  const dateRange = useMemo(() => {
    let rangeStart: Date;
    let rangeEnd: Date;
    if (view === "month") {
      rangeStart = startOfWeek(startOfMonth(currentDate));
      rangeEnd = endOfWeek(endOfMonth(currentDate));
    } else if (view === "week") {
      rangeStart = startOfWeek(currentDate);
      rangeEnd = endOfWeek(currentDate);
    } else {
      rangeStart = startOfDay(currentDate);
      rangeEnd = new Date(startOfDay(currentDate).getTime() + 24 * 60 * 60 * 1000 - 1);
    }
    return {
      timeMin: rangeStart.toISOString(),
      timeMax: rangeEnd.toISOString(),
    };
  }, [currentDate, view]);

  // Fetch events from the backend
  const fetchEvents = useCallback(async () => {
    if (sessionLoading || !session) return;
    setLoadingEvents(true);
    setEventsError(null);
    try {
      const params = new URLSearchParams({
        timeMin: dateRange.timeMin,
        timeMax: dateRange.timeMax,
      });
      const res = await fetch(`/api/calendar/events?${params.toString()}`);
      let data: any = null;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }
      if (!res.ok) {
        if (res.status === 403 && data?.error) {
          throw new Error(
            `${data.error} Visit Dashboard → Profile → Integrations to connect Google Calendar.`
          );
        }
        throw new Error(data?.error ?? `Failed to fetch events (Status: ${res.status})`);
      }
      setEvents(data?.events ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch events";
      setEventsError(msg);
      toast.error("Failed to load events", { description: msg });
    } finally {
      setLoadingEvents(false);
    }
  }, [dateRange.timeMin, dateRange.timeMax, session, sessionLoading]);

  // Auto-fetch events on mount/session load and whenever the visible date range changes
  useEffect(() => {
    if (session && !sessionLoading) {
      fetchEvents();
    }
  }, [session, sessionLoading, fetchEvents]);

  // Delete an event via the API, then refresh the event list
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    const res = await fetch("/api/calendar/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: eventId }),
    });
    let data: any = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    }
    if (!res.ok) throw new Error(data?.error ?? `Failed to delete event (Status: ${res.status})`);
    // Refresh events after deletion
    await fetchEvents();
  }, [fetchEvents]);

  // Navigation
  const navigatePrev = useCallback(() => {
    if (view === "month") setCurrentDate((d) => subMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => subWeeks(d, 1));
    else setCurrentDate((d) => subDays(d, 1));
  }, [view]);

  const navigateNext = useCallback(() => {
    if (view === "month") setCurrentDate((d) => addMonths(d, 1));
    else if (view === "week") setCurrentDate((d) => addWeeks(d, 1));
    else setCurrentDate((d) => addDays(d, 1));
  }, [view]);

  const navigateToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleSelectEvent = useCallback((evt: CalendarEvent) => {
    setSelectedEvent(evt);
    setEventDialogOpen(true);
  }, []);

  const handleSelectDay = useCallback((day: Date) => {
    setCurrentDate(day);
    setView("day");
  }, []);

  // Title for header
  const headerTitle = useMemo(() => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const ws = startOfWeek(currentDate);
      const we = endOfWeek(currentDate);
      if (ws.getMonth() === we.getMonth()) {
        return `${format(ws, "MMM d")} – ${format(we, "d, yyyy")}`;
      }
      return `${format(ws, "MMM d")} – ${format(we, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  }, [currentDate, view]);

  // Today's events for sidebar
  const todaysEvents = useMemo(
    () => getEventsForDay(events, new Date()),
    [events]
  );

  const viewIcons: Record<CalendarView, React.ElementType> = {
    month: LayoutGrid,
    week: Columns3,
    day: AlignJustify,
  };

  return (
    <div className={cn("flex flex-col bg-background overflow-hidden relative", isInline ? "flex-1 h-full w-full" : "h-screen w-full")}>
      {/* ── Top Nav ── */}
      <header className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {!isInline && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 ring-1 ring-border/10">
                  <span className="text-xs font-bold text-primary-foreground">A</span>
                </div>
                <span className="text-sm font-extrabold text-foreground tracking-tight hidden sm:block">
                  Aria Calendar
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-border/40 hidden sm:block" />
            </>
          )}

          {/* Today + Nav */}
          <div className="flex items-center gap-1.5">
            <Button
              id="cal-today"
              variant="outline"
              size="sm"
              onClick={navigateToday}
              className="text-xs font-semibold rounded-xl h-8"
            >
              Today
            </Button>
            <button
              onClick={navigatePrev}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <h1 className="text-sm font-semibold text-foreground ml-2 hidden sm:block">
              {headerTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-muted/40 rounded-xl border border-border/30 p-0.5">
            {(["month", "week", "day"] as CalendarView[]).map((v) => {
              const Icon = viewIcons[v];
              return (
                <button
                  key={v}
                  id={`view-${v}`}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    view === v
                      ? "bg-background text-foreground shadow-sm border border-border/30"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline capitalize">{v}</span>
                </button>
              );
            })}
          </div>

          {/* Create event */}
          <Button
            id="create-event"
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-xl h-8 gap-1.5 shadow-md shadow-primary/15"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Event</span>
          </Button>

          {/* Home */}
          {!isInline && (
            <button
              id="nav-home"
              onClick={() => router.push("/home")}
              className="p-2 rounded-xl border border-transparent hover:border-border/30 hover:bg-accent transition-all text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
            </button>
          )}

          {!isInline && <LogoutButton variant="header" showLabel={false} />}
          {!isInline && <ModeToggle />}
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar ── */}
        <aside
          className={cn(
            "shrink-0 flex flex-col border-r border-border/40 bg-sidebar/40 backdrop-blur-md transition-all duration-300 overflow-hidden",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Mini Calendar */}
            <MiniCalendar
              currentDate={currentDate}
              selectedDate={currentDate}
              onSelectDate={(d) => {
                setCurrentDate(d);
                if (view === "month" && !isSameMonth(d, currentDate)) {
                  // stay in month view, just change month
                } else if (view !== "day") {
                  // don't auto-switch view when clicking mini cal
                }
                setCurrentDate(d);
              }}
              events={events}
            />

            {/* Today's agenda */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3">
                Today · {format(new Date(), "MMM d")}
              </h3>
              {todaysEvents.length === 0 ? (
                <div className="text-center py-4">
                  <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-xs text-muted-foreground/50">
                    No events today
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {todaysEvents
                    .sort(
                      (a, b) =>
                        parseISO(a.start).getTime() - parseISO(b.start).getTime()
                    )
                    .map((evt) => {
                      const color = getEventColor(evt.colorId);
                      return (
                        <button
                          key={evt.id}
                          onClick={() => handleSelectEvent(evt)}
                          className="w-full text-left flex items-start gap-2 p-2 rounded-lg hover:bg-accent/40 transition-colors group"
                        >
                          <div
                            className={cn(
                              "w-1 h-full min-h-[28px] rounded-full shrink-0 mt-0.5",
                              color.dot
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {evt.summary}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                              {evt.allDay
                                ? "All day"
                                : formatTimeRange(evt.start, evt.end)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Upcoming */}
            <UpcomingEvents events={events} onSelect={handleSelectEvent} />
          </div>

          {/* Sidebar toggle */}
          <div className="shrink-0 p-2 border-t border-border/40">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Hide sidebar</span>
            </button>
          </div>
        </aside>

        {/* Sidebar toggle button (when collapsed) */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-background border border-border/40 rounded-r-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground shadow-sm"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}

        {/* ── Main Calendar Area ── */}
        <main className="flex-1 overflow-hidden flex flex-col">
          {/* Mobile header title */}
          <div className="sm:hidden px-4 py-2 border-b border-border/30">
            <h1 className="text-sm font-semibold text-foreground">
              {headerTitle}
            </h1>
          </div>

          {/* Calendar view */}
          <div className="flex-1 overflow-hidden">
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
                onSelectDay={handleSelectDay}
              />
            )}
            {view === "week" && (
              <WeekView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
              />
            )}
            {view === "day" && (
              <DayView
                currentDate={currentDate}
                events={events}
                onSelectEvent={handleSelectEvent}
              />
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      {/* Loading / Error overlay */}
      {loadingEvents && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/40 rounded-xl px-4 py-2 shadow-lg">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">Loading events…</span>
        </div>
      )}
      {eventsError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-2 shadow-lg">
          <span className="text-xs font-medium text-destructive">{eventsError}</span>
          <Button variant="ghost" size="sm" onClick={fetchEvents} className="text-xs h-6 px-2">
            Retry
          </Button>
        </div>
      )}

      <EventDetailDialog
        event={selectedEvent}
        open={eventDialogOpen}
        onClose={() => {
          setEventDialogOpen(false);
          setSelectedEvent(null);
        }}
        onDelete={handleDeleteEvent}
      />
      <CreateEventDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={fetchEvents}
      />
    </div>
  );
}
