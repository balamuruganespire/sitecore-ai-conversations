/**
 * scripts/test-search.ts
 *
 * Standalone connection test for Sitecore Search.
 * Mirrors exactly what lib/sitecoreSearch.ts does server-side.
 *
 * Usage:
 *   npx tsx scripts/test-search.ts
 *   npx tsx scripts/test-search.ts "XM Cloud personalization"
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// ── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq < 1) continue;
      const key = t.slice(0, eq).trim();
      const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
    console.log("✅  Loaded .env.local\n");
  } catch {
    console.warn("⚠️   .env.local not found — relying on process.env\n");
  }
}

loadEnv();

// ── Resolve config (same logic as SDK's SitecoreSearchConfig.build) ──────────
const ENV          = process.env.NEXT_PUBLIC_SEARCH_ENV ?? "prod";
const CUSTOMER_KEY = process.env.NEXT_PUBLIC_SEARCH_CUSTOMER_KEY ?? "";
const API_KEY      = process.env.NEXT_PUBLIC_SEARCH_API_KEY ?? "";
const RFK_ID       = process.env.NEXT_PUBLIC_SEARCH_RFK_ID ?? "rfkid_7";
const QUERY        = process.argv[2] ?? "Sitecore XM Cloud";

// SDK URL table (from @sitecore-search/data/dist/esm/config/types.js)
const DOMAINS: Record<string, string> = {
  prod:    "https://discover.sitecorecloud.io",
  prodEu:  "https://discover-euc1.sitecorecloud.io",
  apse2:   "https://discover-apse2.sitecorecloud.io",
  staging: "https://discover-staging.sitecore-staging.cloud",
};

// extractDomain: takes second segment of "XXXXXXX-YYYYYYY"
const domainId   = CUSTOMER_KEY.split("-")[1] ?? "";
const apiDomain  = DOMAINS[ENV] ?? DOMAINS["prod"];
// With apiKey set, SDK uses NON_SUBDOMAIN_SEARCH_PATH = '/discover/v2/{{key}}'
const searchUrl  = `${apiDomain}/discover/v2/${domainId}`;

console.log("────────────────────────────────────────────────────────");
console.log("  Sitecore Search — SDK-aligned Connection Test");
console.log("────────────────────────────────────────────────────────");
console.log(`  NEXT_PUBLIC_SEARCH_ENV          : ${ENV}`);
console.log(`  NEXT_PUBLIC_SEARCH_CUSTOMER_KEY : ${CUSTOMER_KEY || "❌ NOT SET"}`);
console.log(`  NEXT_PUBLIC_SEARCH_API_KEY      : ${API_KEY ? API_KEY.slice(0, 8) + "…" : "❌ NOT SET"}`);
console.log(`  NEXT_PUBLIC_SEARCH_RFK_ID       : ${RFK_ID}`);
console.log(`  Computed domainId               : ${domainId || "❌ (check CUSTOMER_KEY format)"}`);
console.log(`  Computed searchUrl              : ${searchUrl}`);
console.log(`  Test query                      : "${QUERY}"`);
console.log("────────────────────────────────────────────────────────\n");

if (!CUSTOMER_KEY || !API_KEY) {
  console.error("❌  NEXT_PUBLIC_SEARCH_CUSTOMER_KEY and NEXT_PUBLIC_SEARCH_API_KEY are required.");
  process.exit(1);
}

if (!domainId) {
  console.error("❌  CUSTOMER_KEY must be in format 'XXXXXXX-YYYYYYY' (two numbers separated by dash).");
  process.exit(1);
}

const payload = {
  widget: {
    items: [{
      entity: "content",
      rfk_id: RFK_ID,
      search: {
        query: { keyphrase: QUERY },
        content: {},
        limit: 5,
        offset: 0,
      },
    }],
  },
};

console.log(`→ POST ${searchUrl}\n`);

async function main(): Promise<void> {
  try {
    const res = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // SDK sends apiKey raw (no "Bearer " prefix)
        Authorization: API_KEY,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    console.log(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();

    if (!res.ok) {
      console.error("❌  Non-OK response body:\n", text.slice(0, 800));
      process.exit(1);
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      console.error("❌  Response is not JSON:\n", text.slice(0, 500));
      process.exit(1);
    }

    console.log("✅  Valid JSON received");
    console.log("   Top-level keys:", Object.keys(data).join(", "), "\n");

    const widgets = data?.widgets as Array<Record<string, unknown>> | undefined;
    const items   = (widgets?.[0]?.content as Record<string, unknown>[]) ?? [];
    const total   = (widgets?.[0]?.total_item as number) ?? 0;
    console.log(`   Results: ${items.length} (total in index: ${total})`);

    if (items.length === 0) {
      console.warn(
        "\n⚠️   0 results returned. Possible reasons:\n" +
        `   • rfk_id "${RFK_ID}" doesn't match a widget in your Sitecore Search dashboard\n` +
        `   • No content is indexed yet for domain ${domainId}\n` +
        `   • The keyphrase "${QUERY}" doesn't match any documents\n`,
      );
    } else {
      console.log("\n   Sample results:");
      items.slice(0, 3).forEach((item, i) => {
        console.log(`   [${i + 1}] ${(item["name"] as string) || (item["title"] as string) || "(no title)"}`);
        console.log(`       ${(item["url"] as string) || (item["source_url"] as string) || "(no url)"}`);
      });
      console.log("\n✅  Sitecore Search is working correctly.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("\n❌  Network/fetch error:", message);
    console.error("\nDiagnostics to run:");
    console.error(`  curl -I ${apiDomain}`);
    console.error(`  curl -s -X POST ${searchUrl} \\`);
    console.error(`    -H "Content-Type: application/json" \\`);
    console.error(`    -H "Authorization: ${API_KEY.slice(0, 8)}..." \\`);
    console.error(`    -d '{"widget":{"items":[{"entity":"content","rfk_id":"${RFK_ID}","search":{"query":{"keyphrase":"test"},"content":{},"pagination":{"perPage":3,"startFrom":0}}}]}}'`);
    process.exit(1);
  }
}

main();
