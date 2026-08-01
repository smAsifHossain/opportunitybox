import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { db } from "@/lib/db";
import { consumeEmailToken } from "@/lib/auth-emails";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  let verified = false;
  if (token) {
    const userId = await consumeEmailToken(token, "VERIFY_EMAIL");
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
      verified = true;
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      {verified ? (
        <CheckCircle2 className="size-10 text-emerald-500" />
      ) : (
        <XCircle className="size-10 text-muted-foreground" />
      )}
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        {verified ? "Email verified!" : "Link invalid or expired"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {verified
          ? "Your account is active. Log in and start saving opportunities."
          : "This verification link is invalid or has expired. Log in with your credentials to receive a fresh link."}
      </p>
      <Button className="mt-6" render={<Link href="/login" />}>
        Go to login
      </Button>
    </div>
  );
}
