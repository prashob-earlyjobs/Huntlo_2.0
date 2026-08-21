"use client";

import Link from "next/link";
import {
  Briefcase,
  Check,
  Coins,
  Eraser,
  History,
  LoaderCircle,
  PenLine,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FilterPanel } from "@/components/search/filter-panel";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { getApiErrorMessage, isQuotaError, jobsApi, plansApi } from "@/lib/api";
import { sourcingApi } from "@/lib/api/sourcing";
import {
  annotateCandidateSearch,
  applyCandidateSearch,
  getCandidateSearchCatalog,
  getSourcingSessions,
  previewCandidateSearch,
} from "@/lib/api/candidate-search";
import type { CandidateSearchCatalog } from "@/lib/api/candidate-search";
import {
  datasetFiltersFromState,
  searchStateFromDatasetFilters,
  sectionsFromBrightDataCatalog,
  COMPANY_SCOPE_FIELD_ID,
  EMPLOYERS_FIELD_ID,
  YEARS_OF_EXPERIENCE_FIELD_ID,
} from "@/lib/brightdata-filter-sections";
import { mapSessionState } from "@/lib/api/sourcing";
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
  INTERPRETED_FILTER_STATE,
  isFieldActive,
  type FilterValue,
  type InterpretedCriterion,
  type SearchFilterState,
} from "@/lib/mock-search";
import type { Status } from "@/lib/types";
import {
  filtersToProviderPayload,
  providerPayloadToFilters,
} from "@/lib/search-filter-adapters";
import { ROUTES, sessionDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/providers/realtime-provider";
import {
  clearPendingSearch,
  EXPLORE_WHILE_SEARCHING,
  requestSearchNotificationPermission,
  setSearchWorkspaceActive,
  writePendingSearch,
} from "@/lib/pending-search";

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

const RECENT_SEARCH_STATUS: Record<
  ReturnType<typeof mapSessionState>,
  Status
> = {
  completed: "Completed",
  running: "Running",
  // Backend `partial` = finished with some results; we have no pause action.
  partial: "Completed",
  failed: "Failed",
  empty: "Draft",
};

type RecentSearchItem = {
  id: string;
  title: string;
  prompt: string;
  resultCount: number;
  status: ReturnType<typeof mapSessionState>;
  createdAt: string | null;
};

function formatRecentSearchWhen(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** UI-only: cap live estimate display at 300+. */
function formatPreviewReachCount(count: number): string {
  if (count >= 300) return "300+";
  return NUMBER_FORMAT.format(count);
}

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
  loading = false,
}: {
  onUseExample: () => void;
  loading?: boolean;
}) {
  return (
    <section
      aria-label="Getting started"
      aria-busy={loading || undefined}
      className="rounded-lg border border-border bg-card p-4"
    >
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
    </section>
  );
}

