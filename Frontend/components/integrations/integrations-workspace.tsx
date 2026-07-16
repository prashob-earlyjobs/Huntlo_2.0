"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plug,
  RefreshCw,
  Settings2,
  Unplug,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Field, ToggleRow } from "@/components/outreach/builder-ui";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CALENDLY_CONFIG_DEFAULTS,
  CALENDLY_EVENT_OPTIONS,
  CATEGORY_META,
  EMAIL_CONFIG_DEFAULTS,
  INTEGRATION_CATEGORIES,
  INTEGRATION_PROVIDERS,
  SMTP_CONFIG_DEFAULTS,
  SMTP_SECURITY_OPTIONS,
  WHATSAPP_CONFIG_DEFAULTS,
  type IntegrationCategory,
  type IntegrationConnectionStatus,
  type IntegrationProvider,
} from "@/lib/mock-integrations";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Status badge                                                         */
/* ------------------------------------------------------------------ */

const STATUS_CLASSES: Record<
  IntegrationConnectionStatus,
  { badge: string; dot: string }
> = {
  Connected: { badge: "bg-success/10 text-success", dot: "bg-success" },
  "Not Connected": {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
  "Needs Attention": {
    badge: "bg-warning/10 text-warning",
    dot: "bg-warning",
  },
  Expired: {
    badge: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  Disabled: {
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
};

const ACCENT_CLASSES = {
  brand: "bg-brand-subtle text-primary border-primary/20",
  info: "bg-info/10 text-info border-info/20",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  neutral: "bg-muted text-muted-foreground border-border",
} as const;

function ConnectionStatusBadge({
  status,
}: {
  status: IntegrationConnectionStatus;
}) {
  const classes = STATUS_CLASSES[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        classes.badge
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", classes.dot)} />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Provider card                                                        */
/* ------------------------------------------------------------------ */

function ProviderCard({
  provider,
  onOpen,
}: {
  provider: IntegrationProvider;
  onOpen: (provider: IntegrationProvider) => void;
}) {
  const isConnected =
    provider.status === "Connected" ||
    provider.status === "Needs Attention" ||
    provider.status === "Expired" ||
    provider.status === "Disabled";
  const actionLabel =
    provider.status === "Not Connected"
      ? "Connect"
      : provider.status === "Needs Attention" || provider.status === "Expired"
        ? "Reconnect"
        : "Configure";

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className={cn(
            "flex size-10 items-center justify-center rounded-lg border text-xs font-bold tracking-tight",
            ACCENT_CLASSES[provider.accent]
          )}
        >
          {provider.initials}
        </span>
        <ConnectionStatusBadge status={provider.status} />
      </div>

      <h3 className="mt-3 text-sm font-semibold text-foreground">
        {provider.name}
      </h3>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
        {provider.category}
      </p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {provider.description}
      </p>

      {provider.connectedIdentity ? (
        <p className="mt-3 truncate text-xs text-foreground">
          <span className="text-muted-foreground">Account: </span>
          {provider.connectedIdentity}
        </p>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">Not connected</p>
      )}
      <p className="mt-0.5 text-xs text-muted-foreground">
        Last synced: {provider.lastSynced ?? "—"}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant={isConnected ? "outline" : "default"} onClick={() => onOpen(provider)}>
          {provider.status === "Not Connected" ? (
            <Plug aria-hidden />
          ) : (
            <Settings2 aria-hidden />
          )}
          {actionLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onOpen(provider)}
          className="text-muted-foreground"
        >
          <BookOpen aria-hidden />
          Docs
        </Button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Config panels                                                        */
/* ------------------------------------------------------------------ */

function EmailConfigPanel({
  onSave,
}: {
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState(EMAIL_CONFIG_DEFAULTS);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Email configuration
      </h3>
      <Field label="Sender email" htmlFor="email-sender">
        <Input
          id="email-sender"
          value={form.senderEmail}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              senderEmail: event.target.value,
            }))
          }
        />
      </Field>
      <Field label="Display name" htmlFor="email-display">
        <Input
          id="email-display"
          value={form.displayName}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              displayName: event.target.value,
            }))
          }
        />
      </Field>
      <Field label="Daily send limit" htmlFor="email-limit">
        <Input
          id="email-limit"
          type="number"
          value={form.dailySendLimit}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              dailySendLimit: event.target.value,
            }))
          }
        />
      </Field>
      <Field label="Signature" htmlFor="email-signature">
        <Textarea
          id="email-signature"
          value={form.signature}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              signature: event.target.value,
            }))
          }
          className="min-h-24 font-mono text-xs"
        />
      </Field>
      <ToggleRow
        id="email-reply"
        label="Reply tracking"
        description="Sync inbound replies into Conversations"
        checked={form.replyTracking}
        onChange={(checked) =>
          setForm((previous) => ({ ...previous, replyTracking: checked }))
        }
      />
      <ToggleRow
        id="email-default"
        label="Default sender"
        description="Use this mailbox for new outreach campaigns"
        checked={form.defaultSender}
        onChange={(checked) =>
          setForm((previous) => ({ ...previous, defaultSender: checked }))
        }
      />
      <Button
        size="sm"
        className="w-full"
        onClick={() => onSave("Email configuration saved. (UI preview)")}
      >
        Save email settings
      </Button>
    </div>
  );
}

