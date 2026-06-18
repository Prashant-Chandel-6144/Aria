"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../toggle-button";
import { Menu, X } from "lucide-react";

const LandingNav = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 ring-1 ring-border/10">
            <span className="text-xs font-bold text-primary-foreground">A</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">Aria</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors cursor-pointer">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors cursor-pointer">How it works</button>
          <button onClick={() => scrollTo("integrations")} className="hover:text-foreground transition-colors cursor-pointer">Integrations</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors cursor-pointer">Pricing</button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="font-semibold">
            Log in
          </Button>
          <Button size="sm" onClick={() => router.push("/login")} className="font-semibold shadow-sm shadow-primary/15 rounded-xl">
            Get started free
          </Button>
          <ModeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-xl border border-border/40 hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {["features", "how-it-works", "integrations", "pricing"].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground py-1.5 capitalize transition-colors"
            >
              {id.replace("-", " ")}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => { setMobileOpen(false); router.push("/login"); }} className="flex-1 rounded-xl">Log in</Button>
            <Button size="sm" onClick={() => { setMobileOpen(false); router.push("/login"); }} className="flex-1 rounded-xl">Get started</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingNav;
