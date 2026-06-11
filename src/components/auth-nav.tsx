import Link from "next/link";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

/** Server-rendered auth area, passed into the client Navbar as a slot. */
export async function AuthNav() {
  const session = await auth();

  if (!session?.user) {
    return (
      <>
        <Button variant="ghost" size="sm" render={<Link href="/login" />}>
          Log in
        </Button>
        <Button size="sm" render={<Link href="/register" />}>
          Sign up
        </Button>
      </>
    );
  }

  return (
    <>
      {session.user.role === "ADMIN" && (
        <Button variant="ghost" size="sm" render={<Link href="/admin" />}>
          <ShieldCheck className="size-4" /> Admin
        </Button>
      )}
      <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
        <LayoutDashboard className="size-4" />
        {session.user.name?.split(" ")[0] ?? "Dashboard"}
      </Button>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button variant="ghost" size="icon-sm" type="submit" aria-label="Sign out">
          <LogOut className="size-4" />
        </Button>
      </form>
    </>
  );
}
