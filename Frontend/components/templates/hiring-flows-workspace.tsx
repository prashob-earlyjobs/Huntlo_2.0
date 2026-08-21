"use client";

import {
  GitBranch,
  ListChecks,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  getApiErrorMessage,
  hiringFlowsApi,
  type ApiHiringFlow,
  type ApiHiringFlowStep,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const STEP_TYPE_LABEL: Record<ApiHiringFlowStep["type"], string> = {
  send_whatsapp_template: "WhatsApp",
  ask_question: "Question",
  branch: "Branch",
};

function StepTypeIcon({ type }: { type: ApiHiringFlowStep["type"] }) {
  const className = "size-3.5 shrink-0";
  if (type === "send_whatsapp_template") {
    return <MessageCircle className={className} aria-hidden />;
  }
  if (type === "branch") {
    return <GitBranch className={className} aria-hidden />;
  }
  return <ListChecks className={className} aria-hidden />;
}

function firstMessageStepId(flow: ApiHiringFlow): string | null {
  const entry =
    flow.steps.find((step) => step.id === flow.entryStepId) || flow.steps[0] || null;
  if (entry?.type === "send_whatsapp_template") return entry.id;
  return flow.steps.find((step) => step.type === "send_whatsapp_template")?.id || entry?.id || null;
}

function newStepId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function templateLabel(templateId: string | null | undefined) {
  const id = String(templateId || "").trim();
  if (!id) return "WhatsApp";
  return id.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function HiringFlowsWorkspace() {
  const [flows, setFlows] = useState<ApiHiringFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ApiHiringFlow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await hiringFlowsApi.list({ limit: 100 });
      setFlows(items);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load hiring flows."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flows;
    return flows.filter(
      (flow) =>
        flow.name.toLowerCase().includes(q) ||
        (flow.description || "").toLowerCase().includes(q) ||
        flow.category.toLowerCase().includes(q)
    );
  }, [flows, query]);

  const lockedStepId = draft ? firstMessageStepId(draft) : null;

  function openEditor(flow: ApiHiringFlow) {
    setSelectedId(flow.id);
    setDraft(structuredClone(flow));
    setSaveError(null);
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await hiringFlowsApi.update(draft.id, {
        description: draft.description,
        steps: draft.steps,
      });
      setFlows((previous) =>
        previous.map((flow) => (flow.id === updated.id ? updated : flow))
      );
      setDraft(null);
      setSelectedId(null);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Unable to save hiring flow."));
    } finally {
      setSaving(false);
    }
  }

  function updateStep(stepId: string, patch: Partial<ApiHiringFlowStep>) {
    if (lockedStepId && stepId === lockedStepId) return;
    setDraft((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        steps: previous.steps.map((step) =>
          step.id === stepId ? { ...step, ...patch } : step
        ),
      };
    });
  }

  function addQuestionStep() {
    setDraft((previous) => {
      if (!previous) return previous;
      const id = newStepId("step-q");
      const steps = previous.steps.map((step) => ({ ...step }));
      const last = [...steps].reverse().find((step) => step.type !== "branch") || steps.at(-1);
      if (last && !last.nextStepId) last.nextStepId = id;
      steps.push({
        id,
        type: "ask_question",
        label: "New question",
        prompt: "",
        answerType: "Short text",
        knockout: false,
        nextStepId: null,
        branches: [],
      });
      return { ...previous, steps };
    });
  }

  function removeStep(stepId: string) {
    if (lockedStepId && stepId === lockedStepId) return;
    setDraft((previous) => {
      if (!previous) return previous;
      return {
        ...previous,
        steps: previous.steps
          .filter((step) => step.id !== stepId)
          .map((step) =>
            step.nextStepId === stepId ? { ...step, nextStepId: null } : step
          ),
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative min-w-[220px] max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search assigned flows…"
          className="pl-8"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading hiring flows…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hiring flows assigned"
          description="Huntlo admin assigns playbooks to your organisation. Once assigned, you can add and edit follow-up questions — the first WhatsApp message stays locked."
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((flow) => (
            <li
              key={flow.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3",
                selectedId === flow.id && "bg-muted/40"
              )}
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => openEditor(flow)}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{flow.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {flow.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {flow.steps.length} steps · used {flow.usageCount}×
                  </span>
                </div>
                {flow.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {flow.description}
                  </p>
                ) : null}
              </button>
              <Button size="sm" variant="outline" onClick={() => openEditor(flow)}>
                Edit questions
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={Boolean(draft)}
        onOpenChange={(open) => {
          if (!open) {
            setDraft(null);
            setSelectedId(null);
          }
        }}
      >
        <SheetContent className="gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-2xl">
          {draft ? (
            <>
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle>{draft.name}</SheetTitle>
                <SheetDescription>
                  You can add or edit questions. The first WhatsApp message is set by Huntlo admin.
                </SheetDescription>
              </SheetHeader>

              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
                <section className="space-y-1.5">
                  <Label htmlFor="edit-desc">Notes</Label>
                  <Textarea
                    id="edit-desc"
                    value={draft.description || ""}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        description: event.target.value || null,
                      })
                    }
                    rows={2}
                  />
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Steps</h3>
                      <p className="text-xs text-muted-foreground">
                        First message is locked. Add questions after it.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={addQuestionStep}>
                      <Plus aria-hidden />
                      Add question
                    </Button>
                  </div>

                  <ol className="space-y-3">
                    {draft.steps.map((step, index) => {
                      const locked = step.id === lockedStepId;
                      return (
                        <li
                          key={step.id}
                          className="rounded-lg border border-border bg-background p-4"
                        >
                          <div className="mb-3 flex items-start gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1 space-y-1">
                              {locked ? (
                                <p className="truncate text-sm font-medium">
                                  {step.label || STEP_TYPE_LABEL[step.type]}
                                </p>
                              ) : (
                                <Input
                                  id={`step-label-${step.id}`}
                                  value={step.label || ""}
                                  onChange={(event) =>
                                    updateStep(step.id, {
                                      label: event.target.value || null,
                                    })
                                  }
                                  placeholder={STEP_TYPE_LABEL[step.type]}
                                  aria-label="Question title"
                                  className="h-8 font-medium"
                                />
                              )}
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <StepTypeIcon type={step.type} />
                                {STEP_TYPE_LABEL[step.type]}
                                {locked ? " · locked" : ""}
                              </p>
                            </div>
                            {!locked && step.type === "ask_question" ? (
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label="Remove question"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 aria-hidden />
                              </Button>
                            ) : null}
                          </div>

                          {step.type === "send_whatsapp_template" ? (
                            <div className="rounded-md bg-muted/60 px-3 py-2 text-sm">
                              <p className="font-medium">
                                {templateLabel(step.whatsappTemplateId)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                First WhatsApp message cannot be changed.
                              </p>
                            </div>
                          ) : null}

                          {step.type === "ask_question" ? (
                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <Label htmlFor={`step-prompt-${step.id}`}>Prompt</Label>
                                <Textarea
                                  id={`step-prompt-${step.id}`}
                                  value={step.prompt || ""}
                                  onChange={(event) =>
                                    updateStep(step.id, { prompt: event.target.value })
                                  }
                                  rows={3}
                                  placeholder="Question prompt…"
                                />
                              </div>
                              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                                <div className="space-y-1.5">
                                  <Label htmlFor={`step-answer-${step.id}`}>
                                    Answer type
                                  </Label>
                                  <Select
                                    value={step.answerType || "Short text"}
                                    onValueChange={(value) =>
                                      updateStep(step.id, { answerType: value })
                                    }
                                  >
                                    <SelectTrigger id={`step-answer-${step.id}`}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Short text">Short text</SelectItem>
                                      <SelectItem value="Yes / No">Yes / No</SelectItem>
                                      <SelectItem value="Number">Number</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <label className="flex h-8 items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    className="size-3.5 accent-primary"
                                    checked={Boolean(step.knockout)}
                                    onChange={(event) =>
                                      updateStep(step.id, {
                                        knockout: event.target.checked,
                                      })
                                    }
                                  />
                                  Knockout
                                </label>
                              </div>
                            </div>
                          ) : null}

                          {step.type === "branch" ? (
                            <ul className="space-y-2">
                              {(step.branches || []).map((branch, branchIndex) => (
                                <li
                                  key={`${step.id}-${branchIndex}`}
                                  className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-muted/60 px-3 py-2 text-xs"
                                >
                                  <span className="text-muted-foreground">If</span>
                                  <span className="font-medium">
                                    {branch.match}
                                    {branch.value ? ` “${branch.value}”` : ""}
                                  </span>
                                  <span className="text-muted-foreground">then</span>
                                  <span className="font-medium">{branch.nextStepId}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              </div>

              <SheetFooter className="flex-row items-center justify-end gap-2 border-t border-border">
                {saveError ? (
                  <p className="mr-auto text-sm text-destructive" role="alert">
                    {saveError}
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(null);
                    setSelectedId(null);
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  Save questions
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