function SmtpConfigPanel({
  onSave,
}: {
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState(SMTP_CONFIG_DEFAULTS);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Custom SMTP / IMAP
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From email" htmlFor="smtp-from">
          <Input
            id="smtp-from"
            value={form.fromEmail}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                fromEmail: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Display name" htmlFor="smtp-display">
          <Input
            id="smtp-display"
            value={form.displayName}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                displayName: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="SMTP host" htmlFor="smtp-host">
          <Input
            id="smtp-host"
            value={form.smtpHost}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                smtpHost: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="SMTP port" htmlFor="smtp-port">
          <Input
            id="smtp-port"
            value={form.smtpPort}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                smtpPort: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="Security" htmlFor="smtp-security">
          <Select
            value={form.security}
            onValueChange={(value) =>
              value &&
              setForm((previous) => ({ ...previous, security: value }))
            }
          >
            <SelectTrigger id="smtp-security" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SMTP_SECURITY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Username" htmlFor="smtp-user">
          <Input
            id="smtp-user"
            value={form.username}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                username: event.target.value,
              }))
            }
          />
        </Field>
        <Field
          label="Password"
          htmlFor="smtp-pass"
          className="sm:col-span-2"
          hint="Stored encrypted — leave blank to keep the existing password."
        >
          <Input
            id="smtp-pass"
            type="password"
            value={form.password}
            placeholder="••••••••"
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="IMAP host" htmlFor="imap-host">
          <Input
            id="imap-host"
            value={form.imapHost}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                imapHost: event.target.value,
              }))
            }
          />
        </Field>
        <Field label="IMAP port" htmlFor="imap-port">
          <Input
            id="imap-port"
            value={form.imapPort}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                imapPort: event.target.value,
              }))
            }
          />
        </Field>
      </div>
      <Button
        size="sm"
        className="w-full"
        onClick={() => onSave("SMTP/IMAP settings saved. (UI preview)")}
      >
        Save SMTP settings
      </Button>
    </div>
  );
}

