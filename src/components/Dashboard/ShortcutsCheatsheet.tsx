import React from "react";
import { X } from "lucide-react";

interface ShortcutsCheatsheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsCheatsheet({ isOpen, onClose }: ShortcutsCheatsheetProps) {
  if (!isOpen) return null;

  // Load custom bindings
  let custom: Record<string, string[]> = {};
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("aria_keyboard_shortcuts");
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((k) => {
          const val = parsed[k];
          if (typeof val === "string") {
            custom[k] = val.split(",").map((s) => s.trim());
          } else if (Array.isArray(val)) {
            custom[k] = val.map((s) => s.trim());
          }
        });
      }
    } catch {}
  }

  const bindings = {
    compose: custom.compose || ["c", "n"],
    reply: custom.reply || ["r"],
    delete: custom.delete || ["backspace", "e"],
    star: custom.star || ["*"],
    unread: custom.unread || ["u"],
    search: custom.search || ["/"],
    down: custom.down || ["j", "arrowdown"],
    up: custom.up || ["k", "arrowup"],
    open: custom.open || ["enter", "o"],
    cheatsheet: custom.cheatsheet || ["?"],
  };

  const sections = [
    {
      title: "Navigation",
      items: [
        { keys: bindings.down, desc: "Select next email/row" },
        { keys: bindings.up, desc: "Select previous email/row" },
        { keys: bindings.open, desc: "Open selected email" },
        { keys: bindings.search, desc: "Focus search bar" },
        { keys: ["Esc"], desc: "Close panel / clear focus" },
      ],
    },
    {
      title: "Email Actions",
      items: [
        { keys: bindings.compose, desc: "Compose new email" },
        { keys: bindings.reply, desc: "Reply to current email" },
        { keys: bindings.delete, desc: "Move selected email to trash" },
        { keys: bindings.star, desc: "Toggle star (starred/unstarred)" },
        { keys: bindings.unread, desc: "Toggle read/unread status" },
      ],
    },
    {
      title: "Go To Tab",
      items: [
        { keys: ["g", "i"], desc: "Go to Inbox" },
        { keys: ["g", "d"], desc: "Go to Drafts" },
        { keys: ["g", "s"], desc: "Go to Sent" },
        { keys: ["g", "t"], desc: "Go to Trash" },
        { keys: ["g", "c"], desc: "Go to Calendar" },
        { keys: ["g", "p"], desc: "Go to Profile/Settings" },
        { keys: ["g", "a"], desc: "Go to Aria AI Chat" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden border border-border/60 bg-card/90 dark:bg-card/75 shadow-2xl rounded-3xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-foreground tracking-tight">
              Keyboard Shortcuts
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Cheatsheet
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-transparent hover:border-border/30 hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
            aria-label="Close cheatsheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider pl-1">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {section.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30 border border-transparent hover:border-border/10 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground/80">
                      {item.desc}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((key, kIdx) => (
                        <React.Fragment key={kIdx}>
                          {kIdx > 0 && key !== "↓" && key !== "↑" && (
                            <span className="text-[10px] text-muted-foreground/45 px-0.5">then</span>
                          )}
                          <kbd className="inline-flex h-6 items-center justify-center rounded-lg border border-border/60 bg-background px-2 text-[10px] font-extrabold text-foreground shadow-sm tabular-nums select-none min-w-[24px]">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-muted/20 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
          <span>Press <kbd className="border border-border/60 bg-background px-1.5 py-0.5 rounded text-foreground font-bold">Esc</kbd> to close at any time</span>
          <span>Press <kbd className="border border-border/60 bg-background px-1.5 py-0.5 rounded text-foreground font-bold">?</kbd> to open this help menu</span>
        </div>
      </div>
    </div>
  );
}
