# Roadmap

Where the project is and where it is going. Items are grouped by release rather than by date, because releases here are driven by what is finished rather than by a calendar.

## 0.1, shipped

**Directory**

- [x] Search across titles, descriptions, fields and countries
- [x] Filters for type, funding level, online or in person, and country
- [x] Sort by nearest deadline or newest first, with filter state kept in the URL
- [x] Live deadline countdowns, color coded by urgency
- [x] Past deadline listings hidden from the directory and archived
- [x] Detail pages with funding notes, apply links, source attribution and similar listings
- [x] Country name normalization, so USA, U.S. and United States stop appearing as three countries

**Data**

- [x] Adapter contract and ingestion pipeline with schema validation
- [x] Content hashing, so unchanged records are skipped instead of rewritten
- [x] Per source isolation, so one broken source cannot stop a run
- [x] Adapters for confs.tech, ccf-deadlines, ai-deadlines and Grants.gov
- [x] Curated file for sources that publish no feed at all
- [x] Ingestion every six hours through GitHub Actions
- [x] Run logging per source, surfaced on the admin dashboard

**Accounts and moderation**

- [x] Registration with email verification
- [x] Password reset by email
- [x] Optional Google sign in
- [x] Profile editing: name, affiliation, contact number, password
- [x] Saving opportunities and a personal dashboard
- [x] Community submissions with a moderation queue and rejection reasons
- [x] Duplicate detection by homepage URL
- [x] Weekly digest with tokenized unsubscribe

**Project**

- [x] CI running lint, typecheck, tests and build against a real PostgreSQL
- [x] Unit tests for hashing, URL normalization, slugs and schema validation
- [x] Contributor documentation, issue templates and a code of conduct

## 0.2, next

Ordered roughly by how much difference each one makes.

- [x] Deploy publicly, live at opportunitybox.vercel.app
- [ ] Capture a screenshot of the live site for the README
- [ ] Move the weekly digest out of the serverless function, since Vercel's free plan cuts requests off at ten seconds and a long subscriber list will hit that ceiling
- [ ] Make the ingestion workflow exit cleanly when no database secret is configured, instead of failing on schedule
- [ ] Deadline reminder emails, so saving an opportunity actually warns you before it closes
- [ ] Let people filter by field of study, which is stored already but not exposed as a filter
- [ ] More sources, starting with EU Funding and Tenders, WikiCFP and hackathon listings

## 0.3, later

- [ ] Public read only API for the listings, so other projects can build on the data
- [ ] Saved searches, with an alert when something new matches
- [ ] Region and discipline pages that search engines can index individually
- [ ] Bulk import for admins, for conference series published as a spreadsheet
- [ ] Weekly digest tailored to the topics each subscriber picked, rather than one digest for everyone

## Under consideration

Things worth doing, but not obviously worth doing next.

- [ ] Translations, starting with the interface rather than the listings
- [ ] An assistant that answers questions about listings, which needs a paid model key and would break the free hosting promise unless it is optional
- [ ] Institution pages, showing everything on offer from one university
- [ ] iCal export, so deadlines land in a calendar

## Not planned

- Job boards and internships. Plenty of sites already do this well, and the focus here is on opportunities that are funded, academic or community driven.
- Scraping sites that forbid it. Sources need an API, an open dataset, or a listing added by hand.
- Paid tiers or advertising. The point is that nobody needs an account or a budget to find these.

## Known limitations

Worth being honest about.

- Coverage leans towards computer science and United States federal funding, because those are the sources with open data. Other fields and regions depend on contributions.
- Funding status is only as good as the source. Where a source does not say, the listing shows funding as unknown rather than guessing.
- A listing is a snapshot from the last ingestion run. Deadlines move, and the official page is always the authority.
- Sources with no feed rely on people adding entries by hand, so that coverage grows only as fast as contributions do.
