"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "../ui/button";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
      {/* Background layer */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Main warm glow — more visible in light */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-amber-300/30 dark:bg-primary/10 blur-3xl animate-pulse" />
        {/* Left accent */}
        <div className="absolute top-24 -left-32 w-80 h-80 rounded-full bg-orange-200/40 dark:bg-primary/8 blur-3xl" />
        {/* Right accent */}
        <div className="absolute top-36 -right-24 w-64 h-64 rounded-full bg-yellow-200/35 dark:bg-chart-1/10 blur-2xl" />
        {/* Bottom soft wash */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[180px] bg-amber-100/50 dark:bg-primary/5 blur-3xl rounded-full" />

        {/* Dot grid — more visible in light */}
        <div
          className="absolute inset-0 opacity-[0.12] dark:opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/50 dark:border-primary/30 bg-amber-50 dark:bg-primary/8 text-amber-700 dark:text-primary text-xs font-semibold mb-6 shadow-sm shadow-amber-200/50 dark:shadow-primary/10">
        <Sparkles className="w-3.5 h-3.5" />
        <span>AI-powered productivity, reimagined</span>
        <Zap className="w-3.5 h-3.5" />
      </div>

      {/* Headline */}
      <h1 className="max-w-4xl text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground mb-5">
        Your inbox,{" "}
        <span className="relative inline-block">
          <span className="relative z-10 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500 dark:from-primary dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            supercharged
          </span>
          <span className="absolute -inset-1 rounded-xl bg-amber-400/15 dark:bg-primary/10 blur-sm -z-0" />
        </span>{" "}
        by AI
      </h1>

      {/* Sub-headline */}
      <p className="max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
        Aria connects your Gmail, Google Calendar, GitHub, and Slack into one intelligent workspace.{" "}
        Let AI handle the noise — you focus on what matters.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <Button
          size="lg"
          onClick={() => router.push("/sign-up")}
          className="h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-amber-400/30 dark:shadow-primary/20 hover:shadow-amber-400/50 dark:hover:shadow-primary/35 hover:scale-[1.02] transition-all duration-200"
        >
          Start for free
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/login")}
          className="h-12 px-8 text-base font-semibold rounded-xl border-border/70 hover:bg-amber-50/60 dark:hover:bg-muted/30"
        >
          View demo
        </Button>
      </div>

      {/* Social proof */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex -space-x-2">
          {["#e11d48", "#7c3aed", "#0ea5e9", "#16a34a", "#ea580c"].map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-background flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              {["A", "B", "C", "D", "E"][i]}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="text-foreground font-semibold">1,200+</span> professionals manage their inbox with Aria
        </p>
      </div>
    </section>
  );
}
