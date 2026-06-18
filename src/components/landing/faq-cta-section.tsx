"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const faqs = [
  {
    q: "Is my email data secure?",
    a: "Absolutely. Aria uses OAuth 2.0 to connect your accounts — we never see or store your passwords. Email content is processed in-memory and is never persisted on our servers. You can revoke access at any time from your Google account settings.",
  },
  {
    q: "Which email providers are supported?",
    a: "Right now we support Gmail fully, with Outlook/Microsoft 365 coming in Q3 2026. We use Google's official Gmail API with the exact permission scopes needed — nothing more.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, absolutely. Cancel anytime from your account settings. You'll retain access until the end of your billing period with no additional charges.",
  },
  {
    q: "Does Aria send emails automatically?",
    a: "Only when you explicitly tell it to. Aria drafts, suggests, and queues — but it never sends an email without your final confirmation unless you've explicitly enabled auto-send for specific workflows.",
  },
  {
    q: "What AI model powers Aria?",
    a: "Aria uses a combination of state-of-the-art large language models fine-tuned on email and productivity tasks. We continuously improve the models based on usage patterns and feedback.",
  },
  {
    q: "How does the free plan compare to Pro?",
    a: "The free plan gives you a taste of AI email triage with 100 emails/month and 20 AI drafts. Pro unlocks unlimited triage, all integrations (Calendar, GitHub, Slack), and the full AI command bar.",
  },
];

export default function FaqCtaSection() {
  const router = useRouter();

  return (
    <>
      {/* FAQ */}
      <section className="py-24 px-6 bg-zinc-50/80 dark:bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Got questions?
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border/60 bg-white dark:bg-card shadow-sm overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer text-sm font-semibold text-foreground list-none hover:bg-muted/30 transition-colors">
                  {faq.q}
                  <svg
                    className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-amber-300/60 dark:border-primary/20 bg-gradient-to-br from-amber-50 via-yellow-50/50 to-white dark:from-primary/10 dark:via-amber-400/5 dark:to-background p-12 text-center shadow-xl shadow-amber-200/40 dark:shadow-primary/5">
            {/* Glow */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-primary/20 blur-3xl rounded-full" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/8 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              No credit card required
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-5">
              Start working smarter today
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Join 1,200+ professionals who use Aria to save hours every week. 
              Free forever, upgrade when you're ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => router.push("/sign-up")}
                className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/login")}
                className="h-12 px-8 text-base font-semibold rounded-xl"
              >
                Sign in to your account
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Free plan includes 100 AI triage + 20 smart drafts per month · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-[9px] font-bold text-primary-foreground">A</span>
            </div>
            <span className="font-semibold text-foreground">Aria</span>
            <span className="text-border">·</span>
            <span>© 2026 Aria, Inc.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Blog</a>
            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
