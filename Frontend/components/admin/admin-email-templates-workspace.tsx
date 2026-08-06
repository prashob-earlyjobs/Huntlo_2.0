"use client";

import { ChevronDown, Eye, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdminBlogRichTextEditor } from "@/components/admin/admin-blog-rich-text-editor";
import { AdminWhatsAppTemplatesPanel } from "@/components/admin/admin-whatsapp-templates-panel";
import { Field } from "@/components/outreach/builder-ui";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminApi, type EmailTemplate } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { buildEmailPreviewDocument } from "@/lib/email-layout";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type ChannelTab = "email" | "whatsapp";

type FormState = {
  subject: string;
  bodyHtml: string;
  enabled: boolean;
};

/** Display order for the activation V1 emails (single list of 10). */
const TEMPLATE_ORDER: string[] = [
  "post_signup.day_0",
  "event.no_search",
  "event.first_search_completed",
  "event.campaign_draft",
  "event.campaign_live",
  "event.no_replies",
  "event.first_reply",
  "event.try_ai_voice",
  "post_signup.day_6",
  "post_signup.day_7",
];

const PERSONALIZATION_TOKENS = [
  { token: "{{firstName}}", label: "First name" },
  { token: "{{email}}", label: "Email" },
] as const;

function templateToForm(template: EmailTemplate): FormState {
  return {
    subject: template.subject || "",
    bodyHtml: template.bodyHtml || "",
    enabled: Boolean(template.enabled),
  };
}

function formsEqual(a: FormState, b: FormState): boolean {
  return (
    a.subject === b.subject &&
    a.bodyHtml === b.bodyHtml &&
    a.enabled === b.enabled
  );
}

function sortTemplates(items: EmailTemplate[]): EmailTemplate[] {
  const rank = new Map(TEMPLATE_ORDER.map((key, index) => [key, index]));
  return [...items].sort((a, b) => {
    const aRank = rank.get(a.key) ?? 1000 + a.dayOffset;
    const bRank = rank.get(b.key) ?? 1000 + b.dayOffset;
    return aRank - bRank;
  });
}

function dayTimingLabel(template: EmailTemplate): string {
  if (template.type === "event") {
    switch (template.key) {
      case "event.no_search":
        return "First login · after 2h if still no AI search";
      case "event.first_search_completed":
        return "First AI search · instant (skip if already unlocked)";
      case "event.campaign_draft":
        return "Campaign draft created · after 12h if not launched";
      case "event.campaign_live":
        return "Campaign launched · instant confirmation";
      case "event.no_replies":
        return "Campaign live · after 48h if no replies";
      case "event.first_reply":
        return "First candidate reply · instant";
      case "event.try_ai_voice":
        return "First unlock · after 24h if AI Voice unused";
      default:
        return "On product event";
    }
  }
  const dayOffset = template.dayOffset;
  if (dayOffset === 0) return "Immediately after signup";
  if (dayOffset === 2) return "Day +2 · send only if People Scout unused (else skip)";
  if (dayOffset === 3) return "3 days after signup · social proof";
  if (dayOffset === 4) return "4 days after signup · campaigns";
  if (dayOffset === 5) return "5 days after signup · AI magic moment";
  if (dayOffset === 6) return "6 days after signup · 48 hours left";
  if (dayOffset === 7) return "7 days after signup · trial ends today";
  return `${dayOffset} days after signup`;
}

