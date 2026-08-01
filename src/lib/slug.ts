/** Convert an arbitrary title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Slug for an opportunity: title plus a short stable suffix so different
 * editions/sources of the same name never collide.
 */
export function opportunitySlug(title: string, discriminator: string): string {
  const base = slugify(title);
  const suffix = shortHash(discriminator);
  return `${base}-${suffix}`;
}

/** Tiny stable hash (djb2) rendered as base36, not cryptographic. */
export function shortHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}
