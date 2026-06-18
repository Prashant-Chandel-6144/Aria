import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchLocalEntities } from "@/lib/embeddings";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 20;

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const results = await searchLocalEntities(session.user.id, query, limit);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Local search failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search local cache" },
      { status: 500 }
    );
  }
}
