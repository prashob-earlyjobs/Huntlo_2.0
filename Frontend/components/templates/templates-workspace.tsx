"use client";

import {
  Archive,
  ArchiveRestore,
  AudioLines,
  CalendarClock,
  Check,
  Copy,
  Eye,
  FileText,
  ListChecks,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage, templatesApi } from "@/lib/api";
import { PERSONALIZATION_VARIABLES } from "@/lib/mock-outreach";
import {
  TEMPLATE_TYPES,
  type OutreachTemplate,
  type TemplateType,
} from "@/lib/mock-templates";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<TemplateType, typeof Mail> = {
  Email: Mail,
  WhatsApp: MessageCircle,
  "Voice Script": AudioLines,
  "Qualification Questions": ListChecks,
  "Scheduling Message": CalendarClock,
};

const TYPE_OPTIONS: FilterOption[] = TEMPLATE_TYPES.map((type) => ({
  id: type,
  label: type,
}));

/** Renders template body with highlighted {{placeholders}}. */
function TemplateBody({ body, className }: { body: string; className?: string }) {
  const parts = body.split(/(\{\{[^}]+\}\})/g);
  return (
    <p
      className={cn(
        "text-sm leading-relaxed whitespace-pre-line text-foreground",
        className
      )}
    >
      {parts.map((part, index) =>
        part.startsWith("{{") ? (
          <span
            key={index}
            className="rounded bg-brand-subtle px-1 font-mono text-[0.85em] text-primary"
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </p>
  );
}

function CreateTemplateDialog({
  onCreated,
}: {
  onCreated: (template: OutreachTemplate) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<TemplateType>("Email");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus aria-hidden />
            Create Template
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Reusable message for campaigns. Use placeholders for
            personalisation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tpl-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Intro — role pitch"
                aria-invalid={Boolean(error)}
              />
              {error ? (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) =>
                  value && setType(value as TemplateType)
                }
              >
                <SelectTrigger id="tpl-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "Email" ? (
            <div className="space-y-1.5">
              <Label htmlFor="tpl-subject">Subject</Label>
              <Input
                id="tpl-subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Subject line with {{first_name}}"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">Body</Label>
            <Textarea
              id="tpl-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Hi {{first_name}}, …"
              className="min-h-28 font-mono text-xs leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Insert:</span>
              {PERSONALIZATION_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => setBody((previous) => `${previous} ${variable}`)}
                  className="rounded-md bg-brand-subtle px-1.5 py-0.5 font-mono text-[11px] text-primary outline-none transition-colors hover:bg-brand-subtle/70 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {variable}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => {
              void (async () => {
                if (!name.trim()) {
                  setError("Template name is required.");
                  return;
                }
                if (!body.trim()) {
                  setError("Template body is required.");
                  return;
                }
                setBusy(true);
                setError(null);
                try {
                  const template = await templatesApi.create({
                    name: name.trim(),
                    type,
                    subject: type === "Email" ? subject : null,
                    body: body.trim(),
                  });
                  setCreated(true);
                  onCreated(template);
                  window.setTimeout(() => setCreated(false), 1600);
                } catch (err) {
                  setError(getApiErrorMessage(err));
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            {created ? (
              <>
                <Check aria-hidden />
                Template created
              </>
            ) : busy ? (
              "Creating…"
            ) : (
              "Create Template"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplatesWorkspace() {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [preview, setPreview] = useState<OutreachTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function refresh() {
    try {
      const items = await templatesApi.list({ archived: showArchived });
      setTemplates(items);
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return templates.filter((template) => {
      if (typeFilter.length > 0 && !typeFilter.includes(template.type)) return false;
      if (
        normalized &&
        !`${template.name} ${template.body}`.toLowerCase().includes(normalized)
      ) {
        return false;
      }
      return true;
    });
  }, [query, typeFilter, templates]);

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2200);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates…"
              aria-label="Search templates"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="Type"
              options={TYPE_OPTIONS}
              selected={typeFilter}
              onToggle={(id) =>
                setTypeFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )
              }
            />
            <Button
              size="sm"
              variant={showArchived ? "secondary" : "outline"}
              aria-pressed={showArchived}
              onClick={() => setShowArchived((previous) => !previous)}
            >
              <Archive aria-hidden />
              Archived
            </Button>
            {query || typeFilter.length > 0 ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setTypeFilter([]);
                }}
              >
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
            <CreateTemplateDialog
              onCreated={(template) => {
                setTemplates((previous) => [template, ...previous]);
                flash(`Created “${template.name}”.`);
              }}
            />
          </div>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading templates…</p>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {feedback}
        </p>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => {
            const Icon = TYPE_ICONS[template.type];
            return (
              <article
                key={template.id}
                className="flex flex-col rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon aria-hidden className="size-4 text-muted-foreground" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-foreground">
                      {template.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {template.type} · {template.owner}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Actions for ${template.name}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() => {
                          setPreview(template);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye aria-hidden />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          void templatesApi
                            .duplicate(template.id)
                            .then((copy) => {
                              setTemplates((previous) => [copy, ...previous]);
                              flash(`Duplicated “${template.name}”.`);
                            })
                            .catch((error) => flash(getApiErrorMessage(error)));
                        }}
                      >
                        <Copy aria-hidden />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          void templatesApi
                            .update(template.id, {
                              status: template.archived ? "active" : "archived",
                            })
                            .then(() => {
                              flash(
                                template.archived
                                  ? `Restored “${template.name}”.`
                                  : `Archived “${template.name}”.`
                              );
                              void refresh();
                            })
                            .catch((error) => flash(getApiErrorMessage(error)));
                        }}
                      >
                        {template.archived ? (
                          <>
                            <ArchiveRestore aria-hidden />
                            Restore
                          </>
                        ) : (
                          <>
                            <Archive aria-hidden />
                            Archive
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {template.subject ? (
                  <p className="mt-3 truncate text-xs font-medium text-foreground">
                    Subject: {template.subject}
                  </p>
                ) : null}
                <div className="mt-2 line-clamp-4 flex-1">
                  <TemplateBody body={template.body} className="text-xs" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>
                    Used in{" "}
                    <span className="font-medium text-foreground">
                      {template.usedInCampaigns}
                    </span>{" "}
                    campaigns
                  </span>
                  <span>{template.updated}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : !loading ? (
        <EmptyState
          icon={FileText}
          title={showArchived ? "No archived templates" : "No templates yet"}
          description={
            showArchived
              ? "Archived templates will show up here."
              : "Create a reusable message template for outreach campaigns."
          }
        />
      ) : null}

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{preview?.name ?? "Template"}</SheetTitle>
            <SheetDescription>
              {preview ? `${preview.type} · ${preview.owner}` : null}
            </SheetDescription>
          </SheetHeader>
          {preview ? (
            <ScrollArea className="h-[calc(100vh-8rem)] px-4 pb-6">
              {preview.subject ? (
                <p className="mb-3 text-sm font-medium text-foreground">
                  Subject: {preview.subject}
                </p>
              ) : null}
              <TemplateBody body={preview.body} />
              {preview.variables?.length ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  Variables: {preview.variables.map((v) => `{{${v}}}`).join(", ")}
                </p>
              ) : null}
            </ScrollArea>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
