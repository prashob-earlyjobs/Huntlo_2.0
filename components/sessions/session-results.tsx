"use client";

import Link from "next/link";
import {
  AlertCircle,
  Bookmark,
  Download,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Rows3,
  Search,
  Send,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CandidateCard } from "@/components/sessions/candidate-card";
import { CandidateDrawer } from "@/components/sessions/candidate-drawer";
import { CandidateTable } from "@/components/sessions/candidate-table";
import type { RevealState } from "@/components/sessions/contact-reveal";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SORT_OPTIONS,
  sortCandidates,
  type SessionCandidate,
  type SessionState,
  type SortOptionId,
  type SourcingSession,
} from "@/lib/mock-sessions";
import { ROUTES, jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const FILTER_CHIPS = [
  "Bengaluru",
  "4–7 yrs",
  "Node.js",
  "AWS",
  "SaaS",
  "Backend Engineer",
];

function SessionStateBanner({
  state,
  coverage,
  failureReason,
  loadedCount,
  totalCount,
}: {
  state: SessionState;
  coverage?: number;
  failureReason?: string;
  loadedCount: number;
  totalCount: number;
}) {
  if (state === "completed") return null;

  if (state === "running") {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl border border-primary/20 bg-brand-subtle/40 px-4 py-3"
      >
        <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            Search in progress
          </p>
          <p className="text-xs text-muted-foreground">
            {loadedCount} of {totalCount} candidates loaded — results update as
            the graph is scanned.
          </p>
        </div>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${totalCount > 0 ? (loadedCount / totalCount) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    );
  }

  if (state === "partial") {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3"
      >
        <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Partial results — {coverage ?? 0}% of the graph scanned
          </p>
          <p className="text-xs text-muted-foreground">
            Some candidates may be missing. Rerun the search to complete the
            scan.
          </p>
        </div>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-medium text-foreground">Search failed</p>
          <p className="text-xs text-muted-foreground">
            {failureReason ??
              "The search could not be completed. Your quota was not charged."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function ResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}

export function SessionResults({
  session,
  candidates,
}: {
  session: SourcingSession;
  candidates: SessionCandidate[];
}) {
  const [sort, setSort] = useState<SortOptionId>("best-match");
  const [view, setView] = useState<"table" | "card">("table");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(candidates.map((c) => [c.id, c.saved]))
  );
  const [revealedMap, setRevealedMap] = useState<Record<string, RevealState>>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [progressCount, setProgressCount] = useState(
    session.state === "running" ? 0 : candidates.length
  );
  const [initialLoading, setInitialLoading] = useState(
    session.state === "running"
  );

  useEffect(() => {
    if (session.state !== "running") return;

    setInitialLoading(true);
    const timer = window.setTimeout(() => setInitialLoading(false), 800);

    const interval = window.setInterval(() => {
      setProgressCount((previous) => {
        if (previous >= candidates.length) {
          window.clearInterval(interval);
          return previous;
        }
        return previous + 1;
      });
    }, 600);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [session.state, candidates.length]);

  const visibleCandidates = useMemo(() => {
    const list =
      session.state === "running"
        ? candidates.slice(0, progressCount)
        : candidates;
    return sortCandidates(list, sort);
  }, [candidates, sort, session.state, progressCount]);

  const drawerCandidate = candidates.find((c) => c.id === drawerId) ?? null;
  const drawerRevealed = drawerId
    ? (revealedMap[drawerId] ?? { email: false, phone: false })
    : { email: false, phone: false };

  function toggleSelect(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (visibleCandidates.every((c) => selected.has(c.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(visibleCandidates.map((c) => c.id)));
    }
  }

  function toggleSave(id: string) {
    setSavedMap((previous) => ({
      ...previous,
      [id]: !(previous[id] ?? false),
    }));
  }

  function reveal(id: string, kind: "email" | "phone") {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    if (kind === "email" && candidate.emailRevealed) return;
    if (kind === "phone" && candidate.phoneRevealed) return;

    setRevealedMap((previous) => ({
      ...previous,
      [id]: {
        email: kind === "email" ? true : (previous[id]?.email ?? false),
        phone: kind === "phone" ? true : (previous[id]?.phone ?? false),
      },
    }));
  }

  const isEmpty = session.state === "empty";
  const isFailed = session.state === "failed";
  const showResults =
    !isEmpty && !isFailed && !initialLoading && visibleCandidates.length > 0;
  const showNoResults =
    !isEmpty && !isFailed && !initialLoading && visibleCandidates.length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {session.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              &ldquo;{session.query}&rdquo;
            </p>
            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              <div>
                <dt className="inline font-medium text-foreground">
                  {session.resultCount.toLocaleString("en-IN")} results
                </dt>
              </div>
              <div>
                <dt className="inline">Date: </dt>
                <dd className="inline">{session.date}</dd>
              </div>
              <div>
                <dt className="inline">Job: </dt>
                <dd className="inline">
                  {session.relatedJobId ? (
                    <Link
                      href={jobDetailPath(session.relatedJobId)}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {session.relatedJobTitle}
                    </Link>
                  ) : (
                    "None"
                  )}
                </dd>
              </div>
              <div>
                <dt className="inline">Owner: </dt>
                <dd className="inline">{session.owner}</dd>
              </div>
              <div>
                <dt className="inline">Quota used: </dt>
                <dd className="inline font-medium tabular-nums text-foreground">
                  {session.quotaUsed} credits
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href={ROUTES.search} />}>
              <Pencil aria-hidden />
              Edit Search
            </Button>
            <Button size="sm" variant="outline">
              <Bookmark aria-hidden />
              Save Search
            </Button>
            <Button size="sm" variant="outline">
              <Download aria-hidden />
              Export
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={selected.size === 0}
            >
              <Users aria-hidden />
              Add Selected to List
              {selected.size > 0 ? (
                <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                  {selected.size}
                </span>
              ) : null}
            </Button>
            <Button size="sm" disabled={selected.size === 0}>
              <Send aria-hidden />
              Start Outreach
            </Button>
          </div>
        </div>
      </header>

      <SessionStateBanner
        state={session.state}
        coverage={session.coverage}
        failureReason={session.failureReason}
        loadedCount={progressCount}
        totalCount={candidates.length}
      />

      {/* Filter summary + toolbar */}
      {!isFailed ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidersHorizontal
              aria-hidden
              className="size-3.5 text-muted-foreground"
            />
            <span className="text-xs font-medium text-muted-foreground">
              Filters:
            </span>
            {FILTER_CHIPS.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground"
              >
                {chip}
                <button
                  type="button"
                  aria-label={`Remove ${chip} filter`}
                  className="rounded-sm outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <X aria-hidden className="size-3" />
                </button>
              </span>
            ))}
            <Button size="xs" variant="ghost" nativeButton={false} render={<Link href={ROUTES.search} />}>
              Edit filters
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium tabular-nums text-foreground">
                {visibleCandidates.length.toLocaleString("en-IN")}
              </span>{" "}
              candidates
              {selected.size > 0 ? (
                <span className="ml-2 text-primary">
                  · {selected.size} selected
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={sort}
                onValueChange={(value) => value && setSort(value as SortOptionId)}
              >
                <SelectTrigger size="sm" className="min-w-44" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div
                role="group"
                aria-label="View density"
                className="hidden items-center rounded-lg border border-border p-0.5 sm:inline-flex"
              >
                {(
                  [
                    ["comfortable", Rows3, "Comfortable"],
                    ["compact", List, "Compact"],
                  ] as const
                ).map(([value, Icon, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={density === value}
                    aria-label={label}
                    onClick={() => setDensity(value)}
                    className={cn(
                      "rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      density === value
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon aria-hidden className="size-3.5" />
                  </button>
                ))}
              </div>

              <div
                role="group"
                aria-label="View mode"
                className="inline-flex items-center rounded-lg border border-border p-0.5"
              >
                <button
                  type="button"
                  aria-pressed={view === "table"}
                  aria-label="Table view"
                  onClick={() => setView("table")}
                  className={cn(
                    "rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    view === "table"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List aria-hidden className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-pressed={view === "card"}
                  aria-label="Card view"
                  onClick={() => setView("card")}
                  className={cn(
                    "rounded-md p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    view === "card"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <LayoutGrid aria-hidden className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Results body */}
      {initialLoading ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <ResultsSkeleton />
        </section>
      ) : isFailed ? (
        <EmptyState
          icon={AlertCircle}
          title="Search failed"
          description={
            session.failureReason ??
            "The search could not be completed. Your quota was not charged."
          }
          actionLabel="Edit Search"
          actionHref={ROUTES.search}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={Search}
          title="No candidates found"
          description="Try broadening your location, skills or experience filters and run the search again."
          actionLabel="Edit Search"
          actionHref={ROUTES.search}
        />
      ) : showNoResults ? (
        <EmptyState
          icon={Users}
          title="No results yet"
          description="The search is still loading candidates. Check back in a moment."
        />
      ) : showResults ? (
        <section className="rounded-xl border border-border bg-card">
          {view === "table" ? (
            <CandidateTable
              candidates={visibleCandidates}
              density={density}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              savedMap={savedMap}
              onToggleSave={toggleSave}
              revealedMap={revealedMap}
              onReveal={reveal}
              onOpenProfile={setDrawerId}
              onAddToOutreach={() => undefined}
            />
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  selected={selected.has(candidate.id)}
                  onToggleSelect={() => toggleSelect(candidate.id)}
                  saved={savedMap[candidate.id] ?? candidate.saved}
                  onToggleSave={() => toggleSave(candidate.id)}
                  revealed={
                    revealedMap[candidate.id] ?? { email: false, phone: false }
                  }
                  onReveal={(kind) => reveal(candidate.id, kind)}
                  onOpenProfile={() => setDrawerId(candidate.id)}
                  onAddToOutreach={() => undefined}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <CandidateDrawer
        candidate={drawerCandidate}
        open={drawerId !== null}
        onOpenChange={(open) => !open && setDrawerId(null)}
        revealed={drawerRevealed}
        onReveal={(kind) => drawerId && reveal(drawerId, kind)}
        saved={
          drawerId
            ? (savedMap[drawerId] ?? drawerCandidate?.saved ?? false)
            : false
        }
        onToggleSave={() => drawerId && toggleSave(drawerId)}
        onAddToOutreach={() => undefined}
      />
    </div>
  );
}
