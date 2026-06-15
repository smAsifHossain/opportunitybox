import { OpportunityType, FundingLevel, Prisma } from "@prisma/client";

export const PAGE_SIZE = 12;

export type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export type ParsedFilters = {
  q?: string;
  type?: OpportunityType;
  funding?: FundingLevel;
  location?: "online" | "inperson";
  country?: string;
  sort: "deadline" | "newest";
  page: number;
};

export function parseFilters(sp: SearchParams): ParsedFilters {
  const type = first(sp.type);
  const funding = first(sp.funding);
  const location = first(sp.location);
  const sort = first(sp.sort);
  const page = Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1);

  return {
    q: first(sp.q)?.trim() || undefined,
    type:
      type && type in OpportunityType ? (type as OpportunityType) : undefined,
    funding:
      funding && funding in FundingLevel ? (funding as FundingLevel) : undefined,
    location:
      location === "online" || location === "inperson" ? location : undefined,
    country: first(sp.country) || undefined,
    sort: sort === "newest" ? "newest" : "deadline",
    page,
  };
}

/**
 * Filter that hides opportunities whose deadline has already passed, while
 * keeping rolling/open ones (no deadline). The cutoff is the start of today,
 * so something due later today still counts as open.
 */
export function activeDeadlineFilter(): Prisma.OpportunityWhereInput {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  return { OR: [{ deadline: null }, { deadline: { gte: cutoff } }] };
}

export function buildWhere(f: ParsedFilters): Prisma.OpportunityWhereInput {
  // The deadline filter and the optional search both need their own OR, so
  // they're combined under AND to avoid clobbering each other.
  const and: Prisma.OpportunityWhereInput[] = [activeDeadlineFilter()];

  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
        { field: { contains: f.q, mode: "insensitive" } },
        { country: { contains: f.q, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.OpportunityWhereInput = { status: "APPROVED", AND: and };

  if (f.type) where.type = f.type;
  if (f.funding) where.funding = f.funding;
  if (f.location === "online") where.online = true;
  if (f.location === "inperson") where.online = false;
  if (f.country) where.country = f.country;

  return where;
}

export function buildOrderBy(
  f: ParsedFilters
): Prisma.OpportunityOrderByWithRelationInput[] {
  if (f.sort === "newest") return [{ createdAt: "desc" }];
  // Deadline soonest first; opportunities without a deadline sort last.
  return [{ deadline: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }];
}
