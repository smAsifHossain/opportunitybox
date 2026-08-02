<div align="center">

# OpportunityBox

**Funded workshops, fellowships, conferences and calls for papers from around the world, in one searchable place.**

### [opportunitybox.vercel.app](https://opportunitybox.vercel.app)

[![Live site](https://img.shields.io/badge/live-opportunitybox.vercel.app-000000?logo=vercel)](https://opportunitybox.vercel.app)
[![CI](https://github.com/smAsifHossain/opportunitybox/actions/workflows/ci.yml/badge.svg)](https://github.com/smAsifHossain/opportunitybox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma%207-336791?logo=postgresql&logoColor=white)](https://www.prisma.io)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Report a bug](https://github.com/smAsifHossain/opportunitybox/issues/new?template=bug_report.md) ·
[Suggest a data source](https://github.com/smAsifHossain/opportunitybox/issues/new?template=data_source.md) ·
[Contributing guide](CONTRIBUTING.md)

</div>

## The problem

I attended a workshop called [AI Unlocked](https://nairrpilot.org/ai-unlocked), funded by NAIRR and NSF, which reimbursed participants in full. I only found out it existed because a professor mentioned it in passing. There was no mailing list to join, no directory to check, and no reason I would have heard about it otherwise.

That is the normal case rather than the exception. Funded workshops, fellowships, summer schools, travel grants and calls for papers sit on hundreds of separate university pages, government portals and departmental mailing lists. The people who find them are usually the people who already know someone.

## What it does

OpportunityBox pulls those listings in automatically and puts them behind one search box. At the time of writing that is roughly 470 open opportunities from 5 sources, 203 of them fully funded, spread across 46 countries. Ingestion runs every six hours, so nobody has to maintain the list by hand.

Every listing carries the four things you actually need before deciding whether to apply:

1. When the deadline is, with a countdown
2. Whether it is funded, and what the funding covers
3. Where to apply, linked directly
4. Where it came from, so you can verify it

Listings whose deadline has passed drop out of the directory on their own.

## Features

| Area | What you get |
|:-|:-|
| Search and filter | Full text search over titles, descriptions, fields and countries, plus filters for type, funding level, online or in person, and country. Filter state lives in the URL, so any view can be shared or bookmarked |
| Deadline countdowns | Color coded chips that turn amber under 30 days and red under 7. Expired listings are hidden automatically |
| Ten opportunity types | Conferences, workshops, trainings, fellowships, grants, hackathons, volunteer roles, and calls for papers for both conferences and journals |
| Accounts | Registration with email verification, password reset by email, optional Google sign in, and an editable profile with name, affiliation and contact number |
| Saved opportunities | Bookmark anything and see it on your dashboard, ordered by whichever deadline is closest |
| Community submissions | Anyone can submit an opportunity. It waits in a moderation queue until an admin approves it, and the submitter can track its status |
| Admin tools | Moderation queue with reasons for rejection, duplicate detection by homepage URL, per source health showing the last run and its counts, and a manual ingestion trigger |
| Weekly digest | New and closing soon opportunities by email, with one click unsubscribe. Works with no email provider configured, in which case messages are written to the console |
| Interface | Dark mode by default with a light theme, motion that respects reduced motion preferences, and layouts that work on a phone |

## Where the data comes from

Five adapters run on a schedule. Each one is isolated, so a source that breaks or changes its format cannot stop the others from running.

| Source | Covers | Access |
|:-|:-|:-|
| [confs.tech](https://github.com/tech-conferences/conference-data) | Tech conferences worldwide, including CFP deadlines | Open dataset on GitHub, no key needed |
| [ccf-deadlines](https://github.com/ccfddl/ccf-deadlines) | Computer science conference deadlines with CCF ranks | Open dataset on GitHub, no key needed |
| [ai-deadlines](https://huggingface.co/spaces/huggingface/ai-deadlines) | AI and machine learning conference deadlines | Open dataset, no key needed |
| [Grants.gov](https://www.grants.gov/api/api-guide) | United States federal grants, fellowships and training programs | Public API, no key needed |
| [data/curated.json](data/curated.json) | Anything with no API at all, such as NAIRR program calls and one off university workshops | Edited by pull request |

That last row is the important one. Plenty of good opportunities live on a single university page with no feed of any kind, and the honest answer is that a scraper per website breaks constantly. Adding an entry to `data/curated.json` takes one pull request, and entries disappear on their own once their deadline passes. Details are in [docs/data-sources.md](docs/data-sources.md).

## How it works

```
GitHub Actions (every 6 hours)
        |
        v
  ingestion pipeline
        |
        +-> adapter per source, each isolated
        +-> validate against a schema, drop bad records
        +-> hash the payload, skip anything unchanged
        +-> upsert by (source, external id)
        +-> write a run log for the admin dashboard
        |
        v
   PostgreSQL  <->  Next.js app (pages, API, auth)
                          |
                          v
                    people looking
                    for opportunities
```

Records from the structured sources go live immediately, since they already come from vetted datasets. Community submissions go into the moderation queue instead. Every run is logged per source and shown on the admin dashboard, so a source that quietly stops returning data is visible rather than silent.

## Running it locally

You need Node.js 20.9 or newer. You do not need to install PostgreSQL, because a local one is bundled through `embedded-postgres`. Docker works too if you prefer it.

```bash
git clone https://github.com/smAsifHossain/opportunitybox.git
cd opportunitybox
npm install
cp .env.example .env
```

Generate a secret with `npx auth secret` and paste it into `AUTH_SECRET`. Then open two terminals:

```bash
# first terminal, leave it running
npm run db:start
```

```bash
# second terminal
npm run db:migrate
npm run db:seed
npm run dev
```

The app comes up on http://localhost:3000 with about 30 sample opportunities. To pull real data from all five sources:

```bash
npm run ingest
```

The seed also creates an admin account, `admin@opportunitybox.local` with the password `admin1234`. Override those with `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, and change them before any real deployment.

**Email in development.** Registration needs a verification link and password resets are emailed. With no email provider configured, those emails are printed to the terminal running `npm run dev` instead of being sent, so copy the link from there. The seeded admin is already verified and can log in directly.

To send real email, pick one of two options in `.env`. Gmail SMTP works without owning a domain: set `GMAIL_USER` to your address and `GMAIL_APP_PASSWORD` to an App Password from [Google account settings](https://myaccount.google.com/apppasswords), which requires 2 Step Verification. Alternatively set `RESEND_API_KEY`, though Resend only delivers to your own address until you verify a domain you own.

**On Windows.** If PowerShell refuses to run npm scripts, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once. If `npm run db:start` fails with a DLL error, install the [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe).

### Scripts

| Command | What it does |
|:-|:-|
| `npm run dev` | Development server |
| `npm run db:start` | Local PostgreSQL, data kept in `.local/pgdata` |
| `npm run db:migrate` | Apply database migrations |
| `npm run db:seed` | Sample opportunities and an admin account |
| `npm run ingest` | Run all five adapters once |
| `npm run normalize:countries` | Reapply country name normalization to existing rows |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run build` | Production build |

## Deploying it for free

The whole stack fits inside free tiers and stays online continuously.

**1. Database.** Create a project on [Neon](https://neon.tech) and copy the connection string.

**2. Migrate it once** from your machine, with `DATABASE_URL` set to that string:

```bash
npx prisma migrate deploy
npm run db:seed
```

**3. Host the app.** Import the repository on [Vercel](https://vercel.com) and set these variables:

| Variable | Value |
|:-|:-|
| `DATABASE_URL` | Your Neon connection string |
| `AUTH_SECRET` | Output of `npx auth secret` |
| `CRON_SECRET` | Any long random string |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Optional, sends email from your own Gmail address |
| `RESEND_API_KEY` | Optional alternative to Gmail, needs a verified domain |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional, for Google sign in |

**4. Keep the data fresh.** In the repository settings, add `DATABASE_URL`, `APP_URL` and `CRON_SECRET` as Actions secrets. The included workflows then handle ingestion and the weekly digest.

### Scheduled jobs

| Workflow | Schedule | What it does |
|:-|:-|:-|
| [ci.yml](.github/workflows/ci.yml) | Every push and pull request | Lint, typecheck, tests, build, against a real PostgreSQL |
| [ingest.yml](.github/workflows/ingest.yml) | Every 6 hours | Runs all adapters against the production database |
| [newsletter.yml](.github/workflows/newsletter.yml) | Mondays at 13:00 UTC | Sends the weekly digest |

### Questions people ask about deployment

**Does sign up and login work once deployed?** Yes. Auth.js runs inside the deployed app, so registration, email verification, login, password reset and optional Google sign in all work in production.

**Where does the data live?** In your Neon database in the cloud. Users, saved opportunities, submissions, subscribers and every ingested listing. The local database is only for development.

**Will it stay online?** Yes. Vercel serves the app continuously. Neon suspends an idle database and wakes it on the next query in well under a second, which visitors do not notice.

**Is it actually free?** For normal traffic, yes: Vercel Hobby, the Neon free tier, 3,000 emails a month on Resend, and GitHub Actions, which is free on public repositories. Note that Vercel's Hobby plan is for non commercial use, so a project that starts charging for something needs their paid plan.

**Do I have to set up email?** The site runs without it, but verification links will never reach anyone, so nobody can finish signing up. Add a Resend key before inviting real users.

## API

There are two endpoints, both meant for schedulers rather than browsers, and both protected by `CRON_SECRET`.

| Method | Route | Purpose |
|:-|:-|:-|
| `POST` | `/api/ingest` | Runs every adapter, then expires past deadline records |
| `POST` | `/api/newsletter/digest` | Sends the weekly digest to subscribers |

<details>
<summary>Example call and response</summary>

```bash
curl -X POST https://your-deployment.vercel.app/api/ingest \
  -H "Authorization: Bearer $CRON_SECRET"
```

```json
{
  "runs": [
    { "source": "confs-tech", "status": "SUCCESS", "added": 39, "updated": 26, "skipped": 100, "failed": 0 },
    { "source": "grants-gov", "status": "SUCCESS", "added": 107, "updated": 81, "skipped": 0, "failed": 0 }
  ],
  "expired": 163
}
```

</details>

A public read only API for the listings themselves does not exist yet. It is on the [roadmap](ROADMAP.md).

## Project layout

```
src/
  app/                routes: home, opportunities, auth, dashboard, submit, admin, api
  components/         UI building blocks, ui/ holds the shadcn primitives
  ingestion/
    types.ts          the record shape every adapter must produce
    adapters/         one file per source
    pipeline.ts       validate, deduplicate, upsert, log
  lib/                database, auth, email, digest, country names, query builders
prisma/               schema, migrations, seed data
scripts/              local database, ingestion runner, data maintenance
data/curated.json     hand curated opportunities for sources with no API
docs/                 data source notes
.github/workflows/    CI, ingestion, newsletter
```

## How it compares

| | OpportunityBox | WikiCFP | confs.tech | ccf-deadlines | ProFellow | Grants.gov |
|:-|:-|:-|:-|:-|:-|:-|
| Conferences and CFPs | Yes | Yes | Yes | Yes | No | No |
| Fellowships and grants | Yes | No | No | No | Yes | Yes |
| Workshops and training | Yes | Partial | No | No | Partial | Partial |
| Says whether it is funded | Yes | No | No | No | Partial | Yes |
| Deadline countdown | Yes | No | No | Yes | No | No |
| Worldwide | Yes | Yes | Yes | Yes | Yes | No, US federal only |
| Free, no account needed to browse | Yes | Yes | Yes | Yes | Account needed | Yes |
| Open source | Yes | No | Yes, the data | Yes | No | Government |
| Save and track opportunities | Yes | Partial | No | No | Yes | Yes |
| Weekly email digest | Yes | Yes | No | No | Yes | Yes |
| Anyone can submit a listing | Yes | Yes | Yes, by pull request | Yes, by pull request | No | No |

Based on publicly visible features in August 2026. Several of these are excellent at the one thing they do, and two of them are sources OpportunityBox reads from. The gap being filled is that no single place covers funded workshops, fellowships and calls for papers together, and tells you the funding situation before you click.

## Roadmap

Shipped, planned and explicitly out of scope are all listed in [ROADMAP.md](ROADMAP.md). Released changes are in [CHANGELOG.md](CHANGELOG.md).

## Contributing

New data sources are the most useful contribution, and adding one means writing a single file. See [CONTRIBUTING.md](CONTRIBUTING.md) for the setup, the adapter contract and the checks to run before opening a pull request. Bug reports and corrections to listings are just as welcome.

If the project is useful to you, starring the repository genuinely helps other people find it.

## License and credits

[MIT](LICENSE).

Built by [S M Asif Hossain](https://www.linkedin.com/in/smasifhossain/), a PhD student in Computer Science at Wichita State University, in collaboration with The Maroon Lab.

Data comes from [confs.tech](https://confs.tech), [ccf-deadlines](https://github.com/ccfddl/ccf-deadlines), [ai-deadlines](https://huggingface.co/spaces/huggingface/ai-deadlines) and [Grants.gov](https://www.grants.gov), all of whom publish openly. Always check the official page before applying, because listings can change after they are collected.
