import type { FundingLevel, OpportunityType } from "@prisma/client";
import type { NormalizedOpportunity, SourceAdapter } from "../types";
import { parseDate } from "../util";
import curated from "../../../data/curated.json";

type CuratedRecord = {
  id: string;
  title: string;
  type: string;
  description: string;
  homepageUrl: string;
  applyUrl?: string;
  deadline?: string;
  startDate?: string;
  endDate?: string;
  city?: string;
  country?: string;
  online?: boolean;
  funding?: string;
  fundingNotes?: string;
  tags?: string[];
  field?: string;
};

/**
 * Community-curated opportunities maintained in data/curated.json, the
 * channel for sources that have no API or feed (e.g. nairrpilot.org program
 * calls, university workshop pages). Add an entry via pull request; it ships
 * with the next ingestion run. Records whose deadline has passed are dropped
 * automatically, so stale entries age out without manual cleanup.
 */
export const curatedAdapter: SourceAdapter = {
  key: "curated",
  name: "Curated by contributors",
  url: "https://github.com/smAsifHossain/opportunitybox/blob/main/data/curated.json",

  async fetch(): Promise<NormalizedOpportunity[]> {
    return (curated as CuratedRecord[])
      .map((rec) => ({
        externalId: rec.id,
        title: rec.title,
        description: rec.description,
        type: rec.type as OpportunityType,
        homepageUrl: rec.homepageUrl,
        applyUrl: rec.applyUrl,
        deadline: parseDate(rec.deadline),
        startDate: parseDate(rec.startDate),
        endDate: parseDate(rec.endDate),
        city: rec.city,
        country: rec.country,
        online: rec.online ?? false,
        funding: (rec.funding ?? "UNKNOWN") as FundingLevel,
        fundingNotes: rec.fundingNotes,
        tags: rec.tags ?? [],
        field: rec.field,
      }))
      .filter((rec) => !rec.deadline || rec.deadline.getTime() > Date.now());
  },
};
