# Substrate

**CetaLabs · v0.1** — a techno-economic reasoning instrument that carries its own doubt. Atomic claims with provenance and grades (L1), deterministic models that consume them (L3), and an uncertainty engine that ranks *which unknown is most worth resolving next* (L4 — the moat).

Full design: [`../substrate_architecture.md`](../substrate_architecture.md).

## What's up (shipped)

- **Homepage** (`/`) — Astro landing page with live numbers computed from the claim registry at build time (claim count, Monte Carlo LCOE interval, top-3 VOI ranking).
- **The instrument** (`/app/`) — the v3 dashboard with tweakable parameters, served as-is from `public/app/index.html`.
- **L1 — Claim Substrate** — JSON claims in [`data/claims/`](data/claims/), schema + validation + staleness flags in [`src/lib/l1-claims/`](src/lib/l1-claims/). Git history is the version lineage (decision D1).
- **L3 — Model Registry** — SBSP LCOE as a pure function with fixtures T1–T4 in [`src/lib/l3-models/`](src/lib/l3-models/). `bun test` fails if fixtures break.
- **L4 — Uncertainty Engine** — grade→width config, claim intervals, naive VOI ranking, Monte Carlo propagation in [`src/lib/l4-uncertainty/`](src/lib/l4-uncertainty/), all tested.

## What's ongoing

- ✅ v3 dashboard parameters migrated to `data/claims/` — 15 claims across `sbsp` and `compute` modules.
- ✅ Dashboard bound to L1: the Astro endpoint [`src/pages/app/claims.json.ts`](src/pages/app/claims.json.ts) serializes the registry; `/app` fetches it and overrides its hardcoded presets (which remain only as offline fallback). Edit a claim JSON, rebuild, and the instrument updates.
- Replacing the migration source (`src-v3`) on each claim with real provenance as corroboration lands.
- Extraction sessions (L2 Phase-0 pattern): human grades everything; the gate is architectural, not procedural (D2).

## In build (roadmap — 90-day Cosmos window)

| Weeks | Milestone |
|---|---|
| 1–2 | L1-MVP: full claim repo + access field ✅ (seeded) |
| 1–3 | L2-MVP: Phase-0 extraction sessions with R |
| 3–5 | L3-MVP: harden SBSP model ✅, port compute model |
| 5–7 | L4-MVP: grade→width config ✅ + formalized tornado ✅ |
| 7–9 | **L4-GREAT (partial): correlated Monte Carlo + cost-weighted VOI — the Cosmos demo** |
| 9–12 | Polish, external test, screenshots |

Deferred to v2+: L5-GREAT (event-shock library, forecast calibration), L6 (agent orchestration — needs the `@astrojs/cloudflare` adapter + cron triggers), L7-GREAT (view registry, audience exports), Fable narrative (D5: only after L3/L4 fixtures are stable 30 days).

**Hard rules:** human gate on all claim writes, forever (D2). Restricted-claim inference via Anthropic API or local Ollama only (D4).

## How to

Requires [Bun](https://bun.sh).

```sh
bun install        # install deps
bun run dev        # dev server at localhost:4321
bun test           # run L3 fixtures + L4 engine tests
bun run build      # static build → dist/
bun run deploy     # build + wrangler pages deploy (needs `wrangler login` once)
```

**Add a claim:** drop a JSON file in `data/claims/` following the schema in [`src/lib/l1-claims/schema.ts`](src/lib/l1-claims/schema.ts) — id, statement, value, unit, grade (A–D), contest_range, access, sources. The homepage stats, Monte Carlo, and VOI ranking pick it up on next build.

**Add a model:** copy the pattern in `src/lib/l3-models/sbsp.ts` — one pure function per domain, fixtures in the sibling `.test.ts`, inputs mapped to claim IDs in the page that wires it.

**Deploy on Cloudflare Pages (git-connected alternative):** framework preset *Astro*, build command `bun run build`, output `dist`, root directory `app/`.
