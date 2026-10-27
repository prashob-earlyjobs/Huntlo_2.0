"use client";

import { PhoneCall, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AgentCard } from "@/components/ai-calls/agent-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, vocallabsApi, type AssignedVocallabsAgent } from "@/lib/api";

function AssignedAgentsSkeleton() {
  return (
    <ul
      aria-busy
      aria-label="Loading agents"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2 pt-0.5">
              <Skeleton className="h-4 w-[70%] max-w-48" />
              <Skeleton className="h-3 w-[52%] max-w-36" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-36" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="mt-4 h-8 w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

export function AssignedAgentsWorkspace() {
  const [agents, setAgents] = useState<AssignedVocallabsAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    vocallabsApi
      .listAssignedAgents()
      .then((page) => {
        if (!cancelled) setAgents(page.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setAgents([]);
          setError(getApiErrorMessage(err, "Could not load assigned agents."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((agent) => agent.name.toLowerCase().includes(q));
  }, [agents, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {agents.length > 0 || query ? (
        <div className="relative max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search agents…"
            aria-label="Search agents"
            className="pl-8"
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <AssignedAgentsSkeleton /> : null}

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={PhoneCall}
          title={agents.length === 0 ? "No voice agents assigned" : "No agents match this search"}
          description={
            agents.length === 0
              ? "When an admin assigns a voice agent to you, it will show up here."
              : "Try a different name, or clear the search to see every assigned agent."
          }
        />
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((agent) => (
            <li key={agent.id}>
              <AgentCard agent={agent} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
