"use client";

import { Field, StepCard } from "@/components/outreach/builder-ui";
import type { BuilderState, UpdateBuilder } from "@/components/outreach/builder-types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JOBS } from "@/lib/mock-jobs";
import {
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_OWNERS,
  CAMPAIGN_TYPES,
  TIMEZONE_OPTIONS,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

export function SetupStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
}) {
  return (
    <StepCard
      title="Campaign Setup"
      description="Name the campaign, connect it to a job, and decide who owns it."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Campaign name" htmlFor="campaign-name" required>
          <Input
            id="campaign-name"
            value={state.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="e.g. Backend Engineer — Sequence B"
            aria-invalid={showErrors && !state.name.trim()}
          />
          {showErrors && !state.name.trim() ? (
            <p role="alert" className="text-xs text-destructive">
              Campaign name is required.
            </p>
          ) : null}
        </Field>

        <Field
          label="Related job"
          htmlFor="campaign-job"
          hint="Personalisation variables like {{job_title}} resolve from this job."
        >
          <Select
            value={state.jobId}
            onValueChange={(value) => update("jobId", value)}
          >
            <SelectTrigger id="campaign-job" className="w-full">
              <SelectValue placeholder="No related job" />
            </SelectTrigger>
            <SelectContent>
              {JOBS.filter((job) => job.status !== "Archived").map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Campaign objective" htmlFor="campaign-objective" required>
          <Select
            value={state.objective}
            onValueChange={(value) => value && update("objective", value)}
          >
            <SelectTrigger id="campaign-objective" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_OBJECTIVES.map((objective) => (
                <SelectItem key={objective} value={objective}>
                  {objective}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Campaign owner" htmlFor="campaign-owner" required>
          <Select
            value={state.owner}
            onValueChange={(value) => value && update("owner", value)}
          >
            <SelectTrigger id="campaign-owner" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAMPAIGN_OWNERS.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field
          label="Description"
          htmlFor="campaign-description"
          className="lg:col-span-2"
        >
          <Textarea
            id="campaign-description"
            value={state.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="What is this campaign trying to achieve? Visible to your team only."
            className="min-h-20"
          />
        </Field>

        <Field
          label="Candidate timezone handling"
          htmlFor="campaign-timezone"
          hint="Controls when sequence steps are allowed to send."
        >
          <Select
            value={state.timezone}
            onValueChange={(value) => value && update("timezone", value)}
          >
            <SelectTrigger id="campaign-timezone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Campaign type</p>
          <div
            role="radiogroup"
            aria-label="Campaign type"
            className="grid grid-cols-2 gap-2"
          >
            {CAMPAIGN_TYPES.map((type) => {
              const active = state.campaignType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => update("campaignType", type)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                    active
                      ? "border-primary/50 bg-brand-subtle/40 font-medium text-primary"
                      : "border-border text-foreground hover:bg-muted/40"
                  )}
                >
                  {type}
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    {type === "Single Channel"
                      ? "One channel, simple sequence"
                      : "Mix email, WhatsApp and voice"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepCard>
  );
}
