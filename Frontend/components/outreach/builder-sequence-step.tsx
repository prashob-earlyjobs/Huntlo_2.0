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
  ensureDefaultSequenceSteps,
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
  getDefaultWhatsAppTemplate,
  getWhatsAppTemplateById,
  isApprovedWhatsAppTemplateId,
  listWhatsAppTemplatesForSlot,
  slotForWhatsAppTemplateId,
  WHATSAPP_FREE_TEXT_TEMPLATE_ID,
  whatsappSlotForMessageIndex,
  type WhatsAppTemplateSlot,
} from "@/lib/whatsapp-outreach";
import {
  defaultAiVoiceStepBody,
  isRoshniAgentPrompt,
  LEGACY_AI_VOICE_SCRIPT,
  ROSHNI_INTRODUCTION,
} from "@/lib/roshni-agent-prompt";
import {
  makeStep,
  DELAY_UNIT_OPTIONS,
  formatStepDelay,
  PERSONALIZATION_VARIABLES,
  SEND_WINDOWS,
  STEP_CHANNELS,
  STEP_TYPE_ICONS,
  STEP_TYPES,
  type DelayUnit,
  type SequenceStep,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

function delaySummary(step: SequenceStep, isImmediate: boolean): string {
  if (isImmediate) return "Immediate";
  return formatStepDelay(step.delayDays, step.delayUnit ?? "days");
}

function StepEditor({
  step,
  onChange,
  templateOptions,
  whatsappSlot,
  isFirstStep,
}: {
  step: SequenceStep;
  onChange: (next: SequenceStep) => void;
  templateOptions: string[];
  whatsappSlot: WhatsAppTemplateSlot | null;
  isFirstStep: boolean;
}) {
  const channel = STEP_CHANNELS[step.type];
  const isMessage = channel !== undefined;
  const isEmail = step.type === "Send Email";
  const isWhatsApp = step.type === "Send WhatsApp";
  const isAiVoice = step.type === "Start AI Voice Call";
  const isWait = step.type === "Wait";
  const lockedWhatsAppTemplate = isApprovedWhatsAppTemplateId(step.templateId);
  const effectiveWhatsAppSlot: WhatsAppTemplateSlot | null =
    whatsappSlot ??
    slotForWhatsAppTemplateId(step.templateId) ??
    (lockedWhatsAppTemplate ? "opening" : null);
  // Only the first sequence step is forced immediate; later steps (including
  // WhatsApp "opening" templates used mid-sequence) keep editable delays.
  const isOpeningMessage = isFirstStep;
  const delayUnit = step.delayUnit ?? "days";
  const delayMax =
    DELAY_UNIT_OPTIONS.find((option) => option.value === delayUnit)?.max ?? 30;
  const whatsappTemplates = effectiveWhatsAppSlot
    ? listWhatsAppTemplatesForSlot(effectiveWhatsAppSlot)
    : [];
  const options = templateOptions.includes(step.template)
    ? templateOptions
    : [step.template, ...templateOptions];
  const showLockedTemplate = Boolean(isWhatsApp && effectiveWhatsAppSlot);

  useEffect(() => {
    if (!isAiVoice) return;
    const trimmed = step.body.trim();
    if (!trimmed || trimmed === LEGACY_AI_VOICE_SCRIPT) {
      onChange({
        ...step,
        body: defaultAiVoiceStepBody(),
        template: "Roshni agent prompt",
      });
    }
    // Seed once when opening an empty / legacy AI voice step.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when step id/body stub changes
  }, [isAiVoice, step.id, step.body]);

  return (
    <div className="space-y-4 border-t border-border px-4 py-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {isOpeningMessage ? (
          <Field label="When to send" htmlFor={`${step.id}-delay`}>
            <Input
              id={`${step.id}-delay`}
              value="Immediate"
              readOnly
              aria-readonly
              className="bg-muted/40 text-muted-foreground"
            />
            <p className="pt-1 text-xs text-muted-foreground">
              Opening message sends as soon as the campaign launches (within the
              send window).
            </p>
          </Field>
        ) : (
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
        )}
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
              {showLockedTemplate ? (
                <Select
                  value={
                    step.templateId ||
                    getDefaultWhatsAppTemplate(effectiveWhatsAppSlot!)?.id ||
                    ""
                  }
                  onValueChange={(value) => {
                    if (!value) return;
                    const picked = getWhatsAppTemplateById(value);
                    if (!picked) return;
                    onChange({
                      ...step,
                      templateId: picked.id,
                      template: picked.name,
                      body: picked.body,
                    });
                  }}
                >
                  <SelectTrigger id={`${step.id}-template`} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {whatsappTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : isWhatsApp ? (
                <Input
                  id={`${step.id}-template`}
                  value="Free-text / AI reply follow-up"
                  readOnly
                  className="bg-muted/40 text-muted-foreground"
                />
              ) : (
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
              )}
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
          label={
            isAiVoice
              ? "Agent prompt"
              : showLockedTemplate
                ? "Approved template (read-only)"
                : "Message body"
          }
          htmlFor={`${step.id}-body`}
        >
          {isAiVoice ? (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Roshni screening prompt. Qualification questions from the next
                step fill into {"{jd_screening_questions_list}"} at dial time.
                Edit freely, or reset to the default.
              </p>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() =>
                  onChange({
                    ...step,
                    body: defaultAiVoiceStepBody(),
                    template: "Roshni agent prompt",
                  })
                }
              >
                Reset to Roshni default
              </Button>
            </div>
          ) : null}
          <Textarea
            id={`${step.id}-body`}
            value={step.body}
            readOnly={showLockedTemplate}
            aria-readonly={showLockedTemplate || undefined}
            onChange={(event) => {
              if (showLockedTemplate) return;
              onChange({
                ...step,
                body: event.target.value,
                ...(isWhatsApp
                  ? {
                      templateId: WHATSAPP_FREE_TEXT_TEMPLATE_ID,
                      template: "Free text",
                    }
                  : {}),
                ...(isAiVoice
                  ? {
                      template: isRoshniAgentPrompt(event.target.value)
                        ? "Roshni agent prompt"
                        : "Custom agent prompt",
                    }
                  : {}),
              });
            }}
            className={cn(
              isAiVoice
                ? "h-64 max-h-80 min-h-48 resize-y overflow-y-auto font-mono text-xs leading-relaxed [field-sizing:fixed]"
                : "min-h-28 font-mono text-xs leading-relaxed",
              showLockedTemplate && "bg-muted/40 text-muted-foreground"
            )}
            style={isAiVoice ? { fieldSizing: "fixed" } : undefined}
          />
          {showLockedTemplate ? (
            <p className="pt-1 text-xs text-muted-foreground">
              Meta sends this approved template. {"{{1}}"} = first name, {"{{2}}"}{" "}
              = job title. Body cannot be edited — pick another approved template
              above if needed.
            </p>
          ) : isAiVoice ? (
            <p className="pt-1 text-xs text-muted-foreground">
              Opening line stays{" "}
              <span className="font-mono">{ROSHNI_INTRODUCTION}</span> unless
              you change campaign voice settings. Leave{" "}
              <span className="font-mono">{"{callee_name}"}</span> for the dialer.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground">Insert:</span>
              {PERSONALIZATION_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() =>
                    onChange({ ...step, body: `${step.body} ${variable}` })
                  }
                  className="rounded-md bg-brand-subtle px-1.5 py-0.5 font-mono text-[11px] text-primary outline-none transition-colors hover:bg-brand-subtle/70 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {variable}
                </button>
              ))}
            </div>
          )}
        </Field>
      ) : isWait ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          Wait step — only the delay above is used. No message is sent here.
          WhatsApp follow-ups use approved Meta templates on the next Send
          WhatsApp steps.
        </p>
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
        <div className="max-w-sm">
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

  // Fix sequences that still lead with Wait after channel pruning (Email→WhatsApp).
  // Always keep at least one default send step visible.
  useEffect(() => {
    const supportedSteps = state.steps.filter(
      (step) =>
        step.type !== "Conditional Branch" &&
        step.type !== "Wait" &&
        step.type !== "Create Recruiter Task"
    );
    if (supportedSteps.length !== state.steps.length) {
      const next =
        supportedSteps.length > 0
          ? supportedSteps
          : ensureDefaultSequenceSteps([], state.enabledChannels);
      update("steps", next);
      setExpanded((current) =>
        next.some((step) => step.id === current) ? current : (next[0]?.id ?? null)
      );
      return;
    }

    if (state.steps.length === 0) {
      const seeded = ensureDefaultSequenceSteps([], state.enabledChannels);
      update("steps", seeded);
      setExpanded(seeded[0]?.id ?? null);
      return;
    }
    const firstMessage = state.steps.findIndex((step) =>
      Boolean(STEP_CHANNELS[step.type])
    );
    if (firstMessage > 0) {
      update("steps", state.steps.slice(firstMessage));
      setExpanded(state.steps[firstMessage]?.id ?? null);
      return;
    }
    if (firstMessage < 0) {
      const seeded = ensureDefaultSequenceSteps(
        state.steps,
        state.enabledChannels
      );
      update("steps", seeded);
      setExpanded(seeded[0]?.id ?? null);
      return;
    }
    const first = state.steps[0];
    if (first && first.delayDays !== 0) {
      update(
        "steps",
        state.steps.map((step, index) =>
          index === 0 ? { ...step, delayDays: 0 } : step
        )
      );
    }
  }, [state.steps, state.enabledChannels, update]);

  function setSteps(steps: BuilderState["steps"]) {
    update("steps", steps);
  }

  function addStep(type: (typeof STEP_TYPES)[number]) {
    const step = makeStep(type);
    if (type === "Send WhatsApp") {
      const waCount = state.steps.filter((item) => item.type === "Send WhatsApp")
        .length;
      const slot = whatsappSlotForMessageIndex(waCount);
      if (slot) {
        const picked = getDefaultWhatsAppTemplate(slot);
        if (picked) {
          step.templateId = picked.id;
          step.template = picked.name;
          step.body = picked.body;
        }
      } else {
        step.templateId = WHATSAPP_FREE_TEXT_TEMPLATE_ID;
        step.template = "Free text";
        step.body = "";
      }
    }
    setSteps([...state.steps, step]);
    setExpanded(step.id);
  }

  function updateStep(next: SequenceStep) {
    setSteps(
      state.steps.map((step, index) => {
        if (step.id !== next.id) return step;
        // Opening / first send always goes out immediately.
        if (index === 0) return { ...next, delayDays: 0 };
        return next;
      })
    );
  }

  function duplicateStep(index: number) {
    const source = state.steps[index];
    const copy = { ...source, id: `${source.id}-copy-${Date.now()}` };
    const steps = [...state.steps];
    steps.splice(index + 1, 0, copy);
    setSteps(steps);
  }

  function deleteStep(index: number) {
    if (state.steps.length <= 1) return;
    const remaining = state.steps.filter((_, i) => i !== index);
    setSteps(ensureDefaultSequenceSteps(remaining, state.enabledChannels));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= state.steps.length) return;
    const steps = [...state.steps];
    [steps[index], steps[target]] = [steps[target], steps[index]];
    setSteps(steps);
  }

  const availableStepTypes = STEP_TYPES.filter((type) => {
    if (
      type === "Conditional Branch" ||
      type === "Wait" ||
      type === "Create Recruiter Task"
    ) {
      return false;
    }
    const channel = STEP_CHANNELS[type];
    return !channel || state.enabledChannels.includes(channel);
  });

  return (
    <StepCard
      title="Sequence"
      description={
        isSingleChannelCampaign(state)
          ? `Steps run in order on ${state.enabledChannels[0] ?? "the selected channel"} only.`
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
            const whatsappIndex = state.steps
              .slice(0, index + 1)
              .filter((item) => item.type === "Send WhatsApp").length - 1;
            const whatsappSlot =
              step.type === "Send WhatsApp"
                ? whatsappSlotForMessageIndex(whatsappIndex)
                : null;
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
                        {delaySummary(step, index === 0)}
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
                        disabled={state.steps.length <= 1}
                        onClick={() => deleteStep(index)}
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>

                  {isOpen ? (
                    <StepEditor
                      step={index === 0 ? { ...step, delayDays: 0 } : step}
                      onChange={updateStep}
                      templateOptions={templateOptions}
                      whatsappSlot={whatsappSlot}
                      isFirstStep={index === 0}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        {availableStepTypes.length === 1 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => addStep(availableStepTypes[0]!)}
          >
            <Plus aria-hidden />
            Add {availableStepTypes[0]}
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button type="button" size="sm" variant="outline" />}
            >
              <Plus aria-hidden />
              Add Step
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {availableStepTypes.map((type) => {
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
        )}
      </div>
    </StepCard>
  );
}
