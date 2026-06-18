"use server";

import { auth } from "@/lib/auth";
import { corsair } from "@/server/corsair";
import { headers } from "next/headers";

export async function createMail(formData: FormData) {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const emailRaw = [
      "From: me",
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      `${message}`,
    ].join("\r\n");

    const raw = Buffer.from(emailRaw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const result = await corsair
      .withTenant(userId)
      .gmail.api.messages.send({
        raw,
      });

    console.log("Email sent:", result);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("Gmail send error:", error);
    return { error: error?.message ?? "Failed to send email" };
  }
}

export async function saveDraft(formData: FormData) {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const draftId = formData.get("draftId") as string | null;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const emailRaw = [
      "From: me",
      `To: ${to ?? ""}`,
      `Subject: ${subject ?? ""}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      `${message ?? ""}`,
    ].join("\r\n");

    const raw = Buffer.from(emailRaw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    let result;
    if (draftId) {
      // Update existing draft
      result = await corsair
        .withTenant(userId)
        .gmail.api.drafts.update({
          id: draftId,
          draft: { message: { raw } },
        });
    } else {
      // Create new draft
      result = await corsair
        .withTenant(userId)
        .gmail.api.drafts.create({
          draft: { message: { raw } },
        });
    }

    console.log("Draft saved:", result);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("Gmail draft save error:", error);
    return { error: error?.message ?? "Failed to save draft" };
  }
}

export async function sendDraft(draftId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const result = await corsair
      .withTenant(userId)
      .gmail.api.drafts.send({
        id: draftId,
      });

    console.log("Draft sent:", result);
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error("Gmail draft send error:", error);
    return { error: error?.message ?? "Failed to send draft" };
  }
}

export async function deleteDraft(draftId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await corsair
      .withTenant(userId)
      .gmail.api.drafts.delete({
        id: draftId,
      });

    console.log("Draft deleted:", draftId);
    return { success: true };
  } catch (error: any) {
    console.error("Gmail draft delete error:", error);
    return { error: error?.message ?? "Failed to delete draft" };
  }
}
