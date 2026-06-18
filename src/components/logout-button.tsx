"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutUser } from "@/lib/auth-client";
import { toast } from "sonner";

interface LogoutButtonProps {
  className?: string;
  variant?: "sidebar" | "header" | "profile";
  showLabel?: boolean;
  label?: string;
}

export function LogoutButton({
  className,
  variant = "sidebar",
  showLabel = true,
  label = "Log out",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutUser("/login");
    } catch {
      toast.error("Failed to log out. Please try again.");
      setLoading(false);
    }
  };

  const baseStyles = {
    sidebar:
      "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer",
    header:
      "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer",
    profile:
      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all cursor-pointer",
  };

  return (
    <button
      type="button"
      id="logout-button"
      onClick={handleLogout}
      disabled={loading}
      title={label}
      className={cn(baseStyles[variant], loading && "opacity-60 pointer-events-none", className)}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4 shrink-0" />
      )}
      {showLabel && <span>{loading ? "Logging out..." : label}</span>}
    </button>
  );
}
