"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function setNewsletterOptIn(
  optIn: boolean
): Promise<{ ok: true } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "auth" };

  await db.user.update({
    where: { id: session.user.id },
    data: { newsletterOptIn: optIn },
  });
  return { ok: true };
}
