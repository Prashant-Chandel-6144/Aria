"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Inbox,
  FileText,
  Star,
  Send,
  Trash2,
  Settings,
  PenSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Home,
  Mail,
  CalendarDays,
  User,
  Loader2,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/toggle-button";
import MailList from "@/components/Dashboard/MailList";
import MailDetail from "@/components/Dashboard/MailDetail";
import ComposePanel from "@/components/Dashboard/ComposePanel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { withAuth } from "@/lib/auth-guards";
import ProfileClient from "../profile/profile-client";
import { useShortcuts } from "@/hooks/use-shortcuts";
import { ShortcutsCheatsheet } from "@/components/Dashboard/ShortcutsCheatsheet";
import { AdvancedSearch } from "@/components/Dashboard/AdvancedSearch";
import { sendDraft, deleteDraft } from "@/features/Gmail/actions/action";
import { CalendarViewComponent } from "@/components/Calendar/CalendarView";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GmailMessage {
  id: string;
  threadId?: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  isUnread?: boolean;
  labelIds?: string[];
  priority?: string | null;
}

const sortMailsByPriority = (mails: GmailMessage[]) => {
  const priorityWeight = {
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...mails].sort((a, b) => {
    const pA = priorityWeight[(a.priority || "") as keyof typeof priorityWeight] || 0;
    const pB = priorityWeight[(b.priority || "") as keyof typeof priorityWeight] || 0;

    if (pA !== pB) {
      return pB - pA;
    }

    // Secondary sort: date newest first
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      className="p-1 rounded-lg border border-border/20 bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

interface DraftMessage {
  id: string;
  messageId?: string;
  threadId?: string;
  snippet?: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
}

type Tab = "inbox" | "drafts" | "sent" | "trash" | "compose" | "calendar" | "profile" | "chat";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────
function SidebarItem({
  tab,
  isActive,
  collapsed,
  onClick,
  badge,
}: {
  tab: TabConfig;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: number;
}) {
  const Icon = tab.icon;
  return (
    <button
      id={`sidebar-tab-${tab.id}`}
      onClick={onClick}
      title={collapsed ? tab.label : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative border border-transparent",
        isActive
          ? "bg-primary/10 border-primary/25 text-primary dark:text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40 hover:border-border/10"
      )}
    >
      <Icon
        className={cn(
          "h-[1.05rem] w-[1.05rem] shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      {!collapsed && (
        <span className="flex-1 text-left truncate">{tab.label}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "ml-auto min-w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold px-1.5 shadow-sm",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground border border-border/20"
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/30" />
      )}
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyDetail({ onCompose }: { onCompose: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center space-y-5 max-w-xs">
        <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center mx-auto ring-1 ring-border/30">
          <Mail className="w-8 h-8 text-muted-foreground/25" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground/70">No message selected</p>
          <p className="text-xs text-muted-foreground/50 leading-relaxed">
            Pick a message from the list, or start a new one.
          </p>
        </div>
        <button
          onClick={onCompose}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/15 text-primary rounded-xl text-xs font-medium transition-colors"
        >
          <PenSquare className="h-3.5 w-3.5" />
          Compose new
        </button>
      </div>
    </div>
  );
}

// ─── Placeholder (Sent / Trash) ───────────────────────────────────────────────
function PlaceholderTab({ tab }: { tab: "sent" | "trash" }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          {tab === "sent" ? (
            <Send className="w-6 h-6 text-muted-foreground/40" />
          ) : (
            <Trash2 className="w-6 h-6 text-muted-foreground/40" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {tab === "sent" ? "Sent mails coming soon" : "Trash coming soon"}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function DashboardPage() {
  const router = useRouter();

  // Sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("inbox");

  // Mail data
  const [inboxMails, setInboxMails] = useState<GmailMessage[]>([]);
  const [drafts, setDrafts] = useState<DraftMessage[]>([]);
  const [sentMails, setSentMails] = useState<GmailMessage[]>([]);
  const [trashMails, setTrashMails] = useState<GmailMessage[]>([]);

  // Loading
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingMoreInbox, setLoadingMoreInbox] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [loadingSent, setLoadingSent] = useState(false);
  const [loadingMoreSent, setLoadingMoreSent] = useState(false);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [loadingMoreTrash, setLoadingMoreTrash] = useState(false);

  // Inbox pagination
  const [inboxNextPageToken, setInboxNextPageToken] = useState<string | null>(null);
  const [hasMoreInbox, setHasMoreInbox] = useState(false);

  // Sent pagination
  const [sentNextPageToken, setSentNextPageToken] = useState<string | null>(null);
  const [hasMoreSent, setHasMoreSent] = useState(false);

  // Trash pagination
  const [trashNextPageToken, setTrashNextPageToken] = useState<string | null>(null);
  const [hasMoreTrash, setHasMoreTrash] = useState(false);

  // Loaded state tracking (to avoid redundant fetching)
  const [loadedTabs, setLoadedTabs] = useState<Record<Tab, boolean>>({
    inbox: false,
    drafts: false,
    sent: false,
    trash: false,
    compose: false,
    calendar: false,
    profile: false,
    chat: false,
  });

  // Local Search & AI Chat States
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm Aria, your integrated AI workspace assistant.\n\nI have access to your Gmail and Google Calendar. You can ask me to list your emails, draft replies, create calendar invites, or summarize your day!",
    },
  ]);

  const [localEventsResults, setLocalEventsResults] = useState<any[]>([]);
  const [isLocalSearchActive, setIsLocalSearchActive] = useState(false);
  const [advancedSearchLoading, setAdvancedSearchLoading] = useState(false);
  const [actionedDrafts, setActionedDrafts] = useState<Record<string, "sent" | "discarded">>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "profile") {
        setActiveTab("profile");
      }
    }
  }, []);

  // Initialize & Backfill Vector Database Cache on Dashboard load
  useEffect(() => {
    fetch("/api/embeddings/backfill", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        console.log("Vector DB auto-backfill status:", data);
      })
      .catch((err) => {
        console.error("Vector DB auto-backfill check error:", err);
      });
  }, []);


  // Error
  const [errorInbox, setErrorInbox] = useState<string | null>(null);
  const [errorDrafts, setErrorDrafts] = useState<string | null>(null);
  const [errorSent, setErrorSent] = useState<string | null>(null);
  const [errorTrash, setErrorTrash] = useState<string | null>(null);

  // Detail
  const [selectedMail, setSelectedMail] = useState<GmailMessage | DraftMessage | null>(null);

  // Compose state (for draft-edit prefill)
  const [composeInitial, setComposeInitial] = useState<{
    draftId?: string;
    to?: string;
    subject?: string;
    message?: string;
  }>({});

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [inboxPriorityTab, setInboxPriorityTab] = useState<"all" | "high" | "medium" | "low">("all");

  // ── Mark Read / Unread ────────────────────────────────────────────────────
  /**
   * Optimistically flips isUnread in local state, then fires the API.
   * Works for inbox and important (GmailMessage arrays that have isUnread).
   */
  const handleMarkReadUnread = useCallback(
    async (id: string, markUnread: boolean) => {
      // Optimistic update
      const flip = (arr: GmailMessage[]) =>
        arr.map((m) => (m.id === id ? { ...m, isUnread: markUnread } : m));
      setInboxMails((prev) => flip(prev));
      setSentMails((prev) => flip(prev));
      setTrashMails((prev) => flip(prev));

      // Also update the selected mail if it matches
      setSelectedMail((prev) => {
        if (!prev || prev.id !== id) return prev;
        return { ...prev, isUnread: markUnread } as GmailMessage;
      });

      try {
        const res = await fetch("/api/gmail/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, unread: markUnread }),
        });
        if (!res.ok) {
          // Revert on failure
          const revert = (arr: GmailMessage[]) =>
            arr.map((m) => (m.id === id ? { ...m, isUnread: !markUnread } : m));
          setInboxMails((prev) => revert(prev));
          setSentMails((prev) => revert(prev));
          setTrashMails((prev) => revert(prev));
          setSelectedMail((prev) => {
            if (!prev || prev.id !== id) return prev;
            return { ...prev, isUnread: !markUnread } as GmailMessage;
          });
        }
      } catch {
        // Silent fail — optimistic state already applied
      }
    },
    []
  );

  const handleToggleStar = useCallback(
    async (id: string, makeStarred: boolean) => {
      // Optimistic update
      const toggle = (arr: GmailMessage[]) =>
        arr.map((m) => {
          if (m.id !== id) return m;
          const labels = m.labelIds ?? [];
          const newLabels = makeStarred
            ? [...labels.filter((l) => l !== "STARRED"), "STARRED"]
            : labels.filter((l) => l !== "STARRED");
          return { ...m, labelIds: newLabels };
        });

      setInboxMails((prev) => toggle(prev));
      setSentMails((prev) => toggle(prev));
      setTrashMails((prev) => toggle(prev));

      // Update selected mail
      setSelectedMail((prev) => {
        if (!prev || prev.id !== id) return prev;
        const labels = (prev as GmailMessage).labelIds ?? [];
        const newLabels = makeStarred
          ? [...labels.filter((l) => l !== "STARRED"), "STARRED"]
          : labels.filter((l) => l !== "STARRED");
        return { ...prev, labelIds: newLabels } as GmailMessage;
      });

      try {
        const res = await fetch("/api/gmail/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, starred: makeStarred }),
        });
        if (!res.ok) {
          // Revert on failure
          const revert = (arr: GmailMessage[]) =>
            arr.map((m) => {
              if (m.id !== id) return m;
              const labels = m.labelIds ?? [];
              const newLabels = !makeStarred
                ? [...labels.filter((l) => l !== "STARRED"), "STARRED"]
                : labels.filter((l) => l !== "STARRED");
              return { ...m, labelIds: newLabels };
            });
          setInboxMails((prev) => revert(prev));
          setSentMails((prev) => revert(prev));
          setTrashMails((prev) => revert(prev));
          setSelectedMail((prev) => {
            if (!prev || prev.id !== id) return prev;
            const labels = (prev as GmailMessage).labelIds ?? [];
            const newLabels = !makeStarred
              ? [...labels.filter((l) => l !== "STARRED"), "STARRED"]
              : labels.filter((l) => l !== "STARRED");
            return { ...prev, labelIds: newLabels } as GmailMessage;
          });
        }
      } catch {
        // silent
      }
    },
    []
  );

  /** Called when a mail row is clicked — auto-marks as read */
  const handleSelectMail = useCallback(
    (mail: GmailMessage | DraftMessage) => {
      setSelectedMail(mail);
      // Only mark non-draft unread messages as read
      if ("isUnread" in mail && mail.isUnread) {
        handleMarkReadUnread(mail.id, false);
      }
    },
    [handleMarkReadUnread]
  );

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchInbox = useCallback(async (searchQueryString?: string) => {
    setLoadingInbox(true);
    setErrorInbox(null);
    try {
      const url = searchQueryString
        ? `/api/gmail/inbox?q=${encodeURIComponent(searchQueryString)}`
        : "/api/gmail/inbox";
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch inbox");
      setInboxMails(data.messages ?? []);
      setInboxNextPageToken(data.nextPageToken ?? null);
      setHasMoreInbox(!!data.nextPageToken);
      setLoadedTabs((prev) => ({ ...prev, inbox: true }));
    } catch (err: any) {
      setErrorInbox(err.message);
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  /** Append the next page of inbox messages */
  const fetchMoreInbox = useCallback(async () => {
    if (!inboxNextPageToken || loadingMoreInbox) return;
    setLoadingMoreInbox(true);
    try {
      const url = `/api/gmail/inbox?pageToken=${encodeURIComponent(inboxNextPageToken)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch inbox");
      setInboxMails((prev) => {
        // De-duplicate by id
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = (data.messages ?? []).filter((m: { id: string }) => !existingIds.has(m.id));
        return [...prev, ...fresh];
      });
      setInboxNextPageToken(data.nextPageToken ?? null);
      setHasMoreInbox(!!data.nextPageToken);
    } catch {
      // Silently fail — user can scroll down again to retry
    } finally {
      setLoadingMoreInbox(false);
    }
  }, [inboxNextPageToken, loadingMoreInbox]);

  const fetchDrafts = useCallback(async () => {
    setLoadingDrafts(true);
    setErrorDrafts(null);
    try {
      const res = await fetch("/api/gmail/drafts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch drafts");
      setDrafts(data.drafts ?? []);
      setLoadedTabs((prev) => ({ ...prev, drafts: true }));
    } catch (err: any) {
      setErrorDrafts(err.message);
    } finally {
      setLoadingDrafts(false);
    }
  }, []);

  const fetchSent = useCallback(async () => {
    setLoadingSent(true);
    setErrorSent(null);
    try {
      const res = await fetch("/api/gmail/sent");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch sent");
      setSentMails(data.messages ?? []);
      setSentNextPageToken(data.nextPageToken ?? null);
      setHasMoreSent(!!data.nextPageToken);
      setLoadedTabs((prev) => ({ ...prev, sent: true }));
    } catch (err: any) {
      setErrorSent(err.message);
    } finally {
      setLoadingSent(false);
    }
  }, []);

  const fetchMoreSent = useCallback(async () => {
    if (!sentNextPageToken || loadingMoreSent) return;
    setLoadingMoreSent(true);
    try {
      const url = `/api/gmail/sent?pageToken=${encodeURIComponent(sentNextPageToken)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch sent");
      setSentMails((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = (data.messages ?? []).filter((m: { id: string }) => !existingIds.has(m.id));
        return [...prev, ...fresh];
      });
      setSentNextPageToken(data.nextPageToken ?? null);
      setHasMoreSent(!!data.nextPageToken);
    } catch {
      // silent
    } finally {
      setLoadingMoreSent(false);
    }
  }, [sentNextPageToken, loadingMoreSent]);

  const fetchTrash = useCallback(async () => {
    setLoadingTrash(true);
    setErrorTrash(null);
    try {
      const res = await fetch("/api/gmail/trash");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch trash");
      setTrashMails(data.messages ?? []);
      setTrashNextPageToken(data.nextPageToken ?? null);
      setHasMoreTrash(!!data.nextPageToken);
      setLoadedTabs((prev) => ({ ...prev, trash: true }));
    } catch (err: any) {
      setErrorTrash(err.message);
    } finally {
      setLoadingTrash(false);
    }
  }, []);

  const fetchMoreTrash = useCallback(async () => {
    if (!trashNextPageToken || loadingMoreTrash) return;
    setLoadingMoreTrash(true);
    try {
      const url = `/api/gmail/trash?pageToken=${encodeURIComponent(trashNextPageToken)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch trash");
      setTrashMails((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = (data.messages ?? []).filter((m: { id: string }) => !existingIds.has(m.id));
        return [...prev, ...fresh];
      });
      setTrashNextPageToken(data.nextPageToken ?? null);
      setHasMoreTrash(!!data.nextPageToken);
    } catch {
      // silent
    } finally {
      setLoadingMoreTrash(false);
    }
  }, [trashNextPageToken, loadingMoreTrash]);

  const fetchChatHistory = useCallback(async () => {
    setChatLoading(true);
    try {
      const res = await fetch("/api/agent/history");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load chat history");
      if (data.messages && data.messages.length > 0) {
        setChatMessages(data.messages);
      }
      setLoadedTabs((prev) => ({ ...prev, chat: true }));
    } catch (err: any) {
      toast.error(err.message || "Failed to load chat history");
    } finally {
      setChatLoading(false);
    }
  }, []);

  // Load tab data on switch
  useEffect(() => {
    if (activeTab === "inbox" && !loadedTabs.inbox && !loadingInbox) fetchInbox();
    if (activeTab === "drafts" && !loadedTabs.drafts && !loadingDrafts) fetchDrafts();
    if (activeTab === "sent" && !loadedTabs.sent && !loadingSent) fetchSent();
    if (activeTab === "trash" && !loadedTabs.trash && !loadingTrash) fetchTrash();
    if (activeTab === "chat") {
      if (!loadedTabs.chat) fetchChatHistory();
      if (!loadedTabs.drafts && !loadingDrafts) fetchDrafts();
    }
    setSelectedMail(null);
    setSearchQuery("");
    setInboxPriorityTab("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const unreadCount = inboxMails.filter((m) => m.isUnread).length;

  const tabs: TabConfig[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, badge: unreadCount },
    { id: "drafts", label: "Drafts", icon: FileText, badge: drafts.length },
    { id: "sent", label: "Sent", icon: Send },
    { id: "trash", label: "Trash", icon: Trash2 },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "chat", label: "Aria AI", icon: Sparkles },
    { id: "profile", label: "Profile", icon: User },
    { id: "compose", label: "Compose", icon: PenSquare },
  ];

  const currentMails =
    activeTab === "inbox"
      ? sortMailsByPriority(
          inboxPriorityTab === "all"
            ? inboxMails
            : inboxMails.filter((m) => m.priority === inboxPriorityTab.toUpperCase())
        )
      : activeTab === "drafts"
      ? drafts
      : activeTab === "sent"
      ? sentMails
      : activeTab === "trash"
      ? trashMails
      : [];

  const currentLoading =
    activeTab === "inbox"
      ? loadingInbox
      : activeTab === "drafts"
      ? loadingDrafts
      : activeTab === "sent"
      ? loadingSent
      : activeTab === "trash"
      ? loadingTrash
      : false;

  const currentError =
    activeTab === "inbox"
      ? errorInbox
      : activeTab === "drafts"
      ? errorDrafts
      : activeTab === "sent"
      ? errorSent
      : activeTab === "trash"
      ? errorTrash
      : null;

  const filteredMails = searchQuery.trim()
    ? currentMails.filter(
        (m) =>
          m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.snippet?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentMails;

  const handleRefresh = () => {
    if (activeTab === "inbox") fetchInbox();
    else if (activeTab === "drafts") fetchDrafts();
    else if (activeTab === "sent") fetchSent();
    else if (activeTab === "trash") fetchTrash();
  };

  // ── Trash / Delete Message ────────────────────────────────────────────────
  const handleTrash = useCallback(
    async (id: string) => {
      // Optimistic delete from lists
      setInboxMails((prev) => prev.filter((m) => m.id !== id));
      setSentMails((prev) => prev.filter((m) => m.id !== id));
      setTrashMails((prev) => prev.filter((m) => m.id !== id));
      setDrafts((prev) => prev.filter((d) => d.id !== id));

      setSelectedMail(null);
      // Mark trash tab as dirty so it will fetch fresh when opened next time
      setLoadedTabs((prev) => ({ ...prev, trash: false }));

      try {
        const res = await fetch("/api/gmail/trash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) {
          handleRefresh();
          toast.error("Failed to move message to trash");
        } else {
          toast.success("Message moved to trash");
        }
      } catch {
        handleRefresh();
        toast.error("Failed to move message to trash");
      }
    },
    [handleRefresh]
  );

  const handleEditDraft = (draft: DraftMessage) => {
    setComposeInitial({
      draftId: draft.id,
      to: draft.to ?? "",
      subject: draft.subject ?? "",
      message: draft.snippet ?? "",
    });
    setActiveTab("compose");
  };

  const handleCompose = () => {
    setComposeInitial({});
    setActiveTab("compose");
  };

  const handleAdvancedSearch = async ({ query, from, to, subject, hasAttachment, mode }: any) => {
    setAdvancedSearchLoading(true);
    setIsLocalSearchActive(mode === "local");
    setLocalEventsResults([]);

    if (mode === "live") {
      const parts = [];
      if (from) parts.push(`from:${from}`);
      if (to) parts.push(`to:${to}`);
      if (subject) parts.push(`subject:${subject}`);
      if (hasAttachment) parts.push(`has:attachment`);
      if (query) parts.push(query);

      const qString = parts.join(" ");
      fetchInbox(qString);
    } else {
      try {
        const res = await fetch(`/api/search/local?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Local search failed");

        const searchResults = data.results || [];

        // Map cached messages
        const localEmails = searchResults
          .filter((r: any) => r.entityType === "messages")
          .map((r: any) => ({
            id: r.data.id || r.entityId,
            snippet: r.data.snippet || "",
            subject: r.data.subject || "(no subject)",
            from: r.data.from || "",
            to: r.data.to || "",
            date: r.data.date || r.data.createdAt || "",
            isUnread: r.data.labelIds?.includes("UNREAD") || false,
            labelIds: r.data.labelIds || [],
            priority: r.data.priority || null,
          }));

        // Map calendar events
        const localEvents = searchResults
          .filter((r: any) => r.entityType === "events" || r.entityType === "calendar_event")
          .map((r: any) => r.data);

        setInboxMails(localEmails);
        setLocalEventsResults(localEvents);
        toast.success(`Cached Search: Found ${localEmails.length} emails and ${localEvents.length} calendar events.`);
      } catch (err: any) {
        toast.error(err.message || "Failed to query local vector cache.");
      }
    }
    setAdvancedSearchLoading(false);
  };

  // Keyboard navigation selection index handler
  const handleNavigateSelection = useCallback((direction: "up" | "down") => {
    if (filteredMails.length === 0) return;
    const currentIndex = selectedMail ? filteredMails.findIndex((m) => m.id === selectedMail.id) : -1;
    let nextIndex = 0;
    if (direction === "down") {
      nextIndex = currentIndex < filteredMails.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredMails.length - 1;
    }
    const nextMail = filteredMails[nextIndex];
    handleSelectMail(nextMail);
    document.getElementById(`mail-card-${nextMail.id}`)?.scrollIntoView({ block: "nearest" });
  }, [filteredMails, selectedMail, handleSelectMail]);

  const shortcutsActions = {
    onCompose: handleCompose,
    onReply: () => {
      if (selectedMail && "from" in selectedMail) {
        setComposeInitial({
          to: selectedMail.from || "",
          subject: selectedMail.subject ? `Re: ${selectedMail.subject}` : "Re:",
        });
        setActiveTab("compose");
      }
    },
    onDelete: () => {
      if (selectedMail) {
        handleTrash(selectedMail.id);
      }
    },
    onToggleStar: () => {
      if (selectedMail && "labelIds" in selectedMail) {
        const isStarred = (selectedMail.labelIds ?? []).includes("STARRED");
        handleToggleStar(selectedMail.id, !isStarred);
      }
    },
    onToggleRead: () => {
      if (selectedMail && "isUnread" in selectedMail) {
        handleMarkReadUnread(selectedMail.id, !selectedMail.isUnread);
      }
    },
    onFocusSearch: () => {
      document.getElementById("mail-search")?.focus();
    },
    onNavigateDown: () => handleNavigateSelection("down"),
    onNavigateUp: () => handleNavigateSelection("up"),
    onOpen: () => {
      if (selectedMail) handleSelectMail(selectedMail);
    },
    onClose: () => {
      setShortcutsOpen(false);
      setSelectedMail(null);
    },
    onGoToTab: (tab: string) => {
      setActiveTab(tab as Tab);
    },
    onOpenCheatsheet: () => setShortcutsOpen(true),
  };

  useShortcuts(shortcutsActions, [filteredMails, selectedMail, handleNavigateSelection]);

  // Whether the right panel should show compose

  const isComposeTab = activeTab === "compose";
  // Whether the right panel should show mail list + detail (3-column)
  const isMailTab = ["inbox", "drafts", "sent", "trash"].includes(activeTab);



  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ── Top Nav ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            id="sidebar-toggle"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="p-2 rounded-xl border border-transparent hover:border-border/30 hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-95"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25 ring-1 ring-border/10">
              <span className="text-xs font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-sm font-extrabold text-foreground tracking-tight hidden sm:block">
              Aria Mail
            </span>
          </div>
        </div>

        {/* Search — hidden on compose tab */}
        {!isComposeTab && (
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <AdvancedSearch onSearch={handleAdvancedSearch} isLoading={advancedSearchLoading} />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            id="nav-shortcuts"
            onClick={() => setShortcutsOpen(true)}
            className="p-2 rounded-xl border border-transparent hover:border-border/30 hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-95"
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          <button
            id="nav-home"
            onClick={() => router.push("/home")}
            className="p-2 rounded-xl border border-transparent hover:border-border/30 hover:bg-accent transition-all text-muted-foreground hover:text-foreground active:scale-95"
            aria-label="Go home"
          >
            <Home className="h-4 w-4" />
          </button>
          <ModeToggle />
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside
          className={cn(
            "shrink-0 flex flex-col border-r border-border/40 bg-sidebar/40 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden",
            sidebarCollapsed ? "w-16" : "w-60"
          )}
        >
          {/* Compose shortcut button */}
          <div className="p-3.5 shrink-0">
            <button
              id="compose-button"
              onClick={handleCompose}
              className={cn(
                "w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all shadow-md shadow-primary/15",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <PenSquare className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Compose</span>}
            </button>
          </div>

          {/* Nav Tabs */}
          <nav className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
            {tabs.map((tab) => (
              <SidebarItem
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                collapsed={sidebarCollapsed}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                badge={tab.badge}
              />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="shrink-0 p-2.5 border-t border-border/40">
            <button
              id="sidebar-settings"
              onClick={() => setActiveTab("profile")}
              title={sidebarCollapsed ? "Settings" : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-all cursor-pointer",
                sidebarCollapsed && "justify-center",
                activeTab === "profile" && "bg-primary/10 border-primary/25 text-primary"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Settings</span>}
            </button>
          </div>
        </aside>

        {/* ── Compose Tab (full-width panel) ── */}
        {isComposeTab && (
          <div className="flex-1 overflow-hidden">
            <ComposePanel
              initialData={composeInitial}
              onDraftSaved={() => {
                setLoadedTabs((prev) => ({ ...prev, drafts: false }));
                setActiveTab("drafts");
              }}
              onMailSent={() => {
                setLoadedTabs((prev) => ({ ...prev, inbox: false, sent: false }));
                setActiveTab("inbox");
              }}
              onDiscard={() => setActiveTab("inbox")}
            />
          </div>
        )}

        {/* ── Aria AI Chat Tab ── */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
            {/* Suggestions at the top */}
            <div className="px-6 pt-6 pb-2 shrink-0 border-b border-border/10 bg-muted/10">
              <span className="text-[10px] font-extrabold text-muted-foreground/60 uppercase tracking-wider block mb-2">
                Suggested Commands
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "What's on my calendar today?",
                  "Send a calendar invite to friend@corsair.dev at 9 AM next Thursday. Send him an email too saying I look forward to our meeting.",
                  "Summarize my recent emails",
                  "Draft a short follow-up email to boss@corp.com"
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setChatInput(s);
                      document.getElementById("chat-input-box")?.focus();
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-border/40 bg-card hover:bg-accent text-left text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all active:scale-[0.98] shadow-sm truncate max-w-xs cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Message Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-muted/5">
              
              {chatMessages.map((msg, idx) => {
                const draftRegex = /\[DRAFT_CREATED:\s*([a-zA-Z0-9_-]+)\]/;
                const hasDraft = msg.role === "assistant" && msg.content.match(draftRegex);
                const draftId = hasDraft ? hasDraft[1] : null;
                const displayContent = hasDraft ? msg.content.replace(draftRegex, "").trim() : msg.content;
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 max-w-[80%] animate-in slide-in-from-bottom-2 duration-200",
                      msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm border select-none",
                      msg.role === "user" 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                    )}>
                      {msg.role === "user" ? "ME" : "AI"}
                    </div>
                    <div className={cn(
                      "p-4 rounded-3xl text-xs leading-relaxed border shadow-sm whitespace-pre-wrap font-sans relative group/bubble flex flex-col gap-1.5",
                      msg.role === "user"
                        ? "bg-primary/10 border-primary/20 text-foreground"
                        : "bg-card border-border/40 text-foreground pr-10"
                    )}>
                      <div>{displayContent}</div>

                      {draftId && (
                        <div className="mt-2.5 p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 space-y-3 max-w-sm">
                          <div className="flex items-center gap-2 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                            <Mail className="w-3.5 h-3.5" />
                            Draft Confirmation Required
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                            Aria has created a draft (ID: <code className="px-1 py-0.5 rounded bg-muted/65 font-mono text-[10px]">{draftId}</code>). Please review and authorize sending.
                          </p>
                          <div className="flex gap-2">
                            {actionedDrafts[draftId] ? (
                              <span className={cn(
                                "text-[10px] font-bold px-3 py-1.5 rounded-xl border capitalize",
                                actionedDrafts[draftId] === "sent"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                              )}>
                                {actionedDrafts[draftId] === "sent" ? "Approved & Sent" : "Discarded"}
                              </span>
                            ) : !loadingDrafts && !drafts.some((d) => d.id === draftId) ? (
                              <span className="text-[10px] font-bold px-3 py-1.5 rounded-xl border border-border/30 bg-muted/20 text-muted-foreground select-none">
                                Draft Processed
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    toast.loading("Sending email...", { id: draftId });
                                    const res = await sendDraft(draftId);
                                    if (res.success) {
                                      toast.success("Email sent successfully!", { id: draftId });
                                      setActionedDrafts((prev) => ({ ...prev, [draftId]: "sent" }));
                                      fetchInbox();
                                      fetchDrafts();
                                    } else {
                                      toast.error(res.error || "Failed to send draft", { id: draftId });
                                    }
                                  }}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm shadow-primary/15 flex items-center justify-center cursor-pointer"
                                >
                                  Approve & Send
                                </button>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    toast.loading("Discarding draft...", { id: draftId });
                                    const res = await deleteDraft(draftId);
                                    if (res.success) {
                                      toast.success("Draft discarded.", { id: draftId });
                                      setActionedDrafts((prev) => ({ ...prev, [draftId]: "discarded" }));
                                      fetchDrafts();
                                    } else {
                                      toast.error(res.error || "Failed to discard draft", { id: draftId });
                                    }
                                  }}
                                  className="py-1.5 px-3 rounded-xl border border-border/60 hover:bg-accent hover:text-foreground text-[10px] font-bold transition-all active:scale-95 cursor-pointer text-muted-foreground"
                                >
                                  Discard
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {msg.role === "assistant" && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200">
                          <CopyButton text={displayContent} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {chatLoading && (
                <div className="flex gap-3 mr-auto max-w-[80%] animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[10px] font-extrabold select-none">
                    AI
                  </div>
                  <div className="p-4 rounded-3xl text-xs bg-card border border-border/40 text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    Aria is executing your instructions...
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Box */}
            <div className="p-4 border-t border-border/40 bg-card/30 backdrop-blur shrink-0">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!chatInput.trim() || chatLoading) return;
                  const userMsg = chatInput.trim();
                  setChatInput("");
                  setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
                  setChatLoading(true);

                  try {
                    const res = await fetch("/api/agent", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ query: userMsg }),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Agent query failed");
                    
                    setChatMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
                    fetchInbox();
                    fetchDrafts();
                  } catch (err: any) {
                    setChatMessages((prev) => [
                      ...prev,
                      { role: "assistant", content: `Failed to process: ${err.message || "Unknown error"}` }
                    ]);
                  } finally {
                    setChatLoading(false);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="chat-input-box"
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask Aria to email, schedule, or invite…"
                  disabled={chatLoading}
                  className="flex-1 bg-muted/30 border border-border/30 rounded-2xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="h-10 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-2xl hover:opacity-95 active:scale-95 transition-all shadow-md shadow-primary/15 disabled:opacity-30 disabled:shadow-none flex items-center justify-center cursor-pointer"
                >
                  Ask
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="flex-1 overflow-y-auto bg-background">
            <ProfileClient isTab={true} />
          </div>
        )}

        {/* ── Calendar Tab (inline rendering) ── */}
        {activeTab === "calendar" && (
          <div className="flex-1 overflow-hidden bg-background">
            <CalendarViewComponent isInline={true} />
          </div>
        )}

        {/* ── Mail List + Detail (3-column layout) ── */}
        {isMailTab && (
          <>
            {/* Mail List Panel */}
            <div
              className={cn(
                "shrink-0 flex flex-col border-r border-border/60 bg-background transition-all duration-200",
                selectedMail ? "w-72 hidden md:flex" : "flex-1 md:w-72 md:flex-none"
              )}
            >
              {/* Panel Header */}
              <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-foreground capitalize tracking-tight">
                    {activeTab}
                  </h1>
                  {filteredMails.length > 0 && (
                    <span className="text-xs text-muted-foreground/50">
                      ({filteredMails.length})
                    </span>
                  )}
                </div>
                <button
                  id="refresh-button"
                  onClick={handleRefresh}
                  disabled={currentLoading}
                  className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
                  aria-label="Refresh"
                >
                  <RefreshCw
                    className={cn("h-3.5 w-3.5", currentLoading && "animate-spin")}
                  />
                </button>
              </div>

              {/* Mobile search */}
              <div className="sm:hidden px-3 py-2 border-b border-border/40">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search…"
                    className="w-full bg-muted/40 border border-border/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/30"
                  />
                </div>
              </div>

              {/* Priority Filter Tabs */}
              {activeTab === "inbox" && (
                <div className="shrink-0 px-4 py-2 border-b border-border/40 flex items-center gap-1.5 overflow-x-auto bg-muted/10 backdrop-blur-sm scrollbar-none">
                  {(["all", "high", "medium", "low"] as const).map((pTab) => {
                    const count = pTab === "all"
                      ? inboxMails.length
                      : inboxMails.filter((m) => m.priority === pTab.toUpperCase()).length;
                    return (
                      <button
                        key={pTab}
                        onClick={() => setInboxPriorityTab(pTab)}
                        className={cn(
                          "px-2.5 py-0.5 rounded-lg text-[10px] font-bold border capitalize transition-all select-none flex items-center gap-1 shrink-0",
                          inboxPriorityTab === pTab
                            ? pTab === "high"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                              : pTab === "medium"
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                              : pTab === "low"
                              ? "bg-slate-500/10 border-slate-500/30 text-slate-600 dark:text-slate-400"
                              : "bg-primary/10 border-primary/30 text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40"
                        )}
                      >
                        <span>{pTab}</span>
                        {count > 0 && (
                          <span className="opacity-60 text-[9px] font-semibold">
                            ({count})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* List content */}
              <div className="flex-1 overflow-y-auto">
                {isLocalSearchActive && localEventsResults.length > 0 && (
                  <div className="px-4 py-3 border-b border-border/40 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-2">
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider block">
                      Matched Calendar Events ({localEventsResults.length})
                    </span>
                    <div className="space-y-1.5">
                      {localEventsResults.slice(0, 5).map((evt: any, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-card border border-emerald-500/20 text-xs shadow-sm hover:border-emerald-500/40 transition-colors">
                          <p className="font-bold text-foreground truncate">{evt.summary || "(No Title)"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {evt.start?.dateTime || evt.start?.date || evt.start || ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <MailList
                  mails={filteredMails}
                  selectedId={selectedMail?.id}
                  isDraft={activeTab === "drafts"}
                  loading={currentLoading}
                  loadingMore={
                    activeTab === "inbox"
                      ? loadingMoreInbox
                      : activeTab === "sent"
                      ? loadingMoreSent
                      : activeTab === "trash"
                      ? loadingMoreTrash
                      : undefined
                  }
                  hasMore={
                    activeTab === "inbox"
                      ? hasMoreInbox
                      : activeTab === "sent"
                      ? hasMoreSent
                      : activeTab === "trash"
                      ? hasMoreTrash
                      : undefined
                  }
                  error={currentError}
                  onSelect={handleSelectMail}
                  onMarkReadUnread={
                    activeTab === "inbox" || activeTab === "trash"
                      ? handleMarkReadUnread
                      : undefined
                  }
                  onLoadMore={
                    activeTab === "inbox"
                      ? fetchMoreInbox
                      : activeTab === "sent"
                      ? fetchMoreSent
                      : activeTab === "trash"
                      ? fetchMoreTrash
                      : undefined
                  }
                  emptyText={
                    activeTab === "inbox"
                      ? "Your inbox is empty"
                      : activeTab === "drafts"
                      ? "No drafts saved"
                      : activeTab === "sent"
                      ? "No sent messages"
                      : "Trash is empty"
                  }
                />
              </div>
            </div>

            {/* Mail Detail Panel */}
            <div
              className={cn(
                "flex-1 flex flex-col bg-background overflow-hidden",
                !selectedMail && "hidden md:flex"
              )}
            >
              {selectedMail ? (
                <MailDetail
                  mail={selectedMail}
                  isDraft={activeTab === "drafts"}
                  onBack={() => setSelectedMail(null)}
                  onEditDraft={handleEditDraft}
                  onMarkReadUnread={
                    activeTab !== "drafts" ? handleMarkReadUnread : undefined
                  }
                  onTrash={activeTab !== "trash" ? handleTrash : undefined}
                  onToggleStar={handleToggleStar}
                />
              ) : (
                <EmptyDetail onCompose={handleCompose} />
              )}
            </div>
          </>
        )}
      </div>
      <ShortcutsCheatsheet isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export default withAuth(DashboardPage);