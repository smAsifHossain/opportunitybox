import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Submit an opportunity",
  description:
    "Share a conference, workshop, fellowship, grant, or volunteer role with the community.",
};

export default async function SubmitPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/submit");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Share an <span className="text-gradient">opportunity</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Know about something others shouldn&apos;t miss? Submit it here — a
          moderator will review it before it goes live.
        </p>
      </header>
      <SubmitForm />
    </div>
  );
}
