import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "https://aria-prashant-chandel.vercel.app",
});

export async function signOutUser(redirectTo = "/login") {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = redirectTo;
      },
    },
  });
}
