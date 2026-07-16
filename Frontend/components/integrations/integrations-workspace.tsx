"use client";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Loader2,
  Plug,
  RefreshCw,
  Settings2,
  Unplug,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { getApiErrorMessage, integrationsApi } from "@/lib/api";
import {
  CATEGORY_META,
  INTEGRATION_CATEGORIES,
  INTEGRATION_PROVIDERS as MOCK_INTEGRATION_PROVIDERS,
  SMTP_CONFIG_DEFAULTS,
  SMTP_SECURITY_OPTIONS,
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

function SmtpConfigPanel({
  providerId,
  onSave,
  onConnected,
}: {
  providerId: string;
  onSave: (message: string) => void;
  onConnected: () => void;
}) {
  const [form, setForm] = useState(SMTP_CONFIG_DEFAULTS);
  const [busy, setBusy] = useState(false);

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
        disabled={busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const security =
                form.security === "SSL/TLS"
                  ? "ssl"
                  : form.security === "None"
                    ? "none"
                    : "tls";
              const result = await integrationsApi.connect(providerId, {
                fromEmail: form.fromEmail,
                displayName: form.displayName,
                smtpHost: form.smtpHost,
                smtpPort: Number(form.smtpPort) || 587,
                security,
                username: form.username,
                password: form.password,
              });
              if (result.mode === "connected") {
                onSave("SMTP connected.");
                onConnected();
              } else {
                onSave(result.message || "Could not connect SMTP.");
              }
            } catch (error) {
              onSave(getApiErrorMessage(error));
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy ? "Connecting…" : "Save & connect SMTP"}
      </Button>
    </div>
  );
}

function WhatsAppConfigPanel({
  providerId,
  onSave,
  onConnected,
}: {
  providerId: string;
  onSave: (message: string) => void;
  onConnected: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
    confirmWebhookSetup: true,
  });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        WhatsApp configuration
      </h3>
      {providerId === "meta-whatsapp" ? (
        <>
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
          <Field label="Access token" htmlFor="wa-token">
            <Input
              id="wa-token"
              type="password"
              autoComplete="new-password"
              value={form.accessToken}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  accessToken: event.target.value,
                }))
              }
            />
          </Field>
          <Field label="WABA ID (optional)" htmlFor="wa-waba">
            <Input
              id="wa-waba"
              value={form.wabaId}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  wabaId: event.target.value,
                }))
              }
              className="font-mono text-xs"
            />
          </Field>
          <ToggleRow
            id="wa-webhook-confirm"
            label="Webhook configured"
            description="Confirm Meta webhook uses Huntlo callback URL and verify token"
            checked={form.confirmWebhookSetup}
            onChange={(checked) =>
              setForm((previous) => ({
                ...previous,
                confirmWebhookSetup: checked,
              }))
            }
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This WhatsApp channel uses platform credentials. Connect to enable it
          for your workspace.
        </p>
      )}
      <Button
        size="sm"
        className="w-full"
        disabled={busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const body =
                providerId === "meta-whatsapp"
                  ? {
                      phoneNumberId: form.phoneNumberId,
                      accessToken: form.accessToken,
                      wabaId: form.wabaId,
                      confirmWebhookSetup: form.confirmWebhookSetup,
                    }
                  : providerId === "huntlo-whatsapp"
                    ? { whatsappMode: "huntlo" }
                    : {};
              const result = await integrationsApi.connect(providerId, body);
              if (result.mode === "connected") {
                onSave("WhatsApp connected.");
                onConnected();
              } else {
                onSave(result.message || "Could not connect WhatsApp.");
              }
            } catch (error) {
              onSave(getApiErrorMessage(error));
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy ? "Connecting…" : "Connect WhatsApp"}
      </Button>
    </div>
  );
}

function CalendlyConfigPanel({
  onSave,
  onConnected,
}: {
  onSave: (message: string) => void;
  onConnected: () => void;
}) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Calendly configuration
      </h3>
      <Field label="Personal access token" htmlFor="cal-pat">
        <Input
          id="cal-pat"
          type="password"
          autoComplete="new-password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </Field>
      <Button
        size="sm"
        className="w-full"
        disabled={busy || !token.trim()}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const result = await integrationsApi.connect("calendly", {
                personalAccessToken: token.trim(),
              });
              if (result.mode === "connected") {
                onSave("Calendly connected.");
                onConnected();
              } else {
                onSave(result.message || "Could not connect Calendly.");
              }
            } catch (error) {
              onSave(getApiErrorMessage(error));
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy ? "Connecting…" : "Connect Calendly"}
      </Button>
    </div>
  );
}

type TestState = "idle" | "testing" | "success" | "error";

