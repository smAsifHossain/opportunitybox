import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  Globe2,
  GraduationCap,
  Megaphone,
  Mic2,
  FlaskConical,
  HeartHandshake,
  Trophy,
} from "lucide-react";
import { db } from "@/lib/db";
import { Hero } from "@/components/hero";
import { CountUp } from "@/components/count-up";
import { FadeIn, Stagger, StaggerItem } from "@/components/animated";
import { OpportunityCard } from "@/components/opportunity-card";
import { Button } from "@/components/ui/button";
import { typeLabels } from "@/lib/format";
import { activeDeadlineFilter } from "@/lib/opportunity-query";
import type { OpportunityType } from "@prisma/client";

export const revalidate = 300;

const categoryIcons: Partial<Record<OpportunityType, React.ReactNode>> = {
  CONFERENCE: <Mic2 className="size-5" />,
  WORKSHOP: <FlaskConical className="size-5" />,
  TRAINING: <GraduationCap className="size-5" />,
  FELLOWSHIP: <Trophy className="size-5" />,
  VOLUNTEER: <HeartHandshake className="size-5" />,
  CFP_CONFERENCE: <Megaphone className="size-5" />,
  CFP_JOURNAL: <Megaphone className="size-5" />,
  GRANT: <Banknote className="size-5" />,
  HACKATHON: <Globe2 className="size-5" />,
};

export default async function HomePage() {
  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 86_400_000);
  // Shared rule: count only opportunities that haven't passed their deadline.
  const active = activeDeadlineFilter();

  const [total, closingSoonCount, fundedCount, countryGroups, closingSoon, byType] =
    await Promise.all([
      db.opportunity.count({ where: { status: "APPROVED", AND: [active] } }),
      db.opportunity.count({
        where: { status: "APPROVED", deadline: { gte: now, lte: in30days } },
      }),
      db.opportunity.count({
        where: { status: "APPROVED", funding: "FULLY_FUNDED", AND: [active] },
      }),
      db.opportunity.groupBy({
        by: ["country"],
        where: { status: "APPROVED", country: { not: null }, AND: [active] },
      }),
      db.opportunity.findMany({
        where: { status: "APPROVED", deadline: { gte: now } },
        orderBy: { deadline: "asc" },
        take: 6,
      }),
      db.opportunity.groupBy({
        by: ["type"],
        where: { status: "APPROVED", AND: [active] },
        _count: true,
      }),
    ]);

  const stats = [
    { label: "Open opportunities", value: total },
    { label: "Deadlines in 30 days", value: closingSoonCount },
    { label: "Fully funded", value: fundedCount },
    { label: "Countries covered", value: countryGroups.length },
  ];

  return (
    <div>
      <Hero />

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Stagger className="grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur sm:grid-cols-4 sm:p-8">
          {stats.map((s) => (
            <StaggerItem key={s.label} className="text-center">
              <p className="text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Closing soon */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <FadeIn className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <CalendarClock className="size-6 text-violet-500" /> Closing soon
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Don&apos;t let these deadlines slip by.
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            render={<Link href="/opportunities" />}
          >
            View all <ArrowRight className="size-4" />
          </Button>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {closingSoon.map((opp, i) => (
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
            />
          ))}
        </div>
      </section>

      {/* Browse by category */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <FadeIn>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every kind of opportunity, one directory.
            </p>
          </FadeIn>
          <Stagger className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {byType
              .sort((a, b) => b._count - a._count)
              .map((t) => (
                <StaggerItem key={t.type}>
                  <Link
                    href={`/opportunities?type=${t.type}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-violet-500 dark:text-violet-400">
                      {categoryIcons[t.type] ?? <Globe2 className="size-5" />}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {typeLabels[t.type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t._count} open
                      </span>
                    </span>
                  </Link>
                </StaggerItem>
              ))}
          </Stagger>
        </div>
      </section>

      {/* Origin story CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <FadeIn>
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            One conversation shouldn&apos;t decide your future
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
            A fully funded workshop, found only because a professor mentioned it
            in passing. How many others slipped by unheard? OpportunityBox brings every
            opportunity into one open, searchable place — so the ones that change
            your path reach you, not just the well-connected few.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/about" />}>
              Read the story
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/submit" />}>
              Submit an opportunity
            </Button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
