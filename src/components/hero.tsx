"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 28 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
  });

  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="bg-grid absolute inset-0" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/25 via-fuchsia-400/15 to-cyan-400/25 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-20 pt-24 text-center sm:px-6 sm:pt-32">
        <motion.div {...rise(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-violet-500" />
            Open source · Community driven · Always free
          </span>
        </motion.div>

        <motion.h1
          {...rise(0.1)}
          className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-6xl"
        >
          Never miss an <span className="text-gradient">opportunity</span> again
        </motion.h1>

        <motion.p
          {...rise(0.2)}
          className="mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          Funded workshops, fellowships, conferences, trainings, volunteer roles,
          and calls for papers from around the world, with deadlines, funding
          details, and application links in one place.
        </motion.p>

        <motion.div {...rise(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-12 px-6 text-base shadow-lg shadow-violet-500/25"
            render={<Link href="/opportunities" />}
          >
            Explore opportunities <ArrowRight className="size-4.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-6 text-base"
            render={<Link href="/opportunities?funding=FULLY_FUNDED" />}
          >
            Fully funded only
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
