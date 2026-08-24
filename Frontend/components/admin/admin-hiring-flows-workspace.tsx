"use client";

import {
  Check,
  ChevronDown,
  GitBranch,
  LayoutTemplate,
  ListChecks,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { adminApi, getApiErrorMessage, type ApiHiringFlow, type ApiHiringFlowStep, type MetaWhatsAppTemplate } from "@/lib/api";
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

function newStepId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function humanizeTemplateName(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function templatesForSelect(
  templates: MetaWhatsAppTemplate[],
  selectedId: string | null | undefined
): MetaWhatsAppTemplate[] {
  const current = String(selectedId || "").trim();
  if (current && !templates.some((template) => template.id === current)) {
    return [
      {
        id: current,
        name: current,
        language: "en",
        status: "APPROVED",
        category: "",
        body: "",
        variableCount: 0,
      },
      ...templates,
    ];
  }
  return templates;
}

function MetaTemplatePicker({
  value,
  templates,
  loading,
  disabled,
  onChange,
}: {
  value: string;
  templates: MetaWhatsAppTemplate[];
  loading?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const options = templatesForSelect(templates, value);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter((template) => {
        const label = humanizeTemplateName(template.name).toLowerCase();
        return (
          template.name.toLowerCase().includes(needle) ||
          label.includes(needle) ||
          template.body.toLowerCase().includes(needle)
        );
      })
    : options;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-8 w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50"
      >
        <span
          className={cn(
            "min-w-0 truncate text-left",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? humanizeTemplateName(value)
            : loading
              ? "Loading Meta templates…"
              : "Select a Meta template"}
        </span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-72 p-0"
      >
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates…"
              aria-label="Search WhatsApp templates"
              className="h-7 pl-7 text-sm"
              autoFocus
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
        </div>
        <div className="max-h-56 overflow-y-auto p-1" role="listbox">
          {filtered.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {needle ? `No templates match “${query.trim()}”` : "No templates"}
            </p>
          ) : (
            filtered.map((template) => {
              const selected = template.id === value;
              return (
                <button
                  key={template.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(template.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                    selected && "bg-muted/60"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {humanizeTemplateName(template.name)}
                  </span>
                  {selected ? (
                    <Check aria-hidden className="size-3.5 shrink-0 text-foreground" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

type OrgOption = { id: string; name: string };

export function AdminHiringFlowsWorkspace() {
  const [flows, setFlows] = useState<ApiHiringFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [draft, setDraft] = useState<ApiHiringFlow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [assignFlow, setAssignFlow] = useState<ApiHiringFlow | null>(null);
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [orgQuery, setOrgQuery] = useState("");
  const [waTemplates, setWaTemplates] = useState<MetaWhatsAppTemplate[]>([]);
  const [waTemplatesError, setWaTemplatesError] = useState<string | null>(null);
  const [waTemplatesLoading, setWaTemplatesLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await adminApi.listHiringFlows();
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

  useEffect(() => {
    if (!draft) return;
    let cancelled = false;
    setWaTemplatesLoading(true);
    setWaTemplatesError(null);
    void adminApi
      .listMetaWhatsAppTemplates()
      .then((result) => {
        if (cancelled) return;
        setWaTemplates(result.items || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setWaTemplates([]);
        setWaTemplatesError(
          getApiErrorMessage(err, "Unable to load WhatsApp templates from Meta.")
        );
      })
      .finally(() => {
        if (!cancelled) setWaTemplatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [Boolean(draft)]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flows;
    return flows.filter((flow) => flow.name.toLowerCase().includes(q));
  }, [flows, query]);

  const filteredOrgs = useMemo(() => {
    const q = orgQuery.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter((org) => org.name.toLowerCase().includes(q));
  }, [orgs, orgQuery]);

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const created = await adminApi.createHiringFlow({
        name: createName.trim(),
        category: "general",
        status: "draft",
      });
      setCreateOpen(false);
      setCreateName("");
      await refresh();
      setDraft(created);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create hiring flow."));
    } finally {
      setCreating(false);
    }
  }

  async function handleSave() {
    if (!draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await adminApi.updateHiringFlow(draft.id, {
        name: draft.name,
        description: draft.description,
        category: draft.category,
        status: draft.status as "draft" | "active" | "archived",
        steps: draft.steps,
        entryStepId: draft.entryStepId,
      });
      setFlows((previous) =>
        previous.map((flow) => (flow.id === updated.id ? updated : flow))
      );
      setDraft(null);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Unable to save hiring flow."));
    } finally {
      setSaving(false);
    }
  }

  async function openAssign(flow: ApiHiringFlow) {
    setAssignFlow(flow);
    setSelectedOrgIds((flow.assignedOrganizations || []).map((org) => org.id));
    setOrgQuery("");
    try {
      const result = await adminApi.listOrganizations({ page: 1, limit: 100 });
      setOrgs(
        (result.items || []).map((org) => ({
          id: String(org.id || ""),
          name: String(org.name || "Organization"),
        }))
      );
    } catch {
      setOrgs(flow.assignedOrganizations || []);
    }
  }

  async function handleAssign() {
    if (!assignFlow) return;
    setAssigning(true);
    try {
      const updated = await adminApi.assignHiringFlow(assignFlow.id, selectedOrgIds);
      setFlows((previous) =>
        previous.map((flow) => (flow.id === updated.id ? updated : flow))
      );
      if (draft?.id === updated.id) setDraft(updated);
      setAssignFlow(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to assign hiring flow."));
    } finally {
      setAssigning(false);
    }
  }

  function updateStep(stepId: string, patch: Partial<ApiHiringFlowStep>) {
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
      const last = steps.at(-1);
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
    setDraft((previous) => {
      if (!previous) return previous;
      const target = previous.steps.find((step) => step.id === stepId);
      if (!target || target.type === "send_whatsapp_template") return previous;
      const remaining = previous.steps.filter((step) => step.id !== stepId);
      return {
        ...previous,
        entryStepId:
          previous.entryStepId === stepId
            ? remaining[0]?.id ?? null
            : previous.entryStepId,
        steps: remaining.map((step) => ({
          ...step,
          nextStepId: step.nextStepId === stepId ? null : step.nextStepId,
          branches: (step.branches || []).filter(
            (branch) => branch.nextStepId !== stepId
          ),
        })),
      };
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Hiring flows"
        description="Create playbooks and assign them to organisations. Recruiters can add questions, but cannot change the first WhatsApp message or create new flows."
        actions={
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (open) setCreateName("");
            }}
          >
            <DialogTrigger
              render={
                <Button size="sm">
                  <Plus aria-hidden />
                  New flow
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create hiring flow</DialogTitle>
                <DialogDescription>
                  Starts empty. Pick the first WhatsApp template and add questions in the editor.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="admin-flow-name">Name</Label>
                  <Input
                    id="admin-flow-name"
                    value={createName}
                    onChange={(event) => setCreateName(event.target.value)}
                    placeholder="e.g. Warehouse hiring"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleCreate()}
                  disabled={creating || !createName.trim()}
                >
                  {creating ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search catalog flows…"
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
          icon={LayoutTemplate}
          title="No catalog flows yet"
          description="Create a playbook from scratch, then assign it to organisations."
          actionLabel="New flow"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((flow) => (
            <li key={flow.id} className="flex items-start gap-3 px-4 py-3">
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  setDraft(structuredClone(flow));
                  setSaveError(null);
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{flow.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    {flow.category.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(flow.assignedOrganizations || []).length} org
                    {(flow.assignedOrganizations || []).length === 1 ? "" : "s"}
                  </span>
                </div>
                {flow.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {flow.description}
                  </p>
                ) : null}
              </button>
              <Button size="sm" variant="outline" onClick={() => void openAssign(flow)}>
                <Users aria-hidden />
                Assign
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setDraft(structuredClone(flow));
                  setSaveError(null);
                }}
              >
                Edit
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={Boolean(draft)}
        onOpenChange={(open) => {
          if (!open) setDraft(null);
        }}
      >
        <SheetContent className="gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-2xl">
          {draft ? (
            <>
              <SheetHeader className="border-b border-border pr-12">
                <SheetTitle>Edit catalog flow</SheetTitle>
                <SheetDescription>
                  Changing the first WhatsApp message updates assigned organisation copies.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-5">
                <section className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="admin-edit-name">Name</Label>
                    <Input
                      id="admin-edit-name"
                      value={draft.name}
                      onChange={(event) =>
                        setDraft({ ...draft, name: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="admin-edit-desc">Description</Label>
                    <Textarea
                      id="admin-edit-desc"
                      value={draft.description || ""}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value || null })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-edit-category">Category</Label>
                    <Input
                      id="admin-edit-category"
                      value={draft.category}
                      onChange={(event) =>
                        setDraft({ ...draft, category: event.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select
                      value={draft.status}
                      onValueChange={(value) =>
                        setDraft({ ...draft, status: value || draft.status })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">Steps</h3>
                    <Button size="sm" variant="outline" onClick={addQuestionStep}>
                      <Plus aria-hidden />
                      Add question
                    </Button>
                  </div>
                  <ol className="space-y-3">
                    {draft.steps.map((step, index) => (
                      <li
                        key={step.id}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <div className="mb-3 flex items-start gap-3">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <Input
                              id={`step-label-${step.id}`}
                              value={step.label || ""}
                              onChange={(event) =>
                                updateStep(step.id, {
                                  label: event.target.value || null,
                                })
                              }
                              placeholder={STEP_TYPE_LABEL[step.type]}
                              aria-label="Step title"
                              className="h-8 font-medium"
                            />
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <StepTypeIcon type={step.type} />
                              {STEP_TYPE_LABEL[step.type]}
                              {index === 0 ? " · first message" : ""}
                            </p>
                          </div>
                          {step.type !== "send_whatsapp_template" ? (
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label="Remove step"
                              onClick={() => removeStep(step.id)}
                            >
                              <Trash2 aria-hidden />
                            </Button>
                          ) : null}
                        </div>
                        {step.type === "send_whatsapp_template" ? (
                          <div className="space-y-1.5">
                            <Label>WhatsApp template</Label>
                            <MetaTemplatePicker
                              value={step.whatsappTemplateId || ""}
                              templates={waTemplates}
                              loading={waTemplatesLoading}
                              onChange={(next) =>
                                updateStep(step.id, { whatsappTemplateId: next })
                              }
                            />
                            {waTemplatesError ? (
                              <p className="text-xs text-destructive">{waTemplatesError}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Approved templates from the connected Meta WABA.
                              </p>
                            )}
                          </div>
                        ) : null}
                        {step.type === "ask_question" ? (
                          <div className="space-y-3">
                            <Textarea
                              value={step.prompt || ""}
                              onChange={(event) =>
                                updateStep(step.id, { prompt: event.target.value })
                              }
                              rows={3}
                              placeholder="Question prompt…"
                            />
                            <Select
                              value={step.answerType || "Short text"}
                              onValueChange={(value) =>
                                updateStep(step.id, { answerType: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Short text">Short text</SelectItem>
                                <SelectItem value="Yes / No">Yes / No</SelectItem>
                                <SelectItem value="Number">Number</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null}
                        {step.type === "branch" ? (
                          <ul className="space-y-2 text-xs text-muted-foreground">
                            {(step.branches || []).map((branch, branchIndex) => (
                              <li key={`${step.id}-${branchIndex}`}>
                                If {branch.match}
                                {branch.value ? ` “${branch.value}”` : ""} → {branch.nextStepId}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
              <SheetFooter className="flex-row items-center justify-end gap-2 border-t border-border">
                {saveError ? (
                  <p className="mr-auto text-sm text-destructive" role="alert">
                    {saveError}
                  </p>
                ) : null}
                <Button variant="outline" onClick={() => setDraft(null)}>
                  Close
                </Button>
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" aria-hidden /> : null}
                  Save flow
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <Dialog
        open={Boolean(assignFlow)}
        onOpenChange={(open) => {
          if (!open) setAssignFlow(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign to organisations</DialogTitle>
            <DialogDescription>
              {assignFlow
                ? `“${assignFlow.name}” will appear under Templates for selected organisations.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <Input
            value={orgQuery}
            onChange={(event) => setOrgQuery(event.target.value)}
            placeholder="Search organisations…"
          />
          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {filteredOrgs.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-muted-foreground">
                No organisations found.
              </li>
            ) : (
              filteredOrgs.map((org) => {
                const checked = selectedOrgIds.includes(org.id);
                return (
                  <li key={org.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60",
                        checked && "bg-muted/40"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-3.5 accent-primary"
                        checked={checked}
                        onChange={() =>
                          setSelectedOrgIds((previous) =>
                            checked
                              ? previous.filter((id) => id !== org.id)
                              : [...previous, org.id]
                          )
                        }
                      />
                      {org.name}
                    </label>
                  </li>
                );
              })
            )}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFlow(null)}>
              Cancel
            </Button>
            <Button onClick={() => void handleAssign()} disabled={assigning}>
              {assigning ? <Loader2 className="animate-spin" aria-hidden /> : null}
              Save assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