function WhatsAppConfigPanel({
  onSave,
}: {
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState(WHATSAPP_CONFIG_DEFAULTS);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        WhatsApp configuration
      </h3>
      <Field label="Provider" htmlFor="wa-provider">
        <Input id="wa-provider" value={form.provider} readOnly />
      </Field>
      <Field label="Business number" htmlFor="wa-number">
        <Input
          id="wa-number"
          value={form.businessNumber}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              businessNumber: event.target.value,
            }))
          }
        />
      </Field>
      <Field label="Phone number ID" htmlFor="wa-phone-id">
        <Input
          id="wa-phone-id"
          value={form.phoneNumberId}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              phoneNumberId: event.target.value,
            }))
          }
          className="font-mono text-xs"
        />
      </Field>
      <Field label="Template status" htmlFor="wa-templates">
        <Input id="wa-templates" value={form.templateStatus} readOnly />
      </Field>
      <Field label="Webhook status" htmlFor="wa-webhook">
        <Input id="wa-webhook" value={form.webhookStatus} readOnly />
      </Field>
      <ToggleRow
        id="wa-default"
        label="Default sender"
        description="Use this number for new WhatsApp outreach steps"
        checked={form.defaultSender}
        onChange={(checked) =>
          setForm((previous) => ({ ...previous, defaultSender: checked }))
        }
      />
      <Button
        size="sm"
        className="w-full"
        onClick={() => onSave("WhatsApp configuration saved. (UI preview)")}
      >
        Save WhatsApp settings
      </Button>
    </div>
  );
}

function CalendlyConfigPanel({
  onSave,
}: {
  onSave: (message: string) => void;
}) {
  const [form, setForm] = useState(CALENDLY_CONFIG_DEFAULTS);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Calendly configuration
      </h3>
      <Field label="Connected user" htmlFor="cal-user">
        <Input id="cal-user" value={form.connectedUser} readOnly />
      </Field>
      <Field label="Default event type" htmlFor="cal-event">
        <Select
          value={form.defaultEventType}
          onValueChange={(value) =>
            value &&
            setForm((previous) => ({ ...previous, defaultEventType: value }))
          }
        >
          <SelectTrigger id="cal-event" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CALENDLY_EVENT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Scheduling URL" htmlFor="cal-url">
        <Input
          id="cal-url"
          value={form.schedulingUrl}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              schedulingUrl: event.target.value,
            }))
          }
          className="font-mono text-xs"
        />
      </Field>
      <Field label="Webhook status" htmlFor="cal-webhook">
        <Input id="cal-webhook" value={form.webhookStatus} readOnly />
      </Field>
      <Field label="Reminder defaults" htmlFor="cal-reminders">
        <Select
          value={form.reminderDefaults}
          onValueChange={(value) =>
            value &&
            setForm((previous) => ({ ...previous, reminderDefaults: value }))
          }
        >
          <SelectTrigger id="cal-reminders" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              "24h and 2h before",
              "24h before only",
              "2h before only",
              "No reminders",
            ].map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Button
        size="sm"
        className="w-full"
        onClick={() => onSave("Calendly configuration saved. (UI preview)")}
      >
        Save Calendly settings
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Connection drawer                                                    */
/* ------------------------------------------------------------------ */

type TestState = "idle" | "testing" | "success" | "error";

