/**
 * One-off data janitor: re-apply country normalization to existing rows.
 * Safe to re-run; the ingestion pipeline normalizes new data automatically.
 *
 * Usage: npx tsx scripts/normalize-countries.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeCountry } from "../src/lib/countries";

const db = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

async function main() {
  const rows = await db.opportunity.findMany({
    where: { country: { not: null } },
    select: { id: true, country: true },
  });

  let changed = 0;
  for (const row of rows) {
    const normalized = normalizeCountry(row.country) ?? null;
    if (normalized !== row.country) {
      await db.opportunity.update({
        where: { id: row.id },
        data: { country: normalized },
      });
      changed++;
    }
  }
  console.log(`Checked ${rows.length} rows, normalized ${changed}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
