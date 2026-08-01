import Link from "next/link";
import { GitHubIcon, LogoTile } from "@/components/icons";
import { site } from "@/lib/site";

export function Footer({ newsletterSlot }: { newsletterSlot?: React.ReactNode }) {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <LogoTile className="size-8" markClassName="size-4.5" />
            <span>
              Opportunity<span className="text-gradient">Box</span>
            </span>
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {site.description}
          </p>
          <a
            href={site.repo}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-4" /> Open source on GitHub, support us
            with a ⭐
          </a>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-medium">Explore</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/opportunities" className="hover:text-foreground">
                All opportunities
              </Link>
            </li>
            <li>
              <Link href="/opportunities?type=FELLOWSHIP" className="hover:text-foreground">
                Fellowships
              </Link>
            </li>
            <li>
              <Link href="/opportunities?type=CFP_CONFERENCE" className="hover:text-foreground">
                Calls for papers
              </Link>
            </li>
            <li>
              <Link href="/opportunities?funding=FULLY_FUNDED" className="hover:text-foreground">
                Fully funded
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-foreground">
                Submit an opportunity
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Stay in the loop</p>
          {newsletterSlot ?? (
            <p className="text-sm text-muted-foreground">
              Weekly digest of new and closing-soon opportunities.
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        MIT licensed · Created by{" "}
        <a
          href="https://www.linkedin.com/in/smasifhossain/"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          S M Asif Hossain
        </a>{" "}
        · Built by the community, for the community
      </div>
    </footer>
  );
}
