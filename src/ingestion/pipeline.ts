import type { PrismaClient } from "@prisma/client";
import { confsTechAdapter } from "./adapters/confs-tech";
import { ccfDeadlinesAdapter } from "./adapters/ccf-deadlines";
import { aiDeadlinesAdapter } from "./adapters/ai-deadlines";
import { grantsGovAdapter } from "./adapters/grants-gov";
import { normalizedOpportunitySchema, type SourceAdapter } from "./types";
import { contentHash } from "./util";
import { opportunitySlug } from "../lib/slug";

export const adapters: SourceAdapter[] = [
  confsTechAdapter,
  ccfDeadlinesAdapter,
  aiDeadlinesAdapter,
  grantsGovAdapter,
];

export type RunSummary = {
  source: string;
  status: "SUCCESS" | "FAILED";
  added: number;
  updated: number;
  skipped: number;
  failed: number;
  error?: string;
};

async function runAdapter(
  db: PrismaClient,
  adapter: SourceAdapter
): Promise<RunSummary> {
  const source = await db.source.upsert({
    where: { key: adapter.key },
    update: { name: adapter.name, url: adapter.url },
    create: { key: adapter.key, name: adapter.name, url: adapter.url },
  });

  const run = await db.ingestionRun.create({
    data: { sourceId: source.id, status: "RUNNING" },
  });

  const summary: RunSummary = {
    source: adapter.key,
    status: "SUCCESS",
    added: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  };

  try {
    if (!source.enabled) {
      summary.status = "SUCCESS";
      await db.ingestionRun.update({
        where: { id: run.id },
        data: { status: "SUCCESS", finishedAt: new Date(), error: "Source disabled — skipped" },
      });
      return summary;
    }

    const rawRecords = await adapter.fetch();

    for (const raw of rawRecords) {
      const parsed = normalizedOpportunitySchema.safeParse(raw);
      if (!parsed.success) {
        summary.failed++;
        continue;
      }
      const record = parsed.data;
      const hash = contentHash(record);

      const existing = await db.opportunity.findUnique({
        where: {
          sourceId_externalId: { sourceId: source.id, externalId: record.externalId },
        },
        select: { id: true, contentHash: true, status: true },
      });

      if (!existing) {
        await db.opportunity.create({
          data: {
            ...record,
            slug: opportunitySlug(record.title, `${adapter.key}:${record.externalId}`),
            // Records from trusted structured sources go live immediately.
            status: "APPROVED",
            origin: "INGESTED",
            sourceId: source.id,
            contentHash: hash,
          },
        });
        summary.added++;
      } else if (existing.contentHash !== hash) {
        await db.opportunity.update({
          where: { id: existing.id },
          data: {
            ...record,
            contentHash: hash,
            // A previously expired record with a fresh deadline goes live again;
            // admin-rejected records stay rejected.
            status: existing.status === "EXPIRED" ? "APPROVED" : existing.status,
          },
        });
        summary.updated++;
      } else {
        summary.skipped++;
      }
    }

    await db.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        added: summary.added,
        updated: summary.updated,
        skipped: summary.skipped,
        failed: summary.failed,
      },
    });
  } catch (err) {
    summary.status = "FAILED";
    summary.error = err instanceof Error ? err.message : String(err);
    await db.ingestionRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        added: summary.added,
        updated: summary.updated,
        skipped: summary.skipped,
        failed: summary.failed,
        error: summary.error.slice(0, 1000),
      },
    });
  }
  return summary;
}

/** Mark approved opportunities whose deadline passed more than a day ago. */
async function expireStale(db: PrismaClient): Promise<number> {
  const cutoff = new Date(Date.now() - 86_400_000);
  const res = await db.opportunity.updateMany({
    where: { status: "APPROVED", deadline: { lt: cutoff } },
    data: { status: "EXPIRED" },
  });
  return res.count;
}

/**
 * Run every adapter (each isolated — one broken source never blocks the
 * rest), then expire stale records. Returns per-source summaries.
 */
export async function runIngestion(db: PrismaClient): Promise<{
  runs: RunSummary[];
  expired: number;
}> {
  const runs: RunSummary[] = [];
  for (const adapter of adapters) {
    runs.push(await runAdapter(db, adapter));
  }
  const expired = await expireStale(db);
  return { runs, expired };
}
