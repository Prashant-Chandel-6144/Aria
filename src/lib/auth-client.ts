import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export async function signOutUser(redirectTo = "/login") {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = redirectTo;
      },
    },
  });
}
