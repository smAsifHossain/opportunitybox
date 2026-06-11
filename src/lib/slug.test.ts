import { describe, expect, it } from "vitest";
import { opportunitySlug, shortHash, slugify } from "./slug";

describe("slugify", () => {
  it("lowercases, strips accents and punctuation", () => {
    expect(slugify("NeurIPS 2026 — Call for Papers!")).toBe(
      "neurips-2026-call-for-papers"
    );
    expect(slugify("Café & Résumé")).toBe("cafe-resume");
  });

  it("caps length at 80 characters", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe("opportunitySlug", () => {
  it("is stable for the same inputs and distinct for different sources", () => {
    const a = opportunitySlug("AI Workshop", "source-a:1");
    expect(opportunitySlug("AI Workshop", "source-a:1")).toBe(a);
    expect(opportunitySlug("AI Workshop", "source-b:1")).not.toBe(a);
  });
});

describe("shortHash", () => {
  it("is deterministic and base36", () => {
    expect(shortHash("hello")).toBe(shortHash("hello"));
    expect(shortHash("hello")).toMatch(/^[a-z0-9]+$/);
  });
});
