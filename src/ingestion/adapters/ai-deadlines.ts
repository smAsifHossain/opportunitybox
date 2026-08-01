import { parse } from "yaml";
import type { NormalizedOpportunity, SourceAdapter } from "../types";
import { fetchJson, fetchText, isUpcoming, mapLimit, parseDate } from "../util";

type AiDeadlineEntry = {
  title: string;
  year: number;
  id: string;
  full_name?: string;
  link: string;
  deadlines?: { type: string; label?: string; date?: string }[];
  city?: string;
  country?: string;
  date?: string;
  start?: string;
  end?: string;
  tags?: string[];
};

function parseDeadline(value: string | undefined): Date | undefined {
  if (!value || /tbd|tba/i.test(value)) return undefined;
  return parseDate(value.replace(" ", "T") + "Z");
}

/**
 * AI/ML conference deadlines from huggingface/ai-deadlines (the maintained
 * successor of paperswithcode/ai-deadlines). Data lives as one YAML file per
 * conference in the Hugging Face Space repo.
 */
export const aiDeadlinesAdapter: SourceAdapter = {
  key: "ai-deadlines",
  name: "AI Deadlines",
  url: "https://huggingface.co/spaces/huggingface/ai-deadlines",

  async fetch(): Promise<NormalizedOpportunity[]> {
    const tree = await fetchJson<{ path: string }[]>(
      "https://huggingface.co/api/spaces/huggingface/ai-deadlines/tree/main/src/data/conferences"
    );
    const files = tree
      .map((f) => f.path)
      .filter((p) => p.endsWith(".yml") || p.endsWith(".yaml"));

    const results = await mapLimit(files, 8, async (path) => {
      const yml = await fetchText(
        `https://huggingface.co/spaces/huggingface/ai-deadlines/raw/main/${path}`
      );
      return parse(yml) as AiDeadlineEntry[];
    });

    const out: NormalizedOpportunity[] = [];
    for (const result of results) {
      if (result.status !== "fulfilled" || !Array.isArray(result.value)) continue;

      // Each file holds all editions of one conference; keep upcoming ones.
      for (const entry of result.value) {
        const paperDeadline =
          entry.deadlines?.find((d) => d.type === "paper") ??
          entry.deadlines?.find((d) => d.type === "abstract");
        const deadline = parseDeadline(paperDeadline?.date);
        if (!deadline || !isUpcoming(deadline)) continue;
        if (!entry.link || !entry.title) continue;

        const name = entry.full_name ?? entry.title;
        out.push({
          externalId: entry.id,
          title: `${entry.title} ${entry.year}, Call for Papers`,
          description: [
            `${name} (${entry.title} ${entry.year}) is accepting paper submissions.`,
            entry.date ? ` The conference runs ${entry.date}` : "",
            entry.city && entry.country
              ? ` in ${entry.city}, ${entry.country}.`
              : ".",
            " Deadline data from the open ai-deadlines project.",
          ].join(""),
          type: "CFP_CONFERENCE",
          homepageUrl: entry.link,
          applyUrl: entry.link,
          deadline,
          startDate: parseDate(entry.start),
          endDate: parseDate(entry.end),
          city: entry.city || undefined,
          country: entry.country || undefined,
          online: false,
          funding: "UNKNOWN",
          tags: [...(entry.tags ?? []).slice(0, 6), "paper-submission", "AI"],
          field: "Artificial Intelligence",
        });
      }
    }
    return out;
  },
};
