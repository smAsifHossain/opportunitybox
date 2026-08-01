import Link from "next/link";
import { LogoMark } from "@/components/icons";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <LogoMark className="size-11 text-muted-foreground" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Page not <span className="text-gradient">found</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page doesn&apos;t exist — maybe the opportunity expired, or the
        link is off. The directory, however, is very much alive.
      </p>
      <div className="mt-6 flex gap-3">
        <Button render={<Link href="/opportunities" />}>Explore opportunities</Button>
        <Button variant="outline" render={<Link href="/" />}>
          Home
        </Button>
      </div>
    </div>
  );
}
