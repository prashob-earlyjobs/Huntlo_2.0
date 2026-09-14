"use client";

import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ErrorList, Field, StepCard, ToggleRow } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import { campaignHasAiVoice, stepErrors } from "@/components/outreach/builder-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getApiErrorMessage,
  hiringFlowsApi,
  outreachApi,
  type ApiHiringFlow,
} from "@/lib/api";
import {
  MAX_QUALIFICATION_QUESTIONS,
  suggestQuestionTitle,
  type AnswerType,
  type QualificationQuestion,
} from "@/lib/mock-outreach";
import {
  getDefaultPostQualificationWhatsAppTemplate,
  getWhatsAppTemplateById,
  listPostQualificationWhatsAppTemplates,
} from "@/lib/whatsapp-outreach";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

function mapAnswerType(raw: string): AnswerType {
  const value = raw.toLowerCase();
  if (value.includes("yes") || value.includes("no") || value.includes("boolean")) {
    return "Yes / No";
  }
  if (value.includes("number") || value.includes("day")) return "Number";
  if (value.includes("choice") || value.includes("select")) return "Single choice";
  return "Short text";
}

export function QualificationStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
}) {
  const errors = showErrors ? stepErrors(4, state) : [];
  const hasAiVoice = campaignHasAiVoice(state);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [hiringFlows, setHiringFlows] = useState<ApiHiringFlow[]>([]);
  const [hiringFlowsLoading, setHiringFlowsLoading] = useState(false);
  const whatsappTemplates = listPostQualificationWhatsAppTemplates();
  const selectedWhatsAppTemplate =
    getWhatsAppTemplateById(state.autoWhatsAppTemplateId || "resume_share") ??
    getDefaultPostQualificationWhatsAppTemplate() ??
    whatsappTemplates[0] ??
    null;
  const selectedHiringFlow =
    hiringFlows.find((flow) => flow.id === state.hiringFlowId) || null;

  useEffect(() => {
    let cancelled = false;
    setHiringFlowsLoading(true);
    void hiringFlowsApi
      .list({ limit: 100 })
      .then((items) => {
        if (!cancelled) setHiringFlows(items);
      })
      .catch(() => {
        if (!cancelled) setHiringFlows([]);
      })
      .finally(() => {
        if (!cancelled) setHiringFlowsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function setQuestions(questions: QualificationQuestion[]) {
    update("questions", questions.slice(0, MAX_QUALIFICATION_QUESTIONS));
  }

  function updateQuestion(id: string, patch: Partial<QualificationQuestion>) {
    setQuestions(
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  const atQuestionLimit = state.questions.length >= MAX_QUALIFICATION_QUESTIONS;

  async function generateFromJd() {
    if (atQuestionLimit) {
      setGenerateError(`Maximum ${MAX_QUALIFICATION_QUESTIONS} questions allowed.`);
      return;
    }
    if (!state.jobId) {
      setGenerateError("Select a related job in Campaign Setup first.");
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await outreachApi.generateQualificationQuestions({
        jobId: state.jobId,
        instructions:
          "Generate knockout screening questions from the job description for outreach.",
      });
      const mapped: QualificationQuestion[] = result.questions.map((question, index) => {
        const text = question.prompt;
        return {
          id: question.id || `q-${index + 1}`,
          title: suggestQuestionTitle(text),
          text,
          answerType: mapAnswerType(question.answerType),
          knockout: Boolean(question.knockout),
          knockoutCondition: question.knockoutCondition || "",
        };
      });
      if (!mapped.length) {
        setGenerateError("AI returned no questions. Try again.");
        return;
      }
      setQuestions(mapped.slice(0, MAX_QUALIFICATION_QUESTIONS));
    } catch (error) {
      setGenerateError(
        getApiErrorMessage(error, "Unable to generate questions from the job description.")
      );
    } finally {
      setGenerating(false);
    }
  }

  return (
    <StepCard
      title="Qualification"
      description="AI can generate screening questions from the linked job description, answer candidate questions from the JD, and ask your qualification questions after a reply."
    >
      <div className="space-y-5">
        <ErrorList errors={errors} />
        {generateError ? (
          <p role="alert" className="text-sm text-destructive">
            {generateError}
          </p>
        ) : null}

        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Qualification questions
            </h3>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={generating || !state.jobId || atQuestionLimit}
                onClick={() => void generateFromJd()}
              >
                {generating ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Sparkles aria-hidden />
                )}
                {generating ? "Generating…" : "Generate from JD"}
              </Button>
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={atQuestionLimit}
                onClick={() => {
                  if (atQuestionLimit) return;
                  setQuestions([
                    ...state.questions,
                    {
                      id: `q-${Date.now()}`,
                      title: "",
                      text: "",
                      answerType: "Short text",
                      knockout: false,
                      knockoutCondition: "",
                    },
                  ]);
                }}
              >
                <Plus aria-hidden />
                Add question
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_QUALIFICATION_QUESTIONS} screening questions per campaign
            {state.questions.length > 0
              ? ` (${state.questions.length}/${MAX_QUALIFICATION_QUESTIONS})`
              : ""}
            .
          </p>
          {!state.jobId ? (
            <p className="text-xs text-muted-foreground">
              Link a job in Setup to generate questions from the job description.
            </p>
          ) : null}
          {state.questions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No qualification questions — every interested reply is treated as
              qualified (or generate from the linked JD).
            </p>
          ) : (
            <ul className="space-y-3">
              {state.questions.map((question, index) => (
                <li
                  key={question.id}
                  className="rounded-lg border border-border px-3 py-3"
                >
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,11rem)_1fr_auto]">
                    <Field
                      label="Title"
                      htmlFor={`${question.id}-title`}
                      required
                    >
                      <Input
                        id={`${question.id}-title`}
                        value={question.title}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            title: event.target.value,
                          })
                        }
                        placeholder="e.g. notice period"
                        aria-invalid={
                          showErrors && !question.title.trim()
                        }
                      />
                      {showErrors && !question.title.trim() ? (
                        <p role="alert" className="text-xs text-destructive">
                          Title is required.
                        </p>
                      ) : null}
                    </Field>
                    <Field
                      label={`Question ${index + 1}`}
                      htmlFor={`${question.id}-text`}
                      required
                    >
                      <Input
                        id={`${question.id}-text`}
                        value={question.text}
                        onChange={(event) => {
                          const text = event.target.value;
                          updateQuestion(question.id, {
                            text,
                            ...(!question.title.trim()
                              ? { title: suggestQuestionTitle(text) }
                              : {}),
                          });
                        }}
                        placeholder="Ask a screening question…"
                        aria-invalid={
                          showErrors && !question.text.trim()
                        }
                      />
                    </Field>
                    <div className="flex items-end pb-0.5">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Delete question ${index + 1}`}
                        className="text-destructive hover:text-destructive"
                        onClick={() =>
                          setQuestions(
                            state.questions.filter((q) => q.id !== question.id)
                          )
                        }
                      >
                        <Trash2 aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label
                      htmlFor={`${question.id}-knockout`}
                      className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-foreground"
                    >
                      <input
                        id={`${question.id}-knockout`}
                        type="checkbox"
                        checked={question.knockout}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            knockout: event.target.checked,
                          })
                        }
                        className="size-3.5 accent-primary"
                      />
                      Knockout question
                    </label>
                    {question.knockout ? (
                      <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-input focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50">
                        <span className="flex shrink-0 items-center pl-2.5 text-xs text-muted-foreground">
                          Reject if
                        </span>
                        <Input
                          value={question.knockoutCondition.replace(
                            /^reject\s+if\s+/i,
                            ""
                          )}
                          onChange={(event) =>
                            updateQuestion(question.id, {
                              knockoutCondition: event.target.value,
                            })
                          }
                          placeholder="yes, more than 60…"
                          className="h-8 border-0 text-xs shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
                          aria-label={`Knockout condition for question ${index + 1}`}
                        />
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            After qualification
          </h3>
          <div className="grid gap-2 lg:grid-cols-2">
            {hasAiVoice ? (
              <ToggleRow
                id="qual-auto-whatsapp"
                label="Auto-send WhatsApp"
                description="After the Hunar/Zyvka call, run a hiring flow (or a single WhatsApp template)."
                checked={state.autoWhatsAppAfterQualification}
                onChange={(checked) =>
                  update("autoWhatsAppAfterQualification", checked)
                }
              />
            ) : null}
            <div className="space-y-2">
              <ToggleRow
                id="qual-auto-screening"
                label="Auto-start AI screening"
                description="When a candidate qualifies, schedule them for AI screening."
                checked={state.autoScreening}
                onChange={(checked) => update("autoScreening", checked)}
              />
              {state.autoScreening ? (
                <div
                  className="grid gap-2 sm:grid-cols-2 rounded-lg border border-dashed border-border px-3 py-3"
                  role="radiogroup"
                  aria-label="Screening modality"
                >
                  {(
                    [
                      {
                        key: "voice" as const,
                        title: "Audio",
                        description: "AI voice screening call",
                        disabled: false,
                      },
                      {
                        key: "video" as const,
                        title: "Video",
                        description: "Coming soon",
                        disabled: true,
                      },
                    ] as const
                  ).map((mode) => {
                    const checked = state.autoScreeningModality === mode.key;
                    return (
                      <button
                        key={mode.key}
                        type="button"
                        role="radio"
                        aria-checked={checked}
                        aria-disabled={mode.disabled || undefined}
                        disabled={mode.disabled}
                        onClick={() => {
                          if (mode.disabled) return;
                          update("autoScreeningModality", mode.key);
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                          mode.disabled
                            ? "cursor-not-allowed border-border opacity-50"
                            : "cursor-pointer",
                          !mode.disabled && checked
                            ? "border-primary/50 bg-brand-subtle/20"
                            : !mode.disabled
                              ? "border-border hover:bg-muted/40"
                              : null
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border",
                            checked && !mode.disabled
                              ? "border-primary"
                              : "border-border bg-card"
                          )}
                        >
                          {checked && !mode.disabled ? (
                            <span className="size-2 rounded-full bg-primary" />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {mode.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {mode.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <ToggleRow
              id="qual-auto-calendly"
              label="Auto-send Calendly"
              description="Send a scheduling link after qualification completes."
              checked={state.autoCalendly}
              onChange={(checked) => update("autoCalendly", checked)}
            />
          </div>
          {hasAiVoice && state.autoWhatsAppAfterQualification ? (
            <div className="space-y-3 rounded-lg border border-dashed border-border px-3 py-3">
              <Field
                label="Hiring flow"
                hint="Preferred. Create playbooks under Templates."
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={state.hiringFlowId || "__none__"}
                    onValueChange={(value) =>
                      update(
                        "hiringFlowId",
                        !value || value === "__none__" ? null : value
                      )
                    }
                    disabled={hiringFlowsLoading}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Select a hiring flow">
                        {hiringFlowsLoading
                          ? "Loading flows…"
                          : selectedHiringFlow
                            ? selectedHiringFlow.name
                            : "Template only (no flow)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Template only (no flow)</SelectItem>
                      {hiringFlows.map((flow) => (
                        <SelectItem key={flow.id} value={flow.id}>
                          {flow.name}
                          <span className="ml-1 text-muted-foreground">
                            ({flow.steps.length} steps)
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={ROUTES.templates} target="_blank" />}
                  >
                    Manage
                  </Button>
                </div>
              </Field>
              {!state.hiringFlowId ? (
                <Field
                  label="Fallback WhatsApp template"
                  hint="Used when no hiring flow is selected."
                >
                  <Select
                    value={selectedWhatsAppTemplate?.id ?? "resume_share"}
                    onValueChange={(value) =>
                      update("autoWhatsAppTemplateId", value || null)
                    }
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Select a WhatsApp template">
                        {selectedWhatsAppTemplate
                          ? `${selectedWhatsAppTemplate.name} (${selectedWhatsAppTemplate.metaName})`
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {whatsappTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                          <span className="ml-1 text-muted-foreground">
                            ({template.metaName})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : selectedHiringFlow ? (
                <p className="text-xs text-muted-foreground">
                  Starts with{" "}
                  {selectedHiringFlow.steps.find(
                    (step) => step.id === selectedHiringFlow.entryStepId
                  )?.label ||
                    selectedHiringFlow.steps[0]?.label ||
                    "first step"}
                  · {selectedHiringFlow.steps.length} steps
                </p>
              ) : null}
              {!state.hiringFlowId && selectedWhatsAppTemplate ? (
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                  {selectedWhatsAppTemplate.body}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </StepCard>
  );
}
