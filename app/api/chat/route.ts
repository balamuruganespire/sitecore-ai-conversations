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

const GEMINI_DEFAULT_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/";

function buildClient(): { client: OpenAI; model: string } {
  const provider = (process.env.AI_PROVIDER ?? "openai").toLowerCase();

  if (provider === "gemini") {
    return {
      client: new OpenAI({
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: process.env.GEMINI_BASE_URL ?? GEMINI_DEFAULT_BASE_URL,
      }),
      model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    };
  }

  // default: openai / chatgpt
  return {
    client: new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      ...(process.env.OPENAI_BASE_URL
        ? { baseURL: process.env.OPENAI_BASE_URL }
        : {}),
    }),
    model: process.env.OPENAI_MODEL ?? "gpt-4o",
  };
}

const { client: openai, model: AI_MODEL } = buildClient();

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

// ── Rate-limit-aware retry helper ──────────────────────────────────────────
// Gemini's free tier and OpenAI both return 429 on RPM/quota limits. Some
// gateways (notably Gemini's OpenAI-compat shim) return a 429 with an empty
// body, so we can't always read a structured error — we retry on any 429
// with exponential backoff, respecting a Retry-After header when present.

interface ApiErrorShape {
  status?: number;
  error?: unknown;
  headers?: Headers | Record<string, string>;
}

function getRetryAfterMs(e: ApiErrorShape): number | null {
  const headers = e.headers;
  if (!headers) return null;
  const raw =
    typeof (headers as Headers).get === "function"
      ? (headers as Headers).get("retry-after")
      : (headers as Record<string, string>)["retry-after"];
  if (!raw) return null;
  const seconds = Number(raw);
  return Number.isFinite(seconds) ? seconds * 1000 : null;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseDelayMs?: number } = {},
): Promise<T> {
  const { retries = 2, baseDelayMs = 1000 } = opts;
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const apiErr = e as ApiErrorShape;
      if (apiErr?.status !== 429 || attempt === retries) throw e;

      const retryAfterMs = getRetryAfterMs(apiErr);
      const delay = retryAfterMs ?? baseDelayMs * 2 ** attempt;
      console.warn(
        `[chat] 429 received, retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

function describeApiError(e: unknown): string {
  if (e && typeof e === "object" && "status" in e) {
    const apiErr = e as ApiErrorShape;
    if (apiErr.status === 429) {
      return "We're getting rate-limited by the AI provider right now. Please wait a few seconds and try again.";
    }
    if (apiErr.status === 401 || apiErr.status === 403) {
      return "The AI provider rejected the request — the API key may be invalid or revoked.";
    }
    const detail = apiErr.error ? JSON.stringify(apiErr.error) : undefined;
    return `API error ${apiErr.status}${detail ? `: ${detail}` : ""}`;
  }
  return e instanceof Error ? e.message : String(e);
}

async function shouldSearch(
  history: ConversationTurn[],
  msg: string,
): Promise<boolean> {
  const quickFollowUp =
    /^(tell me more|expand|elaborate|why|how so|go on|continue|ok|okay|thanks|got it|yes|no|sure|really\?|and\?|what about that|more details?)[\s?!.]*$/i;
  if (
    quickFollowUp.test(msg.trim()) ||
    (msg.trim().split(/\s+/).length <= 3 && history.length > 0)
  )
    return false;
  if (history.length === 0) return true;
  // Skip the LLM classification call entirely — just default to searching
  // for anything that isn't a short follow-up. Saves 1 generateContent call/turn
  // and avoids tripping low-RPM free-tier limits.
  return true;
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(sse({ type: "error", message: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  const { history = [], message, useSearch = true } = body;
  if (!message?.trim()) {
    return new Response(sse({ type: "error", message: "message required" }), {
      status: 400,
      headers: { "Content-Type": "text/event-stream" },
    });
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
    } catch (e) {
      console.warn("[chat] search failed:", e);
    }
  }

  const systemMsgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(contextBlock
      ? [
          {
            role: "system" as const,
            content: `KNOWLEDGE BASE CONTEXT (cite as [Source N]):\n\n${contextBlock}`,
          },
        ]
      : []),
  ];

  const historyMsgs: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...history.map((t) => ({ role: t.role, content: t.content })),
    { role: "user" as const, content: message },
  ];

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (e: SSEEvent) => ctrl.enqueue(enc.encode(sse(e)));
      try {
        if (sources.length) send({ type: "sources", sources });

        // Wrap the call creation (not the async iteration) in retry logic —
        // 429s surface when the request is first made, before streaming starts.
        const completion = await withRetry(() =>
          openai.chat.completions.create({
            model: AI_MODEL,
            messages: [...systemMsgs, ...historyMsgs],
            temperature: 0.6,
            max_tokens: 1024,
            stream: true,
          }),
        );

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) send({ type: "token", text: delta });
          if (chunk.choices[0]?.finish_reason === "stop")
            send({ type: "done" });
        }
      } catch (e) {
        console.error("[chat] completion error:", e);
        send({
          type: "error",
          message: describeApiError(e),
        });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
