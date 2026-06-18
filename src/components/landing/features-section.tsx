"use client";

import {
  Brain,
  CalendarDays,
  GitBranch,
  MessageSquare,
  Shield,
  Zap,
  Search,
  PenSquare,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Triage",
    description:
      "Aria intelligently reads, categorizes, and prioritizes your emails — surfacing what matters most, so you never miss a critical message.",
    accent: "from-amber-400/20 to-yellow-300/10 dark:from-primary/20 dark:to-amber-400/10",
    iconBg: "bg-amber-50 dark:bg-muted/60",
    iconColor: "text-amber-600 dark:text-primary",
    border: "hover:border-amber-300/70 dark:hover:border-border",
  },
  {
    icon: PenSquare,
    title: "Smart Compose",
    description:
      "Write emails 10× faster. Aria drafts replies in your own voice, suggests tone adjustments, and handles routine correspondence automatically.",
    accent: "from-violet-100/80 to-purple-50/50 dark:from-violet-500/15 dark:to-purple-400/5",
    iconBg: "bg-violet-50 dark:bg-muted/60",
    iconColor: "text-violet-600 dark:text-violet-500",
    border: "hover:border-violet-300/60 dark:hover:border-border",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description:
      "Find any email, attachment, or conversation instantly with natural language. Ask 'what did John say about the Q3 contract?' and get the answer.",
    accent: "from-sky-100/80 to-blue-50/50 dark:from-sky-500/15 dark:to-blue-400/5",
    iconBg: "bg-sky-50 dark:bg-muted/60",
    iconColor: "text-sky-600 dark:text-sky-500",
    border: "hover:border-sky-300/60 dark:hover:border-border",
  },
  {
    icon: CalendarDays,
    title: "Calendar Integration",
    description:
      "Aria reads your schedule and emails together. It automatically surfaces relevant emails before meetings and suggests scheduling in context.",
    accent: "from-emerald-100/80 to-green-50/50 dark:from-emerald-500/15 dark:to-green-400/5",
    iconBg: "bg-emerald-50 dark:bg-muted/60",
    iconColor: "text-emerald-600 dark:text-emerald-500",
    border: "hover:border-emerald-300/60 dark:hover:border-border",
  },
  {
    icon: GitBranch,
    title: "GitHub Sync",
    description:
      "Connect your repositories. Aria monitors PRs, issues, and reviews — notifying you when action is needed without drowning in GitHub emails.",
    accent: "from-slate-100/80 to-zinc-50/50 dark:from-slate-500/15 dark:to-zinc-400/5",
    iconBg: "bg-slate-100 dark:bg-muted/60",
    iconColor: "text-slate-700 dark:text-slate-300",
    border: "hover:border-slate-300/60 dark:hover:border-border",
  },
  {
    icon: MessageSquare,
    title: "Slack Intelligence",
    description:
      "Bridge the gap between Slack and email. Aria surfaces key Slack threads in your workflow and can respond across both channels seamlessly.",
    accent: "from-fuchsia-100/80 to-pink-50/50 dark:from-fuchsia-500/15 dark:to-pink-400/5",
    iconBg: "bg-fuchsia-50 dark:bg-muted/60",
    iconColor: "text-fuchsia-600 dark:text-fuchsia-500",
    border: "hover:border-fuchsia-300/60 dark:hover:border-border",
  },
  {
    icon: Clock,
    title: "Focus Time Protection",
    description:
      "Set focus hours and Aria batches low-priority emails, mutes non-urgent notifications, and keeps interruptions to a minimum.",
    accent: "from-orange-100/80 to-amber-50/50 dark:from-orange-500/15 dark:to-amber-400/5",
    iconBg: "bg-orange-50 dark:bg-muted/60",
    iconColor: "text-orange-600 dark:text-orange-500",
    border: "hover:border-orange-300/60 dark:hover:border-border",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your emails stay yours. Aria uses end-to-end encrypted OAuth tokens. We never store email content on our servers.",
    accent: "from-teal-100/80 to-cyan-50/50 dark:from-teal-500/15 dark:to-cyan-400/5",
    iconBg: "bg-teal-50 dark:bg-muted/60",
    iconColor: "text-teal-600 dark:text-teal-500",
    border: "hover:border-teal-300/60 dark:hover:border-border",
  },
  {
    icon: Zap,
    title: "Instant Actions",
    description:
      "Archive, star, snooze, reply — all with a single AI command. Aria executes bulk actions across your inbox in seconds.",
    accent: "from-yellow-100/80 to-amber-50/50 dark:from-yellow-500/15 dark:to-amber-300/5",
    iconBg: "bg-yellow-50 dark:bg-muted/60",
    iconColor: "text-yellow-600 dark:text-yellow-500",
    border: "hover:border-yellow-300/60 dark:hover:border-border",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-amber-600 dark:text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Everything you need
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            Built for how you actually work
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Aria is not just another email client. It's an intelligent layer on top of your tools that learns, adapts, and acts on your behalf.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`group relative rounded-2xl border border-border/50 bg-white dark:bg-card p-6 
                  shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 
                  ${f.border} transition-all duration-300 hover:-translate-y-0.5 overflow-hidden`}
              >
                {/* Gradient fill on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
