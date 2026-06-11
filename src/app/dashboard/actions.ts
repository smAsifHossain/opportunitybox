"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
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

const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name").max(100),
  affiliation: z.string().max(150).optional(),
  phone: z
    .string()
    .max(30)
    .regex(/^[+\d\s().-]*$/, "Phone may only contain digits, spaces, and + ( ) . -")
    .optional(),
});

export async function updateProfile(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    affiliation: String(formData.get("affiliation") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      affiliation: parsed.data.affiliation ?? null,
      phone: parsed.data.phone ?? null,
    },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(
  _prev: { ok?: boolean; error?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Please log in." };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    return { error: "This account uses social login and has no password." };
  }
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return { ok: true };
}
