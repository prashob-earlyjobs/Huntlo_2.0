"use client";

import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { ErrorList, Field, StepCard, ToggleRow } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
import { stepErrors } from "@/components/outreach/builder-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage, outreachApi } from "@/lib/api";
import {
  ANSWER_TYPES,
  TAKEOVER_CONDITIONS,
  type AnswerType,
  type QualificationQuestion,
} from "@/lib/mock-outreach";

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
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  function setQuestions(questions: QualificationQuestion[]) {
    update("questions", questions);
  }

  function updateQuestion(id: string, patch: Partial<QualificationQuestion>) {
    setQuestions(
      state.questions.map((question) =>
        question.id === id ? { ...question, ...patch } : question
      )
    );
  }

  async function generateFromJd() {
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
      const mapped: QualificationQuestion[] = result.questions.map((question, index) => ({
        id: question.id || `q-${index + 1}`,
        text: question.prompt,
        answerType: mapAnswerType(question.answerType),
        knockout: Boolean(question.knockout),
        knockoutCondition: question.knockoutCondition || "",
      }));
      if (!mapped.length) {
        setGenerateError("AI returned no questions. Try again.");
        return;
      }
      setQuestions(mapped);
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
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Reply handling
          </h3>
          <Field
            label="Recruiter takeover condition"
            htmlFor="qual-takeover"
            hint="When this condition is met, the conversation is handed to the campaign owner."
          >
            <Select
              value={state.takeoverCondition}
              onValueChange={(value) =>
                value && update("takeoverCondition", value)
              }
            >
              <SelectTrigger id="qual-takeover" className="w-full sm:w-96">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAKEOVER_CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </section>

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
                disabled={generating || !state.jobId}
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
                onClick={() =>
                  setQuestions([
                    ...state.questions,
                    {
                      id: `q-${Date.now()}`,
                      text: "",
                      answerType: "Yes / No",
                      knockout: false,
                      knockoutCondition: "",
                    },
                  ])
                }
              >
                <Plus aria-hidden />
                Add question
              </Button>
            </div>
          </div>
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
                  <div className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                    <Field
                      label={`Question ${index + 1}`}
                      htmlFor={`${question.id}-text`}
                    >
                      <Input
                        id={`${question.id}-text`}
                        value={question.text}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            text: event.target.value,
                          })
                        }
                        placeholder="Ask a screening question…"
                      />
                    </Field>
                    <Field label="Answer type" htmlFor={`${question.id}-type`}>
                      <Select
                        value={question.answerType}
                        onValueChange={(value) =>
                          value &&
                          updateQuestion(question.id, {
                            answerType: value as AnswerType,
                          })
                        }
                      >
                        <SelectTrigger id={`${question.id}-type`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ANSWER_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Input
                        value={question.knockoutCondition}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            knockoutCondition: event.target.value,
                          })
                        }
                        placeholder="Reject if…"
                        className="h-8 text-xs"
                        aria-label={`Knockout condition for question ${index + 1}`}
                      />
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
            <ToggleRow
              id="qual-auto-screening"
              label="Auto-start AI screening"
              description="When a candidate qualifies, schedule them for AI voice screening."
              checked={state.autoScreening}
              onChange={(checked) => update("autoScreening", checked)}
            />
            <ToggleRow
              id="qual-auto-calendly"
              label="Auto-send Calendly"
              description="Send a scheduling link after qualification completes."
              checked={state.autoCalendly}
              onChange={(checked) => update("autoCalendly", checked)}
            />
          </div>
        </section>
      </div>
    </StepCard>
  );
}
