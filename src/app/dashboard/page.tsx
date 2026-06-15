"use client";

import DashboardNav from "@/components/Dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";


interface GmailMessage {
  id: string;
  threadId?: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

const DashboardPage = () => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const fetchGmailMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/messages");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to fetch messages");
      }
      setMessages(data.messages ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardNav />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <Button onClick={fetchGmailMessages} disabled={loading}>
            {loading ? "Loading…" : "Fetch Gmail Messages"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive border border-destructive/30 rounded-md px-4 py-3 bg-destructive/10">
            {error}
          </p>
        )}

        {messages.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
            {messages.map((msg) => (
              <li key={msg.id} className="px-4 py-3 bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {msg.subject ?? "(no subject)"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {msg.from}
                    </p>
                    {msg.snippet && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {msg.snippet}
                      </p>
                    )}
                  </div>
                  {msg.date && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {msg.date}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!loading && messages.length === 0 && !error && (
          <p className="text-sm text-muted-foreground">
            Click the button above to load your Gmail messages.
          </p>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;