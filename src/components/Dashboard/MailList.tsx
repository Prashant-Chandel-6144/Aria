"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileText, MailOpen, Mail, Loader2, Star, Link2, AlertCircle } from "lucide-react";

interface MailMessage {
  id: string;
  threadId?: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  labelIds?: string[];
}

interface DraftMessage {
  id: string;
  messageId?: string;
  threadId?: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

type AnyMail = MailMessage | DraftMessage;

interface MailListProps {
  mails: AnyMail[];
  selectedId?: string;
  isDraft?: boolean;
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  error?: string | null;
  onSelect: (mail: AnyMail) => void;
  onMarkReadUnread?: (id: string, markUnread: boolean) => void;
  onLoadMore?: () => void;
  emptyText?: string;
}

function getInitials(from?: string): string {
  if (!from) return "?";
  const nameMatch = from.match(/^([^<]+)</);
  const name = nameMatch ? nameMatch[1].trim() : from.split("@")[0];
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getDisplayName(from?: string): string {
  if (!from) return "Unknown";
  const nameMatch = from.match(/^([^<]+)</);
  if (nameMatch) return nameMatch[1].trim();
  return from.split("@")[0];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

const AVATAR_COLORS = [
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  "bg-teal-500/15 text-teal-600 dark:text-teal-400",
];

function getAvatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function MailCardSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="flex justify-between items-center">
          <div className="h-3 bg-muted rounded-md w-28" />
          <div className="h-2.5 bg-muted rounded-md w-10" />
        </div>
        <div className="h-2.5 bg-muted rounded-md w-44" />
        <div className="h-2.5 bg-muted/60 rounded-md w-full" />
      </div>
    </div>
  );
}

// ─── Sentinel (IntersectionObserver target) ───────────────────────────────────
function LoadMoreSentinel({
  onVisible,
  loadingMore,
  hasMore,
}: {
  onVisible: () => void;
  loadingMore?: boolean;
  hasMore?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onVisible();
        }
      },
      { rootMargin: "120px" }   // trigger 120px before the element enters view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onVisible]);

  if (!hasMore && !loadingMore) return null;

  return (
    <div ref={ref} className="flex items-center justify-center py-4">
      {loadingMore && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading more…
        </div>
      )}
    </div>
  );
}

