"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
      {/* Background layer */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[80px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full bg-orange-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-8 backdrop-blur-sm">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Your AI-powered intelligent workspace</span>
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
        Reclaim your inbox with{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
          Aria
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
        Seamlessly connect Gmail, Calendar, GitHub, and Slack. Let our advanced AI summarize threads, draft replies, and organize your work—so you can focus on what matters.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
        <Button
          size="lg"
          onClick={() => router.push("/sign-up")}
          className="h-12 px-8 text-base font-semibold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
        >
          Get Started for Free
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/login")}
          className="h-12 px-8 text-base font-semibold rounded-2xl border-border/60 hover:bg-muted/50"
        >
          Sign In
        </Button>
      </div>

      {/* Trust indicators */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Secure OAuth 2.0 connection. No credit card required.</span>
      </div>
    </section>
  );
}

