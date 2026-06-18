"use client";

import { SignupForm } from "@/components/signup-form";

function SignUpClient() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2.5 self-center font-extrabold text-foreground tracking-tight">
          <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-extrabold">A</span>
          </div>
          Aria
        </a>
        <SignupForm />
      </div>
    </div>
  );
}

export default SignUpClient;
