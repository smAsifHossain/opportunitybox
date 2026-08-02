# Changelog

Notable changes to this project. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet. Planned work is in [ROADMAP.md](ROADMAP.md).

## [0.1.0] 2026-08-01

First working version: the directory, automatic ingestion, accounts and moderation.

### Added

- Opportunity directory with full text search, filters for type, funding level, format and country, and sorting by nearest deadline. Filter state is held in the URL so any view can be shared
- Live deadline countdowns, color coded at 30 and 7 days
- Detail pages carrying funding notes, apply and homepage links, tags, source attribution and similar listings
- Ingestion pipeline with a single adapter contract, schema validation, content hashing to skip unchanged records, and per source isolation so one failure cannot stop a run
- Adapters for confs.tech, ccf-deadlines, ai-deadlines and Grants.gov, plus `data/curated.json` for sources that publish no feed
- Scheduled ingestion every six hours and a weekly digest, both through GitHub Actions
- Accounts with email verification, password reset, optional Google sign in, and an editable profile covering name, affiliation and contact number
- Saved opportunities and a dashboard listing them by nearest deadline, alongside your own submissions and their moderation status
- Community submissions through a two step form, held in a moderation queue until approved
- Admin dashboard with the moderation queue, rejection reasons, duplicate detection by homepage URL, per source health and a manual ingestion trigger
- Weekly email digest of new and closing soon opportunities, with tokenized unsubscribe. Runs with no email provider configured, writing messages to the console instead
- Continuous integration running lint, typecheck, tests and build against a real PostgreSQL, plus unit tests for hashing, URL normalization, slugs and validation
- Contributor documentation, issue templates and a code of conduct

### Changed

- Country names are normalized on the way in, so USA, U.S. and United States collapse into one filter entry
- Listings past their deadline are hidden from the directory and from home page counts, and are archived rather than deleted

### Fixed

- Multi step submission form lost every field when moving between steps, because the panels were being remounted
- Select menus displayed raw enum values instead of readable labels
- Duplicate React keys in the opportunity list
- Browser extensions that alter the page could trigger a hydration warning on first load

[Unreleased]: https://github.com/smAsifHossain/opportunitybox/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/smAsifHossain/opportunitybox/releases/tag/v0.1.0
