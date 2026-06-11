import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const { next } = await props.searchParams;

  return <AuthCard mode="login" redirectTo={next || "/dashboard"} />;
}
