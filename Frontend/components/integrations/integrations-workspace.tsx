"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plug,
  RefreshCw,
  Settings2,
  Unplug,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

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
import { GmailConnectButton } from "@/components/integrations/gmail-connect-button";
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
  const inactive = Boolean(provider.inactive);
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
    <article
      aria-disabled={inactive || undefined}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-4",
        inactive && "opacity-60"
      )}
    >
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
        <Button
          size="sm"
          variant={isConnected ? "outline" : "default"}
          disabled={inactive}
          onClick={() => onOpen(provider)}
        >
          {provider.status === "Not Connected" ? (
            <Plug aria-hidden />
          ) : (
            <Settings2 aria-hidden />
          )}
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Config panels                                                        */
/* ------------------------------------------------------------------ */

type FlashTone = "success" | "error";

/** Soften raw SMTP/provider failures for display (matches backend formatSmtpError). */
function formatSmtpErrorMessage(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim();
  if (!text) return "Could not connect SMTP.";

  if (
    /smtpclientauthentication is disabled/i.test(text) ||
    /smtp_auth_disabled/i.test(text) ||
    /5\.7\.139/.test(text)
  ) {
    return [
      "SMTP AUTH is disabled for this Microsoft mailbox.",
      "A Microsoft 365 admin must enable Authenticated SMTP for this mailbox (or the organization).",
      "Guide: https://aka.ms/smtp_auth_disabled",
    ].join("\n");
  }

  if (/certificate|self[- ]signed|unable to verify the first certificate/i.test(text)) {
    return [
      "SMTP TLS certificate could not be verified.",
      "Check the host name, or try SSL on port 465 if your provider requires it.",
    ].join("\n");
  }

  if (/econnrefused|enotfound|getaddrinfo|etimedout|esocket|connection timed out/i.test(text)) {
    return [
      "Could not reach the SMTP server.",
      "Check the host, port, and security settings (TLS 587 / SSL 465).",
    ].join("\n");
  }

  if (
    /invalid login|authentication (failed|unsuccessful)|username and password not accepted|535|534|5\.7\.8/i.test(
      text
    )
  ) {
    return [
      "SMTP login failed.",
      "Check username and password. For Microsoft or Google, use an app password if required, and confirm SMTP AUTH is enabled.",
    ].join("\n");
  }

  return text;
}

function InlineAlert({
  tone,
  children,
}: {
  tone: FlashTone;
  children: ReactNode;
}) {
  const lines =
    typeof children === "string"
      ? children
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
      : null;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm break-words",
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success/10 text-success"
      )}
    >
      {lines && lines.length > 1 ? (
        <div className="space-y-1">
          <p className="font-medium leading-snug">{lines[0]}</p>
          {lines.slice(1).map((line) => {
            const guideMatch = line.match(/^Guide:\s*(https?:\/\/\S+)/i);
            if (guideMatch) {
              return (
                <p key={line} className="text-[13px] leading-snug opacity-90">
                  Guide:{" "}
                  <a
                    href={guideMatch[1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    {guideMatch[1]}
                  </a>
                </p>
              );
            }
            return (
              <p key={line} className="text-[13px] leading-snug opacity-90">
                {line}
              </p>
            );
          })}
        </div>
      ) : (
        <p className="leading-snug whitespace-pre-wrap">{children}</p>
      )}
    </div>
  );
}

