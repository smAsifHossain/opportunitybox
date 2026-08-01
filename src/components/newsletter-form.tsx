"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/app/newsletter/actions";

const placeholders = ["you@university.edu", "you@gmail.com"];

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, undefined);

  // Rotate the placeholder so it's clear any email works.
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setPlaceholderIndex((i) => (i + 1) % placeholders.length),
      1500
    );
    return () => clearInterval(id);
  }, []);

  if (state?.ok) {
    return (
      <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4" /> You&apos;re on the list. First
        digest arrives next week.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <p className="text-sm text-muted-foreground">
        One email a week: new opportunities + deadlines closing soon.
      </p>
      <div className="flex gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder={placeholders[placeholderIndex]}
          aria-label="Email address"
          className="max-w-56"
        />
        <Button type="submit" disabled={pending} aria-label="Subscribe">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          Subscribe
        </Button>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
