import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Banknote,
  CalendarClock,
  CalendarRange,
  ChevronLeft,
  Globe2,
  MapPin,
  Tag,
} from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeadlineChip } from "@/components/deadline-chip";
import { OpportunityCard } from "@/components/opportunity-card";
import { FadeIn } from "@/components/animated";
import {
  formatDate,
  formatDateRange,
  fundingLabels,
  locationLabel,
  typeBadgeClasses,
  typeLabels,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const opp = await db.opportunity.findUnique({ where: { slug } });
  if (!opp) return {};
  return {
    title: opp.title,
    description: opp.description.slice(0, 160),
    openGraph: {
      title: opp.title,
      description: opp.description.slice(0, 160),
    },
  };
}

export default async function OpportunityDetailPage(props: Props) {
  const { slug } = await props.params;
  const opp = await db.opportunity.findUnique({
    where: { slug },
    include: { source: true },
  });
  if (!opp || (opp.status !== "APPROVED" && opp.status !== "EXPIRED")) notFound();

  const similar = await db.opportunity.findMany({
    where: {
      status: "APPROVED",
      id: { not: opp.id },
      OR: [{ type: opp.type }, { field: opp.field ?? undefined }],
      deadline: { gte: new Date() },
    },
    orderBy: { deadline: "asc" },
    take: 3,
  });

  const facts: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <CalendarClock className="size-4" />,
      label: "Application deadline",
      value: opp.deadline ? formatDate(opp.deadline) : "Rolling / not specified",
    },
    ...(opp.startDate
      ? [
          {
            icon: <CalendarRange className="size-4" />,
            label: "Event dates",
            value: formatDateRange(opp.startDate, opp.endDate),
          },
        ]
      : []),
    {
      icon: <MapPin className="size-4" />,
      label: "Location",
      value: locationLabel(opp),
    },
    {
      icon: <Banknote className="size-4" />,
      label: "Funding",
      value: fundingLabels[opp.funding],
    },
    ...(opp.field
      ? [{ icon: <Globe2 className="size-4" />, label: "Field", value: opp.field }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <FadeIn>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" /> All opportunities
        </Link>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold",
              typeBadgeClasses[opp.type]
            )}
          >
            {typeLabels[opp.type]}
          </span>
          <DeadlineChip deadline={opp.deadline?.toISOString() ?? null} />
          {opp.funding === "FULLY_FUNDED" && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Fully funded
            </Badge>
          )}
        </div>

        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          {opp.title}
        </h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            size="lg"
            className="shadow-lg shadow-violet-500/20"
            render={
              <a href={opp.applyUrl ?? opp.homepageUrl} target="_blank" rel="noreferrer" />
            }
          >
            Apply now <ArrowUpRight className="size-4.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<a href={opp.homepageUrl} target="_blank" rel="noreferrer" />}
          >
            Visit homepage <ArrowUpRight className="size-4.5" />
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-10 grid gap-4 rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-500 dark:text-violet-400">
                {f.icon}
              </span>
              <span>
                <span className="block text-xs text-muted-foreground">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </span>
            </div>
          ))}
        </div>

        {opp.fundingNotes && (
          <p className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
            💰 {opp.fundingNotes}
          </p>
        )}
      </FadeIn>

      <FadeIn delay={0.15}>
        <Separator className="my-8" />
        <article className="prose-sm max-w-none leading-relaxed text-foreground/90">
          <p className="whitespace-pre-line">{opp.description}</p>
        </article>

        {opp.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            {opp.tags.map((t) => (
              <Badge key={t} variant="secondary" className="font-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          {opp.source
            ? `Sourced automatically from ${opp.source.name}.`
            : opp.origin === "COMMUNITY"
              ? "Submitted by the community and approved by moderators."
              : "Curated by the OpenOpps team."}{" "}
          Always verify details on the official site before applying.
        </p>
      </FadeIn>

      {similar.length > 0 && (
        <FadeIn delay={0.2}>
          <Separator className="my-10" />
          <h2 className="text-xl font-bold tracking-tight">Similar opportunities</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s, i) => (
              <OpportunityCard
                key={s.id}
                index={i}
                opp={{
                  slug: s.slug,
                  title: s.title,
                  description: s.description,
                  type: s.type,
                  deadline: s.deadline?.toISOString() ?? null,
                  city: s.city,
                  country: s.country,
                  online: s.online,
                  funding: s.funding,
                  field: s.field,
                }}
              />
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  );
}
