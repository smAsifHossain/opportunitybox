import type { FundingLevel, OpportunityType } from "@prisma/client";

export const typeLabels: Record<OpportunityType, string> = {
  CONFERENCE: "Conference",
  WORKSHOP: "Workshop",
  TRAINING: "Training",
  FELLOWSHIP: "Fellowship",
  VOLUNTEER: "Volunteering",
  CFP_CONFERENCE: "CFP · Conference",
  CFP_JOURNAL: "CFP · Journal",
  GRANT: "Grant",
  HACKATHON: "Hackathon",
  OTHER: "Other",
};

export const fundingLabels: Record<FundingLevel, string> = {
  FULLY_FUNDED: "Fully funded",
  PARTIALLY_FUNDED: "Partial funding",
  NOT_FUNDED: "No funding",
  UNKNOWN: "Funding unknown",
};

/** Tailwind classes for the type badge per opportunity type. */
export const typeBadgeClasses: Record<OpportunityType, string> = {
  CONFERENCE: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  WORKSHOP: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  TRAINING: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  FELLOWSHIP: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  VOLUNTEER: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  CFP_CONFERENCE: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  CFP_JOURNAL: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  GRANT: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  HACKATHON: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  OTHER: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
};

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateRange(
  start: Date | string | null | undefined,
  end: Date | string | null | undefined
): string {
  if (!start) return "-";
  if (!end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function daysUntil(date: Date | string): number {
  const target = new Date(date).getTime();
  return Math.ceil((target - Date.now()) / 86_400_000);
}

export function locationLabel(opp: {
  city?: string | null;
  country?: string | null;
  online: boolean;
}): string {
  const place = [opp.city, opp.country].filter(Boolean).join(", ");
  if (place && opp.online) return `${place} · Online`;
  if (place) return place;
  if (opp.online) return "Online";
  return "Location TBA";
}
