import type { NormalizedOpportunity, SourceAdapter } from "../types";
import { isUpcoming } from "../util";

type GrantsHit = {
  id: string;
  number: string;
  title: string;
  agency?: string;
  agencyCode?: string;
  openDate?: string;
  closeDate?: string;
  oppStatus?: string;
};

type GrantsResponse = {
  errorcode: number;
  data?: { hitCount: number; oppHits: GrantsHit[] };
};

/** Grants.gov dates are MM/DD/YYYY. */
function parseUsDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return undefined;
  const d = new Date(Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]), 23, 59));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const searches: { keyword: string; type: NormalizedOpportunity["type"] }[] = [
  { keyword: "fellowship", type: "FELLOWSHIP" },
  { keyword: "training program", type: "TRAINING" },
  { keyword: "research workshop", type: "WORKSHOP" },
  { keyword: "student", type: "GRANT" },
];

/**
 * US federal funding opportunities from the official Grants.gov Search2 API
 * (no API key required). Includes NSF, DOE, NIH and other agencies.
 */
export const grantsGovAdapter: SourceAdapter = {
  key: "grants-gov",
  name: "Grants.gov",
  url: "https://www.grants.gov",

  async fetch(): Promise<NormalizedOpportunity[]> {
    const seen = new Set<string>();
    const out: NormalizedOpportunity[] = [];

    for (const search of searches) {
      const res = await fetch("https://api.grants.gov/v1/api/search2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: 75,
          keyword: search.keyword,
          oppStatuses: "posted",
        }),
      });
      if (!res.ok) throw new Error(`grants.gov search2 -> ${res.status}`);
      const json = (await res.json()) as GrantsResponse;
      if (json.errorcode !== 0 || !json.data) {
        throw new Error(`grants.gov errorcode ${json.errorcode}`);
      }

      for (const hit of json.data.oppHits) {
        if (seen.has(hit.id)) continue;
        seen.add(hit.id);

        const deadline = parseUsDate(hit.closeDate);
        // Skip grants without a close date or closing more than two years
        // out (evergreen programs would crowd out timely opportunities).
        if (!deadline || !isUpcoming(deadline)) continue;
        if (deadline.getTime() > Date.now() + 2 * 365 * 86_400_000) continue;

        const title = hit.title.replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
        out.push({
          externalId: hit.id,
          title,
          description: [
            `${title}, a US federal funding opportunity`,
            hit.agency ? ` from ${hit.agency}` : "",
            ` (opportunity number ${hit.number}).`,
            " See the official Grants.gov listing for eligibility, award amounts, and application instructions.",
          ].join(""),
          type: search.type,
          homepageUrl: `https://www.grants.gov/search-results-detail/${hit.id}`,
          applyUrl: `https://www.grants.gov/search-results-detail/${hit.id}`,
          deadline,
          country: "United States",
          online: false,
          funding: "FULLY_FUNDED",
          fundingNotes: hit.agency
            ? `Federal funding provided by ${hit.agency}.`
            : "Federal grant funding.",
          tags: ["grants-gov", search.keyword.replace(" ", "-"), "federal-funding"],
          field: "All Fields",
        });
      }
    }
    return out;
  },
};
