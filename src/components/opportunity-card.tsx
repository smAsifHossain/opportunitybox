"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { MapPin, Banknote } from "lucide-react";
import { DeadlineChip } from "@/components/deadline-chip";
import {
  typeLabels,
  typeBadgeClasses,
  fundingLabels,
  locationLabel,
  formatDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FundingLevel, OpportunityType } from "@prisma/client";

export type OpportunityCardData = {
  slug: string;
  title: string;
  description: string;
  type: OpportunityType;
  deadline: string | null;
  city: string | null;
  country: string | null;
  online: boolean;
  funding: FundingLevel;
  field: string | null;
};

export function OpportunityCard({
  opp,
  index = 0,
  saveSlot,
}: {
  opp: OpportunityCardData;
  index?: number;
  saveSlot?: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 11) * 0.05 }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="group relative flex flex-col gap-3 rounded-xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-violet-500/10"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            typeBadgeClasses[opp.type]
          )}
        >
          {typeLabels[opp.type]}
        </span>
        <div className="flex items-center gap-1.5">
          <DeadlineChip deadline={opp.deadline} />
          {saveSlot}
        </div>
      </div>

      <div>
        <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight">
          <Link href={`/opportunities/${opp.slug}`} className="focus:outline-none">
            {/* Stretched link covers the whole card */}
            <span className="absolute inset-0 z-0 rounded-xl" aria-hidden />
            {opp.title}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {opp.description}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" />
          {locationLabel(opp)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1",
            opp.funding === "FULLY_FUNDED" &&
              "font-medium text-emerald-600 dark:text-emerald-400"
          )}
        >
          <Banknote className="size-3.5" />
          {fundingLabels[opp.funding]}
        </span>
        {opp.deadline && (
          <span className="ml-auto tabular-nums">
            Due {formatDate(opp.deadline)}
          </span>
        )}
      </div>
    </motion.article>
  );
}
