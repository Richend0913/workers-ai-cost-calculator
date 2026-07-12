// Free tool: "Will my project fit in Cloudflare Workers AI's free daily Neuron allowance?"
// No login, no API key, no AI call needed for the core calculator (pure arithmetic on official
// published pricing), so it costs ~$0 to run. Built by BURNING AUTONOMY (Richend Digital / NEXT GROWTH).
// Pricing data source: https://developers.cloudflare.com/workers-ai/platform/pricing/ (checked 2026-07-12).
// Positioning: Cloudflare's own dashboard calculator is retrospective (needs an account + real usage
// history). CostBench/FlareCalc target enterprise TCO. This tool answers one narrow, common question
// BEFORE you build anything: "at roughly N requests/day, will I stay inside the free 10,000 neurons/day?"

const FREE_NEURONS_PER_DAY = 10000;
const PRICE_PER_1000_NEURONS_USD = 0.011;
const DATA_CHECKED = "2026-07-12";
const SOURCE_URL = "https://developers.cloudflare.com/workers-ai/platform/pricing/";
const SITE_URL = "https://workers-ai-cost-calculator.burningbros.workers.dev";
const INDEXNOW_KEY = "71cdfa32ca43f22511c1ceb530e92f11";
const REPO_URL = "https://github.com/Richend0913/workers-ai-cost-calculator";

// [id, label, neurons per 1M input tokens, neurons per 1M output tokens]
const MODELS = [
  ["@cf/meta/llama-3.2-1b-instruct", "Llama 3.2 1B Instruct", 2457, 18252],
  ["@cf/meta/llama-3.2-3b-instruct", "Llama 3.2 3B Instruct", 4625, 30475],
  ["@cf/meta/llama-3.1-8b-instruct-fp8-fast", "Llama 3.1 8B Instruct (fp8-fast)", 4119, 34868],
  ["@cf/meta/llama-3.1-8b-instruct-fp8", "Llama 3.1 8B Instruct (fp8)", 13778, 26128],
  ["@cf/meta/llama-3.1-8b-instruct-awq", "Llama 3.1 8B Instruct (AWQ)", 11161, 24215],
  ["@cf/meta/llama-3.1-8b-instruct", "Llama 3.1 8B Instruct", 25608, 75147],
  ["@cf/meta/llama-3.2-11b-vision-instruct", "Llama 3.2 11B Vision Instruct", 4410, 61493],
  ["@cf/meta/llama-3.1-70b-instruct-fp8-fast", "Llama 3.1 70B Instruct (fp8-fast)", 26668, 204805],
  ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "Llama 3.3 70B Instruct (fp8-fast) — popular default", 26668, 204805],
  ["@cf/meta/llama-4-scout-17b-16e-instruct", "Llama 4 Scout 17B-16E Instruct", 24545, 77273],
  ["@cf/mistral/mistral-7b-instruct-v0.1", "Mistral 7B Instruct v0.1", 10000, 17300],
  ["@cf/mistralai/mistral-small-3.1-24b-instruct", "Mistral Small 3.1 24B Instruct", 31876, 50488],
  ["@cf/google/gemma-3-12b-it", "Gemma 3 12B IT", 31371, 50560],
  ["@cf/google/gemma-4-26b-a4b-it", "Gemma 4 26B-A4B IT", 9091, 27273],
  ["@cf/qwen/qwen2.5-coder-32b-instruct", "Qwen2.5 Coder 32B Instruct", 60000, 90909],
  ["@cf/qwen/qwen3-30b-a3b-fp8", "Qwen3 30B-A3B (fp8)", 4625, 30475],
  ["@cf/qwen/qwq-32b", "QwQ 32B", 60000, 90909],
  ["@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", "DeepSeek R1 Distill Qwen 32B", 45170, 443756],
  ["@cf/openai/gpt-oss-20b", "GPT-OSS 20B", 18182, 27273],
  ["@cf/openai/gpt-oss-120b", "GPT-OSS 120B", 31818, 68182],
  ["@cf/ibm-granite/granite-4.0-h-micro", "IBM Granite 4.0-H Micro", 1542, 10158],
  ["@cf/zai-org/glm-4.7-flash", "GLM-4.7 Flash", 5500, 36400],
  ["@cf/moonshotai/kimi-k2.5", "Kimi K2.5", 54545, 272727],
];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const modelOptions = MODELS.map(
  (m, i) => `<option value="${i}">${esc(m[1])}</option>`
).join("");

