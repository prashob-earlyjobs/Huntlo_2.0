"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getApiErrorMessage, screeningApi } from "@/lib/api";
import type {
  AiRecommendation,
  CallStatus,
  ScreeningResult,
} from "@/lib/mock-screening";
import {
  candidateDetailPath,
  jobDetailPath,
  ROUTES,
  screeningDetailPath,
  screeningResultPath,
} from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const REC_CLASSES: Record<AiRecommendation, string> = {
  Shortlist: "bg-success/10 text-success",
  Reject: "bg-destructive/10 text-destructive",
  "Needs review": "bg-warning/10 text-warning",
};

const CALL_CLASSES: Record<CallStatus, string> = {
  Queued: "bg-muted text-muted-foreground",
  Ringing: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  "No answer": "bg-warning/10 text-warning",
  Voicemail: "bg-warning/10 text-warning",
  Failed: "bg-destructive/10 text-destructive",
  "Opted out": "bg-destructive/10 text-destructive",
};

const RECOMMENDATION_API: Record<string, string> = {
  Shortlist: "shortlist",
  Reject: "reject",
  "Needs review": "review",
};

const DECISION_API: Record<string, string> = {
  Pending: "pending",
  Shortlisted: "shortlisted",
  Rejected: "rejected",
  "Interview scheduled": "call_again",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

function ResultRowActions({
  result,
  modality = "voice",
  busy,
  onInviteOrCallAgain,
  onAction,
}: {
  result: ScreeningResult;
  modality?: "voice" | "video";
  busy?: boolean;
  onInviteOrCallAgain: (result: ScreeningResult) => void;
  onAction: (message: string) => void;
}) {
  const isVideo = modality === "video";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${result.candidateName}`}
            disabled={busy}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          render={<Link href={screeningResultPath(result.id)} />}
        >
          <Eye aria-hidden />
          View result
        </DropdownMenuItem>
        {result.candidateId ? (
          <DropdownMenuItem
            render={<Link href={candidateDetailPath(result.candidateId)} />}
          >
            <Eye aria-hidden />
            View profile
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onClick={() => onInviteOrCallAgain(result)}
        >
          {isVideo ? <Mail aria-hidden /> : <Phone aria-hidden />}
          {busy
            ? isVideo
              ? "Inviting…"
              : "Queuing…"
            : isVideo
              ? "Invite again"
              : "Call again"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAction(`Note added for “${result.candidateName}”.`)}
        >
          <StickyNote aria-hidden />
          Add note
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ResultsWorkspace({
  screeningId,
  modality = "voice",
}: {
  screeningId?: string;
  modality?: "voice" | "video";
} = {}) {
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<string[]>([]);
  const [decisionFilter, setDecisionFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const isVideo = modality === "video";

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, recommendationFilter, decisionFilter, pageSize, screeningId]);

  const refresh = useCallback(async () => {
    const recommendation = recommendationFilter
      .map((value) => RECOMMENDATION_API[value])
      .filter(Boolean)
      .join(",");
    const decision = decisionFilter
      .map((value) => DECISION_API[value])
      .filter(Boolean)
      .join(",");

    const next = await screeningApi.listResults({
      page,
      limit: pageSize,
      q: debouncedQuery || undefined,
      recommendation: recommendation || undefined,
      decision: decision || undefined,
      ...(screeningId ? { screeningId } : {}),
    });
    setResults(next.items);
    setTotal(next.pagination.total);
    setTotalPages(Math.max(1, next.pagination.totalPages));
    if (next.pagination.page !== page) setPage(next.pagination.page);
    setError(null);
  }, [
    page,
    pageSize,
    debouncedQuery,
    recommendationFilter,
    decisionFilter,
    screeningId,
  ]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch (err) {
        if (cancelled) return;
        setResults([]);
        setTotal(0);
        setTotalPages(1);
        setError(getApiErrorMessage(err, "Unable to load screening results."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useRealtimeRefresh("screening.result.updated", () => {
    void refresh().catch(() => undefined);
  });

  const recommendationOptions: FilterOption[] = [
    "Shortlist",
    "Reject",
    "Needs review",
  ].map((value) => ({ id: value, label: value }));

  const decisionOptions: FilterOption[] = [
    "Pending",
    "Shortlisted",
    "Rejected",
    "Interview scheduled",
  ].map((value) => ({ id: value, label: value }));

  const hasFilters =
    Boolean(query) ||
    recommendationFilter.length > 0 ||
    decisionFilter.length > 0;

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  async function inviteOrCallAgain(result: ScreeningResult) {
    if (busyId) return;
    setBusyId(result.id);
    try {
      await screeningApi.callAgainResult(result.id);
      await refresh();
      flash(
        isVideo
          ? `Re-sent video invite for “${result.candidateName}”.`
          : `Queued another call for “${result.candidateName}”.`
      );
    } catch (err) {
      flash(
        getApiErrorMessage(
          err,
          isVideo
            ? "Unable to re-invite this candidate."
            : "Unable to queue another call."
        )
      );
    } finally {
      setBusyId(null);
    }
  }

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search candidates…"
              aria-label="Search screening results"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="AI recommendation"
              options={recommendationOptions}
              selected={recommendationFilter}
              onToggle={(id) =>
                setRecommendationFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )
              }
            />
            <FilterPopover
              label="Recruiter decision"
              options={decisionOptions}
              selected={decisionFilter}
              onToggle={(id) =>
                setDecisionFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                )
              }
            />
            {hasFilters ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setRecommendationFilter([]);
                  setDecisionFilter([]);
                }}
              >
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading results…</p>
      ) : null}

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {total}
            </span>{" "}
            results
          </p>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                AI voice screening results with scores and recommendations
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Candidate</TableHead>
                  {!screeningId ? (
                    <TableHead className={HEAD}>Job</TableHead>
                  ) : null}
                  <TableHead className={HEAD}>Call status</TableHead>
                  <TableHead className={HEAD}>Duration</TableHead>
                  <TableHead className={`${HEAD} text-right`}>
                    Overall score
                  </TableHead>
                  <TableHead className={HEAD}>Recommendation</TableHead>
                  <TableHead className={HEAD}>Completed date</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-2.5">
                        <CandidateAvatar
                          name={result.candidateName}
                          className="size-7"
                        />
                        <div className="min-w-0">
                          <Link
                            href={screeningResultPath(result.id)}
                            className="block truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                          >
                            {result.candidateName}
                          </Link>
                          {!screeningId ? (
                            <Link
                              href={screeningDetailPath(result.screeningId)}
                              className="block truncate text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                            >
                              {result.screeningName}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    {!screeningId ? (
                      <TableCell className="py-2.5 whitespace-nowrap">
                        {result.jobId ? (
                          <Link
                            href={jobDetailPath(result.jobId)}
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                          >
                            {result.jobTitle}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {result.jobTitle}
                          </span>
                        )}
                      </TableCell>
                    ) : null}
                    <TableCell className="py-2.5">
                      {result.error ? (
                        <Tooltip>
                          <TooltipTrigger
                            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            aria-label={`${result.callStatus}: ${result.error}`}
                          >
                            <Badge
                              text={result.callStatus}
                              className={CALL_CLASSES[result.callStatus]}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-72 text-left leading-snug">
                            {result.error}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Badge
                          text={result.callStatus}
                          className={CALL_CLASSES[result.callStatus]}
                        />
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                      {result.duration}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <Link
                        href={screeningResultPath(result.id)}
                        className={cn(
                          "text-sm font-semibold tabular-nums underline-offset-4 hover:underline",
                          result.overallScore >= 75
                            ? "text-success"
                            : result.overallScore < 60
                              ? "text-destructive"
                              : "text-foreground"
                        )}
                      >
                        {result.overallScore}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          text={result.recommendation}
                          className={REC_CLASSES[result.recommendation]}
                        />
                        {result.knockoutFailed ? (
                          <Badge
                            text="Knockout"
                            className="bg-destructive/10 text-destructive"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {result.completedDate}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <ResultRowActions
                        result={result}
                        modality={modality}
                        busy={busyId === result.id}
                        onInviteOrCallAgain={(row) =>
                          void inviteOrCallAgain(row)
                        }
                        onAction={flash}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : !loading ? (
          <EmptyState
            icon={Search}
            title={
              screeningId
                ? "No results for this screening yet"
                : "No results match these filters"
            }
            description={
              screeningId
                ? "Results appear here once candidates complete AI voice screening for this campaign."
                : "Adjust your filters, or run a voice screening batch to generate results."
            }
            actionLabel={screeningId ? undefined : "Go to AI Screening"}
            actionHref={screeningId ? undefined : ROUTES.screening}
            className="m-4 border-0"
          />
        ) : null}

        {total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading…"
                : `Showing ${rangeStart}–${rangeEnd} of ${total.toLocaleString("en-IN")}`}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Rows
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
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
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Next page"
                  disabled={loading || page >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
