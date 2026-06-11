"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const emailSchema = z.email();

export async function subscribeToNewsletter(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = emailSchema.safeParse(
    String(formData.get("email") ?? "").toLowerCase().trim()
  );
  if (!parsed.success) return { error: "Please enter a valid email address." };

  // Upsert keeps this idempotent — resubscribing is a silent success.
  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: { email: parsed.data },
  });
  return { ok: true };
}
