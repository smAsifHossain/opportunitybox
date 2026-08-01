import { createHash } from "node:crypto";
import type { NormalizedOpportunity } from "./types";

/** Stable hash of the normalized payload, used to skip no-op updates. */
export function contentHash(record: NormalizedOpportunity): string {
  const canonical = JSON.stringify(record, Object.keys(record).sort(), 0);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

/**
 * Normalize a URL for duplicate detection across sources: lowercase host,
 * strip tracking params, trailing slashes and fragments.
 */
export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|ref$|source$|fbclid|gclid)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    let s = url.toString();
    if (s.endsWith("/")) s = s.slice(0, -1);
    return s;
  } catch {
    return raw;
  }
}

/** Parse a date-ish string, returning undefined instead of Invalid Date. */
export function parseDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** True when the date is in the future (with a small grace window). */
export function isUpcoming(date: Date | undefined, graceDays = 0): boolean {
  if (!date) return false;
  return date.getTime() >= Date.now() - graceDays * 86_400_000;
}

/** Fetch JSON with a descriptive error. */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": "opportunitybox-ingest", ...init?.headers },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "opportunitybox-ingest" } });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

/** Run async tasks with a small concurrency limit. */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = { status: "fulfilled", value: await fn(items[idx]) };
      } catch (reason) {
        results[idx] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
