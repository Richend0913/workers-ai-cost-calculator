# Cloudflare Workers AI — Free Tier Neuron Calculator

**Live tool:** https://workers-ai-cost-calculator.burningbros.workers.dev

A free, no-login calculator that answers one narrow question *before you build anything*:

> At roughly N requests/day with M input/output tokens, will my project fit inside Cloudflare Workers AI's **10,000 free Neurons/day** allowance — or how much will the overage cost on the Paid plan?

## Why this exists

Cloudflare's own dashboard usage view is retrospective — it needs an account and real traffic history before it tells you anything. General-purpose cost calculators (FlareCalc, CostBench, etc.) are built for enterprise TCO estimates across the whole Workers platform (KV/D1/R2/Durable Objects/Queues/etc.). Neither answers the specific pre-build question a solo dev has: *"if I ship this today, do I stay free?"*

This tool does one thing: pick a model, enter requests/day and average token counts, get an instant Neurons/day estimate and a free-vs-paid verdict.

## How it works

- Pure arithmetic on Cloudflare's own published per-model Neuron rates (`neurons per 1M input/output tokens`) — **no AI model is called**, so the tool costs ~$0 to run and can't hallucinate the numbers.
- Pricing data is hardcoded from Cloudflare's [official Workers AI pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/), with the date it was last checked shown on the page.
- No login, no API key, no cookies, no per-visitor tracking — the calculator itself runs client-side after the page loads.

## Traffic

The Cloudflare GraphQL Analytics API isn't reachable from this project's deploy token (no `Account Analytics:Read` scope), so the Worker counts its own aggregate page views in KV: see `/stats` for the live numbers. It's a same-origin request counter only — no cookies, no per-visitor identifiers, nothing stored about who's visiting. Requests sending an `X-Skip-Analytics: 1` header or a common bot/test User-Agent (curl, Playwright, etc.) aren't counted, so this project's own testing doesn't inflate the number.

## Stack

- Single [Cloudflare Worker](https://developers.cloudflare.com/workers/) (`worker.js`), no framework, no build step, no KV/D1 bindings.
- Deploy with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npx wrangler deploy
```

## Keeping pricing current

Cloudflare occasionally adds models or changes per-model Neuron rates. To refresh:

1. Check https://developers.cloudflare.com/workers-ai/platform/pricing/
2. Update the `MODELS` array and `DATA_CHECKED` constant in `worker.js`
3. Redeploy

PRs that update pricing data (with a link to the source) or fix bugs are welcome.

## License

MIT — see [LICENSE](LICENSE).

## Related tools

Other free Cloudflare tools from the same project:

- [Cloudflare Error Code AI Explainer](https://cf-error-explainer.burningbros.workers.dev/) ([source](https://github.com/Richend0913/cf-error-explainer))
- [Cloudflare Storage Advisor (KV vs D1 vs R2 vs Durable Objects)](https://cf-storage-advisor.burningbros.workers.dev/) ([source](https://github.com/Richend0913/cf-storage-advisor))
- [Cloudflare Async Processing Advisor (Queues vs Workflows vs Durable Objects vs Cron)](https://cf-async-advisor.burningbros.workers.dev/) ([source](https://github.com/Richend0913/cf-async-advisor))

---

Built by an AI-run micro-tool project ([BURNING AUTONOMY](https://github.com/Richend0913)). No signup, no per-visitor tracking — see [Traffic](#traffic) for the aggregate counter this project publishes at `/stats`.
