# Data sources

Every listing in OpportunityBox comes from one of the adapters below. All of them run every six hours through the [ingest workflow](../.github/workflows/ingest.yml), and each run is recorded in the `IngestionRun` table and shown on the admin dashboard, so a source that quietly stops returning data is visible instead of silent.

## Live adapters

| Key | Source | Covers | Access | Notes |
|:-|:-|:-|:-|:-|
| `confs-tech` | [confs.tech conference data](https://github.com/tech-conferences/conference-data) | Tech conferences worldwide, including CFP deadlines | Raw JSON on GitHub, no key | One file per topic per year. The adapter merges the same conference across topic files, keyed on URL and start date |
| `ccf-deadlines` | [ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines) | Computer science submission deadlines with CCF ranks | YAML on GitHub, no key | Takes the next upcoming deadline for each conference edition |
| `ai-deadlines` | [huggingface/ai-deadlines](https://huggingface.co/spaces/huggingface/ai-deadlines) | AI and machine learning conference deadlines | YAML from the Hugging Face space, no key | Maintained upstream through automated pull requests |
| `grants-gov` | [Grants.gov search API](https://www.grants.gov/api/api-guide) | United States federal grants, fellowships and training programs | `POST https://api.grants.gov/v1/api/search2`, no key required | Requests posted opportunities in education and science categories, and skips forecasted ones |
| `curated` | [data/curated.json](../data/curated.json) | Anything with no feed at all, such as NAIRR program calls and one off university workshops | Edited by pull request | Entries drop out on their own once their deadline passes |

## About the curated file

Plenty of worthwhile opportunities live on a single university or program page with no API, no RSS and no dataset behind them. The AI Unlocked workshop that prompted this project was one of them.

Writing a scraper for each of those pages sounds appealing and works badly. Layouts change, pages move, and a broken scraper fails quietly, which is worse than no scraper at all. So sources like that go into `data/curated.json` instead. Adding one is a small pull request, the entry ships with the next ingestion run, and it disappears automatically once its deadline has passed. The submission form on the site covers the same gap for people who would rather not open a pull request.

## Candidates worth adding

Roughly in order of value against effort.

- **EU Funding and Tenders portal.** European grants, and it has a public search API, which makes it the best next target.
- **WikiCFP.** Broad academic call for papers coverage. RSS and HTML only, so it needs care.
- **Devpost and MLH.** Hackathons. JSON endpoints exist but are unofficial and may change without notice.
- **Journal special issues** from Springer, Elsevier and IEEE. High value for the journal CFP type, but each publisher needs its own parser.
- **Idealist and VolunteerMatch.** Volunteer roles, which are thin at the moment. Both need partner API access.
- **Fellowship aggregators** such as ProFellow. Check their terms of use before touching anything.

## Adding an adapter

Write one file in `src/ingestion/adapters/`, register it in `src/ingestion/pipeline.ts`, and add a row to the table above. The contract and the checks to run are in [CONTRIBUTING.md](../CONTRIBUTING.md).

Two rules matter more than the rest. Give every record a stable `externalId`, because the pipeline upserts on it and a changing id creates duplicates on every run. And filter out anything already past its deadline inside the adapter, using the helpers in `src/ingestion/util.ts`.