export default function MailList({
  mails,
  selectedId,
  isDraft,
  loading,
  loadingMore,
  hasMore,
  error,
  onSelect,
  onMarkReadUnread,
  onLoadMore,
  emptyText = "No messages",
}: MailListProps) {
  if (loading) {
    return (
      <div className="divide-y divide-border/40">
        {Array.from({ length: 6 }).map((_, i) => (
          <MailCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    const errorStr = String(error).toLowerCase();
    const isConnectionError = errorStr.includes("account not found") || errorStr.includes("credentials") || errorStr.includes("not connected") || errorStr.includes("unconnected");
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-[220px] p-5 rounded-2xl border border-border/40 bg-card/45 backdrop-blur-sm shadow-md transition-all">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mx-auto border shadow-sm ring-1 ring-border/10 animate-in zoom-in duration-200",
            isConnectionError 
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
          )}>
            {isConnectionError ? (
              <Link2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-foreground tracking-tight">
              {isConnectionError ? "Gmail Not Connected" : "Failed to Load"}
            </h3>
            <p className="text-[10px] text-muted-foreground/60 leading-normal animate-in fade-in duration-300">
              {isConnectionError
                ? "Please connect your Gmail account in Settings to access your workspace inbox."
                : error}
            </p>
          </div>
          {isConnectionError && (
            <button
              onClick={() => {
                window.location.href = "/dashboard?tab=profile&sub=integrations";
              }}
              className="w-full py-2 bg-primary/15 hover:bg-primary/20 text-primary border border-primary/25 hover:border-primary/35 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shadow-sm shadow-primary/5 active:scale-95"
            >
              Go to Integrations
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mails.length === 0) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted/60 flex items-center justify-center mx-auto ring-1 ring-border/30">
            <svg className="w-6 h-6 text-muted-foreground/35" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 space-y-2.5">
      {mails.map((mail) => {
        const isUnread = "isUnread" in mail ? mail.isUnread : false;
        const isSelected = mail.id === selectedId;
        const initials = getInitials(mail.from);
        const displayName = getDisplayName(mail.from);
        const avatarColor = getAvatarColor(mail.from ?? "");
        const labelIds = "labelIds" in mail ? (mail.labelIds ?? []) : [];
        const isStarred = labelIds.includes("STARRED");
        const priority = "priority" in mail ? (mail as any).priority : null;

        return (
          <div key={mail.id} className="relative group/row">
            <button
              id={`mail-card-${mail.id}`}
              onClick={() => onSelect(mail)}
              className={cn(
                "w-full flex items-start gap-3 p-3.5 text-left transition-all duration-200 rounded-2xl border relative pr-10 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                isSelected
                  ? "bg-primary/10 border-primary/45 shadow-sm shadow-primary/5"
                  : isUnread
                  ? "bg-card/90 dark:bg-card/40 border-primary/20 hover:border-primary/40"
                  : "bg-card/40 dark:bg-card/10 border-border/40 hover:border-border/80 hover:bg-card/70 dark:hover:bg-card/25"
              )}
            >
              {/* Selected indicator bar */}
              {isSelected && (
                <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-full bg-primary animate-pulse" />
              )}

              {/* Avatar */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5 shadow-sm ring-1 ring-border/20",
                  avatarColor
                )}
              >
                {initials}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "text-xs truncate tracking-tight",
                          isUnread
                            ? "font-bold text-foreground"
                            : "font-semibold text-foreground/85"
                        )}
                      >
                        {isDraft
                          ? mail.to
                            ? `To: ${getDisplayName(mail.to)}`
                            : "Draft"
                          : displayName}
                      </span>
                      {priority && (
                        <span className={cn(
                          "text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border tracking-wide uppercase shrink-0 select-none",
                          priority === "HIGH" && "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-450",
                          priority === "MEDIUM" && "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-450",
                          priority === "LOW" && "bg-slate-500/10 border-slate-500/25 text-slate-600 dark:text-slate-400"
                        )}>
                          {priority}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isStarred && (
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                      <span className="text-[10px] text-muted-foreground/50 shrink-0 tabular-nums">
                        {formatDate(mail.date)}
                      </span>
                    </div>
                  </div>

                <p
                  className={cn(
                    "text-[11px] truncate leading-snug tracking-tight",
                    isUnread
                      ? "font-semibold text-foreground/90"
                      : "text-muted-foreground/80 font-medium"
                  )}
                >
                  {mail.subject || "(no subject)"}
                </p>

                {mail.snippet && (
                  <p className="text-[11px] text-muted-foreground/50 truncate font-normal leading-normal">
                    {mail.snippet}
                  </p>
                )}
              </div>

              {/* Unread dot */}
              {isUnread && !isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2.5 animate-pulse shadow-sm shadow-primary/40" />
              )}

              {/* Draft badge */}
              {isDraft && (
                <div className="shrink-0 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                    <FileText className="h-2.5 w-2.5" />
                    Draft
                  </span>
                </div>
              )}
            </button>

            {/* Mark read/unread hover action */}
            {onMarkReadUnread && !isDraft && (
              <button
                id={`mark-read-${mail.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkReadUnread(mail.id, !isUnread);
                }}
                title={isUnread ? "Mark as read" : "Mark as unread"}
                className={cn(
                  "absolute right-3.5 top-1/2 -translate-y-1/2 p-2 rounded-xl border border-border/40 bg-background/80 backdrop-blur shadow-sm",
                  "opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-105 active:scale-95",
                  "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border"
                )}
              >
                {isUnread ? (
                  <MailOpen className="h-3.5 w-3.5" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
        );
      })}

      {/* Infinite scroll sentinel — only for inbox (when onLoadMore is provided) */}
      {onLoadMore && (
        <LoadMoreSentinel
          onVisible={onLoadMore}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      )}

      {/* End of list indicator */}
      {!hasMore && !loadingMore && onLoadMore && mails.length > 0 && (
        <div className="flex items-center justify-center py-5">
          <p className="text-[11px] text-muted-foreground/40">
            All messages loaded · {mails.length} total
          </p>
        </div>
      )}
    </div>
  );
}