function ConnectionDrawer({
  provider,
  open,
  onOpenChange,
  onFlash,
}: {
  provider: IntegrationProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlash: (message: string) => void;
}) {
  const [testState, setTestState] = useState<TestState>("idle");
  const [showConfig, setShowConfig] = useState(true);

  if (!provider) return null;

  const canTest =
    provider.status === "Connected" ||
    provider.status === "Needs Attention" ||
    provider.status === "Expired" ||
    provider.status === "Disabled";

  function runTest() {
    setTestState("testing");
    window.setTimeout(() => {
      if (
        provider!.status === "Needs Attention" ||
        provider!.status === "Expired"
      ) {
        setTestState("error");
      } else if (provider!.status === "Disabled") {
        setTestState("error");
      } else {
        setTestState("success");
      }
    }, 1400);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTestState("idle");
          setShowConfig(true);
        }
        onOpenChange(next);
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        <SheetHeader className="pr-8">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg border text-xs font-bold",
                ACCENT_CLASSES[provider.accent]
              )}
            >
              {provider.initials}
            </span>
            <div className="min-w-0">
              <SheetTitle>{provider.name}</SheetTitle>
              <SheetDescription>{provider.category}</SheetDescription>
            </div>
          </div>
          <div className="pt-1">
            <ConnectionStatusBadge status={provider.status} />
          </div>
        </SheetHeader>

        <div className="space-y-5 px-4 pb-6">
          {/* Status banners */}
          {provider.status === "Needs Attention" ? (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-foreground"
            >
              <AlertTriangle
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-warning"
              />
              <p>
                This connection needs attention. Reconnect to restore outreach
                sending.
              </p>
            </div>
          ) : null}
          {provider.status === "Expired" ? (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-foreground"
            >
              <AlertTriangle
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-destructive"
              />
              <p>
                Token or quota expired. Reconnect or top up before using this
                provider again.
              </p>
            </div>
          ) : null}
          {provider.status === "Disabled" ? (
            <div
              role="status"
              className="flex gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground"
            >
              <Unplug aria-hidden className="mt-0.5 size-4 shrink-0" />
              <p>
                This integration is disabled. An admin can re-enable it after
                resolving the underlying issue.
              </p>
            </div>
          ) : null}

          {/* Connection summary */}
          <dl className="space-y-2.5 rounded-lg border border-border p-3">
            <div>
              <dt className="text-xs text-muted-foreground">Connected account</dt>
              <dd className="text-sm font-medium text-foreground">
                {provider.connectedIdentity ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Provider</dt>
              <dd className="text-sm font-medium text-foreground">
                {provider.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="mt-0.5">
                <ConnectionStatusBadge status={provider.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Last sync</dt>
              <dd className="text-sm font-medium text-foreground">
                {provider.lastSynced ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Default</dt>
              <dd className="text-sm font-medium text-foreground">
                {provider.isDefault ? "Yes — used for new campaigns" : "No"}
              </dd>
            </div>
          </dl>

          {provider.permissions.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Permissions
              </h3>
              <ul className="mt-2 space-y-1">
                {provider.permissions.map((permission) => (
                  <li
                    key={permission}
                    className="flex items-start gap-1.5 text-sm text-foreground"
                  >
                    <CheckCircle2
                      aria-hidden
                      className="mt-0.5 size-3.5 shrink-0 text-success"
                    />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {provider.usage.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Usage
              </h3>
              <ul className="mt-2 grid grid-cols-2 gap-2">
                {provider.usage.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-lg border border-border px-2.5 py-2"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                      {item.value}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {provider.connectionDetails.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Connection details
              </h3>
              <dl className="mt-2 space-y-2">
                {provider.connectionDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-xs text-muted-foreground">
                      {detail.label}
                    </dt>
                    <dd className="text-sm text-foreground">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {/* Test connection */}
          {canTest ? (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">
                  Test connection
                </p>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={testState === "testing"}
                  onClick={runTest}
                >
                  {testState === "testing" ? (
                    <Loader2 aria-hidden className="animate-spin" />
                  ) : (
                    <RefreshCw aria-hidden />
                  )}
                  {testState === "testing" ? "Testing…" : "Run test"}
                </Button>
              </div>
              {testState === "success" ? (
                <p
                  role="status"
                  className="mt-2 flex items-center gap-1.5 text-xs text-success"
                >
                  <CheckCircle2 aria-hidden className="size-3.5" />
                  Connection healthy — auth and webhook responded.
                </p>
              ) : null}
              {testState === "error" ? (
                <p
                  role="alert"
                  className="mt-2 flex items-center gap-1.5 text-xs text-destructive"
                >
                  <AlertTriangle aria-hidden className="size-3.5" />
                  {provider.status === "Expired"
                    ? "Test failed — token or quota expired."
                    : provider.status === "Disabled"
                      ? "Test failed — integration is disabled."
                      : "Test failed — reconnect to renew credentials."}
                </p>
              ) : null}
              {testState === "idle" ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Sends a dry-run handshake. No messages or payments are created.
                </p>
              ) : null}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {provider.status === "Not Connected" ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={() =>
                  onFlash(
                    `Connect ${provider.name} opened. (UI preview — no OAuth)`
                  )
                }
              >
                <Plug aria-hidden />
                Connect
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    onFlash(
                      `Reconnect ${provider.name} opened. (UI preview — no OAuth)`
                    )
                  }
                >
                  <RefreshCw aria-hidden />
                  Reconnect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() =>
                    onFlash(`Disconnected ${provider.name}. (UI preview)`)
                  }
                >
                  <Unplug aria-hidden />
                  Disconnect
                </Button>
              </>
            )}
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() =>
              onFlash(`Opened “${provider.docsLabel}”. (UI placeholder)`)
            }
          >
            <ExternalLink aria-hidden />
            {provider.docsLabel}
          </Button>

          {/* Provider-specific config */}
          {(provider.configKind === "email" ||
            provider.configKind === "smtp" ||
            provider.configKind === "whatsapp" ||
            provider.configKind === "calendly") &&
          provider.status !== "Not Connected" ? (
            <div className="border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowConfig((previous) => !previous)}
                className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Configuration
                <span className="text-xs font-normal text-muted-foreground">
                  {showConfig ? "Hide" : "Show"}
                </span>
              </button>
              {showConfig ? (
                provider.configKind === "email" ? (
                  <EmailConfigPanel onSave={onFlash} />
                ) : provider.configKind === "smtp" ? (
                  <SmtpConfigPanel onSave={onFlash} />
                ) : provider.configKind === "whatsapp" ? (
                  <WhatsAppConfigPanel onSave={onFlash} />
                ) : (
                  <CalendlyConfigPanel onSave={onFlash} />
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function IntegrationsWorkspace() {
  const [category, setCategory] = useState<IntegrationCategory | "All">("All");
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (category === "All") return INTEGRATION_PROVIDERS;
    return INTEGRATION_PROVIDERS.filter(
      (provider) => provider.category === category
    );
  }, [category]);

  const grouped = useMemo(() => {
    const categories =
      category === "All"
        ? [...INTEGRATION_CATEGORIES]
        : ([category] as IntegrationCategory[]);
    return categories.map((cat) => ({
      category: cat,
      providers: filtered.filter((provider) => provider.category === cat),
    }));
  }, [category, filtered]);

  const counts = useMemo(() => {
    const connected = INTEGRATION_PROVIDERS.filter(
      (p) => p.status === "Connected"
    ).length;
    const attention = INTEGRATION_PROVIDERS.filter(
      (p) =>
        p.status === "Needs Attention" ||
        p.status === "Expired" ||
        p.status === "Disabled"
    ).length;
    return { connected, attention, total: INTEGRATION_PROVIDERS.length };
  }, []);

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  function openProvider(provider: IntegrationProvider) {
    setSelected(provider);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-3 gap-px bg-border">
          <div className="bg-card px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">Connected</p>
            <p className="mt-1 text-metric text-xl font-semibold tabular-nums text-foreground">
              {counts.connected}
            </p>
          </div>
          <div className="bg-card px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">Needs attention</p>
            <p className="mt-1 text-metric text-xl font-semibold tabular-nums text-warning">
              {counts.attention}
            </p>
          </div>
          <div className="bg-card px-3 py-2.5">
            <p className="text-[12px] text-muted-foreground">Available</p>
            <p className="mt-1 text-metric text-xl font-semibold tabular-nums text-foreground">
              {counts.total}
            </p>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
              category === "All"
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            All
          </button>
          {INTEGRATION_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_META[cat].icon;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  category === cat
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {cat}
              </button>
            );
          })}
          {category !== "All" ? (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setCategory("All")}
            >
              <X aria-hidden />
              Clear
            </Button>
          ) : null}
        </div>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {/* Grouped cards */}
      {grouped.map(({ category: cat, providers }) =>
        providers.length > 0 ? (
          <section key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = CATEGORY_META[cat].icon;
                return (
                  <Icon
                    aria-hidden
                    className="size-4 text-muted-foreground"
                  />
                );
              })()}
              <h2 className="text-sm font-semibold text-foreground">{cat}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onOpen={openProvider}
                />
              ))}
            </div>
          </section>
        ) : null
      )}

      <ConnectionDrawer
        provider={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onFlash={flash}
      />
    </div>
  );
}
