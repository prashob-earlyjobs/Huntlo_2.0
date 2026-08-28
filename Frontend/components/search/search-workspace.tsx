"use client";

import Link from "next/link";
import {
  Briefcase,
  Coins,
  Eraser,
  LoaderCircle,
  PenLine,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FilterPanel } from "@/components/search/filter-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getApiErrorMessage, isQuotaError, jobsApi, plansApi } from "@/lib/api";
import {
  applyCandidateSearch,
  promptFromJob,
} from "@/lib/api/candidate-search";
import type { JobListItem } from "@/lib/api/contracts";
import {
  clearEditSearchDraft,
  loadEditSearchDraft,
  type EditSearchDraft,
} from "@/lib/edit-search-draft";
import {
  EXAMPLE_QUERY,
  FILTER_FIELD_INDEX,
  FILTER_SECTIONS,
  isFieldActive,
  type FilterValue,
  type SavedSearch,
  type SearchFilterState,
} from "@/lib/mock-search";
import { filtersToProviderPayload } from "@/lib/search-filter-adapters";
import { ROUTES, sessionDetailPath } from "@/lib/routes";

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

function buildPromptFromJob(job: JobListItem): string {
  return `Find ${job.title.toLowerCase()}s in ${job.location} with ${job.experienceMin}–${job.experienceMax} years of experience for the ${job.department} team.`;
}

function formatFilterValue(value: FilterValue): string {
  if (typeof value === "boolean") return "Yes";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  const low = value.min !== null ? NUMBER_FORMAT.format(value.min) : "";
  const high = value.max !== null ? NUMBER_FORMAT.format(value.max) : "";
  if (low && high) return `${low}–${high}`;
  if (low) return `${low}+`;
  return `up to ${high}`;
}

/* ------------------------------------------------------------------ */
/* Practical initial state                                              */
/* ------------------------------------------------------------------ */

