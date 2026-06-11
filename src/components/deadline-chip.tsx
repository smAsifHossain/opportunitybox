"use client";

import { useSyncExternalStore } from "react";
import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
/** False during SSR/hydration, true after mount — without effect-driven state. */
function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

function describe(deadline: string): { label: string; tone: "red" | "amber" | "green" | "gray" } {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Closed", tone: "gray" };
  if (days === 0) return { label: "Closes today", tone: "red" };
  if (days === 1) return { label: "1 day left", tone: "red" };
  if (days < 7) return { label: `${days} days left`, tone: "red" };
  if (days < 30) return { label: `${days} days left`, tone: "amber" };
  return { label: `${days} days left`, tone: "green" };
}

const tones = {
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  gray: "bg-zinc-500/15 text-zinc-500 dark:text-zinc-400",
} as const;

export function DeadlineChip({
  deadline,
  className,
}: {
  deadline: string | null;
  className?: string;
}) {
  // Compute after mount: "days left" depends on the viewer's clock, so
  // rendering it on the server would risk hydration mismatches.
  const mounted = useMounted();
  const state = mounted && deadline ? describe(deadline) : null;

  if (!deadline) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          tones.gray,
          className
        )}
      >
        <CalendarClock className="size-3.5" /> Rolling / open
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
        state ? tones[state.tone] : tones.gray,
        className
      )}
    >
      <CalendarClock className="size-3.5" />
      {state?.label ?? "…"}
    </span>
  );
}
