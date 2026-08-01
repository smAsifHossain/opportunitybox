# 🧭 OpportunityBox

[![CI](https://github.com/smAsifHossain/opportunitybox/actions/workflows/ci.yml/badge.svg)](https://github.com/smAsifHossain/opportunitybox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Never miss an opportunity again.**

OpportunityBox is a free, open-source directory of **conferences, workshops, trainings, fellowships, grants, hackathons, volunteer roles, and calls for papers** (for both conferences and journals) from around the world — each with its **deadline**, **funding status** (fully funded / partial / none), **application link**, and homepage, all in one searchable place.

> **Why it exists:** A fully funded NSF/NAIRR workshop ([AI Unlocked](https://nairrpilot.org/ai-unlocked)) was discovered only because a professor mentioned it in passing. Great opportunities shouldn't depend on who you happen to know — they should reach everyone. OpportunityBox was built to close that gap.

Created by [S M Asif Hossain](https://www.linkedin.com/in/smasifhossain/), a PhD student in Computer Science at Wichita State University, in collaboration with The Maroon Lab.

⭐ If this project helps you, please **star the repo** — it helps more people discover these opportunities.

---

## ✨ Features

- **🔎 Explore & filter** — full-text search plus filters for type, funding, online/in-person, country, and deadline-first sorting. Filter state lives in the URL, so any view is shareable. Past-deadline opportunities are hidden automatically.
- **⏰ Live deadline countdowns** — color-coded chips (red < 7 days, amber < 30, green otherwise).
- **🤖 Automated data ingestion** — adapters pull live opportunities every 6 hours from [confs.tech](https://github.com/tech-conferences/conference-data), [ccf-deadlines](https://github.com/ccfddl/ccf-deadlines), [ai-deadlines](https://github.com/huggingface/ai-deadlines), and the [Grants.gov API](https://www.grants.gov/api). One broken source never blocks the others.
- **👤 Accounts** — register with email verification, log in (email/password or optional Google), reset forgotten passwords by email, and edit your profile (name, affiliation, contact number, password).
- **🔖 Save & track** — bookmark opportunities and manage them from your dashboard.
- **✍️ Community submissions** — anyone can submit an opportunity; moderators approve or reject (with a reason) before it goes live.
- **🛡️ Admin dashboard** — moderation queue, duplicate detection, per-source health, and a manual ingest trigger.
- **📬 Weekly newsletter** — new + closing-soon opportunities, with one-click unsubscribe. Works without any email provider in development (emails print to the console).
- **🌗 Modern animated UI** — dark-mode-first, smooth motion, fully responsive, respects reduced-motion.

## 🛠️ Tech stack

Next.js 16 (App Router, React Server Components) · TypeScript · Tailwind CSS v4 · shadcn/ui (Base UI) · Motion · Prisma 7 + PostgreSQL · Auth.js v5 · Zod · Resend · Vitest

---

## 🚀 Run it locally

### Prerequisites
- **Node.js 20.9+** and npm
- No database install needed — a local PostgreSQL is bundled (via `embedded-postgres`). Docker is an optional alternative.

### Steps

```bash
git clone https://github.com/smAsifHossain/opportunitybox.git
cd opportunitybox
npm install
cp .env.example .env        # then generate a secret: npx auth secret  → paste into AUTH_SECRET
```

**Open two terminals:**

```bash
# Terminal 1 — start the local database (keep it running)
npm run db:start
```

```bash
# Terminal 2 — set up data and run the app
npm run db:migrate          # create the database tables
npm run db:seed             # ~30 sample opportunities + a dev admin account
npm run dev                 # → http://localhost:3000
```

Optionally pull **live data** from all sources:

```bash
npm run ingest
```

The seed creates an admin account — `admin@opportunitybox.local` / `admin1234` (override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`). **Change this in any real deployment.**

> **📧 Emails in local development:** registration requires email verification and password resets are emailed. Without a `RESEND_API_KEY`, those emails are **printed to the `npm run dev` terminal** — copy the verification / reset link from there into your browser. (The seeded admin is already verified, so you can log in with it directly.)

> **🪟 Windows note:** PowerShell may block `npm` scripts — run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. If `npm run db:start` fails with a DLL error, install the [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).

### Useful scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run db:start` | Local PostgreSQL (data in `.local/pgdata`) |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Seed sample data + admin user |
| `npm run ingest` | Run all source adapters once |
| `npm run normalize:countries` | Re-apply country name normalization to existing rows |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` / `npm run typecheck` / `npm run build` | Lint / type check / production build |

---

## ☁️ Deploy for free (Vercel + Neon)

The whole stack runs on free tiers, stays **online 24/7**, and handles login and cloud data storage. See [the FAQ below](#-deployment-faq).

1. **Database (cloud, free):** create a project at [neon.tech](https://neon.tech) and copy its connection string.
2. **Migrate & seed it once** from your machine:
   ```bash
   # PowerShell:  $env:DATABASE_URL="<neon-string>"; npx prisma migrate deploy; npm run db:seed
   # macOS/Linux: DATABASE_URL="<neon-string>" npx prisma migrate deploy && DATABASE_URL="<neon-string>" npm run db:seed
   ```
3. **Host (free):** import this repo at [vercel.com](https://vercel.com) → *Add New → Project*. Set these Environment Variables:
   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `AUTH_SECRET` | output of `npx auth secret` |
   | `CRON_SECRET` | any long random string |
   | `NEXT_PUBLIC_APP_URL` | your deployment URL, e.g. `https://opportunitybox.vercel.app` |
   | `RESEND_API_KEY`, `EMAIL_FROM` | *(optional)* real emails via [resend.com](https://resend.com) |
   | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | *(optional)* Google login |
4. Click **Deploy** — live in ~2 minutes.
5. **Keep data fresh (free):** in this repo → *Settings → Secrets and variables → Actions*, add `DATABASE_URL` (Neon), `APP_URL`, and `CRON_SECRET`. The included GitHub Actions then auto-ingest every 6 hours and send the weekly digest.

### ❓ Deployment FAQ

- **Does it handle sign-up / login?** Yes. Auth.js runs as part of the deployed app — registration, email verification, login, password reset, and (optionally) Google sign-in all work in production.
- **Is data stored in the cloud?** Yes. All data — users, saved opportunities, submissions, newsletter subscribers, ingested listings — lives in your **Neon PostgreSQL** database in the cloud, not on your computer. Your local database is only for development.
- **Will it be online 24/7?** Yes. Vercel serves the app continuously on its global network; Neon keeps the database available. Both free tiers are fine for a project like this. (Neon's free database may "sleep" after inactivity and wakes on the next request within a second or two — invisible to users in practice.)
- **Is it really free?** Yes, for typical usage: Vercel Hobby (hosting), Neon free tier (database), Resend free tier (3,000 emails/month), and GitHub Actions (free for public repos). No credit card required to start.
- **Email note:** Resend's free tier sends from a test domain until you verify your own domain. Without `RESEND_API_KEY`, the deployed app still works — it just logs emails instead of sending, which means verification links won't reach users, so add Resend before inviting real sign-ups.

---

## 🧩 Architecture

```
├─ src/
│  ├─ app/               # routes: home, opportunities, auth, dashboard, submit, admin, api
│  ├─ components/        # UI building blocks (ui/ = shadcn primitives, admin/ = admin widgets)
│  ├─ ingestion/
│  │  ├─ types.ts        # NormalizedOpportunity schema + SourceAdapter interface
│  │  ├─ adapters/       # confs-tech, ccf-deadlines, ai-deadlines, grants-gov, curated
│  │  └─ pipeline.ts     # validate → dedupe → upsert → log each run
│  └─ lib/               # db, auth, email, digest, country normalization, query builders
├─ prisma/               # schema, migrations, seed data
├─ scripts/              # dev database, ingestion runner, data maintenance
├─ data/curated.json     # hand-curated opportunities (sources without an API)
├─ docs/                 # data source documentation
└─ .github/workflows/    # CI, 6-hourly ingestion, weekly newsletter
```

Ingested records from trusted structured sources go live immediately; community submissions wait in the moderation queue. Every ingestion run is logged per source and surfaced on the admin dashboard.

**Adding a data source** is one file — implement `SourceAdapter` in `src/ingestion/adapters/`, register it in `pipeline.ts`, and document it in [docs/data-sources.md](docs/data-sources.md). For sources without an API (university pages, one-off funded events), just add an entry to [`data/curated.json`](data/curated.json) via pull request. See [CONTRIBUTING.md](CONTRIBUTING.md).

## 🤝 Contributing

Contributions of all kinds are welcome — new data sources are the most valuable. See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

## 📄 License

[MIT](LICENSE) — created by [S M Asif Hossain](https://www.linkedin.com/in/smasifhossain/), built for the community.
