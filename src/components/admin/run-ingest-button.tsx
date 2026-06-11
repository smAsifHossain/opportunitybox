"use client";

import { useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runIngestNow } from "@/app/admin/actions";

export function RunIngestButton() {
  const [pending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      const result = await runIngestNow();
      if (!result.ok) {
        toast.error(`Ingestion failed: ${result.error}`);
        return;
      }
      const added = result.runs.reduce((n, r) => n + r.added, 0);
      const updated = result.runs.reduce((n, r) => n + r.updated, 0);
      const failedSources = result.runs.filter((r) => r.status === "FAILED");
      toast.success(
        `Ingestion finished: ${added} added, ${updated} updated, ${result.expired} expired` +
          (failedSources.length
            ? ` — ${failedSources.length} source(s) failed`
            : "")
      );
    });
  }

  return (
    <Button onClick={run} disabled={pending} variant="outline">
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      {pending ? "Running…" : "Run ingestion now"}
    </Button>
  );
}
