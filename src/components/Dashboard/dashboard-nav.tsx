"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { ModeToggle } from "../toggle-button";

const DashboardNav = () => {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur  border-b border-border/40 shadow-sm">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-semibold text-foreground">Aria</div>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.replace("/home")}
          >
            Home
          </Button>
          <ModeToggle />
        </div>
      </nav>
    </div>
  );
};

export default DashboardNav;