const modelTableRows = MODELS.map(
  (m) =>
    `<tr><td>${esc(m[1])}</td><td><code>${esc(m[0])}</code></td><td>${m[2].toLocaleString()}</td><td>${m[3].toLocaleString()}</td></tr>`
).join("");

const MODELS_JSON = JSON.stringify(MODELS.map((m) => [m[2], m[3]]));

const PAGE_TITLE = "Cloudflare Workers AI Free Tier Calculator — Will You Hit the Neuron Limit?";
const PAGE_DESC = "Free, no-login calculator: estimate your daily Neuron usage on Cloudflare Workers AI and see if it fits inside the 10,000 free Neurons/day allowance, before you build anything.";

const SCHEMA_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Cloudflare Workers AI Free Tier Neuron Calculator",
      "url": SITE_URL,
      "description": PAGE_DESC,
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Any (browser-based)",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "browserRequirements": "Requires JavaScript",
      "isAccessibleForFree": true,
      "sameAs": [REPO_URL],
    },
    {
      "@type": "WebPage",
      "@id": SITE_URL + "/",
      "url": SITE_URL + "/",
      "name": PAGE_TITLE,
      "description": PAGE_DESC,
      "isPartOf": { "@type": "WebSite", "url": SITE_URL, "name": "Workers AI Cost Calculator" },
    },
  ],
});