export function AdminEmailTemplatesWorkspace() {
  const { user } = useAuth();
  const [channel, setChannel] = useState<ChannelTab>("email");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState<FormState | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const testEmailSeededRef = useRef(false);

  const dirty = Boolean(form && baseline && !formsEqual(form, baseline));

  function handleChannelChange(next: string) {
    if (next === channel) return;
    if (next !== "email" && next !== "whatsapp") return;
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    if (dirty) closeExpanded();
    setChannel(next);
  }

  const enabledCount = useMemo(
    () => templates.filter((item) => item.enabled).length,
    [templates]
  );

  const preview = useMemo(() => {
    if (!form) return null;
    return buildEmailPreviewDocument({
      subject: form.subject,
      bodyHtml: form.bodyHtml,
    });
  }, [form]);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi.listEmailTemplates();
      setTemplates(sortTemplates(result.items));
    } catch (err) {
      setTemplates([]);
      setError(getApiErrorMessage(err, "Unable to load email templates."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (testEmailSeededRef.current || !user?.email) return;
    testEmailSeededRef.current = true;
    setTestEmail(user.email);
  }, [user?.email]);

  function openTemplate(template: EmailTemplate) {
    const next = templateToForm(template);
    setExpandedId(template.id);
    setForm(next);
    setBaseline(next);
    setError(null);
    setToast(null);
  }

  function closeExpanded() {
    setExpandedId(null);
    setForm(null);
    setBaseline(null);
    setTestEmailOpen(false);
    setPreviewOpen(false);
  }

  function toggleExpand(template: EmailTemplate) {
    if (expandedId === template.id) {
      if (dirty && !window.confirm("Discard unsaved changes?")) return;
      closeExpanded();
      return;
    }
    if (dirty && !window.confirm("Discard unsaved changes on the open email?")) {
      return;
    }
    openTemplate(template);
  }

  function insertToken(token: string) {
    setForm((previous) => {
      if (!previous) return previous;
      return { ...previous, subject: `${previous.subject}${token}` };
    });
  }

  function discardChanges() {
    if (!baseline) return;
    setForm({ ...baseline });
    setToast("Changes discarded.");
  }

  async function handleSave() {
    if (!expandedId || !form) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApi.updateEmailTemplate(expandedId, {
        subject: form.subject,
        bodyHtml: form.bodyHtml,
        enabled: form.enabled,
      });
      const nextForm = templateToForm(updated);
      setForm(nextForm);
      setBaseline(nextForm);
      setTemplates((previous) =>
        sortTemplates(
          previous.map((item) => (item.id === updated.id ? updated : item))
        )
      );
      setToast("Saved.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to save email template."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTest() {
    const to = testEmail.trim();
    if (!expandedId || !form) return;
    if (!to) {
      setError("Enter an email address to send a test email.");
      return;
    }
    if (dirty) {
      setSaving(true);
      setError(null);
      try {
        const updated = await adminApi.updateEmailTemplate(expandedId, {
          subject: form.subject,
          bodyHtml: form.bodyHtml,
          enabled: form.enabled,
        });
        const nextForm = templateToForm(updated);
        setForm(nextForm);
        setBaseline(nextForm);
        setTemplates((previous) =>
          sortTemplates(
            previous.map((item) => (item.id === updated.id ? updated : item))
          )
        );
      } catch (err) {
        setError(getApiErrorMessage(err, "Unable to save before test send."));
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    setSendingTest(true);
    setError(null);
    try {
      const result = await adminApi.sendEmailTemplateTest(expandedId, {
        to,
        firstName: user?.firstName || "Alex",
      });
      if (!result.mailConfigured) {
        setError("SYSTEM_SMTP_* is not configured on the server.");
        return;
      }
      if (!result.sent) {
        setError("Test email failed to send. Check SYSTEM_SMTP_* credentials.");
        return;
      }
      setTestEmailOpen(false);
      setToast(`Test sent to ${result.to} via SYSTEM_SMTP.`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to send test email."));
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Message templates"
        description="Edit activation and lifecycle copy by channel. Email uses SYSTEM_SMTP; WhatsApp templates are stored for delivery wiring."
      />

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      <Tabs value={channel} onValueChange={handleChannelChange}>
        <TabsList>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {enabledCount}/{templates.length || 0} enabled ·{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {"{{firstName}}"}
              </code>{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                {"{{email}}"}
              </code>
            </p>
          </div>

          {loading ? (
            <div className="rounded-lg border border-border bg-card px-3 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : templates.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-3 py-8 text-center text-sm text-muted-foreground">
              No email templates yet.
            </div>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-card">
              {templates.map((template, index) => {
                const isOpen = expandedId === template.id;
                const panelId = `email-tpl-panel-${template.id}`;
                const showForm = isOpen && form;

                return (
                  <li
                    key={template.id}
                    className={cn(
                      "border-b border-border last:border-b-0",
                      !template.enabled && !isOpen && "opacity-60"
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleExpand(template)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring/50",
                        isOpen && "bg-muted/30"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold",
                          template.enabled
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-foreground">
                            {template.name}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded px-1 py-px text-[10px] font-medium",
                              template.enabled
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {template.enabled ? "On" : "Off"}
                          </span>
                          {isOpen && dirty ? (
                            <span className="shrink-0 rounded bg-warning/10 px-1 py-px text-[10px] font-medium text-warning">
                              Unsaved
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {dayTimingLabel(template)}
                        </p>
                      </div>
                      <ChevronDown
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {showForm ? (
                      <div
                        id={panelId}
                        className="space-y-3 border-t border-border bg-background/50 px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-foreground">Enabled</p>
                            <p className="text-[11px] text-muted-foreground">
                              Off emails are skipped at send time.
                            </p>
                          </div>
                          <Switch
                            checked={form.enabled}
                            onCheckedChange={(checked) =>
                              setForm((previous) =>
                                previous ? { ...previous, enabled: checked } : previous
                              )
                            }
                          />
                        </div>

                        <Field label="Subject">
                          <Input
                            value={form.subject}
                            onChange={(event) =>
                              setForm((previous) =>
                                previous
                                  ? { ...previous, subject: event.target.value }
                                  : previous
                              )
                            }
                            maxLength={300}
                          />
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {PERSONALIZATION_TOKENS.map((item) => (
                              <button
                                key={item.token}
                                type="button"
                                onClick={() => insertToken(item.token)}
                                className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </Field>

                        <Field label="Body">
                          <AdminBlogRichTextEditor
                            value={form.bodyHtml}
                            onChange={(html) =>
                              setForm((previous) =>
                                previous ? { ...previous, bodyHtml: html } : previous
                              )
                            }
                          />
                        </Field>

                        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                          <Button
                            size="sm"
                            onClick={() => void handleSave()}
                            disabled={saving || sendingTest || !dirty}
                            aria-busy={saving}
                          >
                            {saving ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            size="icon-xs"
                            variant="outline"
                            onClick={() => setPreviewOpen(true)}
                            aria-label="Preview"
                            title="Preview"
                          >
                            <Eye aria-hidden />
                          </Button>
                          <Popover open={testEmailOpen} onOpenChange={setTestEmailOpen}>
                            <PopoverTrigger
                              render={
                                <Button
                                  size="icon-xs"
                                  variant="outline"
                                  disabled={saving || sendingTest}
                                  aria-busy={sendingTest}
                                  aria-label={sendingTest ? "Sending test…" : "Send test"}
                                  title={sendingTest ? "Sending…" : "Send test"}
                                />
                              }
                            >
                              {sendingTest ? (
                                <Loader2 aria-hidden className="animate-spin" />
                              ) : (
                                <Send aria-hidden />
                              )}
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-72 p-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  value={testEmail}
                                  onChange={(event) => setTestEmail(event.target.value)}
                                  placeholder="alex@example.com"
                                  maxLength={320}
                                  type="email"
                                  autoComplete="email"
                                  onKeyDown={(event) => {
                                    // Keep typing/backspace inside the popover input;
                                    // don't let parent expand/collapse handlers steal keys.
                                    event.stopPropagation();
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      void handleSendTest();
                                    }
                                  }}
                                />
                                <Button
                                  size="icon-xs"
                                  onClick={() => void handleSendTest()}
                                  disabled={saving || sendingTest}
                                  aria-label={sendingTest ? "Sending test…" : "Send test"}
                                  title={sendingTest ? "Sending…" : "Send test"}
                                >
                                  {sendingTest ? (
                                    <Loader2 aria-hidden className="animate-spin" />
                                  ) : (
                                    <Send aria-hidden />
                                  )}
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={discardChanges}
                            disabled={saving || sendingTest || !dirty}
                          >
                            Discard
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (
                                dirty &&
                                !window.confirm("Discard unsaved changes?")
                              ) {
                                return;
                              }
                              closeExpanded();
                            }}
                            disabled={saving || sendingTest}
                            className="ml-auto"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="whatsapp">
          <AdminWhatsAppTemplatesPanel
            onToast={setToast}
            onError={setError}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-3 overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email preview</DialogTitle>
            <DialogDescription>
              Sample recipient: Alex · alex@example.com. Header and footer match sent
              mail.
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
              <div className="rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Subject
                </p>
                <p className="text-sm text-foreground">{preview.subject}</p>
              </div>
              <iframe
                title="Email preview"
                className="h-[min(60vh,520px)] w-full rounded-lg border border-border bg-white"
                srcDoc={preview.html}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
