"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

/**
 * RequireAuth ensures the user is logged in.
 * If not authenticated, redirects to /login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * RequireUnAuth ensures the user is NOT logged in.
 * If already authenticated, redirects to /home.
 */
export function RequireUnAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => {
    if (!sessionLoading && session) {
      router.push("/home");
    }
  }, [session, sessionLoading, router]);

  if (sessionLoading || session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * withAuth is a Higher-Order Component (HOC) version of RequireAuth.
 */
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    return (
      <RequireAuth>
        <Component {...props} />
      </RequireAuth>
    );
  };
}

/**
 * withUnAuth is a Higher-Order Component (HOC) version of RequireUnAuth.
 */
export function withUnAuth<T extends object>(Component: React.ComponentType<T>) {
  return function UnauthenticatedComponent(props: T) {
    return (
      <RequireUnAuth>
        <Component {...props} />
      </RequireUnAuth>
    );
  };
}
