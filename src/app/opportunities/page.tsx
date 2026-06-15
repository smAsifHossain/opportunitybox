import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { FilterBar } from "@/components/filter-bar";
import { OpportunityCard } from "@/components/opportunity-card";
import { SaveButton } from "@/components/save-button";
import { Button } from "@/components/ui/button";
import {
  PAGE_SIZE,
  activeDeadlineFilter,
  buildOrderBy,
  buildWhere,
  parseFilters,
  type SearchParams,
} from "@/lib/opportunity-query";

export const metadata: Metadata = {
  title: "Explore opportunities",
  description:
    "Search and filter conferences, workshops, fellowships, grants, volunteer roles, and calls for papers from around the world.",
};

export default async function OpportunitiesPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await props.searchParams;
  const filters = parseFilters(sp);
  const where = buildWhere(filters);
  const session = await auth();

  const [items, totalCount, countryGroups] = await Promise.all([
    db.opportunity.findMany({
      where,
      orderBy: buildOrderBy(filters),
      skip: (filters.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.opportunity.count({ where }),
    db.opportunity.groupBy({
      by: ["country"],
      where: {
        status: "APPROVED",
        country: { not: null },
        AND: [activeDeadlineFilter()],
      },
      orderBy: { country: "asc" },
    }),
  ]);

  const countries = countryGroups
    .map((g) => g.country)
    .filter((c): c is string => Boolean(c));
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const savedIds = new Set(
    session?.user
      ? (
          await db.savedOpportunity.findMany({
            where: { userId: session.user.id },
            select: { opportunityId: true },
          })
        ).map((s) => s.opportunityId)
      : []
  );

  function pageLink(page: number) {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val) next.set(k, val);
    }
    next.set("page", String(page));
    return `/opportunities?${next.toString()}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Explore <span className="text-gradient">opportunities</span>
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          {totalCount} open {totalCount === 1 ? "opportunity" : "opportunities"}{" "}
          worldwide, updated continuously.
        </p>
      </header>

      <Suspense>
        <FilterBar countries={countries} />
      </Suspense>

      {items.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <SearchX className="size-10 text-muted-foreground/60" />
          <p className="font-medium">No opportunities match those filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try removing a filter or broadening your search — or be the first to{" "}
            <Link href="/submit" className="underline underline-offset-4">
              submit one
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              index={i}
              opp={{
                slug: opp.slug,
                title: opp.title,
                description: opp.description,
                type: opp.type,
                deadline: opp.deadline?.toISOString() ?? null,
                city: opp.city,
                country: opp.country,
                online: opp.online,
                funding: opp.funding,
                field: opp.field,
              }}
              saveSlot={
                <SaveButton
                  key={opp.id}
                  opportunityId={opp.id}
                  initialSaved={savedIds.has(opp.id)}
                  loggedIn={Boolean(session?.user)}
                />
              }
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {filters.page > 1 ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={pageLink(filters.page - 1)} />}
            >
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="px-3 text-sm tabular-nums text-muted-foreground">
            Page {filters.page} of {totalPages}
          </span>
          {filters.page < totalPages ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={pageLink(filters.page + 1)} />}
            >
              Next
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </nav>
      )}
    </div>
  );
}
