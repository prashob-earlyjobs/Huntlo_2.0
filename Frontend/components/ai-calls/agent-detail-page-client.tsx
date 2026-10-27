"use client";

import { ChevronLeft, Phone, Rocket, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { recordFromAgentDetails } from "@/components/ai-calls/agent-record-view";
import {
  agentAvatarUrl,
  agentInitials,
  agentVoiceLabel,
  inputKeysFromRecord,
  languageFlag,
  shortAgentId,
} from "@/components/ai-calls/agent-display";
import { extractPromptVariables } from "@/components/admin/vocallabs-agent-defaults";
import { EmptyState } from "@/components/shared/empty-state";
import { Snackbar } from "@/components/shared/snackbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  getApiErrorMessage,
  vocallabsApi,
  type AssignedVocallabsAgent,
  type VocallabsAgentDetails,
} from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const CAMPAIGN_NAME_MAX = 120;

function campaignNameError(value: string): string | null {
  const name = value.trim();
  if (!name) return "Enter a campaign name.";
  if (name.length > CAMPAIGN_NAME_MAX) return `Use ${CAMPAIGN_NAME_MAX} characters or fewer.`;
  return null;
}

function AgentDetailSkeleton() {
  return (
    <div aria-busy className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <Skeleton className="h-[32rem] rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

function PromptBody({ text }: { text: string }) {
  const parts = text.split(/(\{\{\s*[A-Za-z0-9_]+\s*\}\})/g);
  return (
    <pre className="font-mono text-[13px] leading-6 whitespace-pre-wrap text-foreground">
      {parts.map((part, index) =>
        /^\{\{\s*[A-Za-z0-9_]+\s*\}\}$/.test(part) ? (
          <span key={index} className="rounded-sm bg-primary/10 px-0.5 text-primary">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </pre>
  );
}

function Panel({
  title,
  action,
  children,
  footer,
  className,
}: {
  title: string;
  action?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col rounded-xl border border-border bg-card ${className ?? ""}`}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h2 className="text-xs font-semibold tracking-wide text-foreground uppercase">{title}</h2>
        {action ? <span className="text-[11px] text-muted-foreground">{action}</span> : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      {footer ? <div className="border-t border-border p-4">{footer}</div> : null}
    </section>
  );
}

export function AgentDetailPageClient({ id }: { id: string }) {
  const [details, setDetails] = useState<VocallabsAgentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testSaving, setTestSaving] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [launchOpen, setLaunchOpen] = useState(false);
  const [launchName, setLaunchName] = useState("");
  const [launchNameTouched, setLaunchNameTouched] = useState(false);
  const [launchAgentId, setLaunchAgentId] = useState("");
  const [launchAgentQuery, setLaunchAgentQuery] = useState("");
  const [launchAgents, setLaunchAgents] = useState<AssignedVocallabsAgent[]>([]);
  const [launchSaving, setLaunchSaving] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "default" | "error" } | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    setError(null);
    vocallabsApi
      .getAssignedAgent(id)
      .then((remote) => {
        if (!cancelled) setDetails(remote);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.statusCode === 404) {
          setMissing(true);
          return;
        }
        setError(getApiErrorMessage(err, "Could not load this agent."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!launchOpen) return;
    let cancelled = false;
    vocallabsApi
      .listAssignedAgents()
      .then((page) => {
        if (!cancelled) setLaunchAgents(page.items);
      })
      .catch(() => {
        if (!cancelled) setLaunchAgents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [launchOpen]);

  const record = useMemo(
    () => (details ? recordFromAgentDetails(details) : {}),
    [details]
  );
  const variables = useMemo(() => {
    if (!details) return [];
    const fromPrompt = extractPromptVariables(details.welcomeMessage, details.agentPrompt);
    const extra = inputKeysFromRecord(record).filter((key) => !fromPrompt.includes(key));
    return [...fromPrompt, ...extra];
  }, [details, record]);

  if (loading) return <AgentDetailSkeleton />;

  if (missing) {
    return (
      <EmptyState
        title="Agent not found"
        description="This voice agent is not assigned to you, or the link is incorrect."
        actionLabel="Back to AI Agents"
        actionHref={ROUTES.aiCalls}
      />
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }

  function openLaunch() {
    if (!details) return;
    setLaunchName("");
    setLaunchNameTouched(false);
    setLaunchAgentId(details.id);
    setLaunchAgentQuery("");
    setLaunchError(null);
    setLaunchSaving(false);
    setLaunchOpen(true);
  }

  async function submitLaunch() {
    if (!details || launchSaving) return;
    setLaunchNameTouched(true);
    const name = launchName.trim();
    const nameError = campaignNameError(launchName);
    if (nameError || !launchAgentId) return;
    setLaunchSaving(true);
    setLaunchError(null);
    try {
      await vocallabsApi.createCampaign({ name, agentId: launchAgentId });
      setLaunchOpen(false);
      setToast({
        message: "Campaign created. It will show under Campaigns.",
        variant: "default",
      });
    } catch (err) {
      setLaunchError(getApiErrorMessage(err, "Could not create the campaign."));
    } finally {
      setLaunchSaving(false);
    }
  }

  function openTest() {
    setTestPhone("");
    setTestError(null);
    setTestStarted(false);
    setTestSaving(false);
    setTestOpen(true);
  }

  async function submitTest() {
    if (!details || testSaving) return;
    const phone = testPhone.trim();
    if (phone.replace(/\D/g, "").length < 8) {
      setTestError("Enter a phone number with at least 8 digits.");
      return;
    }
    setTestSaving(true);
    setTestError(null);
    try {
      await vocallabsApi.testAssignedAgent(details.id, { phone });
      setTestStarted(true);
    } catch (err) {
      setTestError(getApiErrorMessage(err, "Could not start the test call."));
    } finally {
      setTestSaving(false);
    }
  }

  if (!details) return null;

  const agentChoices = launchAgents.some((agent) => agent.id === details.id)
    ? launchAgents
    : [
        {
          id: details.id,
          name: details.name || "This agent",
          assignedAt: null,
          language: "",
          createdAt: null,
          updatedAt: null,
          status: "",
          avatarUrl: null,
        },
        ...launchAgents,
      ];
  const agentQuery = launchAgentQuery.trim().toLowerCase();
  const visibleAgents = agentQuery
    ? agentChoices.filter((agent) => agent.name.toLowerCase().includes(agentQuery))
    : agentChoices;
  const nameError = launchNameTouched ? campaignNameError(launchName) : null;
  const agentError = launchNameTouched && !launchAgentId ? "Choose an agent." : null;

  const avatar = agentAvatarUrl(record);
  const voice = agentVoiceLabel(record);
  const language = details.language.trim();
  const flag = languageFlag(language);
  const welcome = details.welcomeMessage.trim();
  const prompt = details.agentPrompt.trim();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <header className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          className="-ml-2"
          nativeButton={false}
          render={<Link href={ROUTES.aiCalls} />}
        >
          <ChevronLeft aria-hidden />
          Back
        </Button>
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium tracking-wide"
          >
            {agentInitials(details.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Agent name
          </p>
          <h1 className="truncate text-sm font-semibold text-foreground">{details.name || "Voice agent"}</h1>
          <p className="truncate font-mono text-[11px] text-muted-foreground">{shortAgentId(details.id)}</p>
        </div>
        <div className="ml-auto hidden flex-wrap items-center justify-end gap-2 sm:flex">
          {language ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] tracking-wide uppercase">
              {flag ? <span aria-hidden>{flag}</span> : null}
              {language}
            </span>
          ) : null}
          {voice ? (
            <span className="inline-flex max-w-56 truncate rounded-full border border-border px-2.5 py-1 text-[11px]">
              {voice}
            </span>
          ) : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:items-start">
        <div className="grid min-h-0 gap-3">
          <Panel title="Welcome message">
            {welcome ? (
              <PromptBody text={welcome} />
            ) : (
              <p className="text-sm text-muted-foreground">No welcome message saved.</p>
            )}
          </Panel>
          <Panel title="Agent prompt" className="min-h-[28rem]">
            {prompt ? (
              <PromptBody text={prompt} />
            ) : (
              <p className="text-sm text-muted-foreground">No agent prompt saved.</p>
            )}
          </Panel>
        </div>

        <Panel
          title="Prompt variables"
          footer={
            <div className="grid gap-2">
              <Button className="w-full" type="button" onClick={openLaunch}>
                <Rocket aria-hidden />
                Launch campaign
              </Button>
              <Button className="w-full" variant="outline" type="button" onClick={openTest}>
                <Phone aria-hidden />
                Test agent
              </Button>
            </div>
          }
        >
          {variables.length === 0 ? (
            <p className="text-sm text-muted-foreground">This script has no {"{{variables}}"}.</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {variables.map((key) => (
                <li
                  key={key}
                  className="rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground"
                >
                  {key}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Dialog
        open={launchOpen}
        onOpenChange={(next) => {
          if (!next && !launchSaving) setLaunchOpen(false);
        }}
      >
        <DialogContent className="gap-4">
          <DialogHeader>
            <DialogTitle>Launch campaign</DialogTitle>
            <DialogDescription>
              Creates a call campaign for the agent you choose.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="ai-campaign-name">Campaign name</Label>
            <Input
              id="ai-campaign-name"
              value={launchName}
              placeholder="Enter campaign name"
              maxLength={CAMPAIGN_NAME_MAX}
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "ai-campaign-name-error" : undefined}
              disabled={launchSaving}
              onChange={(event) => setLaunchName(event.target.value)}
              onBlur={() => setLaunchNameTouched(true)}
            />
            {nameError ? (
              <p id="ai-campaign-name-error" className="text-xs text-destructive" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="ai-campaign-agent-search">Agent</Label>
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="ai-campaign-agent-search"
                value={launchAgentQuery}
                placeholder="Search agents"
                aria-label="Search agents"
                disabled={launchSaving}
                className="pl-8"
                onChange={(event) => setLaunchAgentQuery(event.target.value)}
              />
            </div>
            <ul
              role="listbox"
              aria-label="Assigned agents"
              aria-invalid={Boolean(agentError)}
              className="max-h-40 overflow-y-auto rounded-md border border-border"
            >
              {visibleAgents.length === 0 ? (
                <li className="px-3 py-2 text-sm text-muted-foreground">No agents match this search.</li>
              ) : (
                visibleAgents.map((agent) => {
                  const selected = agent.id === launchAgentId;
                  return (
                    <li key={agent.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        disabled={launchSaving}
                        className={cn(
                          "flex w-full items-center px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:opacity-50",
                          selected && "bg-muted font-medium text-foreground"
                        )}
                        onClick={() => setLaunchAgentId(agent.id)}
                      >
                        {agent.name || "Untitled agent"}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            {agentError ? (
              <p className="text-xs text-destructive" role="alert">
                {agentError}
              </p>
            ) : null}
          </div>
          {launchError ? (
            <p className="text-sm text-destructive" role="alert">
              {launchError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={launchSaving} onClick={() => setLaunchOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={launchSaving} onClick={() => void submitLaunch()}>
              {launchSaving ? "Creating…" : "Create campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={testOpen}
        onOpenChange={(next) => {
          if (!next && !testSaving) setTestOpen(false);
        }}
      >
        <DialogContent className="gap-4">
          <DialogHeader>
            <DialogTitle>Test agent</DialogTitle>
            <DialogDescription>
              This number is called using {details.name || "this agent"}. Required inputs are filled with test values.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="assigned-agent-test-phone">Phone number</Label>
            <Input
              id="assigned-agent-test-phone"
              type="tel"
              autoComplete="tel"
              value={testPhone}
              placeholder="+91 98000 00000"
              disabled={testSaving || testStarted}
              onChange={(event) => setTestPhone(event.target.value)}
            />
          </div>
          {testError ? (
            <p className="text-sm text-destructive" role="alert">
              {testError}
            </p>
          ) : null}
          {testStarted ? (
            <p className="text-sm text-foreground" role="status">
              Test call started. This number is being called.
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={testSaving} onClick={() => setTestOpen(false)}>
              {testStarted ? "Close" : "Cancel"}
            </Button>
            {testStarted ? null : (
              <Button type="button" disabled={testSaving} onClick={() => void submitTest()}>
                {testSaving ? "Calling…" : "Start test call"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Snackbar message={toast?.message ?? null} variant={toast?.variant} onDismiss={dismissToast} />
    </div>
  );
}