function RecentSearchesSection({
  items,
  loading = false,
}: {
  items: RecentSearchItem[];
  loading?: boolean;
}) {
  return (
    <section
      aria-label="Recent searches"
      aria-busy={loading || undefined}
      className="rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <History aria-hidden className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Recent searches</h2>
        </div>
        <Button
          size="xs"
          variant="ghost"
          nativeButton={false}
          render={<Link href={ROUTES.searchHistory} />}
        >
          View all
        </Button>
      </div>

      {loading ? (
        <ul className="mt-3 space-y-2" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2"
            >
              <Skeleton className="h-4 w-[55%] max-w-md" />
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No searches yet. Run your first search above.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={sessionDetailPath(item.id)}
                className="flex items-center gap-3 rounded-md px-2 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {item.prompt && item.prompt !== item.title ? (
                    <p className="truncate text-xs text-muted-foreground">{item.prompt}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center">
                  <StatusBadge status={RECENT_SEARCH_STATUS[item.status]} />
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {item.resultCount > 0
                      ? `${NUMBER_FORMAT.format(item.resultCount)} found · ${formatRecentSearchWhen(item.createdAt)}`
                      : formatRecentSearchWhen(item.createdAt)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
  const [criteria, setCriteria] = useState<InterpretedCriterion[] | null>(null);
  const [interpretedFilters, setInterpretedFilters] = useState<SearchFilterState | null>(
    null
  );
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [criteriaApplied, setCriteriaApplied] = useState(false);
  const [searching, setSearching] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchRemaining, setSearchRemaining] = useState<number | null>(null);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [recentSearchesLoading, setRecentSearchesLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [completionSnackbar, setCompletionSnackbar] = useState<{
    savedSessionId: string;
    count: number;
  } | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewStatus, setPreviewStatus] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewRequestId = useRef(0);
  const [searchCatalog, setSearchCatalog] =
    useState<CandidateSearchCatalog | null>(null);
  const { subscribe } = useRealtime();
  const pendingSessionRef = useRef<{
    savedSessionId: string;
    sessionId: string;
  } | null>(null);

  const loadRecentSearches = useCallback(async () => {
    setRecentSearchesLoading(true);
    try {
      const result = await getSourcingSessions({ page: 1, limit: 5 });
      setRecentSearches(
        result.sessions.map((session) => ({
          id: session.savedSessionId,
          title: session.title || session.prompt || "Untitled search",
          prompt: session.prompt || "",
          resultCount: session.resultCount ?? 0,
          status: mapSessionState(session.status),
          createdAt: session.createdAt,
        }))
      );
    } catch {
      setRecentSearches([]);
    } finally {
      setRecentSearchesLoading(false);
    }
  }, []);

  const refreshSearchRemaining = useCallback(async () => {
    try {
      const summary = await plansApi.getUsageSummary();
      const search = summary.metrics.find(
        (row) => row.metric === "candidate_search"
      );
      if (search) {
        // Use API remaining (accounts for reserved holds), not limit-used.
        setSearchRemaining(Math.max(0, Number(search.remaining) || 0));
      }
    } catch {
      // Leave quota as-is when usage is unavailable.
    }
  }, []);

  useRealtimeRefresh("usage.updated", () => {
    void refreshSearchRemaining();
  });

  const completeBrightDataSearch = useCallback(
    (
      pending: { savedSessionId: string; sessionId: string },
      status: string,
      options?: { error?: string | null; totalDocs?: number }
    ) => {
      const normalized = (status ?? "").toLowerCase();

      // Bright Data snapshots take minutes. Ignore false "failed" races from
      // Future Jobs / transient provider noise — keep the explore banner and wait.
      if (normalized === "failed" || normalized === "cancelled") {
        const msg = options?.error || "";
        const hardFail =
          /snapshot failed|Bright Data filter snapshot failed|timed out before profiles|BRIGHTDATA/i.test(
            msg
          ) && !/couldn't complete the search right now/i.test(msg);
        if (!hardFail) {
          setError(null);
          return false;
        }
        pendingSessionRef.current = null;
        clearPendingSearch();
        setSearching(false);
        setPendingMessage(null);
        setError(msg || "Search failed before profiles were ready.");
        return true;
      }

      if (normalized !== "completed" && normalized !== "partial") {
        return false;
      }

      pendingSessionRef.current = null;
      clearPendingSearch();
      setSearching(false);
      setPendingMessage(null);
      setError(null);
      setSearched(true);
      setCompletionSnackbar({
        savedSessionId: pending.savedSessionId,
        count: Math.max(0, options?.totalDocs ?? 0),
      });
      void loadRecentSearches();
      return true;
    },
    [loadRecentSearches]
  );

  useEffect(() => {
    if (!completionSnackbar) return;
    const id = window.setTimeout(() => setCompletionSnackbar(null), 6000);
    return () => window.clearTimeout(id);
  }, [completionSnackbar]);

  useEffect(() => {
    setSearchWorkspaceActive(true);
    return () => {
      setSearchWorkspaceActive(false);
    };
  }, []);

  useEffect(() => {
    const patchRecent = (event: { data?: unknown } | Record<string, unknown>) => {
      const data = ((event as { data?: unknown }).data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        status?: string;
        totalDocs?: number;
      };
      const targetId = data.savedSessionId;
      if (!targetId || !data.status) return;
      setRecentSearches((previous) =>
        previous.map((item) => {
          if (item.id !== targetId) return item;
          return {
            ...item,
            status: mapSessionState(data.status),
            resultCount:
              typeof data.totalDocs === "number" ? data.totalDocs : item.resultCount,
          };
        })
      );
    };

    const unsub = subscribe("candidates.search.poll", (event) => {
      patchRecent(event);
      const pending = pendingSessionRef.current;
      if (!pending) return;
      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        status?: string;
        totalDocs?: number;
        error?: string | null;
      };
      const matches =
        data.savedSessionId === pending.savedSessionId ||
        data.sessionId === pending.sessionId;
      if (!matches) return;
      completeBrightDataSearch(pending, data.status ?? "", {
        error: data.error,
        totalDocs: data.totalDocs,
      });
    });

    const unsubDone = subscribe("candidates.search.completed", (event) => {
      patchRecent(event);
      const pending = pendingSessionRef.current;
      if (!pending) return;
      const data = (event.data ?? event) as {
        savedSessionId?: string;
        sessionId?: string;
        status?: string;
        totalDocs?: number;
        error?: string | null;
      };
      const matches =
        data.savedSessionId === pending.savedSessionId ||
        data.sessionId === pending.sessionId;
      if (!matches) return;
      completeBrightDataSearch(pending, data.status ?? "completed", {
        error: data.error,
        totalDocs: data.totalDocs,
      });
    });

    return () => {
      unsub();
      unsubDone();
    };
  }, [subscribe, completeBrightDataSearch]);

  useEffect(() => {
    if (!pendingMessage || !pendingSessionRef.current) return;
    const pending = pendingSessionRef.current;
    let cancelled = false;

    const poll = async () => {
      if (cancelled || !pendingSessionRef.current) return;
      try {
        const progress = await sourcingApi.getProgress(pending.savedSessionId);
        completeBrightDataSearch(pending, progress.status, {
          error: progress.errorMessage,
          totalDocs: progress.totalResults,
        });
      } catch {
        // Ignore transient REST errors — websocket may still deliver the terminal event.
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pendingMessage, completeBrightDataSearch]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const catalog = await getCandidateSearchCatalog();
        if (!cancelled) setSearchCatalog(catalog);
      } catch {
        if (!cancelled) setSearchCatalog(null);
      }
    })();
    void (async () => {
      try {
        const items = await jobsApi.list({ limit: 50, status: "active" });
        if (!cancelled) setJobs(items);
      } catch {
        // Leave jobs empty when the API is unavailable.
      }
    })();
    void (async () => {
      if (!cancelled) await refreshSearchRemaining();
    })();
    void (async () => {
      await loadRecentSearches();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadRecentSearches, refreshSearchRemaining]);

  useEffect(() => {
    if (appliedJobFromUrl.current || !jobIdFromUrl) return;
    let cancelled = false;

    void (async () => {
      let job = jobs.find((item) => item.id === jobIdFromUrl) ?? null;
      if (!job) {
        try {
          const detail = await jobsApi.getById(jobIdFromUrl);
          if (cancelled || !detail) return;
          job = detail;
          setJobs((previous) =>
            previous.some((item) => item.id === detail.id)
              ? previous
              : [detail, ...previous]
          );
        } catch {
          return;
        }
      }
      if (cancelled || !job) return;
      appliedJobFromUrl.current = true;
      setSelectedJobId(job.id);
      setQuery(buildPromptFromJob(job));
      setCriteria(null);
      setCriteriaApplied(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [jobIdFromUrl, jobs]);

  useEffect(() => {
    if (appliedEditDraft.current) return;
    const draft = loadEditSearchDraft(editSessionIdFromUrl);
    if (!draft) return;
    appliedEditDraft.current = true;
    setEditDraft(draft);
    setQuery(draft.prompt);
    setFilters(draft.filters ?? {});
    setInterpretedFilters(draft.filters ?? null);
    setCriteriaApplied(Object.keys(draft.filters ?? {}).length > 0);
    setSelectedJobId(draft.jobId);
    setCriteria(null);
    setFilterDrawerOpen(true);
  }, [editSessionIdFromUrl]);

  const filterSections = useMemo(() => {
    if (searchCatalog?.vendor === "brightdata" && searchCatalog.fields.length) {
      return sectionsFromBrightDataCatalog(searchCatalog.fields);
    }
    return FILTER_SECTIONS;
  }, [searchCatalog]);

  const filterFieldIndex = useMemo(
    () =>
      Object.fromEntries(
        filterSections.flatMap((section) =>
          section.fields.map((field) => [
            field.id,
            { field, sectionId: section.id },
          ])
        )
      ) as typeof FILTER_FIELD_INDEX,
    [filterSections]
  );

  const jobOptions = jobs;
  const selectedJob = jobOptions.find((job) => job.id === selectedJobId);

  const activeEntries = useMemo(
    () =>
      Object.entries(filters).filter(
        ([fieldId, value]) =>
          filterFieldIndex[fieldId] && isFieldActive(value)
      ),
    [filters, filterFieldIndex]
  );
  const activeCount = activeEntries.length;

  const groupedActive = useMemo(() => {
    const bySection = new Map<
      string,
      { sectionId: string; sectionTitle: string; entries: [string, FilterValue][] }
    >();
    for (const [fieldId, value] of activeEntries) {
      const meta = filterFieldIndex[fieldId];
      const existing = bySection.get(meta.sectionId);
      if (existing) {
        existing.entries.push([fieldId, value]);
      } else {
        const section = filterSections.find((item) => item.id === meta.sectionId);
        bySection.set(meta.sectionId, {
          sectionId: meta.sectionId,
          sectionTitle: section?.title ?? meta.sectionId,
          entries: [[fieldId, value]],
        });
      }
    }
    return Array.from(bySection.values());
  }, [activeEntries, filterFieldIndex, filterSections]);

  const reach = useMemo(() => {
    if (previewCount == null) return null;
    return { count: previewCount, status: previewStatus };
  }, [previewCount, previewStatus]);

  const isFresh =
    !query.trim() && activeCount === 0 && criteria === null && !searched;

  useEffect(() => {
    if (searchCatalog?.vendor === "brightdata") {
      setPreviewCount(null);
      setPreviewStatus(null);
      setPreviewLoading(false);
      return;
    }
    if (activeCount === 0 && !criteriaApplied) {
      setPreviewCount(null);
      setPreviewStatus(null);
      setPreviewLoading(false);
      return;
    }

    const requestId = ++previewRequestId.current;
    const timer = window.setTimeout(() => {
      void (async () => {
        setPreviewLoading(true);
        try {
          const providerFilters = filtersToProviderPayload(filters);
          const datasetFilters =
            searchCatalog?.vendor === "brightdata"
              ? datasetFiltersFromState(
                  filters,
                  searchCatalog.fields.map((field) => field.name)
                )
              : undefined;
          const result = await previewCandidateSearch({
            prompt: query.trim(),
            filterForm: providerFilters,
            datasetFilters,
          });
          if (previewRequestId.current !== requestId) return;
          setPreviewCount(result.exactCount ?? result.count ?? 0);
          setPreviewStatus(result.status ?? null);
          // Preview auto-peeled skills when estimate was 0 — sync drawer filters.
          if (result.skillsRelaxFallbackUsed && result.filterForm) {
            const relaxed = providerPayloadToFilters(result.filterForm);
            const applySkillBuckets = (
              previous: SearchFilterState | null
            ): SearchFilterState => {
              const next = { ...(previous ?? {}), ...relaxed };
              delete next.mandatorySkills;
              delete next.coreSkills;
              delete next.secondarySkills;
              if (Array.isArray(relaxed.mandatorySkills) && relaxed.mandatorySkills.length > 0) {
                next.mandatorySkills = relaxed.mandatorySkills;
              }
              if (Array.isArray(relaxed.coreSkills) && relaxed.coreSkills.length > 0) {
                next.coreSkills = relaxed.coreSkills;
              }
              if (Array.isArray(relaxed.secondarySkills) && relaxed.secondarySkills.length > 0) {
                next.secondarySkills = relaxed.secondarySkills;
              }
              return next;
            };
            setFilters((previous) => applySkillBuckets(previous));
            setInterpretedFilters((previous) => applySkillBuckets(previous));
            setCriteria((previous) => {
              if (!previous) return previous;
              const skillParts = [
                ...(Array.isArray(relaxed.mandatorySkills) ? relaxed.mandatorySkills : []),
                ...(Array.isArray(relaxed.coreSkills) ? relaxed.coreSkills : []),
                ...(Array.isArray(relaxed.secondarySkills) ? relaxed.secondarySkills : []),
              ];
              return previous
                .map((criterion) => {
                  if (criterion.id !== "ic-skills" && criterion.fieldId !== "coreSkills") {
                    return criterion;
                  }
                  if (skillParts.length === 0) return null;
                  return { ...criterion, value: skillParts.join(", ") };
                })
                .filter((item): item is InterpretedCriterion => item != null);
            });
          }
          console.log("[SearchWorkspace] profile count", {
            count: result.count,
            exactCount: result.exactCount,
            status: result.status,
            skillsRelaxFallbackUsed: result.skillsRelaxFallbackUsed ?? false,
            activeFilters: activeCount,
          });
        } catch (err) {
          if (previewRequestId.current !== requestId) return;
          console.warn("[SearchWorkspace] preview profile count failed", err);
          setPreviewCount(null);
          setPreviewStatus(null);
        } finally {
          if (previewRequestId.current === requestId) {
            setPreviewLoading(false);
          }
        }
      })();
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [filters, query, activeCount, criteriaApplied, searchCatalog]);

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
          ([fieldId]) => filterFieldIndex[fieldId]?.sectionId !== sectionId
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
      const isBrightData =
        searchCatalog?.vendor === "brightdata" ||
        Boolean(result.datasetFilters && Object.keys(result.datasetFilters).length);
      const filterForm = isBrightData
        ? searchStateFromDatasetFilters(
            result.datasetFilters,
            searchCatalog?.fields ?? []
          )
        : providerPayloadToFilters(result.filterForm);
      setInterpretedFilters(filterForm);
      setFilters((previous) => ({ ...previous, ...filterForm }));
      setCriteriaApplied(true);
      setFilterDrawerOpen(true);
      const nextCriteria: InterpretedCriterion[] = [];
      if (isBrightData) {
        const labels = new Map(
          (searchCatalog?.fields ?? []).map((field) => [field.name, field.label])
        );
        labels.set(YEARS_OF_EXPERIENCE_FIELD_ID, "Total experience");
        labels.set(EMPLOYERS_FIELD_ID, "Employers");
        labels.set(COMPANY_SCOPE_FIELD_ID, "Employer history");
        labels.set("position", "Current title");
        labels.set("experience.title", "Previous title");
        labels.set("about", "Core skills");
        labels.set("country_code", "Country");
        labels.set("city", "Region");
        for (const [fieldId, value] of Object.entries(filterForm)) {
          if (value === undefined) continue;
          nextCriteria.push({
            id: `ic-${fieldId}`,
            fieldId,
            label: labels.get(fieldId) ?? fieldId,
            value: formatFilterValue(value),
          });
        }
      } else {
        if (Array.isArray(filterForm.currentTitle) && filterForm.currentTitle.length > 0) {
          nextCriteria.push({
            id: "ic-titles",
            fieldId: "currentTitle",
            label: "Role",
            value: filterForm.currentTitle.join(", "),
          });
        }
        const skillParts = [
          ...(Array.isArray(filterForm.mandatorySkills) ? filterForm.mandatorySkills : []),
          ...(Array.isArray(filterForm.coreSkills) ? filterForm.coreSkills : []),
          ...(Array.isArray(filterForm.secondarySkills)
            ? filterForm.secondarySkills
            : []),
        ];
        if (skillParts.length > 0) {
          nextCriteria.push({
            id: "ic-skills",
            fieldId: "coreSkills",
            label: "Skills",
            value: skillParts.join(", "),
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
    setPendingMessage(null);
    if (editDraft) {
      clearEditSearchDraft();
      setEditDraft(null);
    }
  }

  function fillPromptFromJob(jobId: string) {
    const job = jobOptions.find((item) => item.id === jobId);
    if (!job) return;
    setQuery(buildPromptFromJob(job));
    setCriteria(null);
    setCriteriaApplied(false);
  }

  async function handleSearchClick() {
    const hasPreparedFilters = criteriaApplied || activeCount > 0;
    if (!hasPreparedFilters && query.trim()) {
      await generateFilters();
      return;
    }
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
      const datasetFilters =
        searchCatalog?.vendor === "brightdata"
          ? datasetFiltersFromState(
              nextFilters,
              searchCatalog.fields.map((field) => field.name)
            )
          : undefined;
      const updateSessionId =
        mode === "update"
          ? editDraft?.sessionId || editDraft?.savedSessionId || undefined
          : undefined;
      const result = await applyCandidateSearch({
        prompt: query.trim() || EXAMPLE_QUERY,
        filterForm: providerFilters,
        datasetFilters,
        jobId: selectedJobId,
        sessionId: updateSessionId,
        page: 1,
        limit: 300,
      });

      if ("sessionPending" in result && result.sessionPending) {
        const isBrightData = searchCatalog?.vendor === "brightdata";
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
                prompt: query.trim() || EXAMPLE_QUERY,
                filters: nextFilters,
              })
            );
          }
          if (isBrightData) {
            setPendingMessage(result.message || EXPLORE_WHILE_SEARCHING);
            requestSearchNotificationPermission();
            pendingSessionRef.current = {
              savedSessionId: result.savedSessionId,
              sessionId: result.sessionId,
            };
            writePendingSearch({
              savedSessionId: result.savedSessionId,
              sessionId: result.sessionId,
              prompt: query.trim() || EXAMPLE_QUERY,
            });
            setSearching(false);
            void loadRecentSearches();
            void refreshSearchRemaining();
            return;
          }
          setPendingMessage(
            result.message ||
              "Finding candidates — matching profiles in progress."
          );
          router.push(sessionDetailPath(result.savedSessionId));
          void loadRecentSearches();
          void refreshSearchRemaining();
          return;
        }
        setPendingMessage(
          result.message ||
            "Finding candidates — matching profiles in progress."
        );
        setSearching(false);
        void loadRecentSearches();
        void refreshSearchRemaining();
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
              prompt: query.trim() || EXAMPLE_QUERY,
              filters: nextFilters,
            })
          );
        }
        const isBrightData = searchCatalog?.vendor === "brightdata";
        if (!isBrightData) {
          router.push(sessionDetailPath(result.savedSessionId));
        }
        void loadRecentSearches();
        void refreshSearchRemaining();
        return;
      }

      setError("Search completed without a session id.");
      setSearching(false);
    } catch (err) {
      if (isQuotaError(err)) {
        setError("Candidate search quota exhausted. Upgrade your plan to continue.");
        setSearchRemaining(0);
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
      sections={filterSections}
    />
  );

  return (
    <>
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

          <div
            className="ai-beam-border mt-2 rounded-md border border-input bg-background transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50"
            data-processing={interpreting || searching}
          >
            <Textarea
              id="nl-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies."
              className="min-h-48 resize-none rounded-b-none border-0 bg-transparent text-sm focus-visible:border-0 focus-visible:ring-0"
              aria-busy={interpreting || searching}
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
                  fillPromptFromJob(value);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="max-w-48 border-0 bg-transparent shadow-none hover:bg-muted"
                  aria-label="Select job"
                >
                  <Briefcase
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
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
                    <SheetFooter className="mt-0 flex-row items-center justify-between gap-3 border-t border-border p-3">
                      <span className="text-xs text-muted-foreground">
                        {previewLoading ? (
                          "Estimating profiles…"
                        ) : reach ? (
                          <>
                            Est. profiles{" "}
                            <span className="font-medium tabular-nums text-foreground">
                              {formatPreviewReachCount(reach.count)}
                            </span>
                            {reach.status === "too_broad" ? (
                              <span className="ml-1 text-amber-600 dark:text-amber-400">
                                (broad)
                              </span>
                            ) : null}
                          </>
                        ) : (
                          "Est. profiles —"
                        )}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        disabled={!canSearch || searching || interpreting}
                        aria-busy={searching}
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
                {query || criteria ? (
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
                  variant="outline"
                  className="relative"
                  onClick={() => void generateFilters()}
                  disabled={!query.trim() || interpreting || searching}
                  aria-busy={interpreting}
                  aria-label={interpreting ? "Generating filters" : undefined}
                >
                  {interpreting ? (
                    <LoaderCircle
                      aria-hidden
                      className="absolute left-1/2 -translate-x-1/2 animate-spin"
                    />
                  ) : null}
                  <span className={interpreting ? "invisible" : undefined}>
                    Generate filters
                  </span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="relative"
                  onClick={() => void handleSearchClick()}
                  disabled={!canSearch || searching || interpreting}
                  aria-busy={searching || interpreting}
                  aria-label={
                    searching
                      ? "Finding candidates"
                      : !criteriaApplied && activeCount === 0 && query.trim()
                        ? "Generate filters from search"
                        : undefined
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
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {pendingMessage}
            </p>
          ) : null}
        </section>

        <RecentSearchesSection
          items={recentSearches}
          loading={recentSearchesLoading}
        />

        {isFresh ? (
          <GettingStarted
            onUseExample={() => setQuery(EXAMPLE_QUERY)}
            loading={recentSearchesLoading}
          />
        ) : (
          <>
            {/* Interpretation panel hidden — filters still populate the drawer.
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
            */}

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
                  {previewLoading ? (
                    "Estimating…"
                  ) : reach ? (
                    <>
                      Est. profiles{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {formatPreviewReachCount(reach.count)}
                      </span>
                      {reach.status === "too_broad" ? (
                        <span className="text-amber-600 dark:text-amber-400">(broad)</span>
                      ) : null}
                    </>
                  ) : (
                    "Est. profiles —"
                  )}
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
                                {filterFieldIndex[fieldId]?.field.label ?? fieldId}:
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

    {completionSnackbar ? (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-5 left-1/2 z-50 flex max-w-[min(100vw-2rem,28rem)] -translate-x-1/2 items-center gap-3",
          "rounded-lg border border-border bg-card/95 px-4 py-3 text-sm shadow-lg backdrop-blur-sm sm:bottom-6"
        )}
      >
        <Check aria-hidden className="size-4 shrink-0 text-success" />
        <p className="min-w-0 flex-1 text-foreground">
          {completionSnackbar.count > 0
            ? `Search complete — found ${NUMBER_FORMAT.format(completionSnackbar.count)} candidate${completionSnackbar.count === 1 ? "" : "s"}.`
            : "Search complete."}
        </p>
        <Link
          href={sessionDetailPath(completionSnackbar.savedSessionId)}
          className="shrink-0 font-medium text-primary hover:underline"
          onClick={() => setCompletionSnackbar(null)}
        >
          View
        </Link>
        <button
          type="button"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Dismiss"
          onClick={() => setCompletionSnackbar(null)}
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    ) : null}
    </>
  );
}
