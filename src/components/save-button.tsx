"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleSave } from "@/app/opportunities/actions";
import { cn } from "@/lib/utils";

export function SaveButton({
  opportunityId,
  initialSaved,
  loggedIn,
  className,
}: {
  opportunityId: string;
  initialSaved: boolean;
  loggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onClick() {
    if (!loggedIn) {
      toast("Log in to save opportunities", {
        action: { label: "Log in", onClick: () => router.push("/login") },
      });
      return;
    }
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const result = await toggleSave(opportunityId);
      if ("error" in result) {
        setSaved(!next);
        toast.error("Could not update — please try again.");
      } else if (result.saved) {
        toast.success("Saved to your dashboard");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      aria-pressed={saved}
      className={cn(
        "relative z-10 grid size-7 place-items-center rounded-full transition-colors",
        saved
          ? "bg-violet-500/15 text-violet-500 dark:text-violet-400"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
