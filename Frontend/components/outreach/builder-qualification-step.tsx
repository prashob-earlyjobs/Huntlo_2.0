"use client";

import { Plus, Trash2 } from "lucide-react";

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
import {
  ANSWER_TYPES,
  TAKEOVER_CONDITIONS,
  type AnswerType,
  type QualificationQuestion,
} from "@/lib/mock-outreach";

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

  return (
    <StepCard
      title="Qualification"
      description="Configure how the AI assistant classifies replies and qualifies interested candidates."
    >
      <div className="space-y-5">
        <ErrorList errors={errors} />

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Reply handling
          </h3>
          <div className="grid gap-2 lg:grid-cols-2">
            <ToggleRow
              id="qual-classification"
              label="Classify replies as interested / not interested"
              description="The AI reads every reply and updates the candidate's status automatically."
              checked={state.classificationEnabled}
              onChange={(checked) => update("classificationEnabled", checked)}
            />
            <ToggleRow
              id="qual-ai-reply"
              label="AI reply enabled"
              description="Let the AI answer candidate questions and ask qualification questions."
              checked={state.aiReplyEnabled}
              onChange={(checked) => update("aiReplyEnabled", checked)}
            />
          </div>
          {state.aiReplyEnabled ? (
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
          ) : null}
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Qualification questions
            </h3>
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
              Add Question
            </Button>
          </div>

          {state.questions.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              No qualification questions — every interested reply is treated as
              qualified.
            </p>
          ) : (
            <ol className="space-y-2">
              {state.questions.map((question, index) => (
                <li
                  key={question.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_170px_auto]">
                    <Field
                      label={`Question ${index + 1}`}
                      htmlFor={`${question.id}-text`}
                      required
                    >
                      <Input
                        id={`${question.id}-text`}
                        value={question.text}
                        onChange={(event) =>
                          updateQuestion(question.id, {
                            text: event.target.value,
                          })
                        }
                        placeholder="e.g. What is your notice period?"
                        aria-invalid={showErrors && !question.text.trim()}
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
                        <SelectTrigger
                          id={`${question.id}-type`}
                          className="w-full"
                        >
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
                        placeholder="Knockout condition, e.g. Reject if more than 60"
                        aria-label={`Knockout condition for question ${index + 1}`}
                        className="h-7 text-xs"
                      />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            After qualification
          </h3>
          <div className="grid gap-2 lg:grid-cols-2">
            <ToggleRow
              id="qual-screening"
              label="Auto-start AI screening"
              description="Qualified candidates are automatically enrolled in an AI voice screening."
              checked={state.autoScreening}
              onChange={(checked) => update("autoScreening", checked)}
            />
            <ToggleRow
              id="qual-calendly"
              label="Auto-send Calendly link"
              description="Send the campaign owner's scheduling link once a candidate qualifies."
              checked={state.autoCalendly}
              onChange={(checked) => update("autoCalendly", checked)}
            />
          </div>
        </section>
      </div>
    </StepCard>
  );
}
