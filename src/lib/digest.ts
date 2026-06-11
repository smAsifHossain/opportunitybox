import type { Opportunity, PrismaClient } from "@prisma/client";
import { typeLabels, fundingLabels, formatDate } from "@/lib/format";
import { site } from "@/lib/site";

const WINDOW_DAYS = 7;

export async function collectDigestData(db: PrismaClient) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - WINDOW_DAYS * 86_400_000);
  const weekAhead = new Date(now.getTime() + WINDOW_DAYS * 86_400_000);

  const [fresh, closing] = await Promise.all([
    db.opportunity.findMany({
      where: { status: "APPROVED", createdAt: { gte: weekAgo } },
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }],
      take: 12,
    }),
    db.opportunity.findMany({
      where: { status: "APPROVED", deadline: { gte: now, lte: weekAhead } },
      orderBy: { deadline: "asc" },
      take: 12,
    }),
  ]);

  return { fresh, closing };
}

function row(opp: Opportunity): string {
  const meta = [
    typeLabels[opp.type],
    opp.deadline ? `deadline ${formatDate(opp.deadline)}` : null,
    opp.funding !== "UNKNOWN" ? fundingLabels[opp.funding] : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e5e5ef;">
        <a href="${site.url}/opportunities/${opp.slug}"
           style="color:#7c3aed;font-weight:600;text-decoration:none;">
          ${escapeHtml(opp.title)}
        </a>
        <div style="color:#6b7280;font-size:13px;margin-top:2px;">${escapeHtml(meta)}</div>
      </td>
    </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderDigestHtml(
  data: Awaited<ReturnType<typeof collectDigestData>>,
  unsubscribeUrl: string
): string {
  const section = (title: string, items: Opportunity[]) =>
    items.length
      ? `<h2 style="font-size:16px;margin:28px 0 4px;">${title}</h2>
         <table style="width:100%;border-collapse:collapse;">${items.map(row).join("")}</table>`
      : "";

  return `<!doctype html>
<html><body style="font-family:ui-sans-serif,system-ui,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px;">
  <h1 style="font-size:20px;">🧭 Your weekly opportunity digest</h1>
  <p style="color:#6b7280;font-size:14px;">
    New listings and deadlines closing in the next ${WINDOW_DAYS} days, from
    <a href="${site.url}" style="color:#7c3aed;">${site.name}</a>.
  </p>
  ${section("⏰ Closing soon", data.closing)}
  ${section("✨ New this week", data.fresh)}
  <p style="margin-top:32px;font-size:12px;color:#9ca3af;">
    You're receiving this because you subscribed on ${site.name}.
    <a href="${unsubscribeUrl}" style="color:#9ca3af;">Unsubscribe</a>
  </p>
</body></html>`;
}
