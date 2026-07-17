"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorList, Field, StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import {
  isSingleChannelCampaign,
  stepErrors,
} from "@/components/outreach/builder-types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { templatesApi } from "@/lib/api";
import {
  makeStep,
  DELAY_UNIT_OPTIONS,
  formatStepDelay,
  PERSONALIZATION_VARIABLES,
  RETRY_OPTIONS,
  SEND_WINDOWS,
  STEP_CHANNELS,
  STEP_TYPE_ICONS,
  STEP_TYPES,
  type DelayUnit,
  type SequenceStep,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

function delaySummary(step: SequenceStep): string {
  return formatStepDelay(step.delayDays, step.delayUnit ?? "days");
}

function StepEditor({
  step,
  onChange,
  templateOptions,
}: {
  step: SequenceStep;
  onChange: (next: SequenceStep) => void;
  templateOptions: string[];
}) {
  const channel = STEP_CHANNELS[step.type];
  const isMessage = channel !== undefined;
  const isEmail = step.type === "Send Email";
  const delayUnit = step.delayUnit ?? "days";
  const delayMax =
    DELAY_UNIT_OPTIONS.find((option) => option.value === delayUnit)?.max ?? 30;
  // Always keep the step's own configured template selectable, plus a blank baseline.
  const options = templateOptions.includes(step.template)
    ? templateOptions
    : [step.template, ...templateOptions];

  return (
    <div className="space-y-4 border-t border-border px-4 py-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Delay" htmlFor={`${step.id}-delay`}>
          <div className="flex gap-2">
            <Input
              id={`${step.id}-delay`}
              type="number"
              min={0}
              max={delayMax}
              value={step.delayDays}
              onChange={(event) =>
                onChange({
                  ...step,
                  delayDays: Math.min(
                    delayMax,
                    Math.max(0, Number(event.target.value) || 0)
                  ),
                })
              }
              className="min-w-0 flex-1"
            />
            <Select
              value={delayUnit}
              onValueChange={(value) => {
                if (!value) return;
                const nextUnit = value as DelayUnit;
                const nextMax =
                  DELAY_UNIT_OPTIONS.find((option) => option.value === nextUnit)
                    ?.max ?? 30;
                onChange({
                  ...step,
                  delayUnit: nextUnit,
                  delayDays: Math.min(step.delayDays, nextMax),
                });
              }}
            >
              <SelectTrigger
                id={`${step.id}-delay-unit`}
                className="w-30 shrink-0"
                aria-label="Delay unit"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_UNIT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Field>
        {isMessage ? (
          <>
            <Field label="Channel" htmlFor={`${step.id}-channel`}>
              <Input
                id={`${step.id}-channel`}
                value={channel}
                readOnly
                aria-readonly
                className="bg-muted/40 text-muted-foreground"
              />
            </Field>
            <Field label="Message template" htmlFor={`${step.id}-template`}>
              <Select
                value={step.template}
                onValueChange={(value) =>
                  value && onChange({ ...step, template: value })
                }
              >
                <SelectTrigger id={`${step.id}-template`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </>
        ) : null}
      </div>

      {isEmail ? (
        <Field label="Subject" htmlFor={`${step.id}-subject`}>
          <Input
            id={`${step.id}-subject`}
            value={step.subject}
            onChange={(event) => onChange({ ...step, subject: event.target.value })}
            placeholder="Subject line"
          />
        </Field>
      ) : null}

      {isMessage || step.type === "Send Scheduling Link" ? (
        <Field
          label={step.type === "Start AI Voice Call" ? "Call script" : "Message body"}
          htmlFor={`${step.id}-body`}
        >
          <Textarea
            id={`${step.id}-body`}
            value={step.body}
            onChange={(event) => onChange({ ...step, body: event.target.value })}
            className="min-h-28 font-mono text-xs leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground">Insert:</span>
            {PERSONALIZATION_VARIABLES.map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => onChange({ ...step, body: `${step.body} ${variable}` })}
                className="rounded-md bg-brand-subtle px-1.5 py-0.5 font-mono text-[11px] text-primary outline-none transition-colors hover:bg-brand-subtle/70 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {variable}
              </button>
            ))}
          </div>
        </Field>
      ) : (
        <Field label="Step notes" htmlFor={`${step.id}-note`}>
          <Textarea
            id={`${step.id}-note`}
            value={step.note}
            onChange={(event) => onChange({ ...step, note: event.target.value })}
            className="min-h-16"
          />
        </Field>
      )}

      {isMessage ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Send window" htmlFor={`${step.id}-window`}>
            <Select
              value={step.sendWindow}
              onValueChange={(value) =>
                value && onChange({ ...step, sendWindow: value })
              }
            >
              <SelectTrigger id={`${step.id}-window`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEND_WINDOWS.map((window) => (
                  <SelectItem key={window} value={window}>
                    {window}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Retry behaviour" htmlFor={`${step.id}-retry`}>
            <Select
              value={step.retry}
              onValueChange={(value) => value && onChange({ ...step, retry: value })}
            >
              <SelectTrigger id={`${step.id}-retry`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETRY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Stop on reply</p>
            <label
              htmlFor={`${step.id}-stop`}
              className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border px-2.5 text-sm text-foreground"
            >
              <input
                id={`${step.id}-stop`}
                type="checkbox"
                checked={step.stopOnReply}
                onChange={(event) =>
                  onChange({ ...step, stopOnReply: event.target.checked })
                }
                className="size-3.5 accent-primary"
              />
              Pause sequence when the candidate replies
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SequenceStepBuilder({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(
    state.steps[0]?.id ?? null
  );
  const [templateOptions, setTemplateOptions] = useState<string[]>([
    "Blank message",
  ]);
  const errors = showErrors ? stepErrors(3, state) : [];

  useEffect(() => {
    let cancelled = false;
    void templatesApi
      .list({ archived: false })
      .then((items) => {
        if (cancelled) return;
        const names = ["Blank message", ...items.map((item) => item.name)];
        setTemplateOptions([...new Set(names)]);
      })
      .catch(() => {
        // Keep only the blank baseline when the templates API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setSteps(steps: BuilderState["steps"]) {
    update("steps", steps);
  }

  function addStep(type: (typeof STEP_TYPES)[number]) {
    const step = makeStep(type);
    setSteps([...state.steps, step]);
    setExpanded(step.id);
  }

  function updateStep(next: SequenceStep) {
    setSteps(state.steps.map((step) => (step.id === next.id ? next : step)));
  }

  function duplicateStep(index: number) {
    const source = state.steps[index];
    const copy = { ...source, id: `${source.id}-copy-${Date.now()}` };
    const steps = [...state.steps];
    steps.splice(index + 1, 0, copy);
    setSteps(steps);
  }

  function deleteStep(index: number) {
    setSteps(state.steps.filter((_, i) => i !== index));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= state.steps.length) return;
    const steps = [...state.steps];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setSteps(steps);
  }

  return (
    <StepCard
      title="Sequence"
      description={
        isSingleChannelCampaign(state)
          ? `Steps run in order on ${state.enabledChannels[0] ?? "the selected channel"} only. Non-message steps (wait, tasks) are still available.`
          : "Design the touchpoints candidates receive. Steps run in order using each candidate's timezone rules."
      }
    >
      <div className="space-y-3">
        <ErrorList errors={errors} />

        <ol className="space-y-0">
          {state.steps.map((step, index) => {
            const Icon = STEP_TYPE_ICONS[step.type];
            const channel = STEP_CHANNELS[step.type];
            const isOpen = expanded === step.id;
            const channelEnabled =
              !channel || state.enabledChannels.includes(channel);

            return (
              <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                {index < state.steps.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-10 left-[15px] h-full w-px bg-border"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative mt-2 flex size-8 shrink-0 items-center justify-center rounded-full border",
                    channelEnabled
                      ? "border-border bg-muted text-muted-foreground"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                </span>

                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-xl border bg-card",
                    channelEnabled ? "border-border" : "border-destructive/40"
                  )}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : step.id)}
                      aria-expanded={isOpen}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {index + 1}. {step.type}
                      </span>
                      {channel ? (
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                            channelEnabled
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {channel}
                          {!channelEnabled ? " — not enabled" : ""}
                        </span>
                      ) : null}
                      <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                        {delaySummary(step)}
                        {step.stopOnReply && channel ? " · stops on reply" : ""}
                      </span>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Move step ${index + 1} up`}
                        disabled={index === 0}
                        onClick={() => moveStep(index, -1)}
                      >
                        <ArrowUp aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Move step ${index + 1} down`}
                        disabled={index === state.steps.length - 1}
                        onClick={() => moveStep(index, 1)}
                      >
                        <ArrowDown aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Duplicate step ${index + 1}`}
                        onClick={() => duplicateStep(index)}
                      >
                        <Copy aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="ghost"
                        aria-label={`Delete step ${index + 1}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteStep(index)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>

                  {isOpen ? (
                    <StepEditor
                      step={step}
                      onChange={updateStep}
                      templateOptions={templateOptions}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button type="button" size="sm" variant="outline" />}
          >
            <Plus aria-hidden />
            Add Step
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {STEP_TYPES.filter((type) => {
              const channel = STEP_CHANNELS[type];
              return !channel || state.enabledChannels.includes(channel);
            }).map((type) => {
              const Icon = STEP_TYPE_ICONS[type];
              return (
                <DropdownMenuItem key={type} onClick={() => addStep(type)}>
                  <Icon aria-hidden />
                  {type}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </StepCard>
  );
}
