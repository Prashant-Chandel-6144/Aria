import { useEffect, useRef } from "react";

interface ShortcutActions {
  onCompose?: () => void;
  onReply?: () => void;
  onDelete?: () => void;
  onToggleStar?: () => void;
  onToggleRead?: () => void;
  onFocusSearch?: () => void;
  onNavigateDown?: () => void;
  onNavigateUp?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onGoToTab?: (tab: string) => void;
  onOpenCheatsheet?: () => void;
}

export function useShortcuts(actions: ShortcutActions, deps: any[] = []) {
  const lastKeyRef = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load custom bindings from localStorage
    let custom: Record<string, string[]> = {};
    try {
      const saved = localStorage.getItem("aria_keyboard_shortcuts");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize single strings/comma-separated strings to arrays
        Object.keys(parsed).forEach((k) => {
          const val = parsed[k];
          if (typeof val === "string") {
            custom[k] = val.split(",").map((s) => s.trim().toLowerCase());
          } else if (Array.isArray(val)) {
            custom[k] = val.map((s) => s.trim().toLowerCase());
          }
        });
      }
    } catch {
      // fallback
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

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        (activeEl as HTMLElement)?.isContentEditable;

      // Global keys that should work even when typing in search input (e.g., Escape)
      if (event.key === "Escape") {
        actions.onClose?.();
        // Unfocus active input
        if (activeEl instanceof HTMLElement) {
          activeEl.blur();
        }
        return;
      }

      // If user is actively typing in inputs or textareas, skip shortcuts
      if (isTyping) {
        return;
      }

      const key = event.key.toLowerCase();

      // Sequence handler (e.g., "g" followed by "i")
      if (lastKeyRef.current === "g") {
        lastKeyRef.current = "";
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const tabMap: Record<string, string> = {
          i: "inbox",
          d: "drafts",
          s: "sent",
          t: "trash",
          c: "calendar",
          p: "profile",
          a: "chat",
        };

        const targetTab = tabMap[key];
        if (targetTab && actions.onGoToTab) {
          event.preventDefault();
          actions.onGoToTab(targetTab);
          return;
        }
      }

      if (key === "g") {
        lastKeyRef.current = "g";
        timeoutRef.current = setTimeout(() => {
          lastKeyRef.current = "";
        }, 1000);
        return;
      }

      const match = (keys: string[]) => keys.map((k) => k.toLowerCase()).includes(key);

      if (match(bindings.down)) {
        event.preventDefault();
        actions.onNavigateDown?.();
      } else if (match(bindings.up)) {
        event.preventDefault();
        actions.onNavigateUp?.();
      } else if (match(bindings.open)) {
        event.preventDefault();
        actions.onOpen?.();
      } else if (match(bindings.compose)) {
        event.preventDefault();
        actions.onCompose?.();
      } else if (match(bindings.reply)) {
        event.preventDefault();
        actions.onReply?.();
      } else if (match(bindings.delete)) {
        event.preventDefault();
        actions.onDelete?.();
      } else if (match(bindings.star)) {
        event.preventDefault();
        actions.onToggleStar?.();
      } else if (match(bindings.unread)) {
        event.preventDefault();
        actions.onToggleRead?.();
      } else if (match(bindings.search)) {
        event.preventDefault();
        actions.onFocusSearch?.();
      } else if (match(bindings.cheatsheet)) {
        event.preventDefault();
        actions.onOpenCheatsheet?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, ...deps]);
}
