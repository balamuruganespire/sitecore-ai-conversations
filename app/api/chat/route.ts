/**
 * app/api/chat/route.ts — Stateless SSE streaming chat endpoint
 * No session, no DB, no localStorage. Client sends full history every time.
 */
import { NextRequest } from "next/server";
import OpenAI from "openai";
import {
  searchSitecore,
  formatSearchResultsAsContext,
  SitecoreSearchResult,
} from "@/lib/sitecoreSearch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  history: ConversationTurn[];
  message: string;
  useSearch?: boolean;
}

export type SSEEvent =
  | { type: "token"; text: string }
  | { type: "sources"; sources: SitecoreSearchResult[] }
  | { type: "done" }
  | { type: "error"; message: string };

const SYSTEM_PROMPT = `You are a knowledgeable AI assistant grounded exclusively in the organisation's own content.

RULES:
- Answer only from the provided knowledge base context. If the answer isn't there, say so clearly and suggest the user refine their query or contact support.
- Never hallucinate URLs, document titles, or facts not present in the context.
- Maintain full conversation context across turns — refer back naturally ("as we discussed…").
- Cite sources inline as [Source 1], [Source 2] etc. when using provided context.
- Use **bold** for key terms, \`code\` for technical strings, and bullet lists only when genuinely list-like.
- When the user's question is a follow-up, connect it explicitly to what was said before.
- Be concise but complete. Offer to go deeper rather than front-loading.`;

function sse(e: SSEEvent) {
  return `data: ${JSON.stringify(e)}\n\n`;
}

async function shouldSearch(history: ConversationTurn[], msg: string): Promise<boolean> {
  const quickFollowUp = /^(tell me more|expand|elaborate|why|how so|go on|continue|ok|okay|thanks|got it|yes|no|sure|really\?|and\?|what about that|more details?)[\s?!.]*$/i;
  if (quickFollowUp.test(msg.trim()) || (msg.trim().split(/\s+/).length <= 3 && history.length > 0)) return false;
  if (history.length === 0) return true;
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini", max_tokens: 3, temperature: 0,
      messages: [
        { role: "system", content: "Reply YES if the new message needs a document search (new topic/question). Reply NO if it's a follow-up or clarification of the existing discussion. Only YES or NO." },
        { role: "user", content: `History (last 4):\n${history.slice(-4).map(t=>`${t.role}: ${t.content.slice(0,200)}`).join("\n")}\n\nNew: "${msg}"` },
      ],
    });
    return r.choices[0]?.message?.content?.trim().toUpperCase() !== "NO";
  } catch { return true; }
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try { body = await req.json(); } catch {
    return new Response(sse({ type: "error", message: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  const { history = [], message, useSearch = true } = body;
  if (!message?.trim()) {
    return new Response(sse({ type: "error", message: "message required" }), { status: 400, headers: { "Content-Type": "text/event-stream" } });
  }

  let contextBlock = "";
  let sources: SitecoreSearchResult[] = [];

  if (useSearch && process.env.NEXT_PUBLIC_SEARCH_API_KEY) {
    try {
      if (await shouldSearch(history, message)) {
        const sr = await searchSitecore(message, 5);
        sources = sr.results;
        if (sources.length) contextBlock = formatSearchResultsAsContext(sr);
      }
    } catch (e) { console.warn("[chat] search failed:", e); }
  }

  const systemMsgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(contextBlock ? [{ role: "system" as const, content: `KNOWLEDGE BASE CONTEXT (cite as [Source N]):\n\n${contextBlock}` }] : []),
  ];

  const historyMsgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...history.map(t => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: message },
  ];

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (e: SSEEvent) => ctrl.enqueue(enc.encode(sse(e)));
      try {
        if (sources.length) send({ type: "sources", sources });
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [...systemMsgs, ...historyMsgs],
          temperature: 0.6, max_tokens: 1024, stream: true,
        });
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) send({ type: "token", text: delta });
          if (chunk.choices[0]?.finish_reason === "stop") send({ type: "done" });
        }
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : String(e) });
      } finally { ctrl.close(); }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store", "Connection": "keep-alive", "X-Accel-Buffering": "no" },
  });
}