function SmtpConfigPanel({
  providerId,
  onFeedback,
  onConnected,
}: {
  providerId: string;
  onFeedback: (message: string, tone?: FlashTone) => void;
  onConnected: () => void;
}) {
  const [form, setForm] = useState(SMTP_CONFIG_DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<{ tone: FlashTone; text: string } | null>(
    null
  );

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
          hint="Required to connect or update. Stored encrypted."
        >
          <Input
            id="smtp-pass"
            type="password"
            value={form.password}
            placeholder="••••••••"
            autoComplete="new-password"
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
      {alert ? <InlineAlert tone={alert.tone}>{alert.text}</InlineAlert> : null}
      <Button
        size="sm"
        className="w-full"
        disabled={busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            setAlert(null);
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
                imapHost: form.imapHost || undefined,
                imapPort: form.imapPort ? Number(form.imapPort) || 993 : undefined,
              });
              if (result.mode === "connected") {
                const text = "SMTP connected.";
                setAlert({ tone: "success", text });
                onFeedback(text, "success");
                onConnected();
              } else {
                const text = formatSmtpErrorMessage(
                  result.message || "Could not connect SMTP."
                );
                setAlert({ tone: "error", text });
                onFeedback(text, "error");
              }
            } catch (error) {
              const text = formatSmtpErrorMessage(getApiErrorMessage(error));
              setAlert({ tone: "error", text });
              onFeedback(text, "error");
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
  onFeedback,
  onConnected,
}: {
  providerId: string;
  onFeedback: (message: string, tone?: FlashTone) => void;
  onConnected: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"huntlo" | "own">("huntlo");
  const [form, setForm] = useState({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
    confirmWebhookSetup: true,
  });

  useEffect(() => {
    setMode("huntlo");
  }, [providerId]);

  const connectTarget =
    mode === "huntlo"
      ? providerId === "gupshup"
        ? "gupshup"
        : "huntlo-whatsapp"
      : "meta-whatsapp";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        WhatsApp configuration
      </h3>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          How do you want to send WhatsApp?
        </p>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setMode("huntlo")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left transition-colors",
              mode === "huntlo"
                ? "border-primary bg-brand-subtle"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              Huntlo WhatsApp
              <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wide text-primary">
                Default
              </span>
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Use Huntlo’s managed Business number — no Meta credentials needed.
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("own")}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left transition-colors",
              mode === "own"
                ? "border-primary bg-brand-subtle"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <span className="block text-sm font-medium text-foreground">
              My own Meta WhatsApp
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Connect your WhatsApp Business account with Phone Number ID and token.
            </span>
          </button>
        </div>
      </div>

      {mode === "own" ? (
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
              placeholder="From Meta Business Manager"
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
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
          Huntlo WhatsApp is the default for this workspace. Connect once to enable
          sending from Huntlo’s managed number.
        </p>
      )}
      <Button
        size="sm"
        className="w-full"
        disabled={
          busy ||
          (mode === "own" &&
            (!form.phoneNumberId.trim() || !form.accessToken.trim()))
        }
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const body =
                mode === "own"
                  ? {
                      phoneNumberId: form.phoneNumberId,
                      accessToken: form.accessToken,
                      wabaId: form.wabaId,
                      confirmWebhookSetup: form.confirmWebhookSetup,
                    }
                  : { whatsappMode: "huntlo" };
              const result = await integrationsApi.connect(connectTarget, body);
              if (result.mode === "connected") {
                onFeedback(
                  mode === "huntlo"
                    ? "Huntlo WhatsApp connected (default)."
                    : "WhatsApp connected.",
                  "success"
                );
                onConnected();
              } else {
                onFeedback(
                  result.message || "Could not connect WhatsApp.",
                  "error"
                );
              }
            } catch (error) {
              onFeedback(getApiErrorMessage(error), "error");
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy
          ? "Connecting…"
          : mode === "huntlo"
            ? "Connect Huntlo WhatsApp"
            : "Connect my Meta WhatsApp"}
      </Button>
    </div>
  );
}

