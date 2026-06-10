import type { NormalizedOpportunity, SourceAdapter } from "../types";
import { fetchJson, isUpcoming, mapLimit, parseDate } from "../util";

type ConfsTechRecord = {
  name: string;
  url: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country?: string;
  online?: boolean;
  cfpUrl?: string;
  cfpEndDate?: string;
};

const topicFields: Record<string, string> = {
  ai: "Artificial Intelligence",
  data: "Data Science",
  security: "Security",
  ux: "Design / UX",
  devops: "DevOps",
  python: "Software Engineering",
  javascript: "Software Engineering",
  rust: "Software Engineering",
  golang: "Software Engineering",
  java: "Software Engineering",
  dotnet: "Software Engineering",
  php: "Software Engineering",
  ruby: "Software Engineering",
  css: "Web Development",
  accessibility: "Accessibility",
  iot: "Internet of Things",
  mobile: "Mobile Development",
  android: "Mobile Development",
  ios: "Mobile Development",
};

/**
 * Tech conferences from the confs.tech open dataset
 * (github.com/tech-conferences/conference-data). One JSON file per topic per
 * year; the GitHub contents API lists topics, raw.githubusercontent serves
 * the data (raw fetches don't count against the API rate limit).
 */
export const confsTechAdapter: SourceAdapter = {
  key: "confs-tech",
  name: "confs.tech",
  url: "https://confs.tech",

  async fetch(): Promise<NormalizedOpportunity[]> {
    const thisYear = new Date().getFullYear();
    const years = [thisYear, thisYear + 1];

    const files: { year: number; topic: string }[] = [];
    for (const year of years) {
      try {
        const listing = await fetchJson<{ name: string }[]>(
          `https://api.github.com/repos/tech-conferences/conference-data/contents/conferences/${year}`
        );
        for (const f of listing) {
          if (f.name.endsWith(".json")) {
            files.push({ year, topic: f.name.replace(/\.json$/, "") });
          }
        }
      } catch {
        // Next year's directory may not exist yet — that's fine.
      }
    }

    const results = await mapLimit(files, 8, async ({ year, topic }) => {
      const records = await fetchJson<ConfsTechRecord[]>(
        `https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences/${year}/${topic}.json`
      );
      return { topic, records };
    });

    // The same conference often appears in several topic files; merge those
    // by externalId (keeping a stable, sorted tag union) so repeated runs
    // produce identical records.
    const byId = new Map<string, NormalizedOpportunity>();
    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const { topic, records } = result.value;

      for (const rec of records) {
        const startDate = parseDate(rec.startDate);
        const endDate = parseDate(rec.endDate);
        const cfpEnd = parseDate(rec.cfpEndDate);

        // Only keep conferences that haven't happened yet.
        if (!isUpcoming(endDate ?? startDate, 1)) continue;
        if (!rec.url || !rec.name) continue;

        const openCfp = isUpcoming(cfpEnd);
        const externalId = `${rec.url}::${rec.startDate ?? "tba"}`;

        const existing = byId.get(externalId);
        if (existing) {
          existing.tags = [...new Set([...existing.tags, topic])].sort();
          continue;
        }

        byId.set(externalId, {
          externalId,
          title: rec.name,
          description: [
            `${rec.name} is a ${topic} conference`,
            rec.city && rec.country
              ? ` taking place in ${rec.city}, ${rec.country}`
              : rec.online
                ? " taking place online"
                : "",
            ".",
            openCfp
              ? ` The call for proposals is open until ${cfpEnd!.toDateString()} — speakers are welcome to submit.`
              : "",
            " Listed via the community-maintained confs.tech dataset.",
          ].join(""),
          type: "CONFERENCE",
          homepageUrl: rec.url,
          applyUrl: openCfp ? (rec.cfpUrl ?? rec.url) : undefined,
          deadline: openCfp ? cfpEnd : undefined,
          startDate,
          endDate: endDate ?? startDate,
          city: rec.city || undefined,
          country: rec.country || undefined,
          online: rec.online ?? false,
          funding: "UNKNOWN",
          tags: [topic, "tech-conference"].sort(),
          field: topicFields[topic] ?? "Technology",
        });
      }
    }
    return [...byId.values()];
  },
};
