?/**
 * Runs a local PostgreSQL without Docker (binaries are downloaded by the
 * embedded-postgres package). Data persists in .local/pgdata.
 *
 * Usage: npm run db:start  — keep the terminal open while developing.
 * Matches the default DATABASE_URL in .env.example.
 */
import EmbeddedPostgres from "embedded-postgres";

const DB_NAME = "opportunitybox";

async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: ".local/pgdata",
    user: "postgres",
    password: "postgres",
    port: 5432,
    persistent: true,
    // UTF8 regardless of OS locale — source data contains non-Latin text.
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
  });

  const fs = await import("node:fs");
  if (!fs.existsSync(".local/pgdata/PG_VERSION")) {
    console.log("Initialising new PostgreSQL data directory...");
    await pg.initialise();
  }

  await pg.start();

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}".`);
  } catch (err) {
    if (!String(err).includes("already exists")) throw err;
  }

  console.log(
    `PostgreSQL running at postgresql://postgres:postgres@localhost:5432/${DB_NAME}`
  );
  console.log("Press Ctrl+C to stop.");

  const stop = async () => {
    console.log("Stopping PostgreSQL...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  // Keep the process alive while postgres runs.
  await new Promise(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
