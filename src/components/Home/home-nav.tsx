"use client";

import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ModeToggle } from "../toggle-button";
import { LogoutButton } from "../logout-button";

const HomeNav = () => {
  const router = useRouter();

  return (
   <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40 shadow-sm">
         <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
           <div className="text-xl font-semibold text-foreground cursor-pointer" onClick={() => router.push("/")}>Aria</div>
           <div className="flex items-center gap-4">
             <Button 
               onClick={() => router.push("/connect")}
             >
               Connect
             </Button>
             <Button 
               onClick={() => router.push("/dashboard")}
             >
               Dashboard
             </Button>
             <Button 
               variant="outline"
               onClick={() => router.push("/calendar")}
             >
               Calendar
             </Button>
             <LogoutButton variant="header" />
             <ModeToggle />
           </div>
         </nav>
       </div>
  );
};

export default HomeNav;
