import type { Metadata } from "next";
import Link from "next/link";
import { MailX } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Unsubscribe" };

export default async function UnsubscribePage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  let removed = false;
  if (token) {
    const result = await db.newsletterSubscriber.deleteMany({
      where: { unsubscribeToken: token },
    });
    removed = result.count > 0;
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <MailX className="size-10 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {removed ? "You're unsubscribed" : "Link not recognized"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {removed
          ? "You won't receive the weekly digest anymore. You can resubscribe from the site footer anytime."
          : "This unsubscribe link is invalid or was already used. If you have an account, you can also manage email preferences from your dashboard."}
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        Back to OpenOpps
      </Button>
    </div>
  );
}
