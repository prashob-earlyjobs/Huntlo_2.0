"use client";

import { ChevronDown, Megaphone, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CampaignCard } from "@/components/ai-calls/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
  getApiErrorMessage,
  vocallabsApi,
  type AssignedVocallabsAgent,
  type VocallabsCampaign,
} from "@/lib/api";
import { aiCallCampaignPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const CAMPAIGN_NAME_MAX = 120;

function campaignNameError(value: string): string | null {
  const name = value.trim();
  if (!name) return "Enter a campaign name.";
  if (name.length > CAMPAIGN_NAME_MAX) return `Use ${CAMPAIGN_NAME_MAX} characters or fewer.`;
  return null;
}

function CampaignsSkeleton() {
  return (
    <div aria-busy className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

const LAUNCHED_TOAST_KEY = "huntlo-campaign-launched";

export function AiCallCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<VocallabsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createNameTouched, setCreateNameTouched] = useState(false);
  const [createAgentId, setCreateAgentId] = useState("");
  const [createAgentQuery, setCreateAgentQuery] = useState("");
  const [agentMenuOpen, setAgentMenuOpen] = useState(false);
  const [createAgents, setCreateAgents] = useState<AssignedVocallabsAgent[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSaving, setCreateSaving] = useState(false);

  useEffect(() => {
    const message = sessionStorage.getItem(LAUNCHED_TOAST_KEY);
    if (!message) return;
    sessionStorage.removeItem(LAUNCHED_TOAST_KEY);
    setToast(message);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    vocallabsApi
      .listCampaigns()
      .then((page) => {
        if (!cancelled) setCampaigns(page.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setCampaigns([]);
          setError(getApiErrorMessage(err, "Could not load campaigns."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!createOpen) return;
    let cancelled = false;
    vocallabsApi
      .listAssignedAgents()
      .then((page) => {
        if (!cancelled) setCreateAgents(page.items);
      })
      .catch(() => {
        if (!cancelled) setCreateAgents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [createOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.agentName}`.toLowerCase().includes(q)
    );
  }, [campaigns, query]);

  function openCreate() {
    setCreateName("");
    setCreateNameTouched(false);
    setCreateAgentId("");
    setCreateAgentQuery("");
    setAgentMenuOpen(false);
    setCreateError(null);
    setCreateSaving(false);
    setCreateOpen(true);
  }

  async function submitCreate() {
    if (createSaving) return;
    setCreateNameTouched(true);
    const name = createName.trim();
    if (campaignNameError(createName) || !createAgentId) return;
    setCreateSaving(true);
    setCreateError(null);
    try {
      const created = await vocallabsApi.createCampaign({ name, agentId: createAgentId });
      setCreateOpen(false);
      router.push(`${aiCallCampaignPath(created.id)}?created=1`);
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Could not create the campaign."));
    } finally {
      setCreateSaving(false);
    }
  }

  const agentQuery = createAgentQuery.trim().toLowerCase();
  const visibleAgents = agentQuery
    ? createAgents.filter((agent) => agent.name.toLowerCase().includes(agentQuery))
    : createAgents;
  const nameError = createNameTouched ? campaignNameError(createName) : null;
  const agentError = createNameTouched && !createAgentId ? "Choose an agent." : null;
  const selectedAgent = createAgents.find((agent) => agent.id === createAgentId);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Calling campaigns for your voice agents."
      />

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search campaigns…"
            aria-label="Search campaigns"
            className="pl-8"
          />
        </div>
        <Button type="button" className="shrink-0" onClick={openCreate}>
          <Plus aria-hidden />
          Create campaign
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <CampaignsSkeleton /> : null}

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={campaigns.length === 0 ? "No campaigns yet" : "No campaigns match this search"}
          description={
            campaigns.length === 0
              ? "Campaigns you launch from an agent are saved here."
              : "Try a different name, or clear the search."
          }
        />
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign) => (
            <li key={campaign.id}>
              <CampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      ) : null}
      <Snackbar message={toast} onDismiss={dismissToast} />
      <Dialog
        open={createOpen}
        onOpenChange={(next) => {
          if (!next && !createSaving) setCreateOpen(false);
        }}
      >
        <DialogContent className="gap-4">
          <DialogHeader>
            <DialogTitle>Create campaign</DialogTitle>
            <DialogDescription>
              Creates a call campaign for the agent you choose.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="campaigns-create-name">Campaign name</Label>
            <Input
              id="campaigns-create-name"
              value={createName}
              placeholder="Enter campaign name"
              maxLength={CAMPAIGN_NAME_MAX}
              required
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? "campaigns-create-name-error" : undefined}
              disabled={createSaving}
              onChange={(event) => setCreateName(event.target.value)}
              onBlur={() => setCreateNameTouched(true)}
            />
            {nameError ? (
              <p id="campaigns-create-name-error" className="text-xs text-destructive" role="alert">
                {nameError}
              </p>
            ) : null}
          </div>
          <div className="grid gap-1.5">
            <Label id="campaigns-create-agent-label">Agent</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between font-normal"
              aria-labelledby="campaigns-create-agent-label"
              aria-expanded={agentMenuOpen}
              aria-haspopup="listbox"
              disabled={createSaving}
              onClick={() => setAgentMenuOpen((open) => !open)}
            >
              <span className={cn("truncate", !selectedAgent && "text-muted-foreground")}>
                {selectedAgent?.name || "Select an agent"}
              </span>
              <ChevronDown aria-hidden />
            </Button>
            {agentMenuOpen ? (
              <div className="grid gap-1.5">
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="campaigns-create-agent-search"
                    value={createAgentQuery}
                    placeholder="Search agents"
                    aria-label="Search agents"
                    disabled={createSaving}
                    className="pl-8"
                    onChange={(event) => setCreateAgentQuery(event.target.value)}
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
                      const selected = agent.id === createAgentId;
                      return (
                        <li key={agent.id}>
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            disabled={createSaving}
                            className={cn(
                              "flex w-full items-center px-3 py-2 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted disabled:opacity-50",
                              selected && "bg-muted font-medium text-foreground"
                            )}
                            onClick={() => {
                              setCreateAgentId(agent.id);
                              setAgentMenuOpen(false);
                            }}
                          >
                            {agent.name || "Untitled agent"}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
            ) : null}
            {agentError ? (
              <p className="text-xs text-destructive" role="alert">
                {agentError}
              </p>
            ) : null}
          </div>
          {createError ? (
            <p className="text-sm text-destructive" role="alert">
              {createError}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={createSaving} onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={createSaving} onClick={() => void submitCreate()}>
              {createSaving ? "Creating…" : "Create campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
