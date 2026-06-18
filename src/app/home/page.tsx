"use client";

import HomeNav from "@/components/Home/home-nav";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  Sparkles,
  Mail,
  CalendarDays,
  GitBranch,
  MessageSquare,
  Zap,
  FileText,
  Clock,
  Search,
  Loader2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { withAuth } from "@/lib/auth-guards";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const suggestions = [
  { icon: Mail, label: "Summarize my inbox", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40" },
  { icon: CalendarDays, label: "What's on my calendar today?", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/40" },
  { icon: GitBranch, label: "Any open PRs needing review?", color: "text-slate-500 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-500/10 border-slate-200/60 dark:border-slate-500/20 hover:border-slate-300 dark:hover:border-slate-500/40" },
  { icon: FileText, label: "Draft a follow-up to Sarah", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200/60 dark:border-violet-500/20 hover:border-violet-300 dark:hover:border-violet-500/40" },
  { icon: Search, label: "Find emails about Q3 planning", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10 border-sky-200/60 dark:border-sky-500/20 hover:border-sky-300 dark:hover:border-sky-500/40" },
  { icon: Clock, label: "What's overdue this week?", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10 border-orange-200/60 dark:border-orange-500/20 hover:border-orange-300 dark:hover:border-orange-500/40" },
];

const integrations = [
  { icon: Mail, label: "Gmail", color: "text-red-500" },
  { icon: CalendarDays, label: "Calendar", color: "text-blue-500" },
  { icon: GitBranch, label: "GitHub", color: "text-foreground" },
  { icon: MessageSquare, label: "Slack", color: "text-fuchsia-500" },
];

function HomePage() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSuggestion = (label: string) => {
    setValue(label);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!value.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    setError(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to get response");
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "Failed to process query.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeNav />

      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 w-[700px] h-[400px] rounded-full bg-amber-200/25 dark:bg-primary/8 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-violet-200/15 dark:bg-violet-500/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-sky-200/15 dark:bg-sky-500/5 blur-3xl" />
        </div>

        {/* Greeting */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-primary/10 border border-amber-300/50 dark:border-primary/20 text-amber-700 dark:text-primary text-xs font-semibold mb-5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Connected to Gmail, Calendar, GitHub, Slack
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            How can I help you today?
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Ask me anything about your inbox, schedule, repos, or messages.
          </p>
        </div>

        {/* Composer card */}
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl border border-border/60 bg-white dark:bg-card shadow-lg dark:shadow-xl dark:shadow-black/20 ring-1 ring-border/20 transition-all focus-within:ring-2 focus-within:ring-amber-400/40 dark:focus-within:ring-primary/30 focus-within:border-amber-400/60 dark:focus-within:border-primary/40 focus-within:shadow-xl focus-within:shadow-amber-200/20 dark:focus-within:shadow-primary/5">
            {/* Textarea */}
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Ask Aria anything… e.g. 'Summarize my unread emails and flag what's urgent'"
              disabled={loading}
              className="w-full min-h-[80px] max-h-[200px] resize-none bg-transparent border-0 shadow-none rounded-2xl px-5 pt-4 pb-14 text-base text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-0 leading-relaxed disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            {/* Toolbar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-3 border-t border-border/30">
              {/* Integration pills */}
              <div className="flex items-center gap-2">
                {integrations.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      title={item.label}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border/40 transition-all cursor-default"
                    >
                      <Icon className={`w-3 h-3 ${item.color}`} />
                      <span className="text-[10px] font-medium text-muted-foreground hidden sm:block">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Send */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/50 hidden sm:block">Enter to send</span>
                <Button
                  size="icon-sm"
                  disabled={!value.trim() || loading}
                  onClick={handleSubmit}
                  className="h-8 w-8 rounded-xl shadow-md shadow-primary/20 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-105"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Character hint */}
          {value.length > 0 && (
            <p className="text-[10px] text-muted-foreground/50 text-right mt-1.5 pr-1">
              {value.length} chars
            </p>
          )}
        </div>

        {/* Response block */}
        {(loading || response || error) && (
          <div className="mt-6 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-3 duration-350">
            <div className="rounded-2xl border border-border/50 bg-white/70 dark:bg-card/60 backdrop-blur-md shadow-md p-6 relative overflow-hidden transition-all duration-300">
              <div className="flex items-center gap-2 mb-4 border-b border-border/20 pb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 dark:bg-primary/20 flex items-center justify-center border border-amber-500/20 dark:border-primary/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-primary animate-pulse" />
                </div>
                <span className="text-xs font-bold text-foreground">Aria AI Assistant</span>
                {loading && (
                  <span className="text-[10px] text-muted-foreground/60 animate-pulse ml-auto flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    Thinking...
                  </span>
                )}
              </div>

              {loading && !response && (
                <div className="space-y-3 py-2 animate-pulse">
                  <div className="h-4 bg-muted/65 rounded-lg w-3/4" />
                  <div className="h-4 bg-muted/65 rounded-lg w-5/6" />
                  <div className="h-4 bg-muted/65 rounded-lg w-1/2" />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {response && (
                <>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap select-text selection:bg-amber-200/50 dark:selection:bg-primary/20">
                    {response}
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(response);
                        toast.success("Copied to clipboard");
                      }}
                      className="text-[10px] font-semibold h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/40 cursor-pointer animate-in fade-in"
                    >
                      Copy Response
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResponse(null);
                        setValue("");
                      }}
                      className="text-[10px] font-semibold h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer animate-in fade-in"
                    >
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        <div className="mt-8 w-full max-w-2xl">
          <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider mb-3 text-center">
            Try asking
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suggestions.map((s, i) => {
              const Icon = s.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.label)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-white dark:bg-card text-left text-sm font-medium text-foreground/80 transition-all duration-150 hover:text-foreground hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/20 shadow-sm ${s.bg}`}
                >
                  <div className={`shrink-0 w-7 h-7 rounded-lg ${s.bg.split(" ").slice(0, 2).join(" ")} flex items-center justify-center border ${s.bg.split(" ")[2]}`}>
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground/50">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>All integrations connected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Powered by Aria AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomePage);
