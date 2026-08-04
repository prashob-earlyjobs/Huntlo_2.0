"use client";

import { ChevronDown, Eye, ExternalLink, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminApi, type WhatsAppTemplate } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type Props = {
  onToast: (message: string) => void;
  onError: (message: string | null) => void;
};

function visibleMessageBody(bodyText: string): string {
  const lines = String(bodyText || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => !/\{\{\s*(loginLink|login_link|2)\s*\}\}/i.test(line));
  return lines.join("\n").trim();
}

function personalizePreviewBody(bodyText: string, firstName: string): string {
  const name = firstName.trim() || "Alex";
  return visibleMessageBody(bodyText)
    .replace(/\{\{\s*(firstName|first_name|1)\s*\}\}/gi, name)
    .trim();
}

function previewButtonLabel(template: WhatsAppTemplate): string | null {
  if (template.key === "event.no_login_whatsapp") return "Visit website";
  if (template.key === "event.signup_whatsapp") return "Start Here";
  if (template.key === "event.profile_unlocked_whatsapp") return "Launch Campaign";
  return null;
}

function triggerTimingLabel(template: WhatsAppTemplate): string {
  switch (template.key) {
    case "event.signup_whatsapp":
      return "Immediately after signup";
    case "event.no_login_whatsapp":
      return "First login · after 2h if still no AI search";
    case "event.profile_unlocked_whatsapp":
      return "First profile unlock · instant";
    case "event.interested_candidate_whatsapp":
      return "First candidate reply · instant";
    default:
      return "On product event";
  }
}