function ConnectionDrawer({
  provider,
  open,
  onOpenChange,
  onFlash,
  onRefresh,
}: {
  provider: IntegrationProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlash: (message: string) => void;
  onRefresh: () => void;
}) {
  const [testState, setTestState] = useState<TestState>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [showConfig, setShowConfig] = useState(true);
  const [busy, setBusy] = useState(false);

  if (!provider) return null;

  const canTest =
    Boolean(provider.integrationRecordId) &&
    (provider.status === "Connected" ||
      provider.status === "Needs Attention" ||
      provider.status === "Expired" ||
      provider.status === "Disabled");

  async function runTest() {
    if (!provider?.integrationRecordId) return;
    setTestState("testing");
    try {
      const result = await integrationsApi.test(provider.integrationRecordId);
      setTestState(result.ok ? "success" : "error");
      setTestMessage(result.message);
      onRefresh();
    } catch (error) {
      setTestState("error");
      setTestMessage(getApiErrorMessage(error));
    }
  }

  async function handleConnect() {
    setBusy(true);
    try {
      const result = await integrationsApi.connect(provider!.id, {});
      if (result.mode === "oauth_redirect" && result.authorizeUrl) {
        window.location.assign(result.authorizeUrl);
        return;
      }
      if (result.mode === "connected") {
        onFlash(`${provider!.name} connected.`);
        onRefresh();
      } else {
        onFlash(
          result.message ||
            `Open configuration to finish connecting ${provider!.name}.`
        );
        setShowConfig(true);
      }
    } catch (error) {
      onFlash(getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    if (!provider?.integrationRecordId) {
      await integrationsApi.disconnectByProvider(provider!.id);
    } else {
      await integrationsApi.disconnect(provider.integrationRecordId);
    }
    onFlash(`Disconnected ${provider!.name}.`);
    onRefresh();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTestState("idle");
          setTestMessage("");
          setShowConfig(true);
        }
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
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
          {provider.status === "Needs Attention" || provider.status === "Expired" ? (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-foreground"
            >
              <AlertTriangle
                aria-hidden
                className="mt-0.5 size-4 shrink-0 text-warning"
              />
              <p>This connection needs attention. Reconnect to restore sending.</p>
            </div>
          ) : null}

          <dl className="space-y-2.5 rounded-lg border border-border p-3">
            <div>
              <dt className="text-xs text-muted-foreground">Connected account</dt>
              <dd className="text-sm font-medium text-foreground">
                {provider.connectedIdentity ?? "—"}
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

          {canTest ? (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground">Test connection</p>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={testState === "testing"}
                  onClick={() => void runTest()}
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
                <p role="status" className="mt-2 flex items-center gap-1.5 text-xs text-success">
                  <CheckCircle2 aria-hidden className="size-3.5" />
                  {testMessage || "Connection healthy."}
                </p>
              ) : null}
              {testState === "error" ? (
                <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle aria-hidden className="size-3.5" />
                  {testMessage || "Test failed — reconnect to renew credentials."}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {provider.status === "Not Connected" ? (
              <Button
                size="sm"
                className="flex-1"
                disabled={busy}
                onClick={() => void handleConnect()}
              >
                <Plug aria-hidden />
                {busy ? "Connecting…" : "Connect"}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => void handleConnect()}
                >
                  <RefreshCw aria-hidden />
                  Reconnect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  disabled={busy}
                  onClick={() => {
                    void handleDisconnect().catch((error) =>
                      onFlash(getApiErrorMessage(error))
                    );
                  }}
                >
                  <Unplug aria-hidden />
                  Disconnect
                </Button>
              </>
            )}
          </div>

          {provider.configKind === "smtp" ||
          provider.configKind === "whatsapp" ||
          provider.configKind === "calendly" ? (
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
                provider.configKind === "smtp" ? (
                  <SmtpConfigPanel
                    providerId={provider.id}
                    onSave={onFlash}
                    onConnected={onRefresh}
                  />
                ) : provider.configKind === "whatsapp" ? (
                  <WhatsAppConfigPanel
                    providerId={provider.id}
                    onSave={onFlash}
                    onConnected={onRefresh}
                  />
                ) : (
                  <CalendlyConfigPanel onSave={onFlash} onConnected={onRefresh} />
                )
              ) : null}
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function IntegrationsWorkspace() {
  const [category, setCategory] = useState<IntegrationCategory | "All">("All");
  const [providers, setProviders] = useState<IntegrationProvider[]>(
    MOCK_INTEGRATION_PROVIDERS
  );
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<IntegrationProvider | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    try {
      const next = await integrationsApi.listProviders();
      setProviders(next);
      setSelected((current) =>
        current ? next.find((item) => item.id === current.id) || current : null
      );
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(() => {
    if (category === "All") return providers;
    return providers.filter((provider) => provider.category === category);
  }, [category, providers]);

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
    const connected = providers.filter((p) => p.status === "Connected").length;
    const attention = providers.filter(
      (p) =>
        p.status === "Needs Attention" ||
        p.status === "Expired" ||
        p.status === "Disabled"
    ).length;
    return { connected, attention, total: providers.length };
  }, [providers]);

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
          <Button size="xs" variant="ghost" onClick={() => setCategory("All")}>
            <X aria-hidden />
            Clear
          </Button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading integrations…</p>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {grouped.map(({ category: cat, providers: groupProviders }) =>
        groupProviders.length > 0 ? (
          <section key={cat} className="space-y-3">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = CATEGORY_META[cat].icon;
                return <Icon aria-hidden className="size-4 text-muted-foreground" />;
              })()}
              <h2 className="text-sm font-semibold text-foreground">{cat}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {groupProviders.map((provider) => (
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
        onRefresh={() => void refresh()}
      />
    </div>
  );
}