const UI = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${PAGE_TITLE}</title>
<meta name="description" content="${PAGE_DESC}">
<link rel="canonical" href="${SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${PAGE_TITLE}">
<meta property="og:description" content="${PAGE_DESC}">
<meta property="og:url" content="${SITE_URL}/">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${PAGE_TITLE}">
<meta name="twitter:description" content="${PAGE_DESC}">
<script type="application/ld+json">${SCHEMA_JSON}</script>
<style>
:root{--ac:#f6821f;--ac2:#f38020}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#0c0f16;color:#e6e8ee;line-height:1.6}
.wrap{max-width:820px;margin:0 auto;padding:28px 16px 80px}
h1{font-size:1.5rem;margin:.2em 0 .1em}
.sub{color:#9aa3b2;font-size:.92rem;margin-bottom:10px}
.badge{display:inline-block;background:rgba(246,130,31,.15);color:#ffb066;border:1px solid rgba(246,130,31,.4);font-size:.72rem;padding:3px 10px;border-radius:999px;margin:2px 4px 2px 0}
.card{background:#121722;border:1px solid #202838;border-radius:14px;padding:20px;margin:18px 0}
label{display:block;font-size:.82rem;color:#9aa3b2;margin:14px 0 4px}
select,input{width:100%;background:#0c0f16;color:#e6e8ee;border:1px solid #2a3346;border-radius:8px;padding:10px;font:inherit;font-size:.95rem}
.row3{display:grid;grid-template-columns:1fr 1fr;gap:12px}
button{margin-top:18px;background:linear-gradient(135deg,var(--ac),var(--ac2));color:#0c0f16;font-weight:800;border:0;border-radius:10px;padding:12px 18px;font-size:.95rem;cursor:pointer;width:100%}
.result{margin-top:18px;padding:16px;border-radius:10px;font-size:.95rem}
.ok{background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.4)}
.warn{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4)}
.result b{font-size:1.15rem}
.hint{font-size:.78rem;color:#6b7385;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:.82rem;margin-top:8px}
th,td{text-align:left;padding:7px 8px;border-bottom:1px solid #1c2432}
th{color:#9aa3b2;font-weight:600}
code{font-family:Consolas,Menlo,monospace;font-size:.78rem;color:#93c5fd}
.foot{margin-top:26px;font-size:.8rem;color:#7b8496;border-top:1px solid #1c2432;padding-top:16px}
.foot a{color:#5eead4}
details summary{cursor:pointer;color:#93c5fd;font-size:.88rem;margin-top:10px}
</style></head><body>
<div class="wrap">
<h1>Cloudflare Workers AI — Free Tier Neuron Calculator</h1>
<p class="sub">Estimate whether your project fits inside the 10,000 free Neurons/day allowance — before you build it.</p>
<span class="badge">Free</span><span class="badge">No login</span><span class="badge">No API key</span><span class="badge">Pure math, no AI call</span>

<div class="card">
<label for="model">Model</label>
<select id="model">${modelOptions}</select>

<div class="row3">
<div>
<label for="reqs">Requests per day</label>
<input id="reqs" type="number" min="0" value="200">
</div>
<div>
<label for="freq">&nbsp;</label>
<div class="hint" style="margin-top:12px">Rough guide: 1,000 tokens ≈ 750 English words</div>
</div>
</div>

<div class="row3">
<div>
<label for="intok">Avg. input tokens / request</label>
<input id="intok" type="number" min="0" value="500">
</div>
<div>
<label for="outtok">Avg. output tokens / request</label>
<input id="outtok" type="number" min="0" value="300">
</div>
</div>

<button id="calc">Calculate</button>
<div id="out"></div>
</div>

<details>
<summary>Full model pricing table (Neurons per 1M tokens)</summary>
<table><thead><tr><th>Model</th><th>ID</th><th>Input /1M tok</th><th>Output /1M tok</th></tr></thead>
<tbody>${modelTableRows}</tbody></table>
</details>

<div class="foot">
Free allowance: <b>10,000 Neurons/day</b> on both the Workers Free and Paid plans. Above that, Workers AI bills at
<b>$0.011 / 1,000 Neurons</b> on the Paid plan. This calculator only does arithmetic on Cloudflare's own published
per-model rates — it does not call any AI model, so it costs us nothing to run and can't hallucinate the numbers.<br>
Pricing data checked ${DATA_CHECKED} from <a href="${SOURCE_URL}" target="_blank" rel="noopener">Cloudflare's official pricing page</a> — always confirm current rates there before relying on this for a production budget.<br>
Built as a small, free utility by an AI-run micro-tool project (BURNING AUTONOMY). No tracking, no signup, no data stored.
Source code: <a href="${REPO_URL}" target="_blank" rel="noopener">open on GitHub</a>.
</div>
</div>
<script>
const MODELS = ${MODELS_JSON};
const FREE = ${FREE_NEURONS_PER_DAY};
const PRICE = ${PRICE_PER_1000_NEURONS_USD};
document.getElementById('calc').addEventListener('click', () => {
  const mi = +document.getElementById('model').value;
  const reqs = Math.max(0, +document.getElementById('reqs').value || 0);
  const intok = Math.max(0, +document.getElementById('intok').value || 0);
  const outtok = Math.max(0, +document.getElementById('outtok').value || 0);
  const [inRate, outRate] = MODELS[mi];
  const perReq = (intok/1e6)*inRate + (outtok/1e6)*outRate;
  const perDay = perReq * reqs;
  const out = document.getElementById('out');
  const maxFreeReqs = perReq > 0 ? Math.floor(FREE / perReq) : Infinity;
  if (perDay <= FREE) {
    const pct = FREE>0 ? Math.round((perDay/FREE)*100) : 0;
    out.innerHTML = '<div class="result ok"><b>✅ Fits in the free tier</b><br>'
      + '≈ ' + Math.round(perDay).toLocaleString() + ' Neurons/day ('+pct+'% of the 10,000 free daily allowance)<br>'
      + 'At this token size, you could make up to <b>' + (isFinite(maxFreeReqs)?maxFreeReqs.toLocaleString():'∞') + ' requests/day</b> for free.'
      + '<div class="hint">Neurons/request ≈ ' + perReq.toFixed(2) + '</div></div>';
  } else {
    const overage = perDay - FREE;
    const costPerDay = (overage/1000)*PRICE;
    out.innerHTML = '<div class="result warn"><b>⚠️ Exceeds the free tier</b><br>'
      + '≈ ' + Math.round(perDay).toLocaleString() + ' Neurons/day, about ' + Math.round(overage).toLocaleString() + ' over the free 10,000/day allowance.<br>'
      + 'On the Paid plan that overage costs roughly <b>$' + costPerDay.toFixed(2) + '/day</b> (~$' + (costPerDay*30).toFixed(2) + '/mo).<br>'
      + 'Free tier alone covers up to <b>' + (isFinite(maxFreeReqs)?maxFreeReqs.toLocaleString():'∞') + ' requests/day</b> at this token size.'
      + '<div class="hint">Neurons/request ≈ ' + perReq.toFixed(2) + '</div></div>';
  }
});
document.getElementById('calc').click();
</script>
</body></html>`;

const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE_URL}/</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`;

// Self-hosted traffic counter. Built because the CF GraphQL Analytics API is unreachable with the
// deploy-time wrangler OAuth token (no Account Analytics:Read scope) — see track-c README/RUNLOG.
// Best-effort only: not deduped by visitor, no bot-detection beyond a UA filter, and concurrent
// KV writes can undercount slightly (eventual consistency).
// The /stats endpoint is left public on purpose — publishing real measured numbers (even small ones)
// is the point (STRATEGY.md: verifiable measured data is how an anonymous AI-run tool earns trust).
const ANALYTICS_SITE = "workers-ai-cost-calculator";
const SELF_TEST_UA = /curl|Playwright|HeadlessChrome|python-requests|wrangler/i;
// Link-preview/unfurl bots (fire once whenever this URL is pasted into a chat app) and search/AI
// crawlers (fire once per crawl, e.g. after an IndexNow submission). Neither represents a human
// visitor; excluding them keeps /stats honest per CHARTER's no-fabrication rule. Not exhaustive —
// best-effort based on well-known UA substrings, revisit if new bot traffic shows up unexplained.
const KNOWN_BOT_UA = /discordbot|slackbot|telegrambot|whatsapp|facebookexternalhit|twitterbot|linkedinbot|skypeuripreview|redditbot|pinterest|iframely|googlebot|google-inspectiontool|bingbot|duckduckbot|yandexbot|baiduspider|applebot|petalbot|sogou|bytespider|ahrefsbot|semrushbot|mj12bot|dotbot|gptbot|chatgpt-user|ccbot|claudebot|anthropic-ai|perplexitybot|slurp|ia_archiver/i;

async function recordHit(env, request) {
  if (!env.ANALYTICS) return;
  if (request.headers.get("X-Skip-Analytics") === "1") return;
  const ua = request.headers.get("User-Agent") || "";
  if (SELF_TEST_UA.test(ua) || KNOWN_BOT_UA.test(ua)) return;
  const day = new Date().toISOString().slice(0, 10);
  const key = `hits:${ANALYTICS_SITE}:${day}`;
  const cur = await env.ANALYTICS.get(key);
  const n = (cur ? parseInt(cur, 10) || 0 : 0) + 1;
  await env.ANALYTICS.put(key, String(n), { expirationTtl: 60 * 60 * 24 * 400 });
}

async function statsResponse(env) {
  if (!env.ANALYTICS) {
    return new Response(JSON.stringify({ error: "analytics not configured" }), { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });
  }
  const list = await env.ANALYTICS.list({ prefix: `hits:${ANALYTICS_SITE}:` });
  const by_day = {};
  for (const k of list.keys) {
    const day = k.name.split(":")[2];
    const v = await env.ANALYTICS.get(k.name);
    by_day[day] = parseInt(v, 10) || 0;
  }
  const total = Object.values(by_day).reduce((a, b) => a + b, 0);
  const body = JSON.stringify({
    site: ANALYTICS_SITE,
    method: "self-hosted KV request counter on the '/' route only. Excludes requests sending an X-Skip-Analytics header, a self-test User-Agent (curl/Playwright/etc), or a known link-preview/search-crawler bot (Discordbot, Googlebot, Bingbot, GPTBot, etc). Not deduped by visitor. Not exact — measured trend only.",
    by_day,
    total,
  }, null, 2);
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8" } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "") {
      if (ctx) ctx.waitUntil(recordHit(env, request));
      return new Response(UI, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname === "/stats") {
      return statsResponse(env);
    }
    if (url.pathname === "/robots.txt") {
      return new Response(ROBOTS_TXT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    if (url.pathname === "/sitemap.xml") {
      return new Response(SITEMAP_XML, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
    }
    if (url.pathname === `/${INDEXNOW_KEY}.txt`) {
      return new Response(INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response("Not found", { status: 404 });
  },
};
