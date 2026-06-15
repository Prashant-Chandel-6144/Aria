import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

import { headers } from "next/headers";
import { corsair } from "@/server/corsair";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  //Get the authenticated session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Use corsair to call the Gmail listMessages action for the current user
    const result = await corsair.withTenant("prashant").gmail.api.drafts.get({
      id:"r-5895844025962215518",
      format:"full",

    })
    const messages = result.message?.snippet
    
    

console.log(result)
console.log("Email message",messages)

    return NextResponse.json({ messages: result });
  } catch (error: any) {
    console.error("Gmail fetch error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Failed to fetch Gmail messages" },
      { status: 500 },
    );
  }
}
