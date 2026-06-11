"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setNewsletterOptIn } from "@/app/dashboard/actions";

export function NewsletterPrefs({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [, startTransition] = useTransition();

  function onToggle(checked: boolean) {
    setOptIn(checked);
    startTransition(async () => {
      const res = await setNewsletterOptIn(checked);
      if (res && "error" in res) {
        setOptIn(!checked);
        toast.error("Could not update preference.");
      } else {
        toast.success(checked ? "Weekly digest enabled" : "Weekly digest disabled");
      }
    });
  }

  return (
    <div className="max-w-xl rounded-xl border border-border/70 bg-card/60 p-6">
      <div className="flex items-center justify-between gap-6">
        <div>
          <Label htmlFor="digest" className="text-base font-semibold">
            Weekly opportunity digest
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            One email a week with new opportunities and deadlines closing soon.
            No spam, unsubscribe anytime.
          </p>
        </div>
        <Switch id="digest" checked={optIn} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
