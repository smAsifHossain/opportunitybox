import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordResetCard } from "@/components/password-reset-card";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;
  if (!token) redirect("/forgot-password");

  return <PasswordResetCard mode="reset" token={token} />;
}
