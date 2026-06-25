/**
 * lib/sitecoreSearch.ts
 *
 * Server-side Sitecore Search (Discover) client.
 *
 * Uses the same @sitecore-search/data SDK that powers WidgetsProvider in _app.tsx.
 * Calls setup() to initialise the SDK singleton, then hits the same searchUrl
 * the client-side widgets use.
 *
 * Required env vars — identical to WidgetsProvider props in _app.tsx:
 *   NEXT_PUBLIC_SEARCH_ENV           'prod' | 'prodEu' | 'apse2' | 'staging'
 *   NEXT_PUBLIC_SEARCH_CUSTOMER_KEY  e.g. '101496325-9788065'
 *   NEXT_PUBLIC_SEARCH_API_KEY       Bearer token from Sitecore Search dashboard
 *
 * Optional:
 *   NEXT_PUBLIC_SEARCH_RFK_ID        widget rfk_id (default: 'rfkid_7')
 */

import { setup, getServiceConfig } from "@sitecore-search/data";
import type { Environment } from "@sitecore-search/data";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SitecoreSearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type?: string;
  date?: string;
  image?: string;
}

export interface SitecoreSearchResponse {
  results: SitecoreSearchResult[];
  total: number;
  query: string;
}

// ── SDK init (lazy singleton, once per cold start) ─────────────────────────

let sdkReady = false;

function ensureSDK(): void {
  if (sdkReady) return;

  const env = process.env.NEXT_PUBLIC_SEARCH_ENV as Environment | undefined;
  const customerKey = process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY;
  const apiKey = process.env.NEXT_PUBLIC_SEARCH_API_KEY;

  if (!env || !customerKey || !apiKey) {
    throw new Error(
      "Missing Sitecore Search config.\n" +
        "Set NEXT_PUBLIC_SEARCH_ENV, NEXT_PUBLIC_SEARCH_CUSTOMER_KEY " +
        "and NEXT_PUBLIC_SEARCH_API_KEY in .env.local"
    );
  }

  // setup() is the public API — it calls internal setConfig() and initialises
  // the DataProvider, matching what WidgetsProvider does on the client.
  setup({ env, customerKey, apiKey });

  const { searchUrl } = getServiceConfig();
  console.log(
    `[SitecoreSearch] SDK ready | env=${env} | searchUrl=${searchUrl}`
  );

  sdkReady = true;
}

// ── Payload builder ────────────────────────────────────────────────────────

function buildPayload(query: string, limit: number): Record<string, unknown> {
  const rfkId =
    process.env.NEXT_PUBLIC_SEARCH_RFK_ID ||
    process.env.NEXT_PUBLIC_SEARCH_DISCOVER_DOMAIN_ID ||
    "rfkid_7";

  // Correct Sitecore Discover v2 payload schema (from @sitecore-search/data SDK models):
  //   search.limit  — number of results (not "pagination.perPage")
  //   search.offset — starting index    (not "pagination.startFrom")
  //   search.content — field selection  (empty = return all default fields)
  return {
    widget: {
      items: [
        {
          entity: "content",
          rfk_id: rfkId,
          search: {
            query: { keyphrase: query },
            content: {},
            limit,
            offset: 0,
          },
        },
      ],
    },
  };
}

// ── Response parser ────────────────────────────────────────────────────────

function parseResults(data: Record<string, unknown>): {
  results: SitecoreSearchResult[];
  total: number;
} {
  // SDK v3 response: { widgets: [{ content: [], total_item: N }] }
  const widgets = data?.widgets as Array<Record<string, unknown>> | undefined;
  const rawItems =
    (widgets?.[0]?.content as Record<string, unknown>[]) ?? [];
  const total = (widgets?.[0]?.total_item as number) ?? rawItems.length;

  const results: SitecoreSearchResult[] = rawItems.map((item) => ({
    id:
      (item.id as string) ||
      (item.rfk_id as string) ||
      crypto.randomUUID(),
    title:
      (item.name as string) ||
      (item.title as string) ||
      "Untitled",
    description:
      (item.description as string) ||
      (item.subtitle as string) ||
      (item.content_text as string) ||
      (item.body as string) ||
      "",
    url: (item.url as string) || (item.source_url as string) || "#",
    type: (item.type as string) || "content",
    date:
      (item.publish_date as string) ||
      (item.updated_at as string) ||
      (item.date as string) ||
      "",
    image:
      (item.image_url as string) || (item.thumbnail as string) || "",
  }));

  return { results, total };
}

// ── Public search function ─────────────────────────────────────────────────

/**
 * Query Sitecore Search from a Next.js API route (server-side).
 * The SDK derives the correct endpoint URL from env vars automatically.
 */
export async function searchSitecore(
  query: string,
  limit = 5
): Promise<SitecoreSearchResponse> {
  ensureSDK();

  const { searchUrl, apiKey } = getServiceConfig();

  if (!searchUrl) {
    throw new Error(
      "[SitecoreSearch] searchUrl is empty after SDK init — " +
        "verify NEXT_PUBLIC_SEARCH_ENV and NEXT_PUBLIC_SEARCH_CUSTOMER_KEY"
    );
  }

  const payload = buildPayload(query, limit);
  const rfkId = process.env.NEXT_PUBLIC_SEARCH_RFK_ID || "rfkid_7";

  console.log(
    `[SitecoreSearch] POST ${searchUrl} | rfk_id=${rfkId} | query="${query}"`
  );

  let response: Response;
  try {
    response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // SDK sends apiKey raw, no "Bearer " prefix
        Authorization: apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch (networkErr) {
    const cause =
      networkErr instanceof Error ? networkErr.message : String(networkErr);
    throw new Error(
      `[SitecoreSearch] Network error → ${searchUrl}\n` +
        `Cause: ${cause}\n` +
        `Run: node scripts/test-search.mjs  to diagnose`
    );
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(no body)");
    throw new Error(
      `[SitecoreSearch] HTTP ${response.status} from ${searchUrl}\n${body}`
    );
  }

  const data = (await response.json()) as Record<string, unknown>;
  const { results, total } = parseResults(data);

  console.log(`[SitecoreSearch] ${results.length} results (total: ${total})`);
  return { results, total, query };
}

// ── Context formatter ──────────────────────────────────────────────────────

export function formatSearchResultsAsContext(
  searchResponse: SitecoreSearchResponse
): string {
  if (searchResponse.results.length === 0) {
    return "No relevant content was found in the knowledge base for this query.";
  }

  const lines = searchResponse.results.map(
    (r, i) =>
      `[Source ${i + 1}]: ${r.title}\nURL: ${r.url}` +
      (r.description ? `\nSummary: ${r.description}` : "") +
      (r.date ? `\nDate: ${r.date}` : "")
  );

  return (
    "The following content was retrieved from the Sitecore knowledge base:\n\n" +
    lines.join("\n\n---\n\n")
  );
}
