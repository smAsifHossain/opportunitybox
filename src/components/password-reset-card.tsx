"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  forgotPasswordAction,
  resetPasswordAction,
  type AuthFormState,
} from "@/app/(auth)/actions";

export function PasswordResetCard({
  mode,
  token,
}: {
  mode: "request" | "reset";
  token?: string;
}) {
  const action = mode === "request" ? forgotPasswordAction : resetPasswordAction;
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    undefined
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm rounded-2xl border border-border/70 bg-card/80 p-8 shadow-xl shadow-violet-500/5 backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg shadow-violet-500/25">
            <KeyRound className="size-5" />
          </span>
          <h1 className="mt-4 text-xl font-bold tracking-tight">
            {mode === "request" ? "Forgot your password?" : "Choose a new password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "request"
              ? "Enter your email and we'll send you a reset link."
              : "Pick a new password for your account."}
          </p>
        </div>

        {state?.success ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-9 text-emerald-500" />
            <p className="text-sm text-muted-foreground">{state.success}</p>
            <Button variant="outline" className="mt-2" render={<Link href="/login" />}>
              Back to login
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {mode === "request" ? (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@university.edu"
                  autoComplete="email"
                  required
                />
              </div>
            ) : (
              <>
                <input type="hidden" name="token" value={token} />
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </>
            )}

            {state?.error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button type="submit" className="h-10 w-full" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {mode === "request" ? "Send reset link" : "Update password"}
            </Button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
