"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { typeLabels, fundingLabels } from "@/lib/format";
import { submitOpportunity, type SubmitResult } from "@/app/submit/actions";

export function SubmitForm() {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState<SubmitResult, FormData>(
    submitOpportunity,
    undefined
  );

  if (state?.ok) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-14 text-center"
      >
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="text-xl font-bold">Thank you! Submission received.</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          A moderator will review it shortly. You can track its status from
          your dashboard.
        </p>
        <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
      </motion.div>
    );
  }

  return (
    <form action={formAction}>
      {/* Step indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[0, 1].map((s) => (
          <span
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              s === step ? "w-8 bg-primary" : "w-4 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Both step panels stay mounted at all times — remounting would wipe
          the uncontrolled inputs' values before submit. Visibility is a class
          toggle; tw-animate-css classes replay the entrance animation. */}
      <div className="rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur sm:p-8">
        <div>
          <div
            className={
              step === 0
                ? "animate-in fade-in slide-in-from-left-4 space-y-5 duration-300"
                : "hidden"
            }
          >
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. AI Unlocked Workshop"
                  required
                  minLength={5}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Type *</Label>
                  <Select name="type" defaultValue="WORKSHOP" items={typeLabels} required>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="field">Field / discipline</Label>
                  <Input id="field" name="field" placeholder="e.g. Artificial Intelligence" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={5}
                  required
                  minLength={30}
                  placeholder="What is it, who is it for, and why is it worth applying? Include funding details if any."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" placeholder="AI, fully-funded, students" />
              </div>
            </div>

          <div
            className={
              step === 1
                ? "animate-in fade-in slide-in-from-right-4 space-y-5 duration-300"
                : "hidden"
            }
          >
              <div className="space-y-1.5">
                <Label htmlFor="homepageUrl">Homepage URL *</Label>
                <Input
                  id="homepageUrl"
                  name="homepageUrl"
                  type="url"
                  placeholder="https://…"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="applyUrl">Application URL</Label>
                <Input id="applyUrl" name="applyUrl" type="url" placeholder="https://… (if different)" />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input id="deadline" name="deadline" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Starts</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate">Ends</Label>
                  <Input id="endDate" name="endDate" type="date" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="e.g. Boulder" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" placeholder="e.g. United States" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="online" name="online" />
                <Label htmlFor="online">This opportunity is online / remote</Label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Funding *</Label>
                  <Select name="funding" defaultValue="UNKNOWN" items={fundingLabels} required>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fundingLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fundingNotes">Funding details</Label>
                  <Input
                    id="fundingNotes"
                    name="fundingNotes"
                    placeholder="e.g. Travel + lodging reimbursed"
                  />
                </div>
              </div>
            </div>
        </div>

        {state && !state.ok && (
          <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        )}

        <div className="mt-7 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep(0)}
            className={step === 0 ? "invisible" : ""}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step === 0 ? (
            <Button type="button" onClick={() => setStep(1)}>
              Next <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Submit for review
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
