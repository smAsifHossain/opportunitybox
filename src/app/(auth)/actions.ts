"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import {
  consumeEmailToken,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/auth-emails";

export type AuthFormState = { error?: string; success?: string } | undefined;

const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name").max(100),
    affiliation: z.string().max(150).optional(),
    email: z.email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    affiliation: formData.get("affiliation") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists. Try logging in." };
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      affiliation: parsed.data.affiliation,
      email,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
    },
  });

  await sendVerificationEmail(user.id, email);

  return {
    success:
      "Account created! Check your inbox for a verification link — you'll be able to log in right after confirming your email.",
  };
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") || "/dashboard");

  // Block unverified credential accounts before hitting the provider, so we
  // can give a useful message (and a fresh link) instead of a generic error.
  const user = await db.user.findUnique({ where: { email } });
  if (user?.passwordHash && !user.emailVerified) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (valid) {
      await sendVerificationEmail(user.id, email);
      return {
        error:
          "Your email isn't verified yet. We just sent you a fresh verification link — check your inbox.",
      };
    }
  }

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function forgotPasswordAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = z.email().safeParse(String(formData.get("email") ?? "").toLowerCase().trim());
  if (!parsed.success) return { error: "Please enter a valid email address." };

  const user = await db.user.findUnique({ where: { email: parsed.data } });
  // Same response whether or not the account exists — don't leak which
  // emails are registered.
  if (user?.passwordHash) {
    await sendPasswordResetEmail(user.id, user.email);
  }
  return {
    success:
      "If an account exists for that email, a password reset link is on its way. The link is valid for 1 hour.",
  };
}

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await consumeEmailToken(parsed.data.token, "RESET_PASSWORD");
  if (!userId) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      // A working reset link proves inbox access, so the email is verified too.
      emailVerified: new Date(),
    },
  });

  return { success: "Password updated! You can now log in with your new password." };
}
