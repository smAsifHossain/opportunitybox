import { Resend } from "resend";
import nodemailer from "nodemailer";

/**
 * Email has three modes, picked in this order:
 *
 *   1. SMTP, when GMAIL_USER and GMAIL_APP_PASSWORD are set. Mail is sent
 *      through Gmail from your own address, which works without owning a
 *      domain. Gmail allows roughly 500 recipients a day on a free account.
 *   2. Resend, when RESEND_API_KEY is set. Needs a verified domain before it
 *      will deliver to anyone other than the account owner.
 *   3. Neither, in which case messages are written to the console. The app
 *      runs normally, which is what you want in local development.
 */
const gmailUser = process.env.GMAIL_USER;
const gmailPassword = process.env.GMAIL_APP_PASSWORD;

export const smtpEnabled = Boolean(gmailUser && gmailPassword);
export const resendEnabled = Boolean(process.env.RESEND_API_KEY);
export const emailEnabled = smtpEnabled || resendEnabled;

/** Which transport is live, for health checks and admin display. */
export const emailMode = smtpEnabled ? "smtp" : resendEnabled ? "resend" : "mock";

const from =
  process.env.EMAIL_FROM ??
  (gmailUser ? `OpportunityBox <${gmailUser}>` : "OpportunityBox <onboarding@resend.dev>");

let resend: Resend | null = null;
let transport: nodemailer.Transporter | null = null;

function resendClient(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function smtpTransport(): nodemailer.Transporter {
  if (!transport) {
    transport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
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
