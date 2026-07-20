"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AddToListDialog } from "@/components/candidates/add-to-list-dialog";
import { CandidateCard } from "@/components/sessions/candidate-card";
import { CandidateDrawer } from "@/components/sessions/candidate-drawer";
import { CandidateTable } from "@/components/sessions/candidate-table";
import type { RevealState } from "@/components/sessions/contact-reveal";
import { FilterPanel } from "@/components/search/filter-panel";
import { EmptyState } from "@/components/shared/empty-state";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SessionResultsTableSkeleton } from "@/components/sessions/session-results-skeleton";
import { getApiErrorMessage, candidatesApi, uiRevealKindToType } from "@/lib/api";
import { mapCandidateDetailsToSessionCandidate } from "@/lib/api/candidate-details";
import {
  applyCandidateSearch,
  getCandidateDetails,
} from "@/lib/api/candidate-search";
import {
  FILTER_SECTIONS,
  INTERPRETED_FILTER_STATE,
  isFieldActive,
  type FilterValue,
  type SearchFilterState,
} from "@/lib/mock-search";
import {
  SORT_OPTIONS,
  sortCandidates,
  type SessionCandidate,
  type SessionState,
  type SortOptionId,
  type SourcingSession,
} from "@/lib/mock-sessions";
import { ROUTES, jobDetailPath, sessionDetailPath } from "@/lib/routes";
import { filtersToProviderPayload } from "@/lib/search-filter-adapters";
import { cn } from "@/lib/utils";

