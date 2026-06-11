import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PasswordResetCard } from "@/components/password-reset-card";

export const metadata: Metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return <PasswordResetCard mode="request" />;
}
