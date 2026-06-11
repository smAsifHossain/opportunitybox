"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleSource } from "@/app/admin/actions";

export function SourceToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={enabled}
      disabled={pending}
      onCheckedChange={(checked) =>
        startTransition(async () => {
          await toggleSource(id, checked);
        })
      }
      aria-label="Toggle source"
    />
  );
}
