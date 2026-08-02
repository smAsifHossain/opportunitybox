# Contributing

Thanks for taking a look. Contributions of every size are welcome: new data sources, bug fixes, interface work, documentation, and corrections to listings that have gone stale.

## Getting set up

Full instructions are in the [README](README.md). The short version, assuming Node.js 20.9 or newer:

```bash
npm install
cp .env.example .env
npm run db:start     # first terminal, leave it running
npm run db:migrate   # second terminal
npm run db:seed
npm run dev
```

Run these four before opening a pull request. CI runs the same set against a real PostgreSQL, so a clean run locally usually means a clean run there.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Adding a data source

This is the most useful thing anyone can contribute, and it comes down to one file.

1. Create `src/ingestion/adapters/your-source.ts` implementing the `SourceAdapter` interface from `src/ingestion/types.ts`:
   - `key`, a stable kebab case identifier, plus `name` and `url`
   - `fetch()`, returning `NormalizedOpportunity[]`
2. Register it in the `adapters` array in `src/ingestion/pipeline.ts`
3. Add a row to [docs/data-sources.md](docs/data-sources.md) covering what it holds, how it is accessed, and any rate limits
4. Run `npm run ingest`. The new source should report SUCCESS on the admin dashboard, and a second run should add zero records

That last check matters. If a second run adds records rather than skipping them, the `externalId` is not stable, and every scheduled run will pile up duplicates.

A few things worth knowing:

- Every record needs a stable `externalId`, a real `homepageUrl`, and honest funding information. `UNKNOWN` is a perfectly good answer and better than a guess.
- Filter out anything already past its deadline inside the adapter. `isUpcoming` in `src/ingestion/util.ts` does this.
- Throwing from `fetch()` is fine. The pipeline catches errors per source, records them, and carries on with the others.
- Prefer official APIs and open datasets over scraping HTML. Scrapers break silently, which is worse than not having the source at all.
- Be a reasonable client: respect rate limits and do not request more than you need. `fetchJson` already sets a descriptive user agent.

If a source publishes no feed of any kind, do not write a scraper for it. Add the opportunity to [`data/curated.json`](data/curated.json) instead. It is a much smaller change and it does not rot.

## Code style

- TypeScript throughout, and validate anything crossing a trust boundary with Zod. That means form input, API routes and adapter output.
- Server Components by default. Reach for `"use client"` only where something genuinely needs interactivity.
- Follow the existing Tailwind and shadcn patterns rather than introducing a second way to do the same thing.
- Animations should respect `prefers-reduced-motion`.
- Comments explain why something is the way it is, not what the line already says.

## Reporting problems

Open an issue with steps to reproduce. There are templates for [bugs](.github/ISSUE_TEMPLATE/bug_report.md) and for [suggesting a data source](.github/ISSUE_TEMPLATE/data_source.md).

For a listing with wrong details, a dead link or a stale deadline, include the listing URL and what it should say instead. If it came from an upstream dataset such as confs.tech, fixing it there helps every project using that data, not only this one.

## Conduct

By taking part you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