function GettingStarted({
  onUseExample,
  onUseSaved,
  recentSearches,
  loading = false,
}: {
  onUseExample: () => void;
  onUseSaved: (search: SavedSearch) => void;
  recentSearches: SavedSearch[];
  loading?: boolean;
}) {
  return (
    <section
      aria-label="Getting started"
      aria-busy={loading || undefined}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Try an example
          </h3>
          {loading ? (
            <Skeleton className="mt-2 h-[4.25rem] w-full rounded-md" />
          ) : (
            <button
              type="button"
              onClick={onUseExample}
              className="mt-2 block w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {EXAMPLE_QUERY}
            </button>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Saved searches
            </h3>
            {loading ? (
              <Skeleton className="h-6 w-36 rounded-md" />
            ) : (
              <Button
                size="xs"
                variant="ghost"
                nativeButton={false}
                render={<Link href={ROUTES.searchHistory} />}
              >
                Browse search history
              </Button>
            )}
          </div>
          {loading ? (
            <ul className="mt-2 space-y-2" aria-hidden>
              {Array.from({ length: 3 }).map((_, index) => (
                <li key={index} className="flex items-center justify-between gap-2 px-2">
                  <Skeleton className="h-4 w-[70%] max-w-56" />
                  <Skeleton className="h-3 w-14 shrink-0" />
                </li>
              ))}
            </ul>
          ) : recentSearches.length === 0 ? (
            <p className="mt-2 px-2 text-sm text-muted-foreground">
              No saved searches yet. Use Save Search on a results page.
            </p>
          ) : (
            <ul className="mt-1 space-y-0.5">
              {recentSearches.slice(0, 3).map((saved) => (
                <li key={saved.id}>
                  <button
                    type="button"
                    onClick={() => onUseSaved(saved)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                      {saved.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {saved.lastRun}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function SearchWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdFromUrl = searchParams.get("jobId");
  const editSessionIdFromUrl = searchParams.get("editSessionId");
  const appliedJobFromUrl = useRef(false);
  const appliedEditDraft = useRef(false);
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobIdFromUrl);
  const [editDraft, setEditDraft] = useState<EditSearchDraft | null>(null);
  const [saveModeOpen, setSaveModeOpen] = useState(false);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [filters, setFilters] = useState<SearchFilterState>({});
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRemaining, setSearchRemaining] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [recentSearchesLoading, setRecentSearchesLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [promptFromJobLoading, setPromptFromJobLoading] = useState(false);
  const jobsRef = useRef(jobs);
  jobsRef.current = jobs;
  const promptFromJobSeq = useRef(0);
  const promptFromJobAbort = useRef<AbortController | null>(null);

  const fillPromptFromJob = useCallback(async (jobId: string) => {
    const seq = ++promptFromJobSeq.current;
    promptFromJobAbort.current?.abort();
    const ac = new AbortController();
    promptFromJobAbort.current = ac;
    setPromptFromJobLoading(true);
    setError(null);
    try {
      const result = await promptFromJob({ jobId, signal: ac.signal });
      if (seq !== promptFromJobSeq.current) return;
      setQuery(result.prompt);
    } catch (err) {
      if (ac.signal.aborted || seq !== promptFromJobSeq.current) return;
      const fallback = jobsRef.current.find((item) => item.id === jobId);
      if (fallback) {
        setQuery(buildPromptFromJob(fallback));
        return;
      }
      setError(
        getApiErrorMessage(err, "Could not convert this job into a search prompt.")
      );
    } finally {
      if (seq === promptFromJobSeq.current) setPromptFromJobLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const items = await jobsApi.list({ limit: 50, status: "active" });
        if (!cancelled) setJobs(items);
      } catch {
        // Leave jobs empty when the API is unavailable.
      }
    })();
    void (async () => {
      try {
        const usage = await plansApi.getUsage();
        const searchRow = usage.find((row) => row.id === "searches");
        if (!cancelled && searchRow && searchRow.limit != null) {
          setSearchRemaining(Math.max(0, searchRow.limit - searchRow.used));
        }
      } catch {
        // Leave quota hidden when usage is unavailable.
      }
    })();
    void (async () => {
      setRecentSearchesLoading(true);
      try {
        const { getRecentSearches } = await import("@/lib/api/candidate-search");
        const result = await getRecentSearches({ limit: 5 });
        if (cancelled) return;
        setRecentSearches(
          result.recentSearches.map((entry) => ({
            id: entry.savedSessionId,
            name: entry.title || entry.prompt || "Search",
            query: entry.prompt || "",
            filters: 0,
            lastRun: entry.createdAt || "",
            results: entry.resultCount ?? 0,
          }))
        );
      } catch {
        if (!cancelled) setRecentSearches([]);
      } finally {
        if (!cancelled) setRecentSearchesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (appliedJobFromUrl.current || !jobIdFromUrl) return;
    appliedJobFromUrl.current = true;
    setSelectedJobId(jobIdFromUrl);
    void fillPromptFromJob(jobIdFromUrl);

    let cancelled = false;
    void (async () => {
      if (jobsRef.current.some((item) => item.id === jobIdFromUrl)) return;
      try {
        const detail = await jobsApi.getById(jobIdFromUrl);
        if (cancelled || !detail) return;
        setJobs((previous) =>
          previous.some((item) => item.id === detail.id)
            ? previous
            : [detail, ...previous]
        );
      } catch {
        // Select still works from jobId; list label may stay empty until jobs load.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobIdFromUrl, fillPromptFromJob]);

  useEffect(() => {
    if (appliedEditDraft.current) return;
    const draft = loadEditSearchDraft(editSessionIdFromUrl);
    if (!draft) return;
    appliedEditDraft.current = true;
    setEditDraft(draft);
    setQuery(draft.prompt);
    setFilters(draft.filters ?? {});
    setSelectedJobId(draft.jobId);
    setFilterDrawerOpen(true);
  }, [editSessionIdFromUrl]);

  const jobOptions = jobs;
  const selectedJob = jobOptions.find((job) => job.id === selectedJobId);

  const activeEntries = useMemo(
    () =>
      Object.entries(filters).filter(
        ([fieldId, value]) =>
          FILTER_FIELD_INDEX[fieldId] && isFieldActive(value)
      ),
    [filters]
  );
  const activeCount = activeEntries.length;

  const groupedActive = useMemo(() => {
    const bySection = new Map<
      string,
      { sectionId: string; sectionTitle: string; entries: [string, FilterValue][] }
    >();
    for (const [fieldId, value] of activeEntries) {
      const meta = FILTER_FIELD_INDEX[fieldId];
      const existing = bySection.get(meta.sectionId);
      if (existing) {
        existing.entries.push([fieldId, value]);
      } else {
        const section = FILTER_SECTIONS.find((item) => item.id === meta.sectionId);
        bySection.set(meta.sectionId, {
          sectionId: meta.sectionId,
          sectionTitle: section?.title ?? meta.sectionId,
          entries: [[fieldId, value]],
        });
      }
    }
    return Array.from(bySection.values());
  }, [activeEntries]);

  const isFresh = !query.trim() && activeCount === 0 && !searched;

  function setField(fieldId: string, value: FilterValue | undefined) {
    setFilters((previous) => {
      const next = { ...previous };
      if (value === undefined) {
        delete next[fieldId];
      } else {
        next[fieldId] = value;
      }
      return next;
    });
  }

  function resetSection(sectionId: string) {
    setFilters((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(
          ([fieldId]) => FILTER_FIELD_INDEX[fieldId]?.sectionId !== sectionId
        )
      )
    );
  }

  function resetAll() {
    setFilters({});
  }

  function clearSearch() {
    setQuery("");
    setSearched(false);
    setError(null);
    setPendingMessage(null);
    if (editDraft) {
      clearEditSearchDraft();
      setEditDraft(null);
    }
  }

  function useSavedSearch(saved: SavedSearch) {
    setQuery(saved.query);
  }

  async function handleSearchClick() {
    if (editDraft) {
      setSaveModeOpen(true);
      return;
    }
    await runSearch("new");
  }

  async function runSearch(mode: "new" | "update") {
    if (!canSearch || searching) return;
    setSearching(true);
    setSaveModeOpen(false);
    setError(null);
    setPendingMessage(null);
    try {
      const nextFilters = filters;
      const providerFilters = filtersToProviderPayload(nextFilters);
      const updateSessionId =
        mode === "update"
          ? editDraft?.sessionId || editDraft?.savedSessionId || undefined
          : undefined;
      const result = await applyCandidateSearch({
        prompt: query.trim(),
        filterForm: providerFilters,
        jobId: selectedJobId,
        sessionId: updateSessionId,
        page: 1,
        limit: 300,
      });

      if ("sessionPending" in result && result.sessionPending) {
        setPendingMessage(
          result.message ||
            "Finding candidates — matching profiles in progress."
        );
        if (result.savedSessionId) {
          setSearched(true);
          clearEditSearchDraft();
          setEditDraft(null);
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              `huntlo:search:${result.savedSessionId}`,
              JSON.stringify({
                sessionId: result.sessionId,
                savedSessionId: result.savedSessionId,
                prompt: query.trim(),
                filters: nextFilters,
              })
            );
          }
          router.push(sessionDetailPath(result.savedSessionId));
          return;
        }
        setSearching(false);
        return;
      }

      if (result.success && result.savedSessionId) {
        setSearched(true);
        clearEditSearchDraft();
        setEditDraft(null);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `huntlo:search:${result.savedSessionId}`,
            JSON.stringify({
              sessionId: result.sessionId,
              savedSessionId: result.savedSessionId,
              prompt: query.trim(),
              filters: nextFilters,
            })
          );
        }
        router.push(sessionDetailPath(result.savedSessionId));
        return;
      }

      setError("Search completed without a session id.");
      setSearching(false);
    } catch (err) {
      if (isQuotaError(err)) {
        setError("Candidate search quota exhausted. Upgrade your plan to continue.");
      } else {
        setError(getApiErrorMessage(err));
      }
      // Preserve prompt and filters on error
      setSearching(false);
    }
  }

  const canSearch =
    !promptFromJobLoading && (query.trim().length > 0 || activeCount > 0);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      onFieldChange={setField}
      onResetSection={resetSection}
      onResetAll={resetAll}
      activeCount={activeCount}
    />
  );

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
      <div className="min-w-0 space-y-4">
        {editDraft ? (
          <div
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <PenLine aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              Editing an existing search. Adjust the prompt or filters, then search.
            </span>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              onClick={() => {
                clearEditSearchDraft();
                setEditDraft(null);
              }}
            >
              Discard edit
            </Button>
          </div>
        ) : null}

        {/* Natural-language search composer */}
        <section
          aria-label="Search candidates"
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="nl-query" className="text-sm font-medium text-foreground">
                Describe the candidate profile
              </Label>
              {promptFromJobLoading ? (
                <p className="text-xs text-muted-foreground" role="status">
                  Converting job description into a search prompt…
                </p>
              ) : null}
            </div>
            {searchRemaining !== null ? (
              <Tooltip>
                <TooltipTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm">
                  <Coins aria-hidden className="size-3.5" />
                  {NUMBER_FORMAT.format(searchRemaining)} searches left
                </TooltipTrigger>
                <TooltipContent>1 search per query</TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <div
            className="ai-beam-border mt-2 rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
            data-processing={searching || promptFromJobLoading}
          >
            <Textarea
              id="nl-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                promptFromJobLoading
                  ? "Writing a searchable prompt from the job description…"
                  : "Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies."
              }
              className="min-h-48 resize-none rounded-b-none border-0 bg-transparent text-sm focus-visible:border-0 focus-visible:ring-0"
              aria-busy={searching || promptFromJobLoading}
              disabled={promptFromJobLoading}
            />

            {/* Composer toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-b-md bg-muted/50 px-2 py-1.5">
              <Select
                value={selectedJobId}
                onValueChange={(value) => {
                  if (!value) {
                    setSelectedJobId(null);
                    return;
                  }
                  setSelectedJobId(value);
                  void fillPromptFromJob(value);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="max-w-48 border-0 bg-transparent shadow-none hover:bg-muted"
                  aria-label="Select job"
                >
                  {promptFromJobLoading ? (
                    <LoaderCircle
                      aria-hidden
                      className="size-3.5 shrink-0 animate-spin text-muted-foreground"
                    />
                  ) : (
                    <Briefcase
                      aria-hidden
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                  <SelectValue placeholder="Select Job">
                    {selectedJob?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {jobOptions.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Advanced filters toggle — mobile / narrow screens only */}
              <div className="lg:hidden">
                <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                  <SheetTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <SlidersHorizontal aria-hidden />
                    Filters
                    {activeCount > 0 ? (
                      <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                        {activeCount}
                      </span>
                    ) : null}
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border">
                      <SheetTitle>Advanced filters</SheetTitle>
                      <SheetDescription className="sr-only">
                        Refine candidate search criteria by experience, location, skills and more
                      </SheetDescription>
                    </SheetHeader>
                    <div className="min-h-0 flex-1 overflow-y-auto">{filterPanel}</div>
                    <SheetFooter className="mt-0 flex-row items-center justify-end gap-3 border-t border-border p-3">
                      <Button
                        type="button"
                        size="sm"
                        disabled={!canSearch || searching || promptFromJobLoading}
                        aria-busy={searching || promptFromJobLoading}
                        onClick={() => {
                          setFilterDrawerOpen(false);
                          void handleSearchClick();
                        }}
                      >
                        {searching ? "Finding candidates…" : "Show results"}
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                {query || activeCount > 0 ? (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          aria-label="Clear search"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={clearSearch}
                        />
                      }
                    >
                      <Eraser aria-hidden />
                    </TooltipTrigger>
                    <TooltipContent>Clear search</TooltipContent>
                  </Tooltip>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  className="relative"
                  onClick={() => void handleSearchClick()}
                  disabled={!canSearch || searching || promptFromJobLoading}
                  aria-busy={searching || promptFromJobLoading}
                  aria-label={
                    promptFromJobLoading
                      ? "Writing search prompt"
                      : searching
                        ? "Finding candidates"
                        : "Search"
                  }
                >
                  {searching ? (
                    <>
                      <Search aria-hidden className="invisible" />
                      <LoaderCircle
                        aria-hidden
                        className="absolute left-1/2 -translate-x-1/2 animate-spin"
                      />
                    </>
                  ) : (
                    <Search aria-hidden />
                  )}
                  <span className={searching ? "invisible" : undefined}>Search</span>
                </Button>
              </div>
            </div>
          </div>
          {error ? (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {pendingMessage ? (
            <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              {pendingMessage}
            </p>
          ) : null}
        </section>

        {isFresh ? (
          <GettingStarted
            onUseExample={() => setQuery(EXAMPLE_QUERY)}
            onUseSaved={useSavedSearch}
            recentSearches={recentSearches}
            loading={recentSearchesLoading}
          />
        ) : (
          <>
            {/* Active filter summary */}
            <section
              aria-labelledby="active-filters-heading"
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2
                  id="active-filters-heading"
                  className="text-sm font-semibold text-foreground"
                >
                  Active filters
                  <span className="ml-1.5 rounded-sm bg-muted px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
                    {activeCount}
                  </span>
                </h2>
              </div>

              {activeCount === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No filters applied yet. Search uses your description as-is, or
                  refine manually in the filter panel.
                </p>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {groupedActive.map((group) => (
                    <Tooltip key={group.sectionId}>
                      <TooltipTrigger
                        type="button"
                        onClick={() => resetSection(group.sectionId)}
                        aria-label={`${group.sectionTitle}: ${group.entries.length} active filter${group.entries.length === 1 ? "" : "s"}. Click to reset.`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="font-medium text-foreground">
                          {group.sectionTitle}
                        </span>
                        <span className="rounded-sm bg-background px-1 text-[11px] font-semibold tabular-nums text-muted-foreground">
                          {group.entries.length}
                        </span>
                        <X aria-hidden className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-64">
                        <div className="space-y-1 text-left">
                          {group.entries.map(([fieldId, value]) => (
                            <p key={fieldId}>
                              <span className="font-medium">
                                {FILTER_FIELD_INDEX[fieldId].field.label}:
                              </span>{" "}
                              {formatFilterValue(value)}
                            </p>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  <Button type="button" size="xs" variant="ghost" onClick={resetAll}>
                    Clear all
                  </Button>
                </div>
              )}
            </section>

          </>
        )}
      </div>

      {/* Desktop filter sidebar — fixed height so FilterPanel's overflow-y-auto can scroll */}
      <aside className="sticky top-20 hidden h-[calc(100svh-5.25rem)] overflow-hidden rounded-lg border border-border bg-card lg:flex lg:flex-col">
        {filterPanel}
      </aside>

      <Dialog open={saveModeOpen} onOpenChange={setSaveModeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How should we save this search?</DialogTitle>
            <DialogDescription>
              Update the search you were editing, or keep that one and create a new
              search with these filters.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <Button
              type="button"
              disabled={searching}
              onClick={() => void runSearch("update")}
            >
              Update existing search
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={searching}
              onClick={() => void runSearch("new")}
            >
              Save as new search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
