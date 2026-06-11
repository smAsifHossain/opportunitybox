"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { runIngestion, type RunSummary } from "@/ingestion/pipeline";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function approveOpportunity(id: string) {
  await requireAdmin();
  await db.opportunity.update({
    where: { id },
    data: { status: "APPROVED", rejectionReason: null },
  });
  revalidatePath("/admin");
  revalidatePath("/opportunities");
  return { ok: true as const };
}

export async function rejectOpportunity(id: string, reason: string) {
  await requireAdmin();
  await db.opportunity.update({
    where: { id },
    data: { status: "REJECTED", rejectionReason: reason.slice(0, 500) || null },
  });
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteOpportunity(id: string) {
  await requireAdmin();
  await db.opportunity.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/opportunities");
  return { ok: true as const };
}

export async function toggleSource(id: string, enabled: boolean) {
  await requireAdmin();
  await db.source.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin");
  return { ok: true as const };
}

export async function runIngestNow(): Promise<
  { ok: true; runs: RunSummary[]; expired: number } | { ok: false; error: string }
> {
  await requireAdmin();
  try {
    const result = await runIngestion(db);
    revalidatePath("/admin");
    revalidatePath("/opportunities");
    revalidatePath("/");
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
