import { Resend } from "resend";
import nodemailer from "nodemailer";

/**
 * Email has three modes, picked in this order:
 *
 *   1. SMTP, when SMTP_HOST, SMTP_USER and SMTP_PASS are set. Works with any
 *      provider: Brevo, Mailjet, SMTP2GO, Gmail and so on. Most of them let
 *      you verify a single sender address, so no domain is required.
 *   2. Resend, when RESEND_API_KEY is set. Needs a verified domain before it
 *      will deliver to anyone other than the account owner.
 *   3. Neither, in which case messages are written to the console. The app
 *      runs normally, which is what you want in local development.
 */
const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpPort = Number(process.env.SMTP_PORT ?? 587);

export const smtpEnabled = Boolean(smtpHost && smtpUser && smtpPass);
export const resendEnabled = Boolean(process.env.RESEND_API_KEY);
export const emailEnabled = smtpEnabled || resendEnabled;

/** Which transport is live, for health checks and admin display. */
export const emailMode = smtpEnabled ? "smtp" : resendEnabled ? "resend" : "mock";

const from = process.env.EMAIL_FROM ?? "OpportunityBox <onboarding@resend.dev>";

let resend: Resend | null = null;
let transport: nodemailer.Transporter | null = null;

function resendClient(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function smtpTransport(): nodemailer.Transporter {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      // Port 465 is implicit TLS. Everything else starts plain and upgrades.
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }
  return transport;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!emailEnabled) {
    console.log(`[email mock] to=${to} subject="${subject}" (${html.length} bytes)`);
    return { ok: true };
  }

  try {
    if (smtpEnabled) {
      await smtpTransport().sendMail({ from, to, subject, html });
      return { ok: true };
    }
    const { error } = await resendClient().emails.send({ from, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
