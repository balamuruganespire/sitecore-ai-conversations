/**
 * app/api/search/route.ts — Direct Sitecore Search lookup (no LLM involved)
 * Powers the "Search results" tab so it can query content and paginate
 * independently of the chat/RAG flow.
 */
import { NextRequest, NextResponse } from "next/server";
import { searchSitecore } from "@/lib/sitecoreSearch";

export interface SearchRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export async function POST(req: NextRequest) {
  let body: SearchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { query, limit = 10, offset = 0 } = body;
  if (!query?.trim()) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  try {
    const result = await searchSitecore(query, limit, offset);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
