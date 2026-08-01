# Contributing to OpportunityBox

Thanks for helping make opportunities discoverable for everyone! Contributions of all kinds are welcome: new data sources, bug fixes, UI polish, docs, and opportunity submissions through the app itself.

## Development setup

Follow the [Getting started](README.md#getting-started) section of the README. In short: `npm install`, copy `.env.example` to `.env`, start a database (`npm run db:start` or Docker), then `npm run db:migrate && npm run db:seed && npm run dev`.

Before opening a PR, make sure these pass locally:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

CI runs the same checks against a fresh PostgreSQL.

## Adding a data source (the most valuable contribution!)

The directory is only as good as its data. To add a source:

1. Create `src/ingestion/adapters/<source>.ts` implementing the `SourceAdapter` interface from `src/ingestion/types.ts`:
   - `key`: stable unique id (kebab-case), `name`, `url`
   - `fetch()`: return `NormalizedOpportunity[]`. Each record needs a **stable `externalId`** (the pipeline upserts on it), a real `homepageUrl`, and honest `funding` info (`UNKNOWN` is fine).
2. Register the adapter in the `adapters` array in `src/ingestion/pipeline.ts`.
3. Document the source in `docs/data-sources.md` (what it covers, how it's accessed, rate limits).
4. Test it: `npm run ingest` should finish with the new source reporting SUCCESS on the admin dashboard, and a re-run should produce `0 added` (idempotency).

Guidelines:

- Prefer official APIs or openly licensed datasets over HTML scraping; scraping breaks silently.
- Filter out past events in the adapter (`isUpcoming` in `src/ingestion/util.ts`).
- Throwing from `fetch()` is fine. The pipeline isolates failures per source and records the error.
- Be a good citizen: respect rate limits, set a descriptive User-Agent (`fetchJson` does this), and don't fetch more than needed.

## Code style

- TypeScript, strict. Zod-validate anything that crosses a trust boundary (forms, API routes, adapter output).
- Server Components by default; `"use client"` only where interactivity needs it.
- Match the existing Tailwind + shadcn/ui patterns; animations should respect `prefers-reduced-motion`.

## Reporting issues

Open a GitHub issue with reproduction steps. For listings with wrong data (bad deadline, dead link), include the listing URL and the correct information, or just fix it at the source dataset when it's ingested (e.g. confs.tech data lives in its own repo).
