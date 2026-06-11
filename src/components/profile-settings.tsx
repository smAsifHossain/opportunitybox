"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, updateProfile } from "@/app/dashboard/actions";

type ActionState = { ok?: boolean; error?: string } | undefined;

function useResultToast(state: ActionState, okMessage: string) {
  useEffect(() => {
    if (state?.ok) toast.success(okMessage);
    else if (state?.error) toast.error(state.error);
  }, [state, okMessage]);
}

export function ProfileSettings({
  initial,
}: {
  initial: { name: string; affiliation: string; phone: string; email: string };
}) {
  const [profileState, profileAction, profilePending] = useActionState<
    ActionState,
    FormData
  >(updateProfile, undefined);
  const [pwState, pwAction, pwPending] = useActionState<ActionState, FormData>(
    changePassword,
    undefined
  );

  useResultToast(profileState, "Profile updated");
  useResultToast(pwState, "Password changed");

  return (
    <div className="grid max-w-4xl gap-6 lg:grid-cols-2">
      <form
        action={profileAction}
        className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-6"
      >
        <h3 className="font-semibold">Profile</h3>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={initial.email} disabled />
          <p className="text-xs text-muted-foreground">
            Your email is your login and can&apos;t be changed here.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full name</Label>
          <Input id="profile-name" name="name" defaultValue={initial.name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-affiliation">Affiliation</Label>
          <Input
            id="profile-affiliation"
            name="affiliation"
            defaultValue={initial.affiliation}
            placeholder="e.g. Wichita State University"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-phone">Contact number</Label>
          <Input
            id="profile-phone"
            name="phone"
            type="tel"
            defaultValue={initial.phone}
            placeholder="+1 (316) 555-0100"
          />
        </div>
        <Button type="submit" disabled={profilePending}>
          {profilePending && <Loader2 className="size-4 animate-spin" />}
          Save profile
        </Button>
      </form>

      <form
        action={pwAction}
        className="space-y-4 self-start rounded-xl border border-border/70 bg-card/60 p-6"
      >
        <h3 className="font-semibold">Change password</h3>
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
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
        <Button type="submit" variant="outline" disabled={pwPending}>
          {pwPending && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </div>
  );
}
