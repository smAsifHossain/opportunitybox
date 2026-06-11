"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function toggleSave(
  opportunityId: string
): Promise<{ saved: boolean } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "auth" };

  const key = { userId: session.user.id, opportunityId };
  const existing = await db.savedOpportunity.findUnique({
    where: { userId_opportunityId: key },
  });

  if (existing) {
    await db.savedOpportunity.delete({ where: { userId_opportunityId: key } });
    revalidatePath("/dashboard");
    return { saved: false };
  }

  await db.savedOpportunity.create({ data: key });
  revalidatePath("/dashboard");
  return { saved: true };
}
