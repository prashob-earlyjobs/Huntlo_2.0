"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  RefreshCw,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { ensureSourcedCandidatesInPool } from "@/components/outreach/audience-resolve";
import { getApiErrorMessage, candidatesApi, uiRevealKindToType } from "@/lib/api";
import { mapCandidateDetailsToSessionCandidate } from "@/lib/api/candidate-details";
import {
  applyCandidateSearch,
  getCandidateDetails,
  getSourcingSessionProfiles,
  saveSearch,
  unsaveSearch,
  type CandidateSearchSummary,
  type SearchPagination,
} from "@/lib/api/candidate-search";
import { mapApiCandidateToSessionCandidate } from "@/lib/api/sourcing";
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
import { jobDetailPath, ROUTES, sessionDetailPath } from "@/lib/routes";
import { saveEditSearchDraft, searchEditPath } from "@/lib/edit-search-draft";
import { filtersToProviderPayload } from "@/lib/search-filter-adapters";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
/** Debounce for "search within results" once it's hitting the API (paginated
 * browsing) instead of filtering an already-loaded in-memory list. */
const RESULT_SEARCH_DEBOUNCE_MS = 350;

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

function csvEscape(value: string | number | null | undefined): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadSessionCandidatesCsv(
  candidates: SessionCandidate[],
  sessionName: string
) {
  const headers = [
    "Name",
    "Headline",
    "Current role",
    "Current company",
    "Location",
    "Experience years",
    "Skills",
    "Match score",
    "Email",
    "Phone",
  ];
  const rows = candidates.map((candidate) => [
    candidate.name,
    candidate.headline,
    candidate.currentRole,
    candidate.currentCompany,
    candidate.location,
    candidate.experienceYears,
    candidate.skills.join("; "),
    candidate.matchScore,
    candidate.emailRevealed ? candidate.email : "",
    candidate.phoneRevealed ? candidate.phone : "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const safeName =
    sessionName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "search-results";
  anchor.href = url;
  anchor.download = `${safeName}-export.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
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
    const waitingForFirst = loadedCount === 0;
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
      >
        <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {waitingForFirst ? "Finding candidates" : "Search in progress"}
          </p>
          <p className="text-xs text-muted-foreground">
            {waitingForFirst
              ? "Matching profiles in progress — results will appear as they arrive."
              : `${loadedCount} of ${totalCount} candidates loaded — results update as the graph is scanned.`}
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

/** Mirrors the pager footer used by SearchHistoryTable so paginated browsing
 * looks/behaves consistently across the app. */
function ResultsPager({
  pagination,
  pageSize,
  loading,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: SearchPagination;
  pageSize: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const { page, totalDocs, totalPages } = pagination;
  const rangeStart = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalDocs);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {totalDocs === 0
          ? "No candidates"
          : `Showing ${rangeStart}–${rangeEnd} of ${totalDocs.toLocaleString("en-IN")}`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Rows
          <select
            value={pageSize}
            disabled={loading}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs tabular-nums text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Previous page"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label="Next page"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * API-paginated browsing of stored candidates, owned by the parent
 * (SessionResultsPageClient) since that's where the actual fetch happens.
 * Only consulted once the session is at rest — see `isLive` below.
 */
export type SessionResultsPagedProps = {
  candidates: SessionCandidate[];
  pagination: SearchPagination | null;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  sort: SortOptionId;
  search: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (sort: SortOptionId) => void;
  onSearchChange: (search: string) => void;
  onReload: () => void;
  fetchAllForExport: () => Promise<SessionCandidate[]>;
};

export function SessionResults({
  session,
  candidates,
  initialFilters,
  futureJobsSessionId = null,
  pagedResults,
}: {
  session: SourcingSession;
  candidates: SessionCandidate[];
  initialFilters?: SearchFilterState | null;
  futureJobsSessionId?: string | null;
  pagedResults?: SessionResultsPagedProps;
}) {
  const router = useRouter();
  // While a search is actively running we keep the existing full-list +
  // progressive-reveal behavior below untouched. Once at rest, the table is
  // driven by `pagedResults` (real API pagination) instead.
  const isLive = session.state === "running";
  // Single source of truth for "what candidates exist right now": the full
  // live-accumulated list while running, otherwise just the current page
  // returned by the paginated stored-candidates endpoint.
  const pagedResultsCandidates = pagedResults?.candidates;
  const sourceCandidates = useMemo(
    () => (isLive ? candidates : (pagedResultsCandidates ?? [])),
    [isLive, candidates, pagedResultsCandidates]
  );
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
  const [rerunModeOpen, setRerunModeOpen] = useState(false);
  const [rerunMode, setRerunMode] = useState<"new" | "existing">("new");
  const [refreshingProfiles, setRefreshingProfiles] = useState(false);
  const [refreshProfilesError, setRefreshProfilesError] = useState<string | null>(
    null
  );
  const [searchSaved, setSearchSaved] = useState(
    Boolean(session.isSavedSearch && session.savedListId)
  );
  const [savingSearch, setSavingSearch] = useState(false);
  const [savedListId, setSavedListId] = useState<string | null>(
    session.savedListId ?? null
  );
  const [saveSearchMessage, setSaveSearchMessage] = useState<string | null>(null);
  const [saveSearchError, setSaveSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sourceCandidates.map((c) => [c.id, c.saved]))
  );
  const [savedListMap, setSavedListMap] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      sourceCandidates
        .map((c) => [c.id, c.lists[0] ?? ""] as const)
        .filter((entry) => entry[1])
    )
  );
  const [revealedMap, setRevealedMap] = useState<Record<string, RevealState>>({});
  const [localCandidates, setLocalCandidates] = useState(sourceCandidates);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [drawerDetailsLoading, setDrawerDetailsLoading] = useState(false);
  const [drawerDetailsError, setDrawerDetailsError] = useState<string | null>(null);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [addToListCandidateIds, setAddToListCandidateIds] = useState<string[]>([]);
  const [addToListMessage, setAddToListMessage] = useState<string | null>(null);
  const [outreachStarting, setOutreachStarting] = useState(false);
  const [outreachError, setOutreachError] = useState<string | null>(null);
  const detailsFetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setSearchFilters(initialFilters);
    }
  }, [initialFilters]);

  useEffect(() => {
    setSearchSaved(Boolean(session.isSavedSearch && session.savedListId));
    setSavedListId(session.savedListId ?? null);
  }, [session.id, session.isSavedSearch, session.savedListId]);

  async function toggleSaveSearch() {
    if (savingSearch) return;
    setSavingSearch(true);
    setSaveSearchError(null);
    setSaveSearchMessage(null);
    try {
      if (searchSaved) {
        await unsaveSearch(session.id);
        setSearchSaved(false);
        setSavedListId(null);
        setSaveSearchMessage(
          "Removed from saved searches. Your candidate list was kept."
        );
      } else {
        const result = await saveSearch(session.id);
        setSearchSaved(true);
        setSavedListId(result.listId ?? null);
        const added = result.candidatesAdded ?? 0;
        const listName = result.listName || "Saved search";
        if (listName && added > 0) {
          setSavedMap((previous) => ({
            ...previous,
            ...Object.fromEntries(
              localCandidates.map((candidate) => [candidate.id, true])
            ),
          }));
          setSavedListMap((previous) => ({
            ...previous,
            ...Object.fromEntries(
              localCandidates.map((candidate) => [candidate.id, listName])
            ),
          }));
        }
        if (result.listCreated) {
          setSaveSearchMessage(
            added > 0
              ? `Created list “${listName}” with ${added} candidate${added === 1 ? "" : "s"}.`
              : `Created list “${listName}”. No candidates to add yet.`
          );
        } else {
          setSaveSearchMessage(
            added > 0
              ? `Added ${added} candidate${added === 1 ? "" : "s"} to “${listName}”.`
              : `Saved. List “${listName}” is up to date.`
          );
        }
      }
    } catch (err) {
      setSaveSearchError(getApiErrorMessage(err));
    } finally {
      setSavingSearch(false);
    }
  }

  function startEditSearch() {
    let storedSessionId: string | null = futureJobsSessionId;
    try {
      const stored = sessionStorage.getItem(`huntlo:search:${session.id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as { sessionId?: string | null };
        if (parsed.sessionId) storedSessionId = parsed.sessionId;
      }
    } catch {
      // ignore
    }
    saveEditSearchDraft({
      savedSessionId: session.id,
      sessionId: storedSessionId,
      prompt: session.query,
      filters: searchFilters,
      jobId: session.relatedJobId,
    });
    router.push(searchEditPath(session.id));
  }

  useEffect(() => {
    setLocalCandidates((prev) => {
      const prevMap = new Map(prev.map((c) => [c.id, c]));
      return sourceCandidates.map((incoming) => {
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
  }, [sourceCandidates]);

  useEffect(() => {
    setSavedMap((previous) => ({
      ...previous,
      ...Object.fromEntries(
        sourceCandidates.map((candidate) => [
          candidate.id,
          previous[candidate.id] || candidate.saved,
        ])
      ),
    }));
    setSavedListMap((previous) => {
      const next = { ...previous };
      for (const candidate of sourceCandidates) {
        const incoming = candidate.lists[0];
        if (incoming && !next[candidate.id]) {
          next[candidate.id] = incoming;
        }
      }
      return next;
    });
  }, [sourceCandidates]);

  // Paginated browsing: drop any stale selection whenever the page/sort/
  // search inputs change so "N selected" never silently refers to rows that
  // have scrolled off the current page.
  useEffect(() => {
    if (isLive) return;
    setSelected(new Set());
  }, [isLive, pagedResults?.page, pagedResults?.pageSize, pagedResults?.sort, pagedResults?.search]);

  const [progressCount, setProgressCount] = useState(
    session.state === "running" ? 0 : sourceCandidates.length
  );
  const [initialLoading, setInitialLoading] = useState(
    session.state === "running" && sourceCandidates.length === 0
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
  // the skeleton stuck after the session leaves "running". Paginated browsing
  // (not running) always shows its current page immediately — no animation.
  useEffect(() => {
    if (session.state !== "running") {
      setInitialLoading(false);
      setProgressCount(sourceCandidates.length);
      return;
    }

    if (sourceCandidates.length === 0) {
      setInitialLoading(true);
      const timer = window.setTimeout(() => setInitialLoading(false), 800);
      return () => window.clearTimeout(timer);
    }

    setInitialLoading(false);
    const interval = window.setInterval(() => {
      setProgressCount((previous) => {
        if (previous >= sourceCandidates.length) {
          window.clearInterval(interval);
          return sourceCandidates.length;
        }
        return previous + 1;
      });
    }, 60);

    return () => window.clearInterval(interval);
  }, [session.state, sourceCandidates.length]);

  // If more candidates arrive while running, never clamp progress below what we
  // already revealed — just let the interval catch up.
  useEffect(() => {
    if (session.state !== "running") return;
    setProgressCount((previous) =>
      previous > sourceCandidates.length ? sourceCandidates.length : previous
    );
  }, [session.state, sourceCandidates.length]);

  // Live: client-side slice (progressive reveal) + filter + sort over the
  // full accumulated list. Paginated: the server already returned exactly
  // the right page, sorted and filtered — render it as-is.
  const visibleCandidates = useMemo(() => {
    if (!isLive) return localCandidates;
    const list = localCandidates.slice(0, progressCount);
    const filtered = list.filter((candidate) =>
      matchesResultQuery(candidate, resultQuery)
    );
    return sortCandidates(filtered, sort);
  }, [isLive, localCandidates, sort, progressCount, resultQuery]);

  // Paginated browsing: "search within results" now queries the API, so
  // debounce it instead of re-fetching on every keystroke. Live search stays
  // instant since it's just filtering what's already in memory (see above).
  useEffect(() => {
    if (isLive || !pagedResults) return;
    if (resultQuery === pagedResults.search) return;
    const timer = window.setTimeout(() => {
      pagedResults.onSearchChange(resultQuery);
    }, RESULT_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, resultQuery, pagedResults?.search]);

  function handleSortChange(value: SortOptionId) {
    if (!isLive && pagedResults) {
      pagedResults.onSortChange(value);
    } else {
      setSort(value);
    }
  }

  const effectiveSort = !isLive && pagedResults ? pagedResults.sort : sort;
  const pagedInitialLoading =
    !isLive && Boolean(pagedResults?.loading) && !pagedResults?.pagination;

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

  async function startOutreach(sourcedCandidateIds: string[]) {
    const ids = [...new Set(sourcedCandidateIds.filter(Boolean))];
    if (!ids.length || outreachStarting) return;
    setOutreachStarting(true);
    setOutreachError(null);
    try {
      const wanted = new Set(ids);
      const fallbacks = localCandidates
        .filter((candidate) => wanted.has(candidate.id))
        .map((candidate) => ({
          id: candidate.id,
          name: candidate.name,
          headline: candidate.headline,
          currentRole: candidate.currentRole,
          currentCompany: candidate.currentCompany,
          location: candidate.location,
          experienceYears: candidate.experienceYears,
          skills: candidate.skills,
        }));
      const poolIds = await ensureSourcedCandidatesInPool(
        session.id,
        ids,
        fallbacks
      );
      if (!poolIds.length) {
        throw new Error("Unable to add candidates to the pool for outreach.");
      }
      const params = new URLSearchParams();
      params.set("candidateIds", poolIds.join(","));
      if (session.relatedJobId) params.set("jobId", session.relatedJobId);
      router.push(`${ROUTES.outreachNew}?${params.toString()}`);
    } catch (err) {
      setOutreachError(
        getApiErrorMessage(err, "Unable to start outreach for selected candidates.")
      );
      setOutreachStarting(false);
    }
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
        setRevealError(
          kind === "email"
            ? "No email found for this profile."
            : "No mobile number found for this profile."
        );
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

  async function refreshProfilesOnce() {
    if (refreshingProfiles) return;
    setRefreshingProfiles(true);
    setRefreshProfilesError(null);
    try {
      if (!isLive && pagedResults) {
        // Force a live provider sync, then re-pull the current page from the
        // paginated endpoint so it's the one source of truth for this view.
        await getSourcingSessionProfiles(session.id, { force: true, page: 1, limit: 300 });
        pagedResults.onReload();
        return;
      }
      const result = await getSourcingSessionProfiles(session.id, {
        force: true,
        page: 1,
        limit: 300,
      });
      const mapped = (result.candidates ?? []).map(
        (candidate: CandidateSearchSummary) =>
          mapApiCandidateToSessionCandidate({
            id: candidate.id,
            sourcingSessionId: candidate.sourcingSessionId,
            externalCandidateId: candidate.candidateId,
            name: candidate.name,
            headline: candidate.headline ?? null,
            linkedinUrl: candidate.linkedinProfileUrl ?? candidate.linkedinUrl ?? null,
            profilePictureUrl: candidate.profilePictureUrl ?? null,
            title: candidate.currentRole,
            company: candidate.currentCompany,
            location: candidate.location,
            experienceYears: candidate.experienceYears,
            skills: candidate.skills ?? [],
            educationPreview: candidate.educationPreview ?? [],
            profileSignals: candidate.profileSignals ?? [],
            rank: candidate.rank ?? 0,
            matchScore: candidate.matchScore ?? candidate.finalScore ?? null,
            saved: candidate.saved,
            lists: candidate.lists ?? [],
            source: candidate.source,
          })
      );
      setLocalCandidates(mapped);
      setProgressCount(mapped.length);
      setInitialLoading(false);
    } catch (error) {
      setRefreshProfilesError(getApiErrorMessage(error));
    } finally {
      setRefreshingProfiles(false);
    }
  }

  async function exportCandidatesCsv() {
    if (exportingCsv) return;
    const filenameBase = session.name || session.query || "search-results";
    if (isLive || !pagedResults) {
      downloadSessionCandidatesCsv(visibleCandidates, filenameBase);
      return;
    }
    setExportingCsv(true);
    setExportError(null);
    try {
      const all = await pagedResults.fetchAllForExport();
      downloadSessionCandidatesCsv(all, filenameBase);
    } catch (error) {
      setExportError(getApiErrorMessage(error, "Unable to export candidates."));
    } finally {
      setExportingCsv(false);
    }
  }

  async function rerunSearch(mode: "new" | "existing") {
    if (rerunningSearch) return;
    setRerunningSearch(true);
    setRerunError(null);
    setRerunModeOpen(false);
    try {
      const result = await applyCandidateSearch({
        prompt: session.query,
        filterForm: filtersToProviderPayload(searchFilters),
        sessionId: mode === "existing" ? session.id : "",
        page: 1,
        limit: 300,
        jobId: session.relatedJobId,
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
      if (mode === "existing" && savedSessionId === session.id) {
        router.refresh();
      } else {
        router.push(sessionDetailPath(savedSessionId));
      }
    } catch (error) {
      setRerunError(getApiErrorMessage(error));
      setRerunningSearch(false);
    }
  }

  const isEmpty = session.state === "empty";
  const isFailed = session.state === "failed";
  const isSearching = session.state === "running";
  // Paginated mode reads the *confirmed* (debounced, already-fetched) search
  // term rather than the instantaneous input value, so this stays in sync
  // with `pagination.totalDocs` below instead of racing ahead of it while a
  // debounced fetch is still in flight.
  const hasSearchQuery = isLive
    ? resultQuery.trim().length > 0
    : (pagedResults?.search.trim().length ?? 0) > 0;
  // Whether the session has ANY stored candidates at all, independent of the
  // current "search within results" filter. Live mode already only ever
  // holds the session's own candidates in `localCandidates`. Paginated mode
  // sources this from the session's own totalDocs / the last pagination
  // response rather than the current page's row count, so a search that
  // matches nothing isn't confused with a session that found nothing.
  const hasStoredCandidates = isLive
    ? localCandidates.length > 0
    : session.resultCount > 0 || (pagedResults?.pagination?.totalDocs ?? 0) > 0;
  // "Search within results" narrowed the loaded/paginated set down to zero —
  // distinct from the session itself having found nothing.
  const hasNoMatchesForQuery =
    hasStoredCandidates &&
    hasSearchQuery &&
    (isLive
      ? visibleCandidates.length === 0
      : (pagedResults?.pagination?.totalDocs ?? 0) === 0);
  const showResults =
    !isEmpty &&
    !isFailed &&
    !initialLoading &&
    !pagedInitialLoading &&
    visibleCandidates.length > 0;
  // Only "still loading" while genuinely running — a completed/partial
  // session that stored zero candidates is done, not pending.
  const showNoResults =
    !isEmpty &&
    !isFailed &&
    !initialLoading &&
    !pagedInitialLoading &&
    !hasNoMatchesForQuery &&
    isSearching &&
    !hasStoredCandidates;
  // Terminal session that genuinely found nothing — both Future Jobs and the
  // Bright Data fallback were tried and came up empty (distinct from `isEmpty`,
  // a draft that was never run at all).
  const showNoCandidatesFound =
    !isEmpty &&
    !isFailed &&
    !initialLoading &&
    !pagedInitialLoading &&
    !hasNoMatchesForQuery &&
    !isSearching &&
    !hasStoredCandidates;

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
            <Button
              size="sm"
              variant="outline"
              onClick={startEditSearch}
            >
              <Pencil aria-hidden />
              Edit Search
            </Button>
            <Button
              size="sm"
              variant={searchSaved ? "secondary" : "outline"}
              disabled={savingSearch}
              aria-pressed={searchSaved}
              aria-busy={savingSearch}
              onClick={() => void toggleSaveSearch()}
            >
              {savingSearch ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <Bookmark
                  aria-hidden
                  className={searchSaved ? "fill-current" : undefined}
                />
              )}
              {searchSaved ? "Saved" : "Save Search"}
            </Button>
          </div>
        </div>
      </header>

      {saveSearchError ? (
        <p role="alert" className="text-sm text-destructive">
          {saveSearchError}
        </p>
      ) : null}
      {saveSearchMessage ? (
        <p role="status" className="text-sm text-muted-foreground">
          {saveSearchMessage}{" "}
          {savedListId || searchSaved ? (
            <Link
              href={ROUTES.saved}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              Open Saved Lists
            </Link>
          ) : null}
        </p>
      ) : null}

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
      {refreshProfilesError ? (
        <p role="alert" className="text-sm text-destructive">
          {refreshProfilesError}
        </p>
      ) : null}
      {outreachError ? (
        <p role="alert" className="text-sm text-destructive">
          {outreachError}
        </p>
      ) : null}
      {exportError ? (
        <p role="alert" className="text-sm text-destructive">
          {exportError}
        </p>
      ) : null}
      {!isLive && pagedResults?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {pagedResults.error}
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
              {(isLive
                ? visibleCandidates.length
                : (pagedResults?.pagination?.totalDocs ?? visibleCandidates.length)
              ).toLocaleString("en-IN")}
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

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={refreshingProfiles}
            aria-busy={refreshingProfiles}
            onClick={() => void refreshProfilesOnce()}
          >
            {refreshingProfiles ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <RefreshCw aria-hidden />
            )}
            {refreshingProfiles ? "Refreshing…" : "Refresh"}
          </Button>

          <Select
            value={effectiveSort}
            onValueChange={(value) => value && handleSortChange(value as SortOptionId)}
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
                <Button
                  size="sm"
                  disabled={outreachStarting}
                  onClick={() => void startOutreach(Array.from(selected))}
                >
                  {outreachStarting ? (
                    <Loader2 aria-hidden className="animate-spin" />
                  ) : (
                    <Send aria-hidden />
                  )}
                  {outreachStarting ? "Starting…" : "Start Outreach"}
                  <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                    {selected.size}
                  </span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={visibleCandidates.length === 0 || exportingCsv}
                aria-busy={exportingCsv}
                onClick={() => void exportCandidatesCsv()}
              >
                {exportingCsv ? (
                  <Loader2 aria-hidden className="animate-spin" />
                ) : (
                  <Download aria-hidden />
                )}
                {exportingCsv ? "Exporting…" : "Export"}
              </Button>
            )}
          </div>
        </section>
      ) : null}

      {/* Results body */}
      {initialLoading || pagedInitialLoading ? (
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
          onAction={startEditSearch}
        />
      ) : isEmpty ? (
        <EmptyState
          icon={Search}
          title="No candidates found"
          description="Try broadening your location, skills or experience filters and run the search again."
          actionLabel="Edit Search"
          onAction={startEditSearch}
        />
      ) : hasNoMatchesForQuery ? (
        <EmptyState
          icon={Search}
          title="No matches in your results"
          description={`No candidates match "${resultQuery.trim()}". Try a different term or clear the search.`}
          actionLabel="Clear search"
          onAction={() => setResultQuery("")}
        />
      ) : showNoCandidatesFound ? (
        <EmptyState
          icon={Search}
          title="No candidates found"
          description="We tried Future Jobs and the Bright Data fallback — neither turned up a match. Try broadening your location, skills or experience filters and run the search again."
          actionLabel="Edit Search"
          onAction={startEditSearch}
        />
      ) : showNoResults ? (
        <EmptyState
          icon={Users}
          title="No results yet"
          description="The search is still loading candidates. Check back in a moment."
        />
      ) : showResults ? (
        <section
          className={cn(
            "rounded-xl border border-border bg-card",
            !isLive && pagedResults?.loading && "opacity-60 transition-opacity"
          )}
        >
          {view === "table" ? (
            <CandidateTable
              candidates={visibleCandidates}
              density={density}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              savedMap={savedMap}
              savedListMap={savedListMap}
              onToggleSave={(id) => openAddToList([id])}
              revealedMap={revealedMap}
              onReveal={(id, kind) => void reveal(id, kind)}
              onOpenProfile={setDrawerId}
              onAddToOutreach={(id) => void startOutreach([id])}
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
                  listName={
                    savedListMap[candidate.id] ?? candidate.lists[0] ?? null
                  }
                  onToggleSave={() => openAddToList([candidate.id])}
                  revealed={
                    revealedMap[candidate.id] ?? { email: false, phone: false }
                  }
                  onReveal={(kind) => void reveal(candidate.id, kind)}
                  onOpenProfile={() => setDrawerId(candidate.id)}
                  onAddToOutreach={() => void startOutreach([candidate.id])}
                />
              ))}
            </div>
          )}
          {!isLive && pagedResults?.pagination ? (
            <ResultsPager
              pagination={pagedResults.pagination}
              pageSize={pagedResults.pageSize}
              loading={pagedResults.loading}
              onPageChange={pagedResults.onPageChange}
              onPageSizeChange={pagedResults.onPageSizeChange}
            />
          ) : null}
        </section>
      ) : !isLive && pagedResults?.loading ? (
        // Between a page/sort/search change landing and its fetch resolving,
        // the derived flags above can momentarily agree on nothing — fall
        // back to a lightweight skeleton instead of a blank body.
        <SessionResultsTableSkeleton rows={4} />
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
              onClick={() => {
                setRerunError(null);
                setRerunMode("new");
                setRerunModeOpen(true);
              }}
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

      <AlertDialog open={rerunModeOpen} onOpenChange={setRerunModeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How should we run this search?</AlertDialogTitle>
            <AlertDialogDescription>
              Choose whether to keep results on this session or start a new one
              in your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2 py-1" role="radiogroup" aria-label="Search again mode">
            <label
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                rerunMode === "new"
                  ? "border-primary/40 bg-brand-subtle/30"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <input
                type="radio"
                name="rerun-mode"
                className="mt-0.5 size-3.5 accent-primary"
                checked={rerunMode === "new"}
                onChange={() => setRerunMode("new")}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  Create a new search
                </span>
                <span className="block text-xs text-muted-foreground">
                  Adds a new item to search history. Owner: you (signed-in user).
                </span>
              </span>
            </label>
            <label
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                rerunMode === "existing"
                  ? "border-primary/40 bg-brand-subtle/30"
                  : "border-border hover:bg-muted/40"
              )}
            >
              <input
                type="radio"
                name="rerun-mode"
                className="mt-0.5 size-3.5 accent-primary"
                checked={rerunMode === "existing"}
                onChange={() => setRerunMode("existing")}
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">
                  Update this search
                </span>
                <span className="block text-xs text-muted-foreground">
                  Reuses this session and refreshes its results. Owner stays{" "}
                  {session.owner}.
                </span>
              </span>
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rerunningSearch}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={rerunningSearch}
              onClick={(event) => {
                event.preventDefault();
                void rerunSearch(rerunMode);
              }}
            >
              {rerunningSearch ? "Searching…" : "Run search"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        listName={
          drawerId
            ? (savedListMap[drawerId] ?? drawerCandidate?.lists[0] ?? null)
            : null
        }
        onToggleSave={() => drawerId && openAddToList([drawerId])}
        onAddToOutreach={() => drawerId && void startOutreach([drawerId])}
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
          setSavedListMap((previous) => ({
            ...previous,
            ...Object.fromEntries(
              addToListCandidateIds.map((id) => [id, list.name])
            ),
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
