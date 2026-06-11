import { randomBytes } from "node:crypto";
import type { EmailTokenType } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/site";

const TOKEN_TTL_HOURS: Record<EmailTokenType, number> = {
  VERIFY_EMAIL: 24,
  RESET_PASSWORD: 1,
};

/** Create a fresh single-use token, invalidating older ones of the same type. */
export async function createEmailToken(
  userId: string,
  type: EmailTokenType
): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await db.$transaction([
    db.emailToken.deleteMany({ where: { userId, type } }),
    db.emailToken.create({
      data: {
        token,
        type,
        userId,
        expires: new Date(Date.now() + TOKEN_TTL_HOURS[type] * 3_600_000),
      },
    }),
  ]);
  return token;
}

/** Validate and consume a token. Returns the userId or null. */
export async function consumeEmailToken(
  token: string,
  type: EmailTokenType
): Promise<string | null> {
  const row = await db.emailToken.findUnique({ where: { token } });
  if (!row || row.type !== type) return null;
  await db.emailToken.delete({ where: { id: row.id } });
  if (row.expires < new Date()) return null;
  return row.userId;
}

function emailShell(heading: string, body: string, ctaUrl: string, ctaLabel: string) {
  return `<!doctype html>
<html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#111;max-width:480px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;">🧭 ${heading}</h1>
  <p style="color:#374151;font-size:14px;line-height:1.6;">${body}</p>
  <p style="margin:28px 0;">
    <a href="${ctaUrl}" style="background:#7c3aed;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
      ${ctaLabel}
    </a>
  </p>
  <p style="font-size:12px;color:#9ca3af;">
    Or copy this link into your browser:<br/>
    <a href="${ctaUrl}" style="color:#7c3aed;word-break:break-all;">${ctaUrl}</a>
  </p>
  <p style="font-size:12px;color:#9ca3af;">If you didn't request this, you can safely ignore this email.</p>
</body></html>`;
}

export async function sendVerificationEmail(userId: string, email: string) {
  const token = await createEmailToken(userId, "VERIFY_EMAIL");
  const url = `${site.url}/verify?token=${token}`;
  return sendEmail({
    to: email,
    subject: `Verify your email · ${site.name}`,
    html: emailShell(
      "Confirm your email address",
      `Welcome to ${site.name}! Click the button below to verify your email and activate your account. The link is valid for 24 hours.`,
      url,
      "Verify my email"
    ),
  });
}

export async function sendPasswordResetEmail(userId: string, email: string) {
  const token = await createEmailToken(userId, "RESET_PASSWORD");
  const url = `${site.url}/reset-password?token=${token}`;
  return sendEmail({
    to: email,
    subject: `Reset your password · ${site.name}`,
    html: emailShell(
      "Reset your password",
      `We received a request to reset the password for this account. The link is valid for 1 hour.`,
      url,
      "Choose a new password"
    ),
  });
}
