import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvancedSearchProps {
  onSearch: (params: {
    query: string;
    from: string;
    to: string;
    subject: string;
    hasAttachment: boolean;
    mode: "live" | "local";
  }) => void;
  isLoading?: boolean;
}

export function AdvancedSearch({ onSearch, isLoading = false }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter fields
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);
  const [searchMode, setSearchMode] = useState<"live" | "local">("live");

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      from,
      to,
      subject,
      hasAttachment,
      mode: searchMode,
    });
    setIsOpen(false);
  };

  const handleReset = () => {
    setQuery("");
    setFrom("");
    setTo("");
    setSubject("");
    setHasAttachment(false);
    setSearchMode("live");
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5 flex-1 max-w-sm">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
        <input
          id="mail-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch({
                query,
                from,
                to,
                subject,
                hasAttachment,
                mode: searchMode,
              });
            }
          }}
          placeholder={searchMode === "local" ? "Vector AI search local cache…" : "Search mail live…"}
          className={cn(
            "w-full bg-muted/30 border border-border/30 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:bg-background/90 transition-all",
            searchMode === "local"
              ? "focus:ring-emerald-400/20 focus:border-emerald-400/50"
              : "focus:ring-primary/20 focus:border-primary/45"
          )}
        />
        {/* Advanced Filter Toggle Button inside input */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="Advanced Search Filters"
          className={cn(
            "absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer",
            isOpen
              ? "bg-primary/10 border-primary/20 text-primary"
              : "border-transparent hover:border-border/30 hover:bg-accent text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="h-3 w-3" />
        </button>
      </div>

      {/* Advanced Search Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2.5 w-80 bg-card border border-border/60 rounded-3xl shadow-2xl z-50 p-5 space-y-4 backdrop-blur-xl animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-border/30">
            <span className="text-xs font-bold text-foreground">Advanced Filters</span>
            <button
              type="button"
              onClick={handleReset}
              className="text-[10px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Reset
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-3.5">
            {/* Search Location Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                Search Engine
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/40 border border-border/30 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSearchMode("live")}
                  className={cn(
                    "py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer",
                    searchMode === "live"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Live Gmail API
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode("local")}
                  className={cn(
                    "py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer",
                    searchMode === "local"
                      ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-border/20"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Local AI (pgvector)
                </button>
              </div>
            </div>

            {/* From Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-0.5">
                From
              </label>
              <input
                type="text"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Sender email (e.g. boss@corp.com)"
                className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all"
              />
            </div>

            {/* To Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-0.5">
                To
              </label>
              <input
                type="text"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Recipient email (e.g. me@corp.com)"
                className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all"
              />
            </div>

            {/* Subject Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-0.5">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line contains…"
                className="w-full bg-muted/30 border border-border/40 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/40 focus:bg-background transition-all"
              />
            </div>

            {/* Has Attachment Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="has-attachment-checkbox"
                checked={hasAttachment}
                onChange={(e) => setHasAttachment(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
              />
              <label
                htmlFor="has-attachment-checkbox"
                className="text-[11px] font-semibold text-muted-foreground select-none cursor-pointer"
              >
                Has attachment
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer",
                searchMode === "local"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10"
                  : "bg-primary hover:opacity-95 shadow-primary/10",
                isLoading && "opacity-50 pointer-events-none"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              {isLoading ? "Searching…" : "Search"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