function matchesResultQuery(candidate: SessionCandidate, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [
    candidate.name,
    candidate.currentRole,
    candidate.currentCompany,
    candidate.location,
    ...candidate.skills,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function loadSessionFilters(sessionId: string): SearchFilterState {
  if (typeof window === "undefined") return INTERPRETED_FILTER_STATE;
  try {
    const stored = sessionStorage.getItem(`huntlo:search:${sessionId}`);
    if (!stored) return INTERPRETED_FILTER_STATE;
    const parsed = JSON.parse(stored) as { filters?: SearchFilterState };
    return parsed.filters && typeof parsed.filters === "object"
      ? parsed.filters
      : INTERPRETED_FILTER_STATE;
  } catch {
    return INTERPRETED_FILTER_STATE;
  }
}

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
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
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
        className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3"
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
        className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
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

export function SessionResults({
  session,
  candidates,
  initialFilters,
}: {
  session: SourcingSession;
  candidates: SessionCandidate[];
  initialFilters?: SearchFilterState | null;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<SortOptionId>("best-match");
  const [view, setView] = useState<"table" | "card">("table");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [resultQuery, setResultQuery] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>(() =>
    initialFilters ?? loadSessionFilters(session.id)
  );
  const [rerunningSearch, setRerunningSearch] = useState(false);
  const [rerunError, setRerunError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(candidates.map((c) => [c.id, c.saved]))
  );
  const [revealedMap, setRevealedMap] = useState<Record<string, RevealState>>({});
  const [localCandidates, setLocalCandidates] = useState(candidates);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerDetailsLoading, setDrawerDetailsLoading] = useState(false);
  const [drawerDetailsError, setDrawerDetailsError] = useState<string | null>(null);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [addToListCandidateIds, setAddToListCandidateIds] = useState<string[]>([]);
  const [addToListMessage, setAddToListMessage] = useState<string | null>(null);
  const detailsFetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setLocalCandidates((prev) => {
      const prevMap = new Map(prev.map((c) => [c.id, c]));
      return candidates.map((incoming) => {
        const existing = prevMap.get(incoming.id);
        if (!existing || !detailsFetchedRef.current.has(incoming.id)) {
          return incoming;
        }
        return {
          ...incoming,
          experience: existing.experience.length ? existing.experience : incoming.experience,
          education: existing.education.length ? existing.education : incoming.education,
          summary: existing.summary || incoming.summary,
          matchBreakdown: existing.matchBreakdown,
          avatarUrl: existing.avatarUrl || incoming.avatarUrl,
          signals: existing.signals.length ? existing.signals : incoming.signals,
          headline: existing.headline || incoming.headline,
        };
      });
    });
  }, [candidates]);

  useEffect(() => {
    setSavedMap((previous) => ({
      ...previous,
      ...Object.fromEntries(
        candidates.map((candidate) => [
          candidate.id,
          previous[candidate.id] || candidate.saved,
        ])
      ),
    }));
  }, [candidates]);

  const [progressCount, setProgressCount] = useState(
    session.state === "running" ? 0 : candidates.length
  );
  const [initialLoading, setInitialLoading] = useState(
    session.state === "running" && candidates.length === 0
  );

  useEffect(() => {
    if (!drawerId) {
      setDrawerDetailsLoading(false);
      setDrawerDetailsError(null);
      return;
    }
    if (detailsFetchedRef.current.has(drawerId)) return;

    let cancelled = false;
    setDrawerDetailsLoading(true);
    setDrawerDetailsError(null);

    void getCandidateDetails(drawerId, { sessionId: session.id })
      .then((res) => {
        if (cancelled) return;
        detailsFetchedRef.current.add(drawerId);
        setLocalCandidates((prev) =>
          prev.map((c) =>
            c.id === drawerId
              ? mapCandidateDetailsToSessionCandidate(c, res.candidate)
              : c
          )
        );
      })
      .catch((error) => {
        if (cancelled) return;
        setDrawerDetailsError(
          getApiErrorMessage(error) || "Could not load full profile details"
        );
      })
      .finally(() => {
        if (!cancelled) setDrawerDetailsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [drawerId, session.id]);

  // Keep the progressive reveal in sync with live candidate growth. Never leave
  // the skeleton stuck after the session leaves "running".
  useEffect(() => {
    if (session.state !== "running") {
      setInitialLoading(false);
      setProgressCount(candidates.length);
      return;
    }

    if (candidates.length === 0) {
      setInitialLoading(true);
      const timer = window.setTimeout(() => setInitialLoading(false), 800);
      return () => window.clearTimeout(timer);
    }

    setInitialLoading(false);
    const interval = window.setInterval(() => {
      setProgressCount((previous) => {
        if (previous >= candidates.length) {
          window.clearInterval(interval);
          return candidates.length;
        }
        return previous + 1;
      });
    }, 60);

    return () => window.clearInterval(interval);
  }, [session.state, candidates.length]);

  // If more candidates arrive while running, never clamp progress below what we
  // already revealed — just let the interval catch up.
  useEffect(() => {
    if (session.state !== "running") return;
    setProgressCount((previous) =>
      previous > candidates.length ? candidates.length : previous
    );
  }, [session.state, candidates.length]);

  const visibleCandidates = useMemo(() => {
    const list =
      session.state === "running"
        ? localCandidates.slice(0, progressCount)
        : localCandidates;
    const filtered = list.filter((candidate) =>
      matchesResultQuery(candidate, resultQuery)
    );
    return sortCandidates(filtered, sort);
  }, [localCandidates, sort, session.state, progressCount, resultQuery]);

  const drawerCandidate = localCandidates.find((c) => c.id === drawerId) ?? null;
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

  function openAddToList(ids: string[]) {
    if (!ids.length) return;
    setAddToListCandidateIds(ids);
    setAddToListMessage(null);
    setAddToListOpen(true);
  }

  async function reveal(id: string, kind: "email" | "phone") {
    const candidate = localCandidates.find((c) => c.id === id);
    if (!candidate) return;
    if (kind === "email" && candidate.emailRevealed) return;
    if (kind === "phone" && candidate.phoneRevealed) return;

    setRevealError(null);
    setRevealedMap((previous) => {
      const current = previous[id] ?? { email: false, phone: false };
      return {
        ...previous,
        [id]: {
          ...current,
          [kind === "email" ? "emailStatus" : "phoneStatus"]: "loading",
        },
      };
    });
    try {
      const result = await candidatesApi.revealContact({
        candidateId: id,
        type: uiRevealKindToType(kind),
      });
      const value = result.value || result.values[0] || "";
      if (!result.found || !value) {
        setRevealedMap((previous) => {
          const current = previous[id] ?? { email: false, phone: false };
          return {
            ...previous,
            [id]: {
              ...current,
              [kind === "email" ? "emailStatus" : "phoneStatus"]: "unavailable",
            },
          };
        });
        return;
      }
      setLocalCandidates((previous) =>
        previous.map((item) => {
          if (item.id !== id) return item;
          if (kind === "email") {
            return {
              ...item,
              email: value || item.email,
              emailRevealed: true,
            };
          }
          return {
            ...item,
            phone: value || item.phone,
            phoneRevealed: true,
          };
        })
      );
      setRevealedMap((previous) => ({
        ...previous,
        [id]: {
          ...(previous[id] ?? { email: false, phone: false }),
          [kind]: true,
          [kind === "email" ? "emailStatus" : "phoneStatus"]: "idle",
        },
      }));
    } catch (err) {
      setRevealedMap((previous) => {
        const current = previous[id] ?? { email: false, phone: false };
        return {
          ...previous,
          [id]: {
            ...current,
            [kind === "email" ? "emailStatus" : "phoneStatus"]: "idle",
          },
        };
      });
      setRevealError(getApiErrorMessage(err));
    }
  }

  const activeFilterCount = Object.values(searchFilters).filter(isFieldActive).length;

  function updateSearchFilter(fieldId: string, value: FilterValue | undefined) {
    setSearchFilters((previous) => {
      if (value === undefined) {
        const next = { ...previous };
        delete next[fieldId];
        return next;
      }
      return { ...previous, [fieldId]: value };
    });
  }

  function resetFilterSection(sectionId: string) {
    const section = FILTER_SECTIONS.find((item) => item.id === sectionId);
    if (!section) return;
    setSearchFilters((previous) => {
      const next = { ...previous };
      section.fields.forEach((field) => delete next[field.id]);
      return next;
    });
  }

  async function rerunSearch() {
    if (rerunningSearch) return;
    setRerunningSearch(true);
    setRerunError(null);
    try {
      const result = await applyCandidateSearch({
        prompt: session.query,
        filterForm: filtersToProviderPayload(searchFilters),
        page: 1,
        limit: 300,
      });
      const savedSessionId =
        "savedSessionId" in result ? result.savedSessionId : undefined;
      if (!savedSessionId) {
        throw new Error("Search started without a session id.");
      }
      try {
        sessionStorage.setItem(
          `huntlo:search:${savedSessionId}`,
          JSON.stringify({
            sessionId: result.sessionId,
            savedSessionId,
            prompt: session.query,
            filters: searchFilters,
          })
        );
      } catch {
        // Navigation still succeeds when browser storage is unavailable.
      }
      setFilterDrawerOpen(false);
      router.push(sessionDetailPath(savedSessionId));
    } catch (error) {
      setRerunError(getApiErrorMessage(error));
      setRerunningSearch(false);
    }
  }

  const isEmpty = session.state === "empty";
  const isFailed = session.state === "failed";
  const showResults =
    !isEmpty && !isFailed && !initialLoading && visibleCandidates.length > 0;
  const showNoResults =
    !isEmpty && !isFailed && !initialLoading && visibleCandidates.length === 0;

  return (
    <div className="space-y-4">
      {/* Compact context bar */}
      <header className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="truncate text-base font-semibold text-foreground">
              {session.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              &ldquo;{session.query}&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>
                <span className="font-medium tabular-nums text-foreground">
                  {session.resultCount.toLocaleString("en-IN")}
                </span>{" "}
                results
              </span>
              <span>
                Job:{" "}
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
              </span>
              <span>
                Quota:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {session.quotaUsed} credits
                </span>
              </span>
              <span className="text-muted-foreground/70">
                {session.owner} · {session.date}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href={ROUTES.search} />}>
              <Pencil aria-hidden />
              Edit Search
            </Button>
            <Button size="sm" variant="outline">
              <Bookmark aria-hidden />
              Save Search
            </Button>
          </div>
        </div>
      </header>

      <SessionStateBanner
        state={session.state}
        coverage={session.coverage}
        failureReason={session.failureReason}
        loadedCount={progressCount}
        totalCount={localCandidates.length}
      />

      {revealError ? (
        <p role="alert" className="text-sm text-destructive">
          {revealError}
        </p>
      ) : null}
      {addToListMessage ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {addToListMessage}
        </p>
      ) : null}

      {/* Result controls — one compact toolbar */}
      {!isFailed ? (
        <section className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2.5">
          <span className="shrink-0 text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {visibleCandidates.length.toLocaleString("en-IN")}
            </span>{" "}
            candidates
            {selected.size > 0 ? (
              <span className="ml-1.5 text-primary">· {selected.size} selected</span>
            ) : null}
          </span>

          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              value={resultQuery}
              onChange={(event) => setResultQuery(event.target.value)}
              placeholder="Search within results…"
              aria-label="Search within results"
              className="h-8 w-44 pl-8 text-sm"
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setFilterDrawerOpen(true)}
          >
            <SlidersHorizontal aria-hidden />
            Filters
            {activeFilterCount > 0 ? (
              <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>

          <Select
            value={sort}
            onValueChange={(value) => value && setSort(value as SortOptionId)}
          >
            <SelectTrigger size="sm" className="min-w-40" aria-label="Sort results">
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

          {/* Bulk actions */}
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {selected.size > 0 ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void (async () => {
                      setRevealError(null);
                      try {
                        await candidatesApi.bulkReveal(
                          Array.from(selected).map((candidateId) => ({
                            candidateId,
                            contactTypes: ["email", "mobile"] as const,
                          }))
                        );
                      } catch (err) {
                        setRevealError(getApiErrorMessage(err));
                      }
                    })();
                  }}
                >
                  Reveal contacts
                  <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                    {selected.size}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openAddToList(Array.from(selected))}
                >
                  <Users aria-hidden />
                  Add to List
                  <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                    {selected.size}
                  </span>
                </Button>
                <Button size="sm">
                  <Send aria-hidden />
                  Start Outreach
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost">
                <Download aria-hidden />
                Export
              </Button>
            )}
          </div>
        </section>
      ) : null}

      {/* Results body */}
      {initialLoading ? (
        <SessionResultsTableSkeleton rows={8} />
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
              onToggleSave={(id) => openAddToList([id])}
              revealedMap={revealedMap}
              onReveal={(id, kind) => void reveal(id, kind)}
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
                  onToggleSave={() => openAddToList([candidate.id])}
                  revealed={
                    revealedMap[candidate.id] ?? { email: false, phone: false }
                  }
                  onReveal={(kind) => void reveal(candidate.id, kind)}
                  onOpenProfile={() => setDrawerId(candidate.id)}
                  onAddToOutreach={() => undefined}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
          <SheetHeader className="sr-only">
            <SheetTitle>Edit search filters</SheetTitle>
            <SheetDescription>
              Update the filters used for this candidate search.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1">
            <FilterPanel
              filters={searchFilters}
              onFieldChange={updateSearchFilter}
              onResetSection={resetFilterSection}
              onResetAll={() => setSearchFilters({})}
              activeCount={activeFilterCount}
            />
          </div>
          <SheetFooter className="mt-0 border-t border-border p-3">
            {rerunError ? (
              <p role="alert" className="mr-auto text-xs text-destructive">
                {rerunError}
              </p>
            ) : null}
            <Button
              type="button"
              onClick={() => void rerunSearch()}
              disabled={rerunningSearch}
            >
              {rerunningSearch ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <Search aria-hidden />
              )}
              {rerunningSearch ? "Searching…" : "Search again"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CandidateDrawer
        candidate={drawerCandidate}
        open={drawerId !== null}
        onOpenChange={(open) => !open && setDrawerId(null)}
        revealed={drawerRevealed}
        onReveal={(kind) => {
          if (drawerId) void reveal(drawerId, kind);
        }}
        saved={
          drawerId
            ? (savedMap[drawerId] ?? drawerCandidate?.saved ?? false)
            : false
        }
        onToggleSave={() => drawerId && openAddToList([drawerId])}
        onAddToOutreach={() => undefined}
        detailsLoading={drawerDetailsLoading}
        detailsError={drawerDetailsError}
      />
      <AddToListDialog
        open={addToListOpen}
        onOpenChange={setAddToListOpen}
        sourcedCandidateIds={addToListCandidateIds}
        onSaved={(list, savedCount) => {
          setSavedMap((previous) => ({
            ...previous,
            ...Object.fromEntries(addToListCandidateIds.map((id) => [id, true])),
          }));
          setAddToListMessage(
            savedCount > 0
              ? `Added ${savedCount} candidate${savedCount === 1 ? "" : "s"} to ${list.name}.`
              : `The selected candidate${addToListCandidateIds.length === 1 ? " is" : "s are"} already in ${list.name}.`
          );
          setSelected(new Set());
        }}
      />
    </div>
  );
}
