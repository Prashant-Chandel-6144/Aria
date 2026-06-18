"use client";

const integrations = [
  {
    name: "Gmail",
    description: "Read, compose, send, and manage your emails with full thread support.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path fill="#EA4335" d="M6 40h6V22L4 16v20a2 2 0 002 2z" />
        <path fill="#34A853" d="M36 40h6a2 2 0 002-2V16l-8 6z" />
        <path fill="#4285F4" d="M36 8H12L24 17l12-9z" />
        <path fill="#FBBC04" d="M12 22v18h24V22L24 31z" />
        <path fill="#EA4335" d="M4 16l8 6V8l-6 4a2 2 0 00-2 4z" />
        <path fill="#34A853" d="M44 16l-8 6V8l6 4a2 2 0 012 4z" />
      </svg>
    ),
    badge: "Connected",
    badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    name: "Google Calendar",
    description: "View events, schedule meetings, and sync calendar context with your emails.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect x="6" y="6" width="36" height="36" rx="4" fill="#1A73E8" />
        <rect x="6" y="6" width="36" height="12" rx="4" fill="#1A73E8" />
        <rect x="6" y="14" width="36" height="4" fill="#1A73E8" />
        <rect x="8" y="18" width="32" height="22" rx="2" fill="white" />
        <text x="24" y="34" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1A73E8">31</text>
      </svg>
    ),
    badge: "Connected",
    badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    name: "GitHub",
    description: "Monitor pull requests, issues, reviews, and CI status without the noise.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path
          fill="currentColor"
          className="text-foreground"
          d="M24 4C12.95 4 4 12.95 4 24c0 8.84 5.73 16.33 13.67 18.98.99.18 1.35-.43 1.35-.96 0-.47-.02-2.04-.02-3.7-5.52 1.19-6.68-2.38-6.68-2.38-.9-2.3-2.2-2.91-2.2-2.91-1.8-1.23.14-1.2.14-1.2 1.99.14 3.03 2.04 3.03 2.04 1.77 3.03 4.64 2.15 5.77 1.64.18-1.28.69-2.15 1.26-2.64-4.4-.5-9.03-2.2-9.03-9.8 0-2.17.77-3.94 2.04-5.33-.2-.5-.88-2.52.19-5.25 0 0 1.66-.53 5.44 2.03a18.9 18.9 0 014.96-.67c1.68.01 3.38.23 4.96.67 3.77-2.56 5.43-2.03 5.43-2.03 1.08 2.73.4 4.75.19 5.25 1.27 1.39 2.04 3.16 2.04 5.33 0 7.62-4.64 9.3-9.06 9.79.71.61 1.35 1.82 1.35 3.67 0 2.65-.02 4.78-.02 5.43 0 .53.36 1.15 1.36.96C38.28 40.32 44 32.84 44 24c0-11.05-8.95-20-20-20z"
        />
      </svg>
    ),
    badge: "Connected",
    badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    name: "Slack",
    description: "Bridge Slack threads with email. Respond to channels without context-switching.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path fill="#E01E5A" d="M12.3 24.9c0 2-.6 3.5-2.7 3.5s-2.7-1.5-2.7-3.5.6-3.5 2.7-3.5h2.7v3.5z"/>
        <path fill="#E01E5A" d="M13.7 24.9c0-2 .6-3.5 2.7-3.5s2.7 1.5 2.7 3.5v8.9c0 2-.6 3.5-2.7 3.5s-2.7-1.5-2.7-3.5v-8.9z"/>
        <path fill="#36C5F0" d="M16.4 11.7c-2 0-3.5-.6-3.5-2.7s1.5-2.7 3.5-2.7 3.5.6 3.5 2.7v2.7h-3.5z"/>
        <path fill="#36C5F0" d="M16.4 13c2 0 3.5.6 3.5 2.7s-1.5 2.7-3.5 2.7H7.5c-2 0-3.5-.6-3.5-2.7S5.5 13 7.5 13h8.9z"/>
        <path fill="#2EB67D" d="M29.6 15.7c0-2 .6-3.5 2.7-3.5s2.7 1.5 2.7 3.5-.6 3.5-2.7 3.5h-2.7v-3.5z"/>
        <path fill="#2EB67D" d="M28.3 15.7c0 2-.6 3.5-2.7 3.5s-2.7-1.5-2.7-3.5V6.8c0-2 .6-3.5 2.7-3.5s2.7 1.5 2.7 3.5v8.9z"/>
        <path fill="#ECB22E" d="M25.6 28.9c2 0 3.5.6 3.5 2.7s-1.5 2.7-3.5 2.7-3.5-.6-3.5-2.7v-2.7h3.5z"/>
        <path fill="#ECB22E" d="M25.6 27.5c-2 0-3.5-.6-3.5-2.7s1.5-2.7 3.5-2.7h8.9c2 0 3.5.6 3.5 2.7s-1.5 2.7-3.5 2.7h-8.9z"/>
      </svg>
    ),
    badge: "Connected",
    badgeColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    name: "Notion",
    description: "Sync meeting notes and action items directly into your Notion workspace.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect x="6" y="6" width="36" height="36" rx="6" fill="white" stroke="#E5E7EB" />
        <text x="24" y="32" textAnchor="middle" fontSize="22" fontWeight="900" fill="black">N</text>
      </svg>
    ),
    badge: "Coming soon",
    badgeColor: "text-muted-foreground bg-muted border-border",
  },
  {
    name: "Linear",
    description: "Bring issue tracking into your workflow — get PR and issue updates in context.",
    icon: (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <rect width="48" height="48" rx="10" fill="#5E6AD2"/>
        <path d="M12 36L36 12M12 24l12-12M24 36l12-12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    badge: "Coming soon",
    badgeColor: "text-muted-foreground bg-muted border-border",
  },
];

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Works with your stack
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            All your tools, one AI brain
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            Aria connects to the platforms you already use. No migration, no switching — just smarter workflows across everything.
          </p>
        </div>

        {/* Integration cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((integration, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-white dark:bg-card shadow-sm hover:border-border hover:shadow-md dark:hover:shadow-md dark:hover:shadow-black/15 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl border border-border/60 bg-white dark:bg-background flex items-center justify-center shadow-md dark:shadow-sm group-hover:scale-105 transition-transform">
                {integration.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-sm">{integration.name}</h3>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${integration.badgeColor}`}>
                    {integration.badge}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          More integrations coming soon · <span className="text-primary cursor-pointer hover:underline">Request an integration →</span>
        </p>
      </div>
    </section>
  );
}
