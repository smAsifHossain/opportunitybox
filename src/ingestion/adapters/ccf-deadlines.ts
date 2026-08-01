import { parse } from "yaml";
import type { NormalizedOpportunity, SourceAdapter } from "../types";
import { fetchText, isUpcoming, parseDate } from "../util";

type CcfConf = {
  title: string;
  description?: string;
  sub?: string;
  rank?: { ccf?: string; core?: string };
  confs?: {
    year: number;
    id: string;
    link: string;
    timeline?: { deadline?: string; abstract_deadline?: string; comment?: string }[];
    date?: string;
    place?: string;
  }[];
};

const subFields: Record<string, string> = {
  AI: "Artificial Intelligence",
  CG: "Computer Graphics",
  CT: "Computing Theory",
  DS: "Computer Architecture / Systems",
  DB: "Databases / Data Mining",
  NW: "Networking",
  SC: "Security",
  SE: "Software Engineering",
  HI: "Human-Computer Interaction",
  MX: "Interdisciplinary",
};

/** "TBD" and similar placeholders appear in timeline dates. */
function parseDeadline(value: string | undefined): Date | undefined {
  if (!value || /tbd|tba/i.test(value)) return undefined;
  // Format: "2026-09-08 23:59:59" (timezone given separately; treated as UTC,
  // which is accurate enough for day-level countdowns).
  return parseDate(value.replace(" ", "T") + "Z");
}

function splitPlace(place: string | undefined): { city?: string; country?: string } {
  if (!place || /online|virtual|tbd/i.test(place)) return {};
  const parts = place.split(",").map((p) => p.trim());
  if (parts.length === 1) return { country: parts[0] };
  return { city: parts[0], country: parts[parts.length - 1] };
}

/**
 * CS conference paper deadlines with CCF/CORE ranks, from the ccf-deadlines
 * open dataset (github.com/ccfddl/ccf-deadlines). The site publishes a single
 * aggregated YAML with every tracked conference.
 */
export const ccfDeadlinesAdapter: SourceAdapter = {
  key: "ccf-deadlines",
  name: "CCF Deadlines",
  url: "https://ccfddl.com",

  async fetch(): Promise<NormalizedOpportunity[]> {
    const yml = await fetchText("https://ccfddl.com/conference/allconf.yml");
    const confs = parse(yml) as CcfConf[];

    const out: NormalizedOpportunity[] = [];
    for (const conf of confs) {
      if (!conf.confs?.length) continue;

      // Latest edition with an upcoming submission deadline.
      const editions = [...conf.confs].sort((a, b) => b.year - a.year);
      for (const edition of editions) {
        const deadlines = (edition.timeline ?? [])
          .map((t) => parseDeadline(t.deadline) ?? parseDeadline(t.abstract_deadline))
          .filter((d): d is Date => Boolean(d) && isUpcoming(d))
          .sort((a, b) => a.getTime() - b.getTime());

        if (deadlines.length === 0) continue;

        const { city, country } = splitPlace(edition.place);
        const rank = conf.rank?.ccf ? `CCF-${conf.rank.ccf}` : undefined;
        const core = conf.rank?.core ? `CORE ${conf.rank.core}` : undefined;

        out.push({
          externalId: edition.id,
          title: `${conf.title} ${edition.year}, Call for Papers`,
          description: [
            conf.description ?? conf.title,
            ".",
            rank || core
              ? ` Ranked ${[rank, core].filter(Boolean).join(" / ")}.`
              : "",
            edition.date ? ` The conference takes place ${edition.date}` : "",
            edition.place ? ` in ${edition.place}.` : ".",
            " Deadline data from the open ccf-deadlines project.",
          ].join(""),
          type: "CFP_CONFERENCE",
          homepageUrl: edition.link,
          applyUrl: edition.link,
          deadline: deadlines[0],
          city,
          country,
          online: false,
          funding: "UNKNOWN",
          tags: [
            conf.sub ?? "CS",
            ...(rank ? [rank] : []),
            "paper-submission",
          ],
          field: subFields[conf.sub ?? ""] ?? "Computer Science",
        });
        break; // one (the most recent open) edition per conference
      }
    }
    return out;
  },
};
