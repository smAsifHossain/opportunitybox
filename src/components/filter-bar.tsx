"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { typeLabels, fundingLabels } from "@/lib/format";

const ALL = "__all__";

export function FilterBar({ countries }: { countries: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(params.toString());
      if (value && value !== ALL) next.set(key, value);
      else next.delete(key);
      next.delete("page"); // any filter change resets pagination
      startTransition(() => {
        router.replace(`/opportunities?${next.toString()}`, { scroll: false });
      });
    },
    [params, router]
  );

  // Debounced free-text search.
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setQ(params.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q")]);

  function onSearch(value: string) {
    setQ(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => setParam("q", value.trim() || undefined), 350);
  }

  const hasFilters = ["q", "type", "funding", "location", "country", "sort"].some(
    (k) => params.has(k)
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by title, topic, field, or country…"
          className="h-11 pl-9"
          aria-label="Search opportunities"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={params.get("type") ?? ALL}
          onValueChange={(v) => setParam("type", v)}
          items={{ [ALL]: "All types", ...typeLabels }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("funding") ?? ALL}
          onValueChange={(v) => setParam("funding", v)}
          items={{ [ALL]: "Any funding", ...fundingLabels }}
        >
          <SelectTrigger className="w-[160px]" aria-label="Filter by funding">
            <SelectValue placeholder="Funding" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any funding</SelectItem>
            {Object.entries(fundingLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("location") ?? ALL}
          onValueChange={(v) => setParam("location", v)}
          items={{ [ALL]: "Any format", online: "Online", inperson: "In person" }}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by format">
            <SelectValue placeholder="Format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any format</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="inperson">In person</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={params.get("country") ?? ALL}
          onValueChange={(v) => setParam("country", v)}
          items={{
            [ALL]: "All countries",
            ...Object.fromEntries(countries.map((c) => [c, c])),
          }}
        >
          <SelectTrigger className="w-[170px]" aria-label="Filter by country">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={params.get("sort") ?? "deadline"}
          onValueChange={(v) => setParam("sort", v === "deadline" ? undefined : v)}
          items={{ deadline: "Deadline soonest", newest: "Newest first" }}
        >
          <SelectTrigger className="w-[170px]" aria-label="Sort order">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deadline">Deadline soonest</SelectItem>
            <SelectItem value="newest">Newest first</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {
              setQ("");
              startTransition(() => router.replace("/opportunities"));
            }}
          >
            <X className="size-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
