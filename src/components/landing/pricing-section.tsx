"use client";

import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    tagline: "Perfect to get started",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Try Aria with your Gmail and see what AI-powered email feels like.",
    cta: "Start for free",
    ctaVariant: "outline" as const,
    highlighted: false,
    features: [
      "1 Gmail account",
      "AI email triage (100 emails/month)",
      "Smart compose (20 drafts/month)",
      "Semantic search (basic)",
      "Email summarization",
      "Community support",
    ],
    missing: [
      "Google Calendar integration",
      "GitHub & Slack",
      "Unlimited triage",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    tagline: "For busy professionals",
    monthlyPrice: 12,
    yearlyPrice: 9,
    description: "Unlock the full Aria experience with all integrations and unlimited AI actions.",
    cta: "Start 14-day free trial",
    ctaVariant: "default" as const,
    highlighted: true,
    badge: "Most popular",
    features: [
      "Up to 3 Gmail accounts",
      "Unlimited AI email triage",
      "Unlimited smart compose",
      "Google Calendar integration",
      "GitHub integration",
      "Slack integration",
      "Advanced semantic search",
      "AI command bar",
      "Focus time protection",
      "Priority email support",
    ],
    missing: [],
  },
  {
    name: "Team",
    tagline: "Built for teams",
    monthlyPrice: 29,
    yearlyPrice: 22,
    description: "Everything in Pro, plus shared AI models, admin controls, and team analytics.",
    cta: "Start 14-day free trial",
    ctaVariant: "outline" as const,
    highlighted: false,
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Shared AI assistant",
      "Team inbox management",
      "Admin controls & audit logs",
      "Custom integrations (API)",
      "SAML SSO",
      "Dedicated Slack support",
      "Onboarding call",
    ],
    missing: [],
  },
];

export default function PricingSection() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  return (
    <section id="pricing" className="py-24 px-6 bg-zinc-50/80 dark:bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Simple pricing
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
            Pay for what you use
          </h2>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white dark:bg-background border border-border shadow-md dark:shadow-sm rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                −25%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, i) => {
            const price = billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-200 ${
                  plan.highlighted
                    ? "border-amber-400/70 dark:border-primary bg-gradient-to-b from-amber-50/80 to-white dark:from-primary/5 dark:to-transparent shadow-xl shadow-amber-200/60 dark:shadow-primary/10 scale-[1.02]"
                    : "border-border/50 bg-white dark:bg-card shadow-sm hover:border-border hover:shadow-md"
                }`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-md shadow-primary/20">
                      <Zap className="w-3 h-3" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{plan.tagline}</div>
                  <h3 className="text-2xl font-extrabold text-foreground">{plan.name}</h3>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-5xl font-extrabold text-foreground">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && (
                    <span className="text-muted-foreground text-sm mb-2">
                      /mo{billing === "yearly" && ", billed yearly"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-8">{plan.description}</p>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant}
                  className={`w-full h-11 font-semibold rounded-xl mb-8 ${
                    plan.highlighted ? "shadow-md shadow-primary/20" : ""
                  }`}
                  onClick={() => router.push("/sign-up")}
                >
                  {plan.cta}
                </Button>

                {/* Divider */}
                <div className="border-t border-border/50 mb-6" />

                {/* Features */}
                <div className="flex-1 space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}
                  {plan.missing.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3 text-sm opacity-35">
                      <span className="w-4 h-4 shrink-0 mt-0.5 flex items-center justify-center text-muted-foreground">—</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise note */}
        <div className="mt-10 text-center p-6 rounded-2xl border border-border/50 bg-white dark:bg-card shadow-sm max-w-2xl mx-auto">
          <h3 className="font-bold text-foreground mb-1">Need more than 10 seats?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            We offer custom Enterprise plans with unlimited seats, advanced compliance, custom AI models, and SLA guarantees.
          </p>
          <Button variant="outline" size="sm" className="rounded-xl">
            Contact sales →
          </Button>
        </div>
      </div>
    </section>
  );
}
