# Data sources

## Live (v1 adapters)

| Adapter key | Source | Coverage | Access | Notes |
|---|---|---|---|---|
| `confs-tech` | [confs.tech conference-data](https://github.com/tech-conferences/conference-data) | Tech conferences worldwide incl. CFP deadlines | Raw JSON from GitHub, no auth | One file per topic/year; adapter merges topic duplicates by URL+date |
| `ccf-deadlines` | [ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines) | CS conference submission deadlines + CCF ranks | YAML from GitHub, no auth | Picks the next upcoming deadline per conference edition |
| `ai-deadlines` | [huggingface/ai-deadlines](https://huggingface.co/spaces/huggingface/ai-deadlines) | AI/ML conference deadlines (NeurIPS, ICLR, …) | YAML from the HF space repo, no auth | Kept by AI agents opening PRs upstream |
| `grants-gov` | [Grants.gov search2 API](https://www.grants.gov/api/api-guide) | US federal grants, fellowships, training programs | `POST https://api.grants.gov/v1/api/search2`, **no API key** | Queries posted, forecasted excluded; education/science categories |

All four are polled every 6 hours by the [ingest workflow](../.github/workflows/ingest.yml). Each run is recorded in the `IngestionRun` table and shown on `/admin`.

## Candidates for future adapters

- **WikiCFP** — broad academic CFPs; RSS/HTML only, fragile to scrape.
- **EU Funding & Tenders portal** — European grants; has a public search API.
- **Devpost / MLH** — hackathons; JSON endpoints exist but are unofficial.
- **Idealist / VolunteerMatch** — volunteer roles; partner API access required.
- **Journal special issues** (Springer/Elsevier/IEEE pages) — high value for the CFP_JOURNAL type, but HTML scraping per publisher.
- **ProFellow / fellowship aggregators** — check terms of use before scraping.

To add one, see [CONTRIBUTING.md](../CONTRIBUTING.md#adding-a-data-source-the-most-valuable-contribution).
