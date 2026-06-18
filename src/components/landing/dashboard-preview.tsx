"use client";

import { Inbox, Star, Send, PenSquare, RefreshCw, Search } from "lucide-react";

const emails = [
  { from: "Sarah K.", subject: "Re: Q3 planning — Action required", preview: "Thanks for the update! I think we should...", time: "9:41 AM", unread: true, important: true },
  { from: "GitHub", subject: "PR #482: feat/ai-compose merged", preview: "Pull request was merged by @marcus-r...", time: "8:20 AM", unread: true, important: false },
  { from: "Linear", subject: "4 issues assigned to you", preview: "ENG-441, ENG-449, ENG-451, ENG-458 are now...", time: "7:55 AM", unread: false, important: false },
  { from: "Aisha T.", subject: "Onboarding call next Tuesday?", preview: "Hey, wanted to check if Tuesday at 3pm works...", time: "Yesterday", unread: false, important: true },
  { from: "Google Calendar", subject: "Reminder: Design review in 30 min", preview: "Design Review — 2:00 PM – 3:00 PM, Google Meet...", time: "Yesterday", unread: false, important: false },
  { from: "Priya M.", subject: "Product roadmap deck — final version", preview: "Hey team, attaching the final roadmap deck for...", time: "Mon", unread: false, important: false },
];

export default function DashboardPreview() {
  return (
    <section className="py-12 px-6 bg-zinc-50/60 dark:bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            See it in action
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            A familiar inbox, made extraordinary
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Aria feels like the email client you've always wanted — clean, fast, and intelligent.
          </p>
        </div>

        {/* Mock Dashboard */}
        <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-zinc-300/60 dark:shadow-black/30 overflow-hidden ring-1 ring-border/20">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/50">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="bg-background/70 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                aria.app/dashboard
              </div>
            </div>
          </div>

          {/* App shell */}
          <div className="flex h-[480px] overflow-hidden">
            {/* Sidebar */}
            <div className="w-52 shrink-0 border-r border-border/50 bg-sidebar/40 flex flex-col">
              <div className="p-3">
                <div className="flex items-center gap-2 mb-4 px-2 pt-1">
                  <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-[9px] font-bold text-primary-foreground">A</span>
                  </div>
                  <span className="text-sm font-extrabold text-foreground">Aria Mail</span>
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold mb-3">
                  <PenSquare className="w-3.5 h-3.5" />
                  Compose
                </button>
              </div>
              <nav className="flex-1 px-2 space-y-0.5">
                {[
                  { label: "Inbox", icon: Inbox, badge: 2, active: true },
                  { label: "Important", icon: Star },
                  { label: "Sent", icon: Send },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                      item.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Email list */}
            <div className="w-72 shrink-0 border-r border-border/50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <h2 className="text-xs font-bold text-foreground">Inbox <span className="text-muted-foreground font-normal">(6)</span></h2>
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="relative px-3 py-2 border-b border-border/30">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/50" />
                <div className="bg-muted/40 rounded-lg pl-7 pr-3 py-1.5 text-[10px] text-muted-foreground/50">
                  Search mail…
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {emails.map((email, i) => (
                  <div
                    key={i}
                    className={`px-4 py-3 border-b border-border/30 cursor-pointer transition-colors hover:bg-muted/30 ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        {email.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                        <span className={`text-[11px] truncate max-w-[110px] ${email.unread ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                          {email.from}
                        </span>
                      </div>
                      <span className="text-[9px] text-muted-foreground shrink-0">{email.time}</span>
                    </div>
                    <div className={`text-[10px] truncate mb-0.5 ${email.unread ? "text-foreground font-semibold" : "text-foreground/70"}`}>
                      {email.subject}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{email.preview}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email detail */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground leading-tight">Re: Q3 planning — Action required</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">Important</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[9px] font-bold text-white">SK</div>
                  <div>
                    <div className="text-[10px] font-semibold text-foreground">Sarah K.</div>
                    <div className="text-[9px] text-muted-foreground">sarah@stripe.com → me</div>
                  </div>
                  <div className="ml-auto text-[9px] text-muted-foreground">Today, 9:41 AM</div>
                </div>
              </div>
              <div className="flex-1 px-6 py-4 overflow-hidden">
                {/* AI Summary */}
                <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary mb-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    Aria summary
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Sarah is requesting your approval on the Q3 headcount plan by EOD Friday. She's proposing 2 new hires in infra. <span className="text-primary font-semibold">Action required: Review & approve</span>
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    "Hi! Thanks for the detailed breakdown of the Q3 plan.",
                    "I've reviewed the infra team proposal and I think the 2 new hire slots make a lot of sense given the scaling targets you laid out.",
                    "One thing I wanted to flag — can we revisit the timeline on ENG-441? I think we might be able to ship 2 weeks earlier if we...",
                  ].map((line, i) => (
                    <div key={i} className="h-2 bg-muted/60 rounded-full" style={{ width: `${[100, 90, 75][i]}%` }} />
                  ))}
                </div>
              </div>
              {/* Reply bar */}
              <div className="px-4 py-3 border-t border-border/50">
                <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2 text-[10px] text-muted-foreground/60 border border-border/40">
                  <PenSquare className="w-3 h-3" />
                  <span>Reply with Aria…</span>
                  <span className="ml-auto text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-semibold">AI draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Actual Aria dashboard · AI summary, email triage, and smart reply shown above
        </p>
      </div>
    </section>
  );
}
