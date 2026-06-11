import { describe, expect, it } from "vitest";
import { contentHash, isUpcoming, mapLimit, normalizeUrl, parseDate } from "./util";
import { normalizedOpportunitySchema, type NormalizedOpportunity } from "./types";

const baseRecord: NormalizedOpportunity = {
  externalId: "ex-1",
  title: "Test Conference 2026",
  description: "A conference for testing things thoroughly.",
  type: "CONFERENCE",
  homepageUrl: "https://example.org/conf",
  online: false,
  funding: "UNKNOWN",
  tags: ["testing"],
};

describe("contentHash", () => {
  it("is stable for identical content regardless of key order", () => {
    const a = { ...baseRecord };
    const b = JSON.parse(JSON.stringify(baseRecord));
    expect(contentHash(a)).toBe(contentHash(b));
  });

  it("changes when a field changes", () => {
    expect(contentHash(baseRecord)).not.toBe(
      contentHash({ ...baseRecord, title: "Renamed Conference" })
    );
  });
});

describe("normalizeUrl", () => {
  it("strips tracking params, fragments, www, and trailing slash", () => {
    expect(
      normalizeUrl("https://WWW.Example.org/path/?utm_source=x&fbclid=123&id=7#frag")
    ).toBe("https://example.org/path/?id=7");
    expect(normalizeUrl("https://example.org/")).toBe("https://example.org");
  });

  it("returns invalid URLs unchanged", () => {
    expect(normalizeUrl("not a url")).toBe("not a url");
  });
});

describe("parseDate / isUpcoming", () => {
  it("parses valid dates and rejects garbage", () => {
    expect(parseDate("2026-08-15")?.getUTCFullYear()).toBe(2026);
    expect(parseDate("definitely not a date")).toBeUndefined();
    expect(parseDate(undefined)).toBeUndefined();
  });

  it("classifies upcoming vs past with grace window", () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    const tomorrow = new Date(Date.now() + 86_400_000);
    expect(isUpcoming(tomorrow)).toBe(true);
    expect(isUpcoming(yesterday)).toBe(false);
    expect(isUpcoming(yesterday, 2)).toBe(true);
    expect(isUpcoming(undefined)).toBe(false);
  });
});

describe("normalizedOpportunitySchema", () => {
  it("accepts a valid record and applies defaults", () => {
    const parsed = normalizedOpportunitySchema.parse({
      externalId: "x",
      title: "Some Workshop",
      description: "Long enough description here.",
      type: "WORKSHOP",
      homepageUrl: "https://example.org",
    });
    expect(parsed.funding).toBe("UNKNOWN");
    expect(parsed.online).toBe(false);
    expect(parsed.tags).toEqual([]);
  });

  it("rejects records with bad urls or missing fields", () => {
    expect(
      normalizedOpportunitySchema.safeParse({
        externalId: "x",
        title: "T",
        description: "short",
        type: "WORKSHOP",
        homepageUrl: "nope",
      }).success
    ).toBe(false);
  });
});

describe("mapLimit", () => {
  it("preserves order and isolates failures", async () => {
    const results = await mapLimit([1, 2, 3, 4], 2, async (n) => {
      if (n === 3) throw new Error("boom");
      return n * 10;
    });
    expect(results.map((r) => r.status)).toEqual([
      "fulfilled",
      "fulfilled",
      "rejected",
      "fulfilled",
    ]);
    expect(results[3]).toMatchObject({ value: 40 });
  });
});
