"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import {
  User,
  Settings,
  Link2,
  ChevronLeft,
  Save,
  Moon,
  Sun,
  Laptop,
  Loader2,
  Mail,
  Calendar,
  MessageSquare,
  Sparkles,
  Signature,
  Keyboard
} from "lucide-react";
import { GithubLogoIcon as Github } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getProfileData,
  updateProfile,
  updatePreferences,
  disconnectIntegration,
} from "./actions";

type Tab = "account" | "preferences" | "integrations" | "shortcuts";

export default function ProfileClient({ isTab = false }: { isTab?: boolean }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Set sub-tab from search params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("sub");
      if (sub === "integrations" || sub === "preferences" || sub === "account" || sub === "shortcuts") {
        setActiveTab(sub);
      }
    }
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("sub", tab);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Auth Session
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Profile data state
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  // Transition state for saving actions
  const [isPending, startTransition] = useTransition();

  // Form states
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [gmailAddress, setGmailAddress] = useState("");

  // Preference states
  const [prefTheme, setPrefTheme] = useState("system");
  const [emailSignature, setEmailSignature] = useState("");
  const [readingPaneEnabled, setReadingPaneEnabled] = useState(true);
  const [readingPanePosition, setReadingPanePosition] = useState("right");
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [defaultSendDelay, setDefaultSendDelay] = useState(5);
  
  // Keyboard Shortcuts state
  const [shortcuts, setShortcuts] = useState<Record<string, string>>({
    compose: "c, n",
    reply: "r",
    delete: "backspace, e",
    star: "*",
    unread: "u",
    search: "/",
    down: "j, arrowdown",
    up: "k, arrowup",
    open: "enter, o",
    cheatsheet: "?",
  });

  // Integrations state
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);

  // Load profile data
  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      if (!isTab) {
        router.push("/login");
      }
      return;
    }

    async function loadData() {
      try {
        const data = await getProfileData();
        setProfileData(data);
        
        // Populate form states
        setName(data.user.name || "");
        setDisplayName(data.profile.displayName || "");
        setAvatarUrl(data.profile.avatarUrl || "");
        setGmailAddress(data.profile.gmailAddress || "");

        // Populate preference states
        setPrefTheme(data.preference.theme);
        setEmailSignature(data.preference.emailSignature);
        setReadingPaneEnabled(data.preference.readingPaneEnabled);
        setReadingPanePosition(data.preference.readingPanePosition);
        setAutoAdvance(data.preference.autoAdvance);
        setDefaultSendDelay(data.preference.defaultSendDelay);

        if (data.preference.keyboardShortcuts) {
          const loadedShortcuts = data.preference.keyboardShortcuts;
          const normalized: Record<string, string> = {};
          Object.keys(loadedShortcuts).forEach((key) => {
            const val = loadedShortcuts[key];
            if (Array.isArray(val)) {
              normalized[key] = val.join(", ");
            } else if (typeof val === "string") {
              normalized[key] = val;
            }
          });
          setShortcuts((prev) => ({ ...prev, ...normalized }));
        }

        // Populate integrations state
        setConnectedIntegrations(data.integrations);
      } catch (err: any) {
        console.error("Failed to load profile data:", err);
        toast.error("Failed to load profile settings.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session, sessionLoading, router]);

  // Handle saving account details
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile({
          name,
          displayName,
          avatarUrl,
          gmailAddress,
        });
        toast.success("Profile details updated successfully.");
      } catch (err: any) {
        console.error("Update profile error:", err);
        toast.error(err.message || "Failed to update profile.");
      }
    });
  };

  // Handle saving preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updatePreferences({
          theme: prefTheme,
          emailSignature,
          readingPaneEnabled,
          readingPanePosition,
          autoAdvance,
          defaultSendDelay,
        });
        // Apply theme immediately on client
        setTheme(prefTheme);
        toast.success("Preferences updated successfully.");
      } catch (err: any) {
        console.error("Update preferences error:", err);
        toast.error(err.message || "Failed to update preferences.");
      }
    });
  };

  const shortcutLabels = [
    { key: "compose", label: "Compose Email", desc: "Open the email composition modal", defaultKeys: "c, n" },
    { key: "reply", label: "Reply to Email", desc: "Open reply input for active email", defaultKeys: "r" },
    { key: "delete", label: "Delete Email/Draft", desc: "Move active item to trash", defaultKeys: "backspace, e" },
    { key: "star", label: "Toggle Star", desc: "Star or unstar the selected email", defaultKeys: "*" },
    { key: "unread", label: "Mark Unread/Read", desc: "Toggle read status of selected email", defaultKeys: "u" },
    { key: "search", label: "Focus Search", desc: "Focus on the advanced search bar", defaultKeys: "/" },
    { key: "down", label: "Navigate Down", desc: "Move selection down in email list", defaultKeys: "j, arrowdown" },
    { key: "up", label: "Navigate Up", desc: "Move selection up in email list", defaultKeys: "k, arrowup" },
    { key: "open", label: "Open Selected", desc: "Open/expand the selected email thread", defaultKeys: "enter, o" },
    { key: "cheatsheet", label: "Show Cheatsheet", desc: "Display the keyboard shortcuts dialog", defaultKeys: "?" },
  ];

  // Handle saving shortcuts
  const handleSaveShortcuts = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const parsedShortcuts: Record<string, string[]> = {};
        Object.keys(shortcuts).forEach((key) => {
          parsedShortcuts[key] = shortcuts[key]
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
        });

        await updatePreferences({
          keyboardShortcuts: parsedShortcuts,
        });

        // Sync with localStorage
        localStorage.setItem("aria_keyboard_shortcuts", JSON.stringify(parsedShortcuts));

        toast.success("Keyboard shortcuts updated successfully.");
      } catch (err: any) {
        console.error("Update shortcuts error:", err);
        toast.error(err.message || "Failed to update keyboard shortcuts.");
      }
    });
  };

  // Handle disconnect integration
  const handleDisconnect = async (integrationId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${integrationId}? This will stop sync operations.`)) {
      return;
    }
    
    startTransition(async () => {
      try {
        await disconnectIntegration(integrationId);
        setConnectedIntegrations((prev) => prev.filter((id) => id !== integrationId));
        toast.success(`${integrationId} disconnected successfully.`);
      } catch (err: any) {
        console.error("Disconnect integration error:", err);
        toast.error(err.message || `Failed to disconnect ${integrationId}.`);
      }
    });
  };

  // Handle connect integration redirect
  const handleConnect = (plugin: string) => {
    window.location.href = `/api/connect?plugin=${plugin}`;
  };

  if (sessionLoading || loading) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center bg-background",
        isTab ? "w-full py-12" : "min-h-screen"
      )}>
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (isTab) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-border/40 md:pr-4">
          <button
            id="tab-account"
            type="button"
            onClick={() => handleTabChange("account")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "account"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <User className="w-4 h-4" />
            Account Details
          </button>
          <button
            id="tab-preferences"
            type="button"
            onClick={() => handleTabChange("preferences")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "preferences"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Settings className="w-4 h-4" />
            Preferences
          </button>
          <button
            id="tab-integrations"
            type="button"
            onClick={() => handleTabChange("integrations")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "integrations"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Link2 className="w-4 h-4" />
            Integrations
          </button>
          <button
            id="tab-shortcuts"
            type="button"
            onClick={() => handleTabChange("shortcuts")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "shortcuts"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
          </button>
        </aside>

        {/* Right Panel Content */}
        <div className="flex-1 min-w-0">
          {/* TAB: ACCOUNT DETAILS */}
          {activeTab === "account" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold">Account Details</CardTitle>
                <CardDescription className="text-xs">
                  Update your display credentials and public profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAccount} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-border/20">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="text-2xl font-extrabold text-white">
                        {displayName ? displayName.charAt(0).toUpperCase() : (name ? name.charAt(0).toUpperCase() : "?")}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <h3 className="text-sm font-semibold text-foreground">Profile Avatar</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Provide a URL to load your custom image. Leave empty to automatically use your initials.
                      </p>
                    </div>
                  </div>

                  <FieldGroup className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="profile-name">Full Name</FieldLabel>
                        <Input
                          id="profile-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="rounded-xl"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile-display-name">Display Name</FieldLabel>
                        <Input
                          id="profile-display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Public handle or nickname"
                          className="rounded-xl"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="profile-email">Auth Email</FieldLabel>
                        <div className="relative">
                          <Input
                            id="profile-email"
                            value={session?.user?.email || ""}
                            disabled
                            className="rounded-xl bg-muted/40 pr-24 cursor-not-allowed opacity-90"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                        <FieldDescription>Email address linked to your authentication provider.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile-gmail">Connected Gmail Account</FieldLabel>
                        <Input
                          id="profile-gmail"
                          value={gmailAddress}
                          onChange={(e) => setGmailAddress(e.target.value)}
                          placeholder="username@gmail.com"
                          className="rounded-xl"
                        />
                        <FieldDescription>Used for syncing email and calendar details.</FieldDescription>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="profile-avatar-url">Avatar Image URL</FieldLabel>
                      <Input
                        id="profile-avatar-url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="rounded-xl"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-account-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === "preferences" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold">App Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Customize the look, layout settings, and drafting features of Aria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  {/* Theme Selector Section */}
                  <div className="space-y-3">
                    <FieldLabel>Interface Theme</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Laptop },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = prefTheme === t.value;
                        return (
                          <button
                            id={`theme-btn-${t.value}`}
                            type="button"
                            key={t.value}
                            onClick={() => setPrefTheme(t.value)}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-background/50 hover:bg-accent/40 text-center transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : ""}`} />
                            <span className="text-xs font-semibold">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <FieldGroup className="space-y-5">
                    {/* Signature */}
                    <Field>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Signature className="w-4 h-4 text-muted-foreground" />
                        <FieldLabel htmlFor="signature-text" className="mb-0">Email Signature</FieldLabel>
                      </div>
                      <Textarea
                        id="signature-text"
                        value={emailSignature}
                        onChange={(e) => setEmailSignature(e.target.value)}
                        placeholder="Regards,&#10;Your Name"
                        rows={4}
                        className="rounded-xl resize-none font-sans"
                      />
                      <FieldDescription>Automatically appended to your drafted messages.</FieldDescription>
                    </Field>

                    <div className="border-t border-border/25 pt-5 space-y-4">
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">Layout & Composing</h3>
                      
                      {/* Reading Pane switches */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-accent/10">
                        <div className="space-y-0.5 pr-4">
                          <label htmlFor="reading-pane-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                            Enable Reading Pane
                          </label>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Split screen layout to preview emails beside the list.
                          </p>
                        </div>
                        <Switch
                          id="reading-pane-toggle"
                          checked={readingPaneEnabled}
                          onCheckedChange={setReadingPaneEnabled}
                        />
                      </div>

                      {readingPaneEnabled && (
                        <div className="p-3.5 rounded-2xl border border-border/40 bg-accent/5 space-y-3">
                          <span className="text-xs font-bold text-foreground">Reading Pane Position</span>
                          <div className="flex gap-2">
                            {[
                              { value: "right", label: "Split Right" },
                              { value: "bottom", label: "Split Bottom" },
                            ].map((pos) => {
                              const isSelected = readingPanePosition === pos.value;
                              return (
                                <button
                                  id={`reading-pane-pos-${pos.value}`}
                                  type="button"
                                  key={pos.value}
                                  onClick={() => setReadingPanePosition(pos.value)}
                                  className={`flex-1 py-2 px-3.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5 text-primary"
                                      : "border-border/55 text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Auto advance and delay */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-accent/10">
                        <div className="space-y-0.5 pr-4">
                          <label htmlFor="auto-advance-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                            Auto-Advance Mail
                          </label>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Show the next conversation automatically after trashing an email.
                          </p>
                        </div>
                        <Switch
                          id="auto-advance-toggle"
                          checked={autoAdvance}
                          onCheckedChange={setAutoAdvance}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-accent/10 gap-3">
                        <div className="space-y-0.5">
                          <label htmlFor="undo-send-delay" className="text-xs font-bold text-foreground cursor-pointer">
                            Undo Send Delay
                          </label>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Number of seconds to delay sending in order to allow undo.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Input
                            id="undo-send-delay"
                            type="number"
                            min={0}
                            max={30}
                            value={defaultSendDelay}
                            onChange={(e) => setDefaultSendDelay(parseInt(e.target.value) || 0)}
                            className="w-16 h-8 text-xs text-center rounded-lg"
                          />
                          <span className="text-[11px] text-muted-foreground font-semibold">seconds</span>
                        </div>
                      </div>
                    </div>
                  </FieldGroup>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-preferences-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold">Connected Integrations</CardTitle>
                <CardDescription className="text-xs">
                  Connect your workspace services to access your emails, events, codebases, and chats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "gmail",
                    name: "Gmail",
                    desc: "Triage your inbox, view threads, draft responses, and send emails.",
                    icon: Mail,
                    color: "text-red-500",
                    bg: "bg-red-50 dark:bg-red-500/10",
                  },
                  {
                    id: "googlecalendar",
                    name: "Google Calendar",
                    desc: "Sync events, schedule meetings, check schedules, and manage calendars.",
                    icon: Calendar,
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-500/10",
                  },
                  {
                    id: "github",
                    name: "GitHub",
                    desc: "Check pull requests, commits, issues, and sync repository activity.",
                    icon: Github,
                    color: "text-slate-800 dark:text-slate-100",
                    bg: "bg-slate-50 dark:bg-slate-500/10",
                  },
                ].map((plugin) => {
                  const Icon = plugin.icon;
                  const isConnected = connectedIntegrations.includes(plugin.id);
                  return (
                    <div
                      key={plugin.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-border/80 transition-all bg-accent/15 gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl ${plugin.bg} flex items-center justify-center shrink-0 border border-border/10`}
                        >
                          <Icon className={`w-5 h-5 ${plugin.color}`} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                            {plugin.name}
                            {isConnected && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold border border-emerald-200/50 dark:border-emerald-500/20">
                                Connected
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-normal max-w-md">
                            {plugin.desc}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end shrink-0">
                        {isConnected ? (
                          <Button
                            id={`disconnect-btn-${plugin.id}`}
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDisconnect(plugin.id)}
                            disabled={isPending}
                            className="rounded-xl text-xs font-semibold"
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            id={`connect-btn-${plugin.id}`}
                            variant="outline"
                            size="sm"
                            onClick={() => handleConnect(plugin.id)}
                            disabled={isPending}
                            className="rounded-xl text-xs font-semibold hover:bg-accent"
                          >
                            Connect Account
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* TAB: KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize your hotkeys for lightning fast keyboard-only inbox navigation. Separate multiple keys with commas (e.g. `c, n`).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveShortcuts} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shortcutLabels.map((item) => (
                      <Field key={item.key}>
                        <FieldLabel htmlFor={`shortcut-${item.key}`}>{item.label}</FieldLabel>
                        <Input
                          id={`shortcut-${item.key}`}
                          value={shortcuts[item.key] || ""}
                          onChange={(e) => setShortcuts((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          placeholder={`e.g. ${item.defaultKeys}`}
                          className="rounded-xl font-mono text-xs"
                        />
                        <FieldDescription>{item.desc} (Default: `{item.defaultKeys}`)</FieldDescription>
                      </Field>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-shortcuts-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Shortcuts
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Aesthetic Header */}
      <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/40 shrink-0">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <Button
              id="back-button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-transparent hover:bg-accent/40 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-xl font-heading font-extrabold tracking-tight flex items-center gap-2">
                Settings & Profile
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-primary/10 border border-amber-300/40 dark:border-primary/25 text-amber-700 dark:text-primary text-[10px] font-extrabold shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  Premium
                </span>
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Manage your identity, settings, and workspace integrations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/home")}
              className="rounded-xl text-xs font-semibold hover:bg-accent active:scale-95 transition-all"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 border-b md:border-b-0 border-border/40 md:border-r md:pr-4">
          <button
            id="tab-account"
            onClick={() => handleTabChange("account")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "account"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <User className="w-4 h-4" />
            Account Details
          </button>
          <button
            id="tab-preferences"
            onClick={() => handleTabChange("preferences")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "preferences"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Settings className="w-4 h-4" />
            Preferences
          </button>
          <button
            id="tab-integrations"
            onClick={() => handleTabChange("integrations")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "integrations"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Link2 className="w-4 h-4" />
            Integrations
          </button>
          <button
            id="tab-shortcuts"
            onClick={() => handleTabChange("shortcuts")}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 md:w-full border ${
              activeTab === "shortcuts"
                ? "bg-primary/10 border-primary/25 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
          </button>
        </aside>

        {/* Right Panel Content */}
        <div className="flex-1 min-w-0">
          {/* TAB: ACCOUNT DETAILS */}
          {activeTab === "account" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold">Account Details</CardTitle>
                <CardDescription className="text-xs">
                  Update your display credentials and public profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAccount} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 pb-4 border-b border-border/20">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="text-2xl font-extrabold text-white">
                        {displayName ? displayName.charAt(0).toUpperCase() : (name ? name.charAt(0).toUpperCase() : "?")}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1.5 text-center sm:text-left">
                      <h3 className="text-sm font-semibold text-foreground">Profile Avatar</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Provide a URL to load your custom image. Leave empty to automatically use your initials.
                      </p>
                    </div>
                  </div>

                  <FieldGroup className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="profile-name">Full Name</FieldLabel>
                        <Input
                          id="profile-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          className="rounded-xl"
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile-display-name">Display Name</FieldLabel>
                        <Input
                          id="profile-display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Public handle or nickname"
                          className="rounded-xl"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="profile-email">Auth Email</FieldLabel>
                        <div className="relative">
                          <Input
                            id="profile-email"
                            value={session?.user?.email || ""}
                            disabled
                            className="rounded-xl bg-muted/40 pr-24 cursor-not-allowed opacity-90"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                        <FieldDescription>Email address linked to your authentication provider.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="profile-gmail">Connected Gmail Account</FieldLabel>
                        <Input
                          id="profile-gmail"
                          value={gmailAddress}
                          onChange={(e) => setGmailAddress(e.target.value)}
                          placeholder="username@gmail.com"
                          className="rounded-xl"
                        />
                        <FieldDescription>Used for syncing email and calendar details.</FieldDescription>
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="profile-avatar-url">Avatar Image URL</FieldLabel>
                      <Input
                        id="profile-avatar-url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="rounded-xl"
                      />
                    </Field>
                  </FieldGroup>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-account-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === "preferences" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold">App Preferences</CardTitle>
                <CardDescription className="text-xs">
                  Customize the look, layout settings, and drafting features of Aria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePreferences} className="space-y-6">
                  {/* Theme Selector Section */}
                  <div className="space-y-3">
                    <FieldLabel>Interface Theme</FieldLabel>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Laptop },
                      ].map((t) => {
                        const Icon = t.icon;
                        const isSelected = prefTheme === t.value;
                        return (
                          <button
                            id={`theme-btn-${t.value}`}
                            type="button"
                            key={t.value}
                            onClick={() => setPrefTheme(t.value)}
                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border bg-background/50 hover:bg-accent/40 text-center transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : ""}`} />
                            <span className="text-xs font-semibold">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <FieldGroup className="space-y-5">
                    {/* Signature */}
                    <Field>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Signature className="w-4 h-4 text-muted-foreground" />
                        <FieldLabel htmlFor="signature-text" className="mb-0">Email Signature</FieldLabel>
                      </div>
                      <Textarea
                        id="signature-text"
                        value={emailSignature}
                        onChange={(e) => setEmailSignature(e.target.value)}
                        placeholder="Regards,&#10;Your Name"
                        rows={4}
                        className="rounded-xl resize-none font-sans"
                      />
                      <FieldDescription>Automatically appended to your drafted messages.</FieldDescription>
                    </Field>

                    <div className="border-t border-border/25 pt-5 space-y-4">
                      <h3 className="text-sm font-semibold text-foreground tracking-tight">Layout & Composing</h3>
                      
                      {/* Reading Pane switches */}
                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-accent/10">
                        <div className="space-y-0.5 pr-4">
                          <label htmlFor="reading-pane-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                            Enable Reading Pane
                          </label>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Split screen layout to preview emails beside the list.
                          </p>
                        </div>
                        <Switch
                          id="reading-pane-toggle"
                          checked={readingPaneEnabled}
                          onCheckedChange={setReadingPaneEnabled}
                        />
                      </div>

                      {readingPaneEnabled && (
                        <div className="p-3.5 rounded-2xl border border-border/40 bg-accent/5 space-y-3">
                          <span className="text-xs font-bold text-foreground">Reading Pane Position</span>
                          <div className="flex gap-2">
                            {[
                              { value: "right", label: "Split Right" },
                              { value: "bottom", label: "Split Bottom" },
                            ].map((pos) => {
                              const isSelected = readingPanePosition === pos.value;
                              return (
                                <button
                                  id={`pane-pos-btn-${pos.value}`}
                                  type="button"
                                  key={pos.value}
                                  onClick={() => setReadingPanePosition(pos.value)}
                                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-background text-muted-foreground border-border/60 hover:text-foreground"
                                  }`}
                                >
                                  {pos.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/40 bg-accent/10">
                        <div className="space-y-0.5 pr-4">
                          <label htmlFor="auto-advance-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                            Auto-Advance
                          </label>
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Automatically open the next message after deleting or archiving an email.
                          </p>
                        </div>
                        <Switch
                          id="auto-advance-toggle"
                          checked={autoAdvance}
                          onCheckedChange={setAutoAdvance}
                        />
                      </div>

                      {/* Undo Send Delay Slider */}
                      <div className="p-3.5 rounded-2xl border border-border/40 bg-accent/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <label htmlFor="send-delay-slider" className="text-xs font-bold text-foreground">
                            Undo Send Delay
                          </label>
                          <span className="text-xs font-heading font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                            {defaultSendDelay} seconds
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Delay outgoing messages for a safety buffer to click "Undo Send".
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] text-muted-foreground">0s</span>
                          <input
                            id="send-delay-slider"
                            type="range"
                            min="0"
                            max="30"
                            value={defaultSendDelay}
                            onChange={(e) => setDefaultSendDelay(parseInt(e.target.value))}
                            className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <span className="text-[10px] text-muted-foreground">30s</span>
                        </div>
                      </div>
                    </div>
                  </FieldGroup>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-preferences-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-heading font-extrabold tracking-tight">Connected Integrations</h2>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Manage links to third-party services. Connecting plugins allows Aria to sync notifications, repositories, emails, and events to your workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: "gmail",
                    name: "Gmail",
                    icon: Mail,
                    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                    glowColor: "shadow-rose-500/5 hover:border-rose-300 dark:hover:border-rose-500/30",
                    description: "Read, archive, send, and draft replies using your Gmail account via AI assistance.",
                  },
                  {
                    id: "googlecalendar",
                    name: "Google Calendar",
                    icon: Calendar,
                    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
                    glowColor: "shadow-blue-500/5 hover:border-blue-300 dark:hover:border-blue-500/30",
                    description: "Automatically index events, analyze schedules, and generate calendar invitations.",
                  },
                  {
                    id: "github",
                    name: "GitHub",
                    icon: Github,
                    color: "text-foreground bg-muted border-border/40",
                    glowColor: "shadow-muted/5 hover:border-foreground/30",
                    description: "Monitor open pull requests, compile repo issues, and scan code changes.",
                  },
                  {
                    id: "slack",
                    name: "Slack",
                    icon: MessageSquare,
                    color: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
                    glowColor: "shadow-fuchsia-500/5 hover:border-fuchsia-300 dark:hover:border-fuchsia-500/30",
                    description: "Retrieve direct messages, summary channels, and connect workspace logs.",
                  },
                ].map((plugin) => {
                  const Icon = plugin.icon;
                  const isConnected = connectedIntegrations.includes(plugin.id);
                  return (
                    <Card
                      key={plugin.id}
                      className={`border border-border/50 bg-card/60 backdrop-blur-sm flex flex-col shadow-sm transition-all duration-300 hover:shadow-md ${plugin.glowColor}`}
                    >
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${plugin.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-bold">{plugin.name}</CardTitle>
                            <span className="text-[10px] text-muted-foreground/60 capitalize">
                              OAuth Sync Plugin
                            </span>
                          </div>
                        </div>

                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 dark:border-emerald-500/25 text-[10px] font-extrabold shadow-sm relative">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute left-[9px]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 relative" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 text-[10px] font-extrabold shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                            Offline
                          </span>
                        )}
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">
                          {plugin.description}
                        </p>
                        <div className="pt-2">
                          {isConnected ? (
                            <Button
                              id={`disconnect-${plugin.id}`}
                              variant="outline"
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleDisconnect(plugin.id)}
                              className="w-full text-xs font-semibold border-rose-200/50 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 dark:border-rose-500/20 rounded-xl transition-all duration-200 active:scale-[0.98]"
                            >
                              Disconnect Plugin
                            </Button>
                          ) : (
                            <Button
                              id={`connect-${plugin.id}`}
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleConnect(plugin.id)}
                              className="w-full text-xs font-semibold rounded-xl hover:scale-[1.01] active:scale-[0.98] shadow-sm transition-all duration-200"
                            >
                              Connect Service
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <Card className="border border-border/50 shadow-md bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-heading font-extrabold flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary animate-pulse" />
                  Keyboard Shortcuts
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize your hotkeys for lightning fast keyboard-only inbox navigation. Separate multiple keys with commas (e.g. `c, n`).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveShortcuts} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {shortcutLabels.map((item) => (
                      <Field key={item.key}>
                        <FieldLabel htmlFor={`shortcut-${item.key}`}>{item.label}</FieldLabel>
                        <Input
                          id={`shortcut-${item.key}`}
                          value={shortcuts[item.key] || ""}
                          onChange={(e) => setShortcuts((prev) => ({ ...prev, [item.key]: e.target.value }))}
                          placeholder={`e.g. ${item.defaultKeys}`}
                          className="rounded-xl font-mono text-xs"
                        />
                        <FieldDescription>{item.desc} (Default: `{item.defaultKeys}`)</FieldDescription>
                      </Field>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      id="save-shortcuts-btn"
                      type="submit"
                      disabled={isPending}
                      className="rounded-xl px-5 font-semibold shadow-md active:scale-95 transition-all"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Shortcuts
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
