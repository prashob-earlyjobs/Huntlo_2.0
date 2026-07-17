"use client";

import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  Check,
  Coins,
  Eraser,
  FileText,
  PenLine,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { FilterPanel } from "@/components/search/filter-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getApiErrorMessage, isQuotaError, jobsApi, plansApi } from "@/lib/api";
import {
  annotateCandidateSearch,
  applyCandidateSearch,
  type CandidateFilterForm,
} from "@/lib/api/candidate-search";
import type { JobListItem } from "@/lib/api/contracts";
import {
  EXAMPLE_QUERY,
  FILTER_FIELD_INDEX,
  FILTER_SECTIONS,
  INTERPRETED_FILTER_STATE,
  estimateReach,
  isFieldActive,
  type FilterValue,
  type InterpretedCriterion,
  type SavedSearch,
  type SearchFilterState,
} from "@/lib/mock-search";
import { ROUTES, sessionDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Map UI filter state into Future Jobs filter-form keys the backend accepts. */
function filtersToProviderPayload(filters: SearchFilterState): CandidateFilterForm {
  const payload: CandidateFilterForm = { ...filters };

  const currentTitle = filters.currentTitle;
  if (Array.isArray(currentTitle) && currentTitle.length > 0) {
    payload.currentTitle = currentTitle.join(", ");
  } else if (typeof currentTitle === "string" && currentTitle.trim()) {
    payload.currentTitle = currentTitle.trim();
  }

  const skills = filters.requiredSkills ?? filters.keywordSkills;
  if (Array.isArray(skills) && skills.length > 0) {
    payload.keywordSkills = skills.join(", ");
  } else if (typeof skills === "string" && skills.trim()) {
    payload.keywordSkills = skills.trim();
  }

  const city = filters.city ?? filters.location;
  if (Array.isArray(city) && city.length > 0) {
    payload.location = city;
  }

  const experience = filters.totalExperience;
  if (experience && typeof experience === "object" && !Array.isArray(experience)) {
    if (experience.min != null) payload.yearsExpMin = String(experience.min);
    if (experience.max != null) payload.yearsExpMax = String(experience.max);
  }

  const industry = filters.industry;
  if (Array.isArray(industry) && industry.length > 0) {
    payload.industry = industry.join(", ");
  } else if (typeof industry === "string" && industry.trim()) {
    payload.industry = industry.trim();
  }

  if (filters.seniorityLevel && typeof filters.seniorityLevel === "string") {
    payload.seniorityLevel = filters.seniorityLevel;
  }
  if (filters.openToWork === true) payload.openToWork = true;

  return payload;
}

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

const EXCLUSION_FIELD_IDS = [
  "excludeTitles",
  "excludeLocations",
  "excludedEmployers",
  "excludeKeywords",
];

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
/* AI interpretation — grouped, editable rows                          */
/* ------------------------------------------------------------------ */

function InterpretationPanel({
  criteria,
  confirmedIds,
  onEdit,
  onRemove,
  onToggleConfirm,
  onApply,
  applied,
}: {
  criteria: InterpretedCriterion[];
  confirmedIds: Set<string>;
  onEdit: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onToggleConfirm: (id: string) => void;
  onApply: () => void;
  applied: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <section
      aria-labelledby="ai-interpretation-heading"
      className="rounded-lg border border-border border-l-[3px] border-l-primary/40 bg-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            id="ai-interpretation-heading"
            className="text-[15px] font-semibold text-foreground"
          >
            Interpreted criteria
          </h2>
          <p className="text-[12px] text-muted-foreground">
            Confirm, edit or remove each row before searching.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={applied ? "outline" : "default"}
          onClick={onApply}
          disabled={applied || criteria.length === 0}
        >
          {applied ? (
            <>
              <Check aria-hidden />
              Applied to filters
            </>
          ) : (
            "Apply to filters"
          )}
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          All interpreted criteria were removed. Re-generate filters or add
          criteria manually in the filter panel.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {criteria.map((criterion) => {
            const isEditing = editingId === criterion.id;
            const confirmed = confirmedIds.has(criterion.id);
            return (
              <li
                key={criterion.id}
                className="flex items-center gap-3 py-2 first:pt-0.5 last:pb-0.5"
              >
                <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground sm:w-32">
                  {criterion.label}
                </span>
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <Input
                      autoFocus
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onEdit(criterion.id, draft);
                          setEditingId(null);
                        }
                        if (event.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => {
                        onEdit(criterion.id, draft);
                        setEditingId(null);
                      }}
                      aria-label={`Edit ${criterion.label}`}
                      className="h-7 text-sm"
                    />
                  ) : (
                    <p className="truncate text-sm font-medium text-foreground">
                      {criterion.value}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    size="xs"
                    variant={confirmed ? "secondary" : "ghost"}
                    onClick={() => onToggleConfirm(criterion.id)}
                    aria-pressed={confirmed}
                  >
                    <Check aria-hidden />
                    {confirmed ? "Confirmed" : "Confirm"}
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Edit ${criterion.label}`}
                    onClick={() => {
                      setEditingId(criterion.id);
                      setDraft(criterion.value);
                    }}
                  >
                    <PenLine aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Remove ${criterion.label}`}
                    onClick={() => onRemove(criterion.id)}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Practical initial state                                              */
/* ------------------------------------------------------------------ */

function GettingStarted({
  onUseExample,
  onUseSaved,
  recentSearches,
}: {
  onUseExample: () => void;
  onUseSaved: (search: SavedSearch) => void;
  recentSearches: SavedSearch[];
}) {
  return (
    <section
      aria-label="Getting started"
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Try an example
          </h3>
          <button
            type="button"
            onClick={onUseExample}
            className="mt-2 block w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {EXAMPLE_QUERY}
          </button>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Recent searches
            </h3>
            <Button
              size="xs"
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.searchHistory} />}
            >
              Browse search history
            </Button>
          </div>
          {recentSearches.length === 0 ? (
            <p className="mt-2 px-2 text-sm text-muted-foreground">
              No recent searches yet.
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
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [filters, setFilters] = useState<SearchFilterState>({});
  const [criteria, setCriteria] = useState<InterpretedCriterion[] | null>(null);
  const [interpretedFilters, setInterpretedFilters] = useState<SearchFilterState | null>(
    null
  );
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [criteriaApplied, setCriteriaApplied] = useState(false);
  const [saveSearch, setSaveSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRemaining, setSearchRemaining] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

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
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const reach = useMemo(
    () => estimateReach(activeCount, query.trim().length > 0),
    [activeCount, query]
  );

  const exclusionSummary = useMemo(() => {
    return EXCLUSION_FIELD_IDS.map((fieldId) => {
      const value = filters[fieldId];
      if (!isFieldActive(value)) return null;
      return `${FILTER_FIELD_INDEX[fieldId].field.label}: ${formatFilterValue(value)}`;
    }).filter((entry): entry is string => entry !== null);
  }, [filters]);

  const isFresh =
    !query.trim() && activeCount === 0 && criteria === null && !searched;

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
    setCriteriaApplied(false);
  }

  async function generateFilters() {
    if (!query.trim()) return;
    setInterpreting(true);
    setError(null);
    try {
      const result = await annotateCandidateSearch({ prompt: query.trim() });
      const filterForm = result.filterForm as SearchFilterState;
      setInterpretedFilters(filterForm);
      setFilters({ ...filters, ...filterForm });
      setCriteriaApplied(true);
      setFilterDrawerOpen(true);
      // Build lightweight criteria rows from filter form for the interpretation panel
      const nextCriteria: InterpretedCriterion[] = [];
      if (typeof filterForm.currentTitle === "string" && filterForm.currentTitle.trim()) {
        nextCriteria.push({
          id: "ic-titles",
          fieldId: "currentTitle",
          label: "Role",
          value: filterForm.currentTitle.trim(),
        });
      }
      if (typeof filterForm.keywordSkills === "string" && filterForm.keywordSkills.trim()) {
        nextCriteria.push({
          id: "ic-skills",
          fieldId: "keywordSkills",
          label: "Skills",
          value: filterForm.keywordSkills.trim(),
        });
      }
      if (Array.isArray(filterForm.location) && filterForm.location.length > 0) {
        nextCriteria.push({
          id: "ic-location",
          fieldId: "location",
          label: "Location",
          value: filterForm.location.filter(Boolean).join(", "),
        });
      }
      setCriteria(nextCriteria.length > 0 ? nextCriteria : null);
      setConfirmedIds(new Set(nextCriteria.map((c) => c.id)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setInterpreting(false);
    }
  }

  function applyCriteria() {
    if (!criteria) return;
    const activeFieldIds = new Set(criteria.map((item) => item.fieldId));
    const source = interpretedFilters ?? INTERPRETED_FILTER_STATE;
    const next: SearchFilterState = { ...filters };
    for (const [fieldId, value] of Object.entries(source)) {
      if (activeFieldIds.has(fieldId)) next[fieldId] = value as FilterValue;
    }
    setFilters(next);
    setCriteriaApplied(true);
  }

  function clearSearch() {
    setQuery("");
    setCriteria(null);
    setInterpretedFilters(null);
    setConfirmedIds(new Set());
    setCriteriaApplied(false);
    setSearched(false);
    setError(null);
  }

  function useJobDescription() {
    const job = selectedJob ?? jobOptions[0];
    if (!job) return;
    if (!selectedJobId) setSelectedJobId(job.id);
    const location =
      "location" in job && typeof job.location === "string"
        ? job.location
        : "Bengaluru";
    const experienceMin =
      "experienceMin" in job && typeof job.experienceMin === "number"
        ? job.experienceMin
        : 4;
    const experienceMax =
      "experienceMax" in job && typeof job.experienceMax === "number"
        ? job.experienceMax
        : 7;
    const department =
      "department" in job && typeof job.department === "string"
        ? job.department
        : "Engineering";
    setQuery(
      `Find ${job.title.toLowerCase()}s in ${location} with ${experienceMin}–${experienceMax} years of experience for the ${department} team.`
    );
    setCriteria(null);
    setCriteriaApplied(false);
  }

  function useSavedSearch(saved: SavedSearch) {
    setQuery(saved.query);
    setCriteria(null);
    setCriteriaApplied(false);
  }

  async function runSearch() {
    if (!canSearch || searching) return;
    setSearching(true);
    setError(null);
    setPendingMessage(null);
    try {
      let nextFilters = filters;
      const hasCriteria =
        Object.keys(filters).some((key) => {
          const value = filters[key];
          if (value == null || value === "") return false;
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === "object") {
            return Object.values(value as Record<string, unknown>).some(
              (entry) => entry != null && entry !== ""
            );
          }
          return true;
        }) || Boolean(interpretedFilters);

      // Mirror backend auto-annotate so the drawer reflects structured filters.
      if (!hasCriteria && query.trim()) {
        try {
          const annotated = await annotateCandidateSearch({ prompt: query.trim() });
          const filterForm = annotated.filterForm as SearchFilterState;
          setInterpretedFilters(filterForm);
          nextFilters = { ...filters, ...filterForm };
          setFilters(nextFilters);
          setCriteriaApplied(true);
        } catch {
          // Backend apply also auto-annotates; continue with empty filters.
        }
      }

      const providerFilters = filtersToProviderPayload(nextFilters);
      const result = await applyCandidateSearch({
        prompt: query.trim() || EXAMPLE_QUERY,
        filterForm: providerFilters,
        jobId: selectedJobId,
        page: 1,
        limit: 20,
      });

      if ("sessionPending" in result && result.sessionPending) {
        setPendingMessage(
          result.message || "Candidate matching is still being processed."
        );
        if (result.savedSessionId) {
          setSearched(true);
          router.push(sessionDetailPath(result.savedSessionId));
          return;
        }
        setSearching(false);
        return;
      }

      if (result.success && result.savedSessionId) {
        setSearched(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            `huntlo:search:${result.savedSessionId}`,
            JSON.stringify({
              sessionId: result.sessionId,
              savedSessionId: result.savedSessionId,
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

  const canSearch = query.trim().length > 0 || activeCount > 0;

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
        {/* Natural-language search composer */}
        <section
          aria-label="Search candidates"
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label htmlFor="nl-query" className="text-sm font-medium text-foreground">
              Describe the candidate profile
            </Label>
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

          <Textarea
            id="nl-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies."
            className="mt-2 min-h-20 resize-none bg-background text-sm"
          />

          <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Select
                value={selectedJobId}
                onValueChange={(value) => setSelectedJobId(value)}
              >
                <SelectTrigger
                  size="sm"
                  className="max-w-56"
                  aria-label="Select job"
                >
                  <Briefcase
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <SelectValue placeholder="Select Job" />
                </SelectTrigger>
                <SelectContent>
                  {jobOptions.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={useJobDescription}
              >
                <FileText aria-hidden />
                Use Job Description
              </Button>

              {/* Advanced filters toggle — mobile / narrow screens only */}
              <div className="lg:hidden">
                <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
                  <SheetTrigger
                    render={<Button type="button" size="sm" variant="outline" />}
                  >
                    <SlidersHorizontal aria-hidden />
                    Advanced Filters
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
                    <SheetFooter className="mt-0 flex-row items-center justify-between gap-3 border-t border-border p-3">
                      <span className="text-xs text-muted-foreground">
                        Est. reach{" "}
                        <span className="font-medium tabular-nums text-foreground">
                          {NUMBER_FORMAT.format(reach.low)}–{NUMBER_FORMAT.format(reach.high)}
                        </span>
                      </span>
                      <SheetClose render={<Button type="button" size="sm" />}>
                        Show results
                      </SheetClose>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                disabled={!query && !criteria}
              >
                <Eraser aria-hidden />
                Clear Search
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void generateFilters()}
                disabled={!query.trim() || interpreting}
              >
                {interpreting ? "Interpreting…" : "Generate filters"}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => void runSearch()}
                disabled={!canSearch || searching}
              >
                <Search aria-hidden />
                {searching ? "Searching…" : "Search Candidates"}
              </Button>
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
          />
        ) : (
          <>
            {/* AI interpretation */}
            {criteria !== null ? (
              <InterpretationPanel
                criteria={criteria}
                confirmedIds={confirmedIds}
                applied={criteriaApplied}
                onApply={applyCriteria}
                onToggleConfirm={(id) =>
                  setConfirmedIds((previous) => {
                    const next = new Set(previous);
                    if (next.has(id)) {
                      next.delete(id);
                    } else {
                      next.add(id);
                    }
                    return next;
                  })
                }
                onEdit={(id, value) =>
                  setCriteria((previous) =>
                    previous
                      ? previous.map((item) =>
                          item.id === id && value.trim()
                            ? { ...item, value: value.trim() }
                            : item
                        )
                      : previous
                  )
                }
                onRemove={(id) => {
                  setCriteria((previous) =>
                    previous ? previous.filter((item) => item.id !== id) : previous
                  );
                  setConfirmedIds((previous) => {
                    const next = new Set(previous);
                    next.delete(id);
                    return next;
                  });
                  setCriteriaApplied(false);
                }}
              />
            ) : null}

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
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Users aria-hidden className="size-3.5" />
                  Est. reach{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {NUMBER_FORMAT.format(reach.low)}–{NUMBER_FORMAT.format(reach.high)}
                  </span>
                </span>
              </div>

              {activeCount === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No filters applied yet. Generate filters from your description or
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

            {/* Search summary */}
            <section
              aria-labelledby="search-preview-heading"
              className="rounded-lg border border-border bg-card p-4"
            >
              <h2
                id="search-preview-heading"
                className="text-sm font-semibold text-foreground"
              >
                Search summary
              </h2>
              <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Query
                  </dt>
                  <dd className="mt-0.5 text-foreground">
                    {query.trim()
                      ? query.trim()
                      : activeCount > 0
                        ? `Structured search with ${activeCount} filter${activeCount === 1 ? "" : "s"}`
                        : "Describe candidates above or apply filters to build a search."}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Expected results
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                    {canSearch
                      ? `${NUMBER_FORMAT.format(reach.low)} – ${NUMBER_FORMAT.format(reach.high)} candidates`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Quota cost
                  </dt>
                  <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                    {searchRemaining !== null
                      ? `1 search · ${NUMBER_FORMAT.format(Math.max(0, searchRemaining - 1))} remaining after search`
                      : "1 search"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Selected job
                  </dt>
                  <dd className="mt-0.5 text-foreground">
                    {selectedJob ? (
                      <>
                        {selectedJob.title}
                        <span className="text-muted-foreground">
                          {" "}
                          · {selectedJob.location}
                        </span>
                      </>
                    ) : (
                      "No job linked"
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">
                    Important exclusions
                  </dt>
                  <dd className="mt-0.5 text-foreground">
                    {exclusionSummary.length > 0 ? exclusionSummary.join(" · ") : "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-muted-foreground">
                    Save search
                  </dt>
                  <dd className="mt-0.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={saveSearch}
                      onClick={() => setSaveSearch((previous) => !previous)}
                      className="inline-flex items-center gap-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <span
                        className={cn(
                          "relative h-5 w-9 rounded-full transition-colors",
                          saveSearch ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow transition-transform",
                            saveSearch && "translate-x-4"
                          )}
                        />
                      </span>
                      <Bookmark aria-hidden className="size-3.5 text-muted-foreground" />
                      Save this search for reuse
                    </button>
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                {searched ? (
                  <p className="text-sm text-success">
                    Search complete —{" "}
                    <Link
                      href={sessionDetailPath("s1")}
                      className="font-medium underline underline-offset-4"
                    >
                      view results
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Searches run against the live candidate graph. UI preview uses
                    mock data only.
                  </p>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={runSearch}
                  disabled={!canSearch || searching}
                >
                  <Search aria-hidden />
                  {searching ? "Searching…" : "Search Candidates"}
                </Button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Desktop filter sidebar — fixed height so FilterPanel's overflow-y-auto can scroll */}
      <aside className="sticky top-20 hidden h-[calc(100svh-6rem)] overflow-hidden rounded-lg border border-border bg-card lg:flex lg:flex-col">
        {filterPanel}
      </aside>
    </div>
  );
}
