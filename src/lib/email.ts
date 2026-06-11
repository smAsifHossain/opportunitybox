import { Resend } from "resend";

/**
 * Email is optional infrastructure: without RESEND_API_KEY the app runs
 * normally and "sent" emails are logged to the server console instead.
 */
export const emailEnabled = Boolean(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM ?? "OpenOpps <onboarding@resend.dev>";

let resend: Resend | null = null;
function client(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
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
    const { error } = await client().emails.send({ from, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
