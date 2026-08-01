import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, HeartHandshake, Radar } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animated";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why OpportunityBox exists: making global opportunities discoverable for everyone, not just the well-connected.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <FadeIn>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Opportunity shouldn&apos;t depend on <span className="text-gradient">who you know</span>
        </h1>

        <div className="mt-8 space-y-5 leading-relaxed text-foreground/85">
          <p>
            OpportunityBox started with a single near-miss.{" "}
            <a
              href="https://www.linkedin.com/in/smasifhossain/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Asif
            </a>{" "}
            attended{" "}
            <a
              href="https://nairrpilot.org/ai-unlocked"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              AI Unlocked
            </a>
            , a workshop funded by NAIRR and NSF that fully reimbursed
            participants — but only because his professor happened to mention it
            in passing. No mailing list, no central directory, no way to find
            it. One conversation was the difference between attending and never
            knowing it existed.
          </p>
          <p>
            That raised an uncomfortable question: <em>how many opportunities
            does everyone miss simply because the information never reaches
            them?</em> Funded workshops, fellowships, summer schools, travel
            grants, calls for papers — they&apos;re scattered across hundreds of
            websites, mailing lists, and word-of-mouth networks that favor the
            already-connected.
          </p>
          <p>
            OpportunityBox is the fix: one open-source, free directory of conferences,
            workshops, trainings, fellowships, grants, volunteer roles, and
            calls for papers from around the world — each with its deadline,
            funding details, and application link.
          </p>
          <p>
            OpportunityBox was developed by{" "}
            <a
              href="https://www.linkedin.com/in/smasifhossain/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              S M Asif Hossain
            </a>
            , a PhD student in Computer Science at Wichita State University, in
            collaboration with The Maroon Lab. If the project helps you,
            consider{" "}
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              giving it a star on GitHub
            </a>{" "}
            ⭐ — it helps more people discover these opportunities.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <Radar className="size-5" />,
              title: "Automated discovery",
              body: "Adapters continuously ingest opportunities from public APIs and open datasets like confs.tech, ccf-deadlines, ai-deadlines, and Grants.gov.",
            },
            {
              icon: <HeartHandshake className="size-5" />,
              title: "Community powered",
              body: "Anyone can submit an opportunity. Moderators review submissions before they go live, keeping quality high.",
            },
            {
              icon: <Globe2 className="size-5" />,
              title: "Global & free",
              body: "Worldwide coverage, no paywall, MIT licensed. Run your own instance or contribute a new data source.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-border/70 bg-card/70 p-5 backdrop-blur"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500/15 to-cyan-400/15 text-violet-500 dark:text-violet-400">
                {c.icon}
              </span>
              <h2 className="mt-3 font-semibold">{c.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button size="lg" render={<Link href="/opportunities" />}>
            Start exploring
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<a href={site.repo} target="_blank" rel="noreferrer" />}
          >
            <GitHubIcon className="size-4.5" /> Contribute on GitHub
          </Button>
        </div>
      </FadeIn>
    </div>
  );
}
