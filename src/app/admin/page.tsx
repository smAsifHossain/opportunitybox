import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Inbox,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { RunIngestButton } from "@/components/admin/run-ingest-button";
import { SourceToggle } from "@/components/admin/source-toggle";
import { formatDate, fundingLabels, typeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [pendingList, counts, sources, duplicates] = await Promise.all([
    db.opportunity.findMany({
      where: { status: "PENDING" },
      include: { submittedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    Promise.all([
      db.opportunity.count({ where: { status: "APPROVED" } }),
      db.opportunity.count({ where: { status: "PENDING" } }),
      db.opportunity.count({ where: { status: "EXPIRED" } }),
      db.user.count(),
    ]),
    db.source.findMany({
      include: {
        runs: { orderBy: { startedAt: "desc" }, take: 1 },
        _count: { select: { opportunities: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.opportunity.groupBy({
      by: ["homepageUrl"],
      where: { status: { in: ["APPROVED", "PENDING"] } },
      having: { homepageUrl: { _count: { gt: 1 } } },
      _count: true,
    }),
  ]);
  const [approved, pending, expired, users] = counts;

  const stats = [
    { icon: <CheckCircle2 className="size-4" />, label: "Live", value: approved },
    { icon: <Inbox className="size-4" />, label: "Pending review", value: pending },
    { icon: <Clock className="size-4" />, label: "Expired", value: expired },
    { icon: <Database className="size-4" />, label: "Users", value: users },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1.5 text-muted-foreground">
            Moderation queue and data source health.
          </p>
        </div>
        <RunIngestButton />
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/70 bg-card/70 p-4"
          >
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {s.icon} {s.label}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Moderation queue */}
      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">
          Moderation queue {pending > 0 && <Badge className="ml-1">{pending}</Badge>}
        </h2>
        {pendingList.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            All clear — nothing waiting for review.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {pendingList.map((opp) => (
              <li
                key={opp.id}
                className="rounded-xl border border-border/70 bg-card/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{opp.title}</span>
                      <Badge variant="secondary">{typeLabels[opp.type]}</Badge>
                      <Badge variant="secondary">{fundingLabels[opp.funding]}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {formatDate(opp.createdAt)} by{" "}
                      {opp.submittedBy?.name ?? "unknown"} (
                      {opp.submittedBy?.email ?? "—"}) · deadline{" "}
                      {formatDate(opp.deadline)}
                    </p>
                  </div>
                  <ModerationActions id={opp.id} title={opp.title} />
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {opp.description}
                </p>
                <a
                  href={opp.homepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-violet-500 hover:underline"
                >
                  {opp.homepageUrl} <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Possible duplicates */}
      {duplicates.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Copy className="size-5 text-amber-500" /> Possible duplicates
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These homepage URLs appear on more than one live or pending listing.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {duplicates.map((d) => (
              <li key={d.homepageUrl}>
                <a
                  href={d.homepageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-500 hover:underline"
                >
                  {d.homepageUrl}
                </a>{" "}
                <span className="text-muted-foreground">× {d._count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Source health */}
      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Data sources</h2>
        {sources.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No sources have run yet — press “Run ingestion now” to fetch live
            data from confs.tech, ccf-deadlines, ai-deadlines, and Grants.gov.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Listings</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">+ / ~ / = / ✗</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s) => {
                  const run = s.runs[0];
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium hover:underline"
                        >
                          {s.name}
                        </a>
                      </TableCell>
                      <TableCell>
                        <SourceToggle id={s.id} enabled={s.enabled} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {s._count.opportunities}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {run ? formatDate(run.startedAt) : "never"}
                      </TableCell>
                      <TableCell>
                        {run ? (
                          <Badge
                            className={
                              run.status === "SUCCESS"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : run.status === "FAILED"
                                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                  : "bg-amber-500/15 text-amber-600"
                            }
                          >
                            {run.status}
                          </Badge>
                        ) : (
                          "—"
                        )}
                        {run?.error && (
                          <p
                            className="mt-1 max-w-60 truncate text-xs text-red-500"
                            title={run.error}
                          >
                            {run.error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {run
                          ? `${run.added} / ${run.updated} / ${run.skipped} / ${run.failed}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
