"use client";

const steps = [
  {
    number: "01",
    title: "Connect your tools",
    description:
      "Sign up in seconds and connect Gmail, Google Calendar, GitHub, and Slack with one-click OAuth. No complex setup, no API keys.",
    detail: "Aria requests only the permissions it needs — read, compose, and send on your behalf.",
  },
  {
    number: "02",
    title: "Aria learns your style",
    description:
      "Over the first few days, Aria analyzes your communication patterns, priority contacts, and writing style — building a model that's uniquely yours.",
    detail: "Your data never leaves your OAuth tokens. All learning happens in a privacy-preserving pipeline.",
  },
  {
    number: "03",
    title: "Let AI handle the noise",
    description:
      "Newsletters, notifications, and low-priority threads get auto-archived. Important emails are flagged, summarized, and ready for your action.",
    detail: "You always stay in control — every AI action can be reviewed, undone, or adjusted.",
  },
  {
    number: "04",
    title: "Work smarter every day",
    description:
      "Use natural language to search, compose, schedule, and act across all your connected tools from a single AI-powered command bar.",
    detail: "Ask Aria anything: 'Draft a follow-up for the client meeting on Thursday' and it's done.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-zinc-50/80 dark:bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Simple by design
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            Up and running in minutes
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            No training required. Aria adapts to you — not the other way around.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-border hidden lg:block" />

          <div className="space-y-10 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-14">
            {steps.map((step, i) => (
              <div key={i} className="relative flex gap-6 group">
                {/* Step number */}
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-amber-50 dark:bg-primary/10 border border-amber-300/60 dark:border-primary/20 flex items-center justify-center group-hover:bg-amber-100 dark:group-hover:bg-primary/15 transition-colors shadow-sm">
                  <span className="text-xl font-extrabold text-amber-600 dark:text-primary font-mono">{step.number}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-3">{step.description}</p>
                  <div className="inline-flex items-start gap-2 text-xs text-muted-foreground/70 bg-muted/50 rounded-lg px-3 py-2 border border-border/40">
                    <span className="text-primary mt-0.5">→</span>
                    <span>{step.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
