import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, FilePlus2, Inbox } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpportunityCard } from "@/components/opportunity-card";
import { SaveButton } from "@/components/save-button";
import { formatDate, typeLabels } from "@/lib/format";
import { NewsletterPrefs } from "@/components/newsletter-prefs";
import { ProfileSettings } from "@/components/profile-settings";

export const metadata: Metadata = { title: "Dashboard" };

const statusBadge: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
  EXPIRED: "bg-zinc-500/15 text-zinc-500",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const [saved, submissions, user] = await Promise.all([
    db.savedOpportunity.findMany({
      where: { userId: session.user.id },
      include: { opportunity: true },
      orderBy: { createdAt: "desc" },
    }),
    db.opportunity.findMany({
      where: { submittedById: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        newsletterOptIn: true,
        name: true,
        email: true,
        affiliation: true,
        phone: true,
      },
    }),
  ]);

  // Saved items sorted by nearest deadline first (no deadline last).
  const savedSorted = [...saved].sort((a, b) => {
    const da = a.opportunity.deadline?.getTime() ?? Infinity;
    const db_ = b.opportunity.deadline?.getTime() ?? Infinity;
    return da - db_;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hey, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            Your saved opportunities and submissions, all in one place.
          </p>
        </div>
        <Button render={<Link href="/submit" />}>
          <FilePlus2 className="size-4" /> Submit an opportunity
        </Button>
      </header>

      <Tabs defaultValue="saved">
        <TabsList>
          <TabsTrigger value="saved">
            <Bookmark className="size-4" /> Saved ({saved.length})
          </TabsTrigger>
          <TabsTrigger value="submissions">
            <Inbox className="size-4" /> My submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="preferences">Profile &amp; settings</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-6">
          {savedSorted.length === 0 ? (
            <EmptyState
              text="Nothing saved yet. Tap the bookmark on any opportunity to keep it here."
              cta={{ href: "/opportunities", label: "Explore opportunities" }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedSorted.map(({ opportunity: opp }, i) => (
                <OpportunityCard
                  key={opp.id}
                  index={i}
                  opp={{
                    slug: opp.slug,
                    title: opp.title,
                    description: opp.description,
                    type: opp.type,
                    deadline: opp.deadline?.toISOString() ?? null,
                    city: opp.city,
                    country: opp.country,
                    online: opp.online,
                    funding: opp.funding,
                    field: opp.field,
                  }}
                  saveSlot={
                    <SaveButton opportunityId={opp.id} initialSaved loggedIn />
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          {submissions.length === 0 ? (
            <EmptyState
              text="You haven't submitted any opportunities yet. Know one others would love?"
              cta={{ href: "/submit", label: "Submit an opportunity" }}
            />
          ) : (
            <ul className="divide-y divide-border/70 rounded-xl border border-border/70 bg-card/60">
              {submissions.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabels[s.type]} · submitted {formatDate(s.createdAt)}
                    </p>
                    {s.status === "REJECTED" && s.rejectionReason && (
                      <p className="mt-1 text-xs text-red-500">
                        Reason: {s.rejectionReason}
                      </p>
                    )}
                  </div>
                  <Badge className={statusBadge[s.status]}>{s.status}</Badge>
                  {s.status === "APPROVED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/opportunities/${s.slug}`} />}
                    >
                      View
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-6">
          <ProfileSettings
            initial={{
              name: user?.name ?? "",
              affiliation: user?.affiliation ?? "",
              phone: user?.phone ?? "",
              email: user?.email ?? "",
            }}
          />
          <NewsletterPrefs initialOptIn={user?.newsletterOptIn ?? false} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  text,
  cta,
}: {
  text: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-16 text-center">
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      <Button variant="outline" render={<Link href={cta.href} />}>
        {cta.label}
      </Button>
    </div>
  );
}
