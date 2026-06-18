"use client";

import React from "react";
import { ArrowLeft, Star, Reply, Trash2, Edit2, Tag, MailOpen, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface MailDetailProps {
  mail: MailMessage | DraftMessage | null;
  isDraft?: boolean;
  onBack: () => void;
  onEditDraft?: (draft: DraftMessage) => void;
  onMarkReadUnread?: (id: string, markUnread: boolean) => void;
  onTrash?: (id: string) => void;
  onToggleStar?: (id: string, starred: boolean) => void;
}

function formatFullDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
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
  return from;
}

function getEmail(from?: string): string {
  if (!from) return "";
  const emailMatch = from.match(/<([^>]+)>/);
  if (emailMatch) return emailMatch[1];
  return from;
}

const AVATAR_COLORS = [
  "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  "bg-sky-500/20 text-sky-600 dark:text-sky-400",
  "bg-orange-500/20 text-orange-600 dark:text-orange-400",
  "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  "bg-teal-500/20 text-teal-600 dark:text-teal-400",
];

function getAvatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Label badge
function LabelBadge({ label }: { label: string }) {
  const hidden = ["INBOX", "UNREAD", "IMPORTANT", "CATEGORY_PERSONAL"];
  if (hidden.includes(label)) return null;
  const map: Record<string, string> = {
    STARRED: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    SENT: "bg-primary/10 text-primary",
    DRAFT: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium",
        map[label] ?? "bg-muted text-muted-foreground"
      )}
    >
      <Tag className="h-2.5 w-2.5" />
      {label.replace("CATEGORY_", "").toLowerCase()}
    </span>
  );
}

export default function MailDetail({
  mail,
  isDraft,
  onBack,
  onEditDraft,
  onMarkReadUnread,
  onTrash,
  onToggleStar,
}: MailDetailProps) {
  if (!mail) return null;

  const isUnread = "isUnread" in mail ? (mail as MailMessage).isUnread : false;
  const initials = getInitials(mail.from);
  const displayName = getDisplayName(mail.from);
  const email = getEmail(mail.from);
  const avatarColor = getAvatarColor(mail.from ?? "");
  const labelIds = "labelIds" in mail ? (mail.labelIds ?? []) : [];
  const isStarred = labelIds.includes("STARRED");
  const priority = "priority" in mail ? (mail as any).priority : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">

      {/* ── Detail Header ── */}
      <div className="shrink-0 flex items-center gap-2 px-6 py-4 border-b border-border/50">
        <button
          id="mail-detail-back"
          onClick={onBack}
          className="p-2 rounded-xl hover:bg-accent transition-all text-muted-foreground hover:text-foreground shrink-0 border border-transparent hover:border-border/30 active:scale-95"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-foreground truncate tracking-tight">
            {mail.subject || "(no subject)"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isDraft ? (
            <button
              id="mail-detail-edit-draft"
              onClick={() => onEditDraft?.(mail as DraftMessage)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition-all text-xs font-semibold shadow-sm shadow-primary/10"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Draft
            </button>
          ) : (
            <>
              {/* Mark Read / Unread toggle */}
              {onMarkReadUnread && (
                <button
                  id="mail-detail-toggle-read"
                  onClick={() => onMarkReadUnread(mail.id, !isUnread)}
                  title={isUnread ? "Mark as read" : "Mark as unread"}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-border/40 hover:border-border/80 shadow-sm active:scale-95",
                    isUnread
                      ? "text-primary bg-primary/10 border-primary/20 hover:bg-primary/15"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {isUnread ? (
                    <>
                      <MailOpen className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Mark read</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Mark unread</span>
                    </>
                  )}
                </button>
              )}

              {/* Star toggle */}
              {onToggleStar && (
                <button
                  id="mail-detail-star"
                  onClick={() => onToggleStar(mail.id, !isStarred)}
                  className={cn(
                    "p-2 rounded-xl border border-border/40 hover:border-border/80 transition-all shadow-sm active:scale-95",
                    isStarred
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-500 hover:bg-amber-500/15"
                      : "bg-background/50 hover:bg-accent text-muted-foreground hover:text-amber-500"
                  )}
                  aria-label={isStarred ? "Unstar" : "Star"}
                >
                  <Star className={cn("h-4 w-4", isStarred && "fill-amber-500")} />
                </button>
              )}
              <button
                id="mail-detail-reply"
                className="p-2 rounded-xl border border-border/40 hover:border-border/80 bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
                aria-label="Reply"
              >
                <Reply className="h-4 w-4" />
              </button>
              {onTrash && (
                <button
                  id="mail-detail-trash"
                  onClick={() => onTrash(mail.id)}
                  className="p-2 rounded-xl border border-border/40 hover:border-destructive/30 bg-background/50 hover:bg-destructive/10 hover:text-destructive transition-all shadow-sm active:scale-95 text-muted-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Unread Banner ── */}
      {isUnread && (
        <div className="shrink-0 flex items-center justify-between px-6 py-2.5 bg-primary/5 border-b border-primary/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse shadow-sm shadow-primary/50" />
            <span className="text-xs text-primary font-semibold tracking-tight">Unread message</span>
          </div>
          {onMarkReadUnread && (
            <button
              onClick={() => onMarkReadUnread(mail.id, false)}
              className="text-xs text-primary/70 hover:text-primary font-medium underline-offset-4 hover:underline transition-all"
            >
              Mark as read
            </button>
          )}
        </div>
      )}

      {/* ── Mail Body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 pt-8 pb-12 space-y-6">

          {/* Subject + Labels */}
          <div className="space-y-3">
            <h3 className="text-xl font-extrabold text-foreground leading-snug tracking-tight">
              {mail.subject || "(no subject)"}
            </h3>
            {labelIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {labelIds.map((l) => (
                  <LabelBadge key={l} label={l} />
                ))}
              </div>
            )}
          </div>

          {/* Sender card */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-card/60 border border-border/40 shadow-sm backdrop-blur-sm">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ring-1 ring-border/20",
                avatarColor
              )}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground leading-none">{displayName}</p>
                    {priority && (
                      <span className={cn(
                        "text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border tracking-wide uppercase select-none",
                        priority === "HIGH" && "bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-450",
                        priority === "MEDIUM" && "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-450",
                        priority === "LOW" && "bg-slate-500/10 border-slate-500/25 text-slate-600 dark:text-slate-400"
                      )}>
                        {priority}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-1 font-medium">&lt;{email}&gt;</p>
                </div>
                <p className="text-[11px] text-muted-foreground/50 shrink-0 font-medium tracking-tight">
                  {formatFullDate(mail.date)}
                </p>
              </div>
              {mail.to && (
                <p className="text-xs text-muted-foreground/50 mt-2 font-medium">
                  <span className="font-semibold text-muted-foreground/40 uppercase text-[10px] tracking-wider mr-1">To:</span> {mail.to}
                </p>
              )}
            </div>
          </div>

          {/* Draft notice */}
          {isDraft && (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 shadow-sm">
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Draft — click "Edit Draft" to continue editing
              </span>
            </div>
          )}

          {/* Message content */}
          <div className="prose prose-sm max-w-none dark:prose-invert border-t border-border/20 pt-6">
            <p className="text-sm text-foreground/85 leading-7 whitespace-pre-wrap font-sans">
              {mail.snippet || "No preview available."}
            </p>
          </div>

          {/* Footer note */}
          <div className="pt-6 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground/40 italic font-medium leading-normal">
              {isDraft
                ? "This is a draft — click Edit Draft to modify it."
                : "Showing snippet preview. Full email body requires additional Gmail API scope."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
