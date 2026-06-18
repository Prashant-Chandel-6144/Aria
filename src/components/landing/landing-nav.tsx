"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../toggle-button";

const LandingNav = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <span className="text-xs font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">Aria</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors cursor-pointer">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors cursor-pointer">How it works</button>
          <button onClick={() => scrollTo("integrations")} className="hover:text-foreground transition-colors cursor-pointer">Integrations</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors cursor-pointer">Pricing</button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
            Login
          </Button>
          <Button size="sm" onClick={() => router.push("/sign-up")}>
            Get started free
          </Button>
          <ModeToggle />
        </div>
      </nav>
    </div>
  );
};

export default LandingNav;
