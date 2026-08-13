"use client";

import { LoaderCircle, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  getApiErrorMessage,
  isQuotaError,
  sourcingApi,
  type SourcingSessionApi,
} from "@/lib/api";
import {
  annotateCandidateSearch,
  applyCandidateSearch,
} from "@/lib/api/candidate-search";
import { hydrateSourcingSessionResults } from "@/components/outreach/audience-resolve";
import { cn } from "@/lib/utils";

type Mode = "existing" | "create";

function sessionLabel(session: SourcingSessionApi): string {
  const count =
    typeof session.resultCount === "number"
      ? ` (${session.resultCount})`
      : typeof session.estimatedResults === "number"
        ? ` (~${session.estimatedResults})`
        : "";
  return `${session.name || "Untitled search"}${count}`;
}

function sessionMeta(session: SourcingSessionApi): string {
  const parts: string[] = [];
  const status = session.status || session.state;
  if (status) parts.push(String(status));
  if (session.relatedJobTitle) parts.push(session.relatedJobTitle);
  if (session.date) {
    const parsed = new Date(session.date);
    if (!Number.isNaN(parsed.getTime())) {
      parts.push(parsed.toLocaleDateString());
    }
  }
  return parts.join(" · ");
}

export function SourcingSessionPickerDialog({
  open,
  onOpenChange,
  selectedSessionId,
  relatedJobId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSessionId?: string | null;
  relatedJobId?: string | null;
  onSelect: (session: SourcingSessionApi) => void;
}) {
  const [mode, setMode] = useState<Mode>("existing");
  const [sessions, setSessions] = useState<SourcingSessionApi[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMode("existing");
    setSearch("");
    setQuery("");
    setError(null);
    setCreating(false);

    void (async () => {
      setLoading(true);
      try {
        const next = await sourcingApi.listSessions({
          limit: 50,
          sort: "-createdAt",
        });
        if (!cancelled) setSessions(next);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to load sourcing sessions."));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sessions;
    return sessions.filter((session) => {
      const haystack = [
        session.name,
        session.query,
        session.naturalLanguageQuery,
        session.relatedJobTitle,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [search, sessions]);

  async function createSearch() {
    const prompt = query.trim();
    if (!prompt || creating) return;

    setCreating(true);
    setError(null);
    try {
      const annotated = await annotateCandidateSearch({ prompt });
      const result = await applyCandidateSearch({
        prompt,
        filterForm: annotated.filterForm,
        jobId: relatedJobId || null,
        page: 1,
        limit: 300,
      });

      const savedSessionId =
        "savedSessionId" in result ? result.savedSessionId : undefined;
      if (!savedSessionId) {
        throw new Error("Search started without a session id.");
      }

      // Apply often returns page 1 only — hydrate so audience gets the full set.
      const hydrated = await hydrateSourcingSessionResults(savedSessionId);

      let session = await sourcingApi.getSession(savedSessionId);
      if (!session) {
        session = {
          id: savedSessionId,
          name: prompt.slice(0, 80) || "New search",
          query: prompt,
          resultCount: hydrated.length,
          date: new Date().toISOString(),
          relatedJobId: relatedJobId || null,
          relatedJobTitle: null,
          owner: "You",
          quotaUsed: 0,
          state: "running",
          candidateIds: [],
          status:
            "sessionPending" in result && result.sessionPending
              ? "running"
              : "completed",
        };
      } else {
        session = {
          ...session,
          resultCount: Math.max(session.resultCount ?? 0, hydrated.length),
        };
      }

      setSessions((prev) => [
        session!,
        ...prev.filter((item) => item.id !== session!.id),
      ]);
      onSelect(session);
      onOpenChange(false);
    } catch (err) {
      if (isQuotaError(err)) {
        setError(
          "Candidate search quota exhausted. Upgrade your plan to continue."
        );
      } else {
        setError(getApiErrorMessage(err, "Unable to start search."));
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Keep parent audience state untouched while a search is starting.
        if (creating) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!creating}>
        <DialogHeader>
          <DialogTitle>Sourcing session</DialogTitle>
          <DialogDescription>
            Pick an existing AI search, or start a new one to feed this audience.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            disabled={creating}
            onClick={() => setMode("existing")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "existing"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Existing sessions
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={() => setMode("create")}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "create"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Create a search
          </button>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {mode === "existing" ? (
          <div className="space-y-3">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filter sessions…"
              aria-label="Filter sourcing sessions"
            />
            <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-muted-foreground">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Loading sessions…
                </div>
              ) : filtered.length === 0 ? (
                <div className="space-y-3 px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {sessions.length === 0
                      ? "No sourcing sessions yet."
                      : "No sessions match that filter."}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMode("create")}
                  >
                    <Plus aria-hidden />
                    Create a search
                  </Button>
                </div>
              ) : (
                filtered.map((session) => {
                  const selected = session.id === selectedSessionId;
                  return (
                    <button
                      key={session.id}
                      type="button"
                      disabled={creating}
                      onClick={() => {
                        // Existing-session pick only — no annotate/apply side effects.
                        onSelect(session);
                        onOpenChange(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
                        selected
                          ? "bg-brand-subtle text-foreground"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <Search
                        aria-hidden
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          selected ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {sessionLabel(session)}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {sessionMeta(session) ||
                            session.query ||
                            session.naturalLanguageQuery ||
                            "AI sourcing session"}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="sourcing-create-query"
                className="text-sm font-medium text-foreground"
              >
                Search prompt
              </label>
              <Textarea
                id="sourcing-create-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. Senior backend engineers in Bengaluru with 5+ years Node.js"
                rows={4}
                disabled={creating}
              />
              <p className="text-xs text-muted-foreground">
                Starts an AI search
                {relatedJobId ? " linked to the selected job" : ""}. You can use
                results as soon as the session is created.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={creating}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          {mode === "create" ? (
            <Button
              type="button"
              disabled={!query.trim() || creating}
              onClick={() => void createSearch()}
            >
              {creating ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Starting…
                </>
              ) : (
                <>
                  <Search aria-hidden />
                  Start search
                </>
              )}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
