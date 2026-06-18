"use client";

import React, { useState, useTransition } from "react";
import { X, Send, FileText, Loader2, ChevronDown } from "lucide-react";
import { createMail, saveDraft } from "@/features/Gmail/actions/action";
import { cn } from "@/lib/utils";

interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: {
    draftId?: string;
    to?: string;
    subject?: string;
    message?: string;
  };
  onDraftSaved?: () => void;
  onMailSent?: () => void;
}

export default function ComposeModal({
  open,
  onClose,
  initialData,
  onDraftSaved,
  onMailSent,
}: ComposeModalProps) {
  const [to, setTo] = useState(initialData?.to ?? "");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [status, setStatus] = useState<"idle" | "sending" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sync initialData if it changes (when editing a draft)
  React.useEffect(() => {
    setTo(initialData?.to ?? "");
    setSubject(initialData?.subject ?? "");
    setMessage(initialData?.message ?? "");
    setStatus("idle");
    setErrorMsg(null);
  }, [initialData?.draftId, open]);

  if (!open) return null;

  const handleSend = () => {
    startTransition(async () => {
      setStatus("sending");
      setErrorMsg(null);
      const fd = new FormData();
      fd.append("to", to);
      fd.append("subject", subject);
      fd.append("message", message);
      const result = await createMail(fd);
      if (result?.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("done");
        onMailSent?.();
        setTimeout(onClose, 800);
      }
    });
  };

  const handleSaveDraft = () => {
    startTransition(async () => {
      setStatus("saving");
      setErrorMsg(null);
      const fd = new FormData();
      fd.append("to", to);
      fd.append("subject", subject);
      fd.append("message", message);
      if (initialData?.draftId) fd.append("draftId", initialData.draftId);
      const result = await saveDraft(fd);
      if (result?.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("idle");
        onDraftSaved?.();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300",
          minimized ? "h-12 overflow-hidden" : "h-auto"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 rounded-t-2xl">
          <h3 className="text-sm font-semibold text-foreground">
            {initialData?.draftId ? "Edit Draft" : "New Message"}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized((m) => !m)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  minimized && "rotate-180"
                )}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              To
            </label>
            <input
              id="compose-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full bg-transparent border-0 border-b border-border pb-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Subject
            </label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full bg-transparent border-0 border-b border-border pb-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Message
            </label>
            <textarea
              id="compose-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={8}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          {status === "done" && (
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
              ✓ Email sent successfully!
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            id="compose-save-draft"
            onClick={handleSaveDraft}
            disabled={isPending}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {status === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Save Draft
          </button>
          <button
            id="compose-send"
            onClick={handleSend}
            disabled={isPending || !to.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
