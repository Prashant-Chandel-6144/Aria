import type { Metadata } from "next";
import ProfileClient from "./profile-client";

import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings & Profile — Aria",
  description: "Manage your user profile details, email settings, interface preferences, and active OAuth connections for Aria AI.",
};

export default function ProfilePage() {
  redirect("/dashboard?tab=profile");
}
