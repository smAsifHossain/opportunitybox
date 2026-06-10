import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runIngestion } from "@/ingestion/pipeline";

export const maxDuration = 300;

/**
 * Cron-triggered ingestion endpoint. Protected by CRON_SECRET — use either
 * `Authorization: Bearer <secret>` (Vercel Cron convention) or `?secret=`.
 * The GitHub Action runs `npm run ingest` directly instead; this endpoint is
 * a fallback for platforms with built-in cron.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runIngestion(db);
  return NextResponse.json(result);
}
