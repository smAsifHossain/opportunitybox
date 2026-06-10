import { z } from "zod";
import { FundingLevel, OpportunityType } from "@prisma/client";

/**
 * The shape every adapter must normalize its records into before they enter
 * the pipeline. Validation failures are logged and skipped, never fatal.
 */
export const normalizedOpportunitySchema = z.object({
  /** Stable identifier within the source (used for idempotent upserts). */
  externalId: z.string().min(1),
  title: z.string().min(3).max(300),
  description: z.string().min(10).max(5000),
  type: z.enum(OpportunityType),
  homepageUrl: z.url(),
  applyUrl: z.url().optional(),
  deadline: z.date().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  online: z.boolean().default(false),
  funding: z.enum(FundingLevel).default("UNKNOWN"),
  fundingNotes: z.string().max(500).optional(),
  tags: z.array(z.string().max(60)).max(12).default([]),
  field: z.string().max(120).optional(),
});

export type NormalizedOpportunity = z.infer<typeof normalizedOpportunitySchema>;

export interface SourceAdapter {
  /** Unique key, also stored on the Source row (e.g. "confs-tech"). */
  key: string;
  name: string;
  url: string;
  /** Fetch and normalize all current records from the source. */
  fetch(): Promise<NormalizedOpportunity[]>;
}
