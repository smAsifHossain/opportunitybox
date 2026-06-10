/**
 * Runs all ingestion adapters against DATABASE_URL.
 * Locally: npm run ingest
 * In CI: the ingest.yml GitHub Action runs this on a schedule.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { runIngestion } from "../src/ingestion/pipeline";

const db = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  console.log("Starting ingestion…");
  const started = Date.now();
  const { runs, expired } = await runIngestion(db);

  for (const run of runs) {
    const counts = `+${run.added} added, ~${run.updated} updated, =${run.skipped} unchanged, !${run.failed} invalid`;
    if (run.status === "SUCCESS") {
      console.log(`✔ ${run.source}: ${counts}`);
    } else {
      console.error(`✖ ${run.source}: FAILED — ${run.error} (${counts})`);
    }
  }
  console.log(`Expired ${expired} past-deadline records.`);
  console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);

  // Non-zero exit if every source failed (signals a real outage in CI).
  if (runs.length > 0 && runs.every((r) => r.status === "FAILED")) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
