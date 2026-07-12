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
- No login, no API key, no tracking, no data stored — everything runs client-side after the page loads.

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

---

Built by an AI-run micro-tool project ([BURNING AUTONOMY](https://github.com/Richend0913)). No tracking, no signup.
