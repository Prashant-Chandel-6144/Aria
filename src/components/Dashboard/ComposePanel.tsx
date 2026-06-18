"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  Loader2,
  Paperclip,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { createMail, saveDraft } from "@/features/Gmail/actions/action";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ComposePanelProps {
  initialData?: {
    draftId?: string;
    to?: string;
    subject?: string;
    message?: string;
  };
  onDraftSaved?: () => void;
  onMailSent?: () => void;
  onDiscard?: () => void;
}

interface AttachedFile {
  file: File;
  id: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileChip({ af, onRemove }: { af: AttachedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/60 border border-border/50 rounded-lg text-xs group">
      <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="text-foreground/80 truncate max-w-[120px]">{af.file.name}</span>
      <span className="text-muted-foreground/60 shrink-0">{formatFileSize(af.file.size)}</span>
      <button
        onClick={onRemove}
        className="ml-1 text-muted-foreground/50 hover:text-destructive transition-colors shrink-0"
        aria-label={`Remove ${af.file.name}`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function ComposePanel({
  initialData,
  onDraftSaved,
  onMailSent,
  onDiscard,
}: ComposePanelProps) {
  const [to, setTo] = useState(initialData?.to ?? "");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initialData?.subject ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "saving" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialData on change (e.g., editing a draft)
  useEffect(() => {
    setTo(initialData?.to ?? "");
    setSubject(initialData?.subject ?? "");
    setMessage(initialData?.message ?? "");
    setStatus("idle");
    setErrorMsg(null);
    setAttachments([]);
    setCc("");
    setBcc("");
  }, [initialData?.draftId]);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 200)}px`;
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAttachments: AttachedFile[] = files.map((f) => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random()}`,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // Reset input so same file can be added again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    startTransition(async () => {
      setStatus("sending");
      setErrorMsg(null);
      const fd = new FormData();
      fd.append("to", to);
      fd.append("subject", subject);
      fd.append("message", message);
      if (cc) fd.append("cc", cc);
      if (bcc) fd.append("bcc", bcc);
      attachments.forEach((a) => fd.append("attachments", a.file));
      const result = await createMail(fd);
      if (result?.error) {
        setStatus("error");
        setErrorMsg(result.error);
        toast.error("Failed to send email", {
          description: result.error,
        });
      } else {
        setStatus("sent");
        toast.success("Email sent successfully!");
        onMailSent?.();
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
        toast.error("Failed to save draft", {
          description: result.error,
        });
      } else {
        setStatus("idle");
        toast.success("Draft saved successfully!");
        onDraftSaved?.();
      }
    });
  };

  const isDraft = !!initialData?.draftId;
  const isBusy = isPending || status === "sending" || status === "saving";

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Panel Header ── */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/60">
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            {isDraft ? "Edit Draft" : "New Message"}
          </h1>
          {isDraft && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Editing saved draft</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            id="compose-save-draft"
            onClick={handleSaveDraft}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-40"
          >
            {status === "saving" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            Save draft
          </button>
          <button
            id="compose-discard"
            onClick={onDiscard}
            disabled={isBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Discard
          </button>
          <button
            id="compose-send"
            onClick={handleSend}
            disabled={isBusy || !to.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
          >
            {status === "sending" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send
          </button>
        </div>
      </div>

      {/* ── Status Banner ── */}
      {status === "sent" && (
        <div className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-primary/8 border-b border-primary/20 text-xs text-primary font-medium">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Email sent successfully!
        </div>
      )}
      {status === "error" && errorMsg && (
        <div className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-destructive/8 border-b border-destructive/20 text-xs text-destructive font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ── Compose Form ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-10 space-y-0">

          {/* To field */}
          <div className="flex items-center gap-3 py-3 border-b border-border/40 group">
            <label className="text-xs font-semibold text-muted-foreground w-14 shrink-0 uppercase tracking-wider">
              To
            </label>
            <input
              id="compose-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
            <button
              onClick={() => setShowCcBcc((s) => !s)}
              className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
            >
              Cc/Bcc
              {showCcBcc ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          </div>

          {/* Cc field */}
          {showCcBcc && (
            <div className="flex items-center gap-3 py-3 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground w-14 shrink-0 uppercase tracking-wider">
                Cc
              </label>
              <input
                id="compose-cc"
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          )}

          {/* Bcc field */}
          {showCcBcc && (
            <div className="flex items-center gap-3 py-3 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground w-14 shrink-0 uppercase tracking-wider">
                Bcc
              </label>
              <input
                id="compose-bcc"
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="bcc@example.com"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          )}

          {/* Subject field */}
          <div className="flex items-center gap-3 py-3 border-b border-border/40">
            <label className="text-xs font-semibold text-muted-foreground w-14 shrink-0 uppercase tracking-wider">
              Subject
            </label>
            <input
              id="compose-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-medium"
            />
          </div>

          {/* Message body */}
          <div className="pt-4">
            <textarea
              id="compose-message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here…"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed min-h-[200px]"
              style={{ overflow: "hidden" }}
            />
          </div>

          {/* Attachments list */}
          {attachments.length > 0 && (
            <div className="pt-4 border-t border-border/40">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Attachments ({attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((af) => (
                  <FileChip
                    key={af.id}
                    af={af}
                    onRemove={() => removeAttachment(af.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-3.5 border-t border-border/50 bg-muted/20">
        {/* Attach files */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          id="compose-attach-input"
          onChange={handleFileChange}
        />
        <button
          id="compose-attach"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        >
          <Paperclip className="h-3.5 w-3.5" />
          Attach files
        </button>

        {attachments.length > 0 && (
          <span className="text-xs text-muted-foreground/60">
            {attachments.length} file{attachments.length !== 1 ? "s" : ""} attached
          </span>
        )}

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground/40 hidden sm:block">
          {message.length > 0 ? `${message.length} chars` : ""}
        </span>
      </div>
    </div>
  );
}
