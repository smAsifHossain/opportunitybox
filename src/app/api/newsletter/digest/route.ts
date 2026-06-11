import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, emailEnabled } from "@/lib/email";
import { collectDigestData, renderDigestHtml } from "@/lib/digest";
import { site } from "@/lib/site";

export const maxDuration = 300;

/**
 * Weekly digest sender, triggered by cron (GitHub Actions or Vercel Cron).
 * Protected by CRON_SECRET like /api/ingest.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(request.url).searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await collectDigestData(db);
  if (data.fresh.length === 0 && data.closing.length === 0) {
    return NextResponse.json({ sent: 0, skipped: "nothing to report this week" });
  }

  const [subscribers, optInUsers] = await Promise.all([
    db.newsletterSubscriber.findMany(),
    db.user.findMany({
      where: { newsletterOptIn: true },
      select: { email: true },
    }),
  ]);

  // Account opt-ins without a standalone subscription manage email from the
  // dashboard, so their "unsubscribe" link points there.
  const subscriberEmails = new Set(subscribers.map((s) => s.email));
  const recipients: { email: string; unsubscribeUrl: string }[] = [
    ...subscribers.map((s) => ({
      email: s.email,
      unsubscribeUrl: `${site.url}/unsubscribe?token=${s.unsubscribeToken}`,
    })),
    ...optInUsers
      .filter((u) => !subscriberEmails.has(u.email))
      .map((u) => ({ email: u.email, unsubscribeUrl: `${site.url}/dashboard` })),
  ];

  const subject = `${data.closing.length} deadlines closing soon · ${site.name} weekly digest`;
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const res = await sendEmail({
      to: r.email,
      subject,
      html: renderDigestHtml(data, r.unsubscribeUrl),
    });
    if (res.ok) sent++;
    else failed++;
  }

  return NextResponse.json({
    sent,
    failed,
    recipients: recipients.length,
    mode: emailEnabled ? "live" : "mock",
    fresh: data.fresh.length,
    closing: data.closing.length,
  });
}