function CalendlyConfigPanel({
  onFeedback,
  onConnected,
}: {
  onFeedback: (message: string, tone?: FlashTone) => void;
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
        <p className="text-xs text-muted-foreground">
          Create a token in Calendly under Integrations → API &amp; Webhooks.{" "}
          <a
            href="https://calendly.com/integrations/api_webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
          >
            Get personal access token
            <ExternalLink aria-hidden className="size-3" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </p>
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
                onFeedback("Calendly connected.", "success");
                onConnected();
              } else {
                onFeedback(
                  result.message || "Could not connect Calendly.",
                  "error"
                );
              }
            } catch (error) {
              onFeedback(getApiErrorMessage(error), "error");
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

function ZwayamConfigPanel({
  onSave,
  onConnected,
}: {
  onSave: (message: string) => void;
  onConnected: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Zwayam Amplify configuration
      </h3>
      <Field label="API key" htmlFor="zwayam-api-key">
        <Input
          id="zwayam-api-key"
          type="password"
          autoComplete="new-password"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Get your Amplify API key from your Naukri account manager or{" "}
          <a
            href="https://developers.zwayam.com/amplify/zwayam-amplify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
          >
            Zwayam Amplify docs
            <ExternalLink aria-hidden className="size-3" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          . Contact amplify@zwayam.com if you need a key.
        </p>
      </Field>
      <Field label="Display name (optional)" htmlFor="zwayam-label">
        <Input
          id="zwayam-label"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Zwayam Amplify"
        />
      </Field>
      <Button
        size="sm"
        className="w-full"
        disabled={busy || !apiKey.trim()}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const result = await integrationsApi.connect("zwayam-amplify", {
                apiKey: apiKey.trim(),
                displayName: displayName.trim() || undefined,
              });
              if (result.mode === "connected") {
                onSave("Zwayam Amplify connected.");
                onConnected();
              } else {
                onSave(result.message || "Could not connect Zwayam Amplify.");
              }
            } catch (error) {
              onSave(getApiErrorMessage(error));
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        {busy ? "Connecting…" : "Connect Zwayam Amplify"}
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
  onFlash: (message: string, tone?: FlashTone) => void;
  onRefresh: () => void;
}) {
  const [testState, setTestState] = useState<TestState>("idle");
  const [testMessage, setTestMessage] = useState("");
  const [showConfig, setShowConfig] = useState(true);
  const [busy, setBusy] = useState(false);
  const [drawerAlert, setDrawerAlert] = useState<{
    tone: FlashTone;
    text: string;
  } | null>(null);

  if (!provider) return null;

  const canTest =
    Boolean(provider.integrationRecordId) &&
    (provider.status === "Connected" ||
      provider.status === "Needs Attention" ||
      provider.status === "Expired" ||
      provider.status === "Disabled");

  function notify(text: string, tone: FlashTone = "success") {
    setDrawerAlert({ tone, text });
    onFlash(text, tone);
  }

  async function runTest() {
    if (!provider?.integrationRecordId) return;
    setTestState("testing");
    try {
      const result = await integrationsApi.test(provider.integrationRecordId);
      setTestState(result.ok ? "success" : "error");
      setTestMessage(
        result.ok
          ? result.message
          : formatSmtpErrorMessage(result.message || "Test failed.")
      );
      onRefresh();
    } catch (error) {
      setTestState("error");
      setTestMessage(formatSmtpErrorMessage(getApiErrorMessage(error)));
    }
  }

  async function handleConnect(body: Record<string, unknown> = {}) {
    setBusy(true);
    setDrawerAlert(null);
    try {
      const result = await integrationsApi.connect(provider!.id, body);
      if (result.mode === "oauth_redirect" && result.authorizeUrl) {
        window.location.assign(result.authorizeUrl);
        return;
      }
      if (result.mode === "connected") {
        notify(`${provider!.name} connected.`, "success");
        onRefresh();
      } else if (provider!.id === "gmail") {
        notify(
          result.message ||
            "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the backend.",
          "error"
        );
      } else {
        notify(
          result.message ||
            `Open configuration to finish connecting ${provider!.name}.`,
          "error"
        );
        setShowConfig(true);
      }
    } catch (error) {
      notify(getApiErrorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleGmailCode(code: string) {
    await handleConnect({ code });
  }

  const gmailClientId = provider.oauthClientId?.trim() || "";
  const useGmailPopup = provider.id === "gmail" && Boolean(gmailClientId);
  const usesConfigConnect =
    provider.configKind === "smtp" ||
    provider.configKind === "whatsapp" ||
    provider.configKind === "calendly" ||
    provider.configKind === "zwayam";

  async function handleDisconnect() {
    if (!provider?.integrationRecordId) {
      await integrationsApi.disconnectByProvider(provider!.id);
    } else {
      await integrationsApi.disconnect(provider.integrationRecordId);
    }
    notify(`Disconnected ${provider!.name}.`, "success");
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
          setDrawerAlert(null);
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
          {drawerAlert ? (
            <InlineAlert tone={drawerAlert.tone}>{drawerAlert.text}</InlineAlert>
          ) : null}

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
                <div className="mt-2">
                  <InlineAlert tone="error">
                    {testMessage || "Test failed — reconnect to renew credentials."}
                  </InlineAlert>
                </div>
              ) : null}
            </div>
          ) : null}

          {usesConfigConnect && provider.status === "Not Connected" ? (
            <p className="text-xs text-muted-foreground">
              Enter the details in Configuration below to connect{" "}
              {provider.name}.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {provider.status === "Not Connected" ? (
                useGmailPopup ? (
                  <GmailConnectButton
                    clientId={gmailClientId}
                    busy={busy}
                    onCode={(code) => void handleGmailCode(code)}
                    onError={(message) => notify(message, "error")}
                  />
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={busy}
                    onClick={() => void handleConnect()}
                  >
                    <Plug aria-hidden />
                    {busy ? "Connecting…" : "Connect"}
                  </Button>
                )
              ) : (
                <>
                  {useGmailPopup ? (
                    <GmailConnectButton
                      clientId={gmailClientId}
                      busy={busy}
                      reconnect
                      onCode={(code) => void handleGmailCode(code)}
                      onError={(message) => notify(message, "error")}
                    />
                  ) : usesConfigConnect ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowConfig(true)}
                    >
                      <Settings2 aria-hidden />
                      Update configuration
                    </Button>
                  ) : (
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
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    disabled={busy}
                    onClick={() => {
                      void handleDisconnect().catch((error) =>
                        notify(getApiErrorMessage(error), "error")
                      );
                    }}
                  >
                    <Unplug aria-hidden />
                    Disconnect
                  </Button>
                </>
              )}
            </div>
          )}

          {provider.id === "gmail" && !gmailClientId ? (
            <p className="text-xs text-muted-foreground">
              Set <code className="font-mono">GOOGLE_CLIENT_ID</code> and{" "}
              <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in the
              backend env, then refresh this page to enable Google sign-in.
            </p>
          ) : null}

          {provider.configKind === "smtp" ||
          provider.configKind === "whatsapp" ||
          provider.configKind === "calendly" ||
          provider.configKind === "zwayam" ? (
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
                    onFeedback={notify}
                    onConnected={onRefresh}
                  />
                ) : provider.configKind === "whatsapp" ? (
                  <WhatsAppConfigPanel
                    providerId={provider.id}
                    onFeedback={notify}
                    onConnected={onRefresh}
                  />
                ) : provider.configKind === "zwayam" ? (
                  <ZwayamConfigPanel onSave={onFlash} onConnected={onRefresh} />
                ) : (
                  <CalendlyConfigPanel
                    onFeedback={notify}
                    onConnected={onRefresh}
                  />
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
  const [message, setMessage] = useState<{
    text: string;
    tone: FlashTone;
  } | null>(null);

  async function refresh() {
    try {
      const next = await integrationsApi.listProviders();
      setProviders(next);
      setSelected((current) =>
        current ? next.find((item) => item.id === current.id) || current : null
      );
    } catch (error) {
      setMessage({ text: getApiErrorMessage(error), tone: "error" });
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

  function flash(text: string, tone: FlashTone = "success") {
    setMessage({ text, tone });
    const errorHoldMs = Math.min(14_000, 5_000 + text.length * 25);
    window.setTimeout(() => setMessage(null), tone === "error" ? errorHoldMs : 2800);
  }

  function openProvider(provider: IntegrationProvider) {
    if (provider.inactive) return;
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
        {INTEGRATION_CATEGORIES.filter((cat) =>
          providers.some((provider) => provider.category === cat)
        ).map((cat) => {
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

      {message ? <InlineAlert tone={message.tone}>{message.text}</InlineAlert> : null}

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
