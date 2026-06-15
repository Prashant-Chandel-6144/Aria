import { generateOAuthUrl } from "corsair/oauth";
import { corsair } from "@/server/corsair";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const REDIRECT_URI = `${process.env.APP_URL}/api/auth`;

export async function GET(request: NextRequest) {
    const tenantId = getUserIdFromSession(request); // your auth logic
    const plugin = new URL(request.url).searchParams.get("plugin")!;

    const { url, state } = await generateOAuthUrl(corsair, plugin, {
        tenantId,
        redirectUri: REDIRECT_URI,
    });

    const response = NextResponse.redirect(url);
    response.cookies.set("oauth_state", state, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10,
    });
    return response;
}

function getUserIdFromSession(request: NextRequest): string {
    const cookie = request.cookies.get("session")?.value;
    if (!cookie) {
        throw new Error("No session found");
    }
    // Assuming session cookie contains user ID or decode JWT/session token
    return cookie;
}