export function AdminWhatsAppTemplatesPanel({ onToast, onError }: Props) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(
    null
  );
  const [testPhone, setTestPhone] = useState("");
  const [sendingTestId, setSendingTestId] = useState<string | null>(null);

  const visibleTemplates = useMemo(() => templates.slice(0, 4), [templates]);

  const enabledCount = useMemo(
    () => visibleTemplates.filter((item) => item.enabled).length,
    [visibleTemplates]
  );

  const defaultPhone = user?.phone || user?.mobile || "";

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      const result = await adminApi.listWhatsAppTemplates();
      setTemplates(result.items);
    } catch (err) {
      setTemplates([]);
      onError(getApiErrorMessage(err, "Unable to load WhatsApp templates."));
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (defaultPhone && !testPhone) {
      setTestPhone(defaultPhone);
    }
  }, [defaultPhone, testPhone]);

  async function handleToggle(template: WhatsAppTemplate, enabled: boolean) {
    if (template.enabled === enabled) return;
    setSavingId(template.id);
    onError(null);
    try {
      const updated = await adminApi.updateWhatsAppTemplate(template.id, {
        enabled,
      });
      setTemplates((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item))
      );
      onToast(`${updated.name} ${updated.enabled ? "enabled" : "disabled"}.`);
    } catch (err) {
      onError(getApiErrorMessage(err, "Unable to update WhatsApp template."));
    } finally {
      setSavingId(null);
    }
  }

  async function handleSendTest(template: WhatsAppTemplate) {
    const to = testPhone.trim() || defaultPhone;
    if (!to) {
      onError("Enter a phone number to send a WhatsApp test.");
      return;
    }
    setSendingTestId(template.id);
    onError(null);
    try {
      const result = await adminApi.sendWhatsAppTemplateTest(template.id, {
        to,
        firstName: user?.firstName || "Alex",
      });
      if (!result.whatsappConfigured) {
        onError("HUNTLO_WHATSAPP_* is not configured on the server.");
        return;
      }
      if (!result.sent) {
        onError("WhatsApp test failed to send. Check Meta template name and credentials.");
        return;
      }
      onToast(`Test WhatsApp sent to ${result.to}.`);
    } catch (err) {
      onError(getApiErrorMessage(err, "Unable to send WhatsApp test."));
    } finally {
      setSendingTestId(null);
    }
  }

  function toggleExpand(templateId: string) {
    setExpandedId((current) => (current === templateId ? null : templateId));
  }

  const previewFirstName = user?.firstName || "Alex";
  const previewBody = previewTemplate
    ? personalizePreviewBody(previewTemplate.bodyText, previewFirstName)
    : "";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {enabledCount}/{visibleTemplates.length || 0} enabled · Meta body{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{"{{1}}"}</code>{" "}
          · button URL{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{"{{2}}"}</code>
        </p>
        <p className="text-[11px] text-muted-foreground">
          Body preview hides button/URL params. Delivery uses the approved Meta template + Start Here CTA.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card px-3 py-8 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-3 py-8 text-center text-sm text-muted-foreground">
          No WhatsApp templates available yet.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-lg border border-border bg-card">
          {visibleTemplates.map((template, index) => {
            const isSaving = savingId === template.id;
            const isSendingTest = sendingTestId === template.id;
            const isOpen = expandedId === template.id;
            const panelId = `wa-tpl-panel-${template.id}`;
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
                  onClick={() => toggleExpand(template.id)}
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
                    <div className="flex min-w-0 items-center gap-2">
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
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {triggerTimingLabel(template)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {isSaving || isSendingTest ? (
                      <Loader2 aria-hidden className="size-4 animate-spin" />
                    ) : null}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {isOpen ? (
                  <div
                    id={panelId}
                    className="space-y-3 border-t border-border bg-background/50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-foreground">Enabled</p>
                        <p className="text-[11px] text-muted-foreground">
                          Off templates are skipped when the matching lifecycle event fires.
                        </p>
                      </div>
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={(checked) => void handleToggle(template, checked)}
                        disabled={Boolean(savingId) || Boolean(sendingTestId)}
                        aria-label={`${template.name} enabled`}
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Message</p>
                      <div className="rounded-md border border-border bg-card px-3 py-2 text-sm whitespace-pre-line text-foreground">
                        {visibleMessageBody(template.bodyText) || "No visible body copy yet"}
                      </div>
                      {template.metaTemplateName ? (
                        <p className="text-[11px] text-muted-foreground">
                          Meta template{" "}
                          <code className="rounded bg-muted px-1 py-0.5">
                            {template.metaTemplateName}
                          </code>
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                          No Meta template name configured — test send is disabled until one is
                          approved and set.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-border pt-3">
                      <p className="text-xs font-medium text-foreground">Test phone</p>
                      <Input
                        value={testPhone}
                        onChange={(event) => setTestPhone(event.target.value)}
                        placeholder="+91XXXXXXXXXX"
                        maxLength={30}
                      />
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => setPreviewTemplate(template)}
                          aria-label="Preview"
                          title="Preview"
                        >
                          <Eye aria-hidden />
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="outline"
                          onClick={() => void handleSendTest(template)}
                          disabled={
                            Boolean(savingId) ||
                            Boolean(sendingTestId) ||
                            !template.metaTemplateName
                          }
                          aria-busy={isSendingTest}
                          aria-label={isSendingTest ? "Sending test…" : "Send test"}
                          title={
                            !template.metaTemplateName
                              ? "No Meta template name configured"
                              : isSendingTest
                                ? "Sending…"
                                : "Send test"
                          }
                        >
                          {isSendingTest ? (
                            <Loader2 aria-hidden className="animate-spin" />
                          ) : (
                            <Send aria-hidden />
                          )}
                        </Button>
                        <span className="text-[11px] text-muted-foreground">
                          Preview locally · Test sends via Meta template
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>WhatsApp preview</DialogTitle>
            <DialogDescription>
              Sample recipient: {previewFirstName}. Matches the approved Meta template
              (footer{previewTemplate && previewButtonLabel(previewTemplate) ? " + CTA" : ""}
              ).
            </DialogDescription>
          </DialogHeader>
          {previewTemplate ? (
            <div className="rounded-xl bg-[#e5ddd5] p-4">
              <div className="ml-auto max-w-[85%] overflow-hidden rounded-lg bg-white shadow-sm">
                <div className="space-y-2 px-3 py-2.5">
                  <p className="whitespace-pre-line text-sm text-[#111b21]">
                    {previewBody || "No visible body copy yet"}
                  </p>
                  <p className="text-xs text-[#667781]">Team Huntlo</p>
                  <p className="text-right text-[10px] text-[#667781]">Preview</p>
                </div>
                {previewButtonLabel(previewTemplate) ? (
                  <div className="flex items-center justify-center gap-2 border-t border-[#e9edef] px-3 py-2.5 text-sm font-medium text-[#00a884]">
                    <ExternalLink aria-hidden className="size-3.5" />
                    {previewButtonLabel(previewTemplate)}
                  </div>
                ) : null}
              </div>
              {previewTemplate.metaTemplateName ? (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Meta template:{" "}
                  <code className="rounded bg-muted px-1 py-0.5">
                    {previewTemplate.metaTemplateName}
                  </code>
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
