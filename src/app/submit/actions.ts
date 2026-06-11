"use server";

import { z } from "zod";
import { FundingLevel, OpportunityType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { opportunitySlug } from "@/lib/slug";

const submitSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  type: z.enum(OpportunityType),
  description: z
    .string()
    .min(30, "Please describe the opportunity in at least 30 characters")
    .max(5000),
  field: z.string().max(120).optional(),
  homepageUrl: z.url("Homepage must be a valid URL (https://…)"),
  applyUrl: z.union([z.url(), z.literal("")]).optional(),
  deadline: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  city: z.string().max(120).optional(),
  country: z.string().max(120).optional(),
  online: z.boolean(),
  funding: z.enum(FundingLevel),
  fundingNotes: z.string().max(500).optional(),
  tags: z.string().max(300).optional(),
});

export type SubmitResult =
  | { ok: true }
  | { ok: false; error: string }
  | undefined;

function parseDateInput(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function submitOpportunity(
  _prev: SubmitResult,
  formData: FormData
): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Please log in to submit." };

  const parsed = submitSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    description: formData.get("description"),
    field: formData.get("field") || undefined,
    homepageUrl: formData.get("homepageUrl"),
    applyUrl: formData.get("applyUrl") || undefined,
    deadline: formData.get("deadline") || undefined,
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    city: formData.get("city") || undefined,
    country: formData.get("country") || undefined,
    online: formData.get("online") === "on",
    funding: formData.get("funding") ?? "UNKNOWN",
    fundingNotes: formData.get("fundingNotes") || undefined,
    tags: formData.get("tags") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  // Light duplicate guard: same homepage already listed and still open.
  const dup = await db.opportunity.findFirst({
    where: {
      homepageUrl: data.homepageUrl,
      status: { in: ["APPROVED", "PENDING"] },
    },
    select: { id: true },
  });
  if (dup) {
    return {
      ok: false,
      error: "An opportunity with this homepage URL is already listed or awaiting review.",
    };
  }

  await db.opportunity.create({
    data: {
      slug: opportunitySlug(data.title, `${session.user.id}:${data.homepageUrl}`),
      title: data.title,
      type: data.type,
      description: data.description,
      field: data.field,
      homepageUrl: data.homepageUrl,
      applyUrl: data.applyUrl || undefined,
      deadline: parseDateInput(data.deadline),
      startDate: parseDateInput(data.startDate),
      endDate: parseDateInput(data.endDate),
      city: data.city,
      country: data.country,
      online: data.online,
      funding: data.funding,
      fundingNotes: data.fundingNotes,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 12)
        : [],
      status: "PENDING",
      origin: "COMMUNITY",
      submittedById: session.user.id,
    },
  });

  return { ok: true };
}
