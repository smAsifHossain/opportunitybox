# 🧭 OpenOpps

**Never miss an opportunity again.**

OpenOpps is an open-source directory of conferences, workshops, trainings, fellowships, grants, hackathons, volunteer roles, and calls for papers (conferences *and* journals) from around the world — each with its **deadline**, **funding status** (fully funded / partial / none), **application link**, and homepage.

> This project exists because a fully funded NSF/NAIRR workshop ([AI Unlocked](https://nairrpilot.org/ai-unlocked)) was discovered only through a professor's passing mention. Great opportunities shouldn't depend on who you happen to know.

## Features

- 🔎 **Explore & filter** — full-text search plus filters for type, funding, online/in-person, country, and deadline-first sorting. Filter state lives in the URL, so every view is shareable.
- ⏰ **Live deadline countdowns** — color-coded chips (red < 7 days, amber < 30, green otherwise); expired listings are archived automatically.
- 🤖 **Automated ingestion** — adapters pull live data from [confs.tech](https://github.com/tech-conferences/conference-data), [ccf-deadlines](https://github.com/ccfddl/ccf-deadlines), [ai-deadlines](https://github.com/huggingface/ai-deadlines), and the [Grants.gov API](https://www.grants.gov/api) every 6 hours via GitHub Actions. One broken source never blocks the rest.
- 👤 **Accounts** — email/password (and optional Google) login, bookmark opportunities, track your submissions.
- ✍️ **Community submissions** — anyone can submit an opportunity; moderators approve or reject (with a reason) before it goes live.
- 🛡️ **Admin dashboard** — moderation queue, duplicate detection, per-source health (last run, add/update/fail counts), manual ingest trigger.
- 📬 **Weekly newsletter** — new + closing-soon opportunities, tokenized unsubscribe; runs without any email provider in development (emails log to console).
- 🌗 **Modern animated UI** — dark-mode-first, Framer Motion entrances and micro-interactions, respects `prefers-reduced-motion`.

## Stack

Next.js 16 (App Router, RSC) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Motion · Prisma 7 + PostgreSQL · Auth.js v5 · Zod · Resend · Vitest

## Getting started

```bash
git clone https://github.com/openopps/openopps && cd openopps
npm install
cp .env.example .env        # then: npx auth secret  → paste into AUTH_SECRET
```

**Start a database** (pick one):

```bash
npm run db:start            # embedded PostgreSQL — no Docker needed; keep the terminal open
# or
docker compose up -d        # if you prefer Docker
```

**Migrate, seed, and run:**

```bash
npm run db:migrate          # create tables
npm run db:seed             # ~30 sample opportunities + dev admin account
npm run dev                 # http://localhost:3000
```

The seed creates an admin account `admin@openopps.local` / `admin1234` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`). **Change it in any real deployment.**

**Pull live data** from all four sources:

```bash
npm run ingest
```

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run db:start` | Embedded local PostgreSQL (data in `.local/pgdata`) |
| `npm run db:migrate` | Prisma migrations |
| `npm run db:seed` | Seed sample data + admin user |
| `npm run ingest` | Run all source adapters once |
| `npm test` | Vitest unit tests |
| `npm run lint` / `npm run build` | ESLint / production build |

> **Windows note:** if `npm run db:start` fails with a DLL error, the PostgreSQL binaries need the [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).

## Free deployment (Vercel + Neon + GitHub Actions)

The whole stack runs on free tiers:

1. **Database** — create a free [Neon](https://neon.tech) project, copy the connection string.
2. **App** — import the repo on [Vercel](https://vercel.com) (Hobby tier). Set env vars: `DATABASE_URL`, `AUTH_SECRET`, `CRON_SECRET` (any long random string), `NEXT_PUBLIC_APP_URL` (your deployment URL), and optionally `RESEND_API_KEY` + `EMAIL_FROM` for real emails and `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` for Google login.
3. **Migrate** — run `npx prisma migrate deploy` locally against the Neon `DATABASE_URL` (or add it to your build step).
4. **Scheduled ingestion** — add repo secrets `DATABASE_URL` (Neon) for the [ingest workflow](.github/workflows/ingest.yml), plus `APP_URL` and `CRON_SECRET` for the [weekly newsletter](.github/workflows/newsletter.yml). GitHub Actions cron is free for public repos.

## Architecture

```
src/
├─ app/                  # routes: home, opportunities, auth, dashboard, submit, admin, api
├─ components/           # UI building blocks (+ ui/ for shadcn primitives)
├─ ingestion/
│  ├─ types.ts           # NormalizedOpportunity schema + SourceAdapter interface
│  ├─ adapters/          # confs-tech, ccf-deadlines, ai-deadlines, grants-gov
│  └─ pipeline.ts        # validate → dedupe (contentHash) → upsert → log IngestionRun
└─ lib/                  # db, auth, email, digest, query builders, formatting
```

Ingested records from trusted structured sources go live immediately; community submissions wait in the moderation queue. Every ingestion run is logged per source and surfaced on the admin dashboard.

**Adding a data source** is one file: implement `SourceAdapter` in `src/ingestion/adapters/`, register it in `pipeline.ts`, and document it in [docs/data-sources.md](docs/data-sources.md). See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) — built by the community, for the community.
