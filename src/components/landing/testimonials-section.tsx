"use client";

const testimonials = [
  {
    quote: "Aria cut my inbox time in half. The AI triage is eerily accurate — I haven't missed an important email in weeks.",
    name: "Sarah K.",
    role: "Engineering Manager @ Stripe",
    initials: "SK",
    color: "#7c3aed",
  },
  {
    quote: "The GitHub + Gmail integration is a game changer. I get PR summaries in my inbox without the noise of 50 notification emails.",
    name: "Marcus R.",
    role: "Staff Engineer @ Vercel",
    initials: "MR",
    color: "#0ea5e9",
  },
  {
    quote: "I use the AI compose feature every single day. It writes in my voice so well that my team doesn't even notice.",
    name: "Priya M.",
    role: "Product Lead @ Linear",
    initials: "PM",
    color: "#16a34a",
  },
  {
    quote: "The semantic search alone is worth the subscription. I found a 2-year-old email thread in under 3 seconds.",
    name: "James L.",
    role: "Founder @ Acme Corp",
    initials: "JL",
    color: "#ea580c",
  },
  {
    quote: "Finally, an email tool that understands context. Aria knows what's urgent before I even read my inbox.",
    name: "Aisha T.",
    role: "Operations Director @ Notion",
    initials: "AT",
    color: "#e11d48",
  },
  {
    quote: "We rolled Aria out to our entire team of 8 and saved 3+ hours per person per week on email overhead. ROI is insane.",
    name: "Chen W.",
    role: "CTO @ Loom",
    initials: "CW",
    color: "#8b5cf6",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Loved by professionals
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            Don't take our word for it
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            Thousands of engineers, founders, and operators use Aria to reclaim their time.
          </p>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="break-inside-avoid rounded-2xl border border-border/50 bg-white dark:bg-card shadow-sm hover:border-border hover:shadow-md transition-all duration-200 group p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground/80 leading-relaxed mb-5 italic">"{t.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-background"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
