"use client";

import {
  Copy,
  ChevronLeft,
  ChevronRight,
  Mail,
  Eye,
  MoreHorizontal,
  Phone,
  RotateCcw,
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
import { getApiErrorMessage, screeningApi, type PaginationMeta } from "@/lib/api";
import type {
  AiRecommendation,
  RecruiterDecision,
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
const DEFAULT_PAGE_SIZE = 10;
const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function toApiRecommendation(value: string): string {
  const raw = value.trim().toLowerCase();
  if (raw.includes("shortlist")) return "shortlist";
  if (raw.includes("reject")) return "reject";
  return "needs_review";
}

function toApiDecision(value: string): string {
  const raw = value.trim().toLowerCase();
  if (raw.includes("shortlist")) return "shortlisted";
  if (raw.includes("reject")) return "rejected";
  if (raw.includes("interview") || raw.includes("schedule")) return "call_again";
  return "pending";
}

function getPageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
}

const REC_CLASSES: Record<AiRecommendation, string> = {
  Shortlist: "bg-success/10 text-success",
  Reject: "bg-destructive/10 text-destructive",
  "Needs review": "bg-warning/10 text-warning",
};

const VIDEO_STATUS_CLASSES: Record<string, string> = {
  Queued: "bg-muted text-muted-foreground",
  Created: "bg-brand-subtle text-primary",
  Invited: "bg-info/10 text-info",
  Sent: "bg-info/10 text-info",
  Resent: "bg-info/10 text-info",
  Failed: "bg-destructive/10 text-destructive",
};

const DECISION_CLASSES: Record<RecruiterDecision, string> = {
  Pending: "bg-muted text-muted-foreground",
  Shortlisted: "bg-brand-subtle text-primary",
  Rejected: "bg-destructive/10 text-destructive",
  "Interview scheduled": "bg-info/10 text-info",
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
  onAction,
  onResultUpdated,
  mode,
}: {
  result: ScreeningResult;
  onAction: (message: string) => void;
  onResultUpdated?: (next: ScreeningResult) => void;
  mode?: "voice" | "video";
}) {
  const showVideoInviteActions =
    mode === "video" && Boolean(String(result.videoApplicationId || "").trim());
  const showVideoRetryAction =
    mode === "video" && (result.videoInvitationStatus || "") === "Failed";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${result.candidateName}`}
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
        {mode === "video" && (showVideoInviteActions || showVideoRetryAction) ? (
          <>
            <DropdownMenuSeparator />
            {showVideoRetryAction ? (
              <DropdownMenuItem
                onClick={() => {
                  void screeningApi
                    .retryInviteResult(result.id)
                    .then((updated) => {
                      onResultUpdated?.(updated);
                      onAction(`Retry queued for “${result.candidateName}”.`);
                    })
                    .catch((err) =>
                      onAction(
                        getApiErrorMessage(err, "Unable to retry interview invite.")
                      )
                    );
                }}
              >
                <RotateCcw aria-hidden />
                Retry invite
              </DropdownMenuItem>
            ) : null}
            {showVideoInviteActions ? (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    void screeningApi
                      .getInterviewLink(result.id)
                      .then(async (link) => {
                        if (!link) {
                          onAction("Interview link was not returned.");
                          return;
                        }
                        await navigator.clipboard?.writeText(link);
                        onAction(`Interview link copied for “${result.candidateName}”.`);
                      })
                      .catch((err) =>
                        onAction(
                          getApiErrorMessage(err, "Unable to fetch interview link.")
                        )
                      );
                  }}
                >
                  <Copy aria-hidden />
                  Copy interview link
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void screeningApi
                      .resendInviteResult(result.id)
                      .then(() =>
                        onAction(`Interview link resent to “${result.candidateName}”.`)
                      )
                      .catch((err) =>
                        onAction(
                          getApiErrorMessage(err, "Unable to resend interview link.")
                        )
                      );
                  }}
                >
                  <Mail aria-hidden />
                  Resend interview link
                </DropdownMenuItem>
              </>
            ) : null}
          </>
        ) : mode === "video" ? null : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction(`Queued another call for “${result.candidateName}”.`)}
            >
              <Phone aria-hidden />
              Call again
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAction(`Note added for “${result.candidateName}”.`)}
            >
              <StickyNote aria-hidden />
              Add note
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function VideoStatusBadge({ result }: { result: ScreeningResult }) {
  const status = result.videoInvitationStatus || "Queued";
  const badge = (
    <Badge
      text={status}
      className={VIDEO_STATUS_CLASSES[status] || "bg-muted text-muted-foreground"}
    />
  );
  return status === "Failed" && result.videoInvitationError ? (
    <Tooltip>
      <TooltipTrigger className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        {badge}
      </TooltipTrigger>
      <TooltipContent>{result.videoInvitationError}</TooltipContent>
    </Tooltip>
  ) : (
    badge
  );
}

export function ResultsWorkspace({
  screeningId,
  mode,
}: {
  screeningId?: string;
  mode?: "voice" | "video";
} = {}) {
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<string[]>([]);
  const [decisionFilter, setDecisionFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      setDebouncedQuery((previous) => {
        if (previous !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const refresh = useCallback(async () => {
    const next = await screeningApi.listResultsPage({
      page,
      limit: DEFAULT_PAGE_SIZE,
      ...(screeningId ? { screeningId } : {}),
      ...(debouncedQuery ? { q: debouncedQuery } : {}),
      ...(recommendationFilter.length > 0
        ? { recommendation: recommendationFilter.map(toApiRecommendation).join(",") }
        : {}),
      ...(decisionFilter.length > 0
        ? { decision: decisionFilter.map(toApiDecision).join(",") }
        : {}),
    });
    setResults(next.items);
    setPagination(next.pagination);
    const nextPage = Number(next.pagination.page) || 1;
    if (nextPage !== page) setPage(nextPage);
    setError(null);
  }, [page, screeningId, debouncedQuery, recommendationFilter, decisionFilter]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load screening results."));
        setResults([]);
        setPagination(EMPTY_PAGINATION);
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
              placeholder="Search candidates, jobs, batches…"
              aria-label="Search screening results"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="AI recommendation"
              options={recommendationOptions}
              selected={recommendationFilter}
              onToggle={(id) => {
                setPage(1);
                setRecommendationFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                );
              }}
            />
            <FilterPopover
              label="Recruiter decision"
              options={decisionOptions}
              selected={decisionFilter}
              onToggle={(id) => {
                setPage(1);
                setDecisionFilter((previous) =>
                  previous.includes(id)
                    ? previous.filter((value) => value !== id)
                    : [...previous, id]
                );
              }}
            />
            {hasFilters ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setRecommendationFilter([]);
                  setDecisionFilter([]);
                  setPage(1);
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
              {pagination.total.toLocaleString("en-IN")}
            </span>{" "}
            results
          </p>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                {mode === "video"
                  ? "AI video screening results with invitation statuses and recommendations"
                  : "AI voice screening results with scores and recommendations"}
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Candidate</TableHead>
                  {!screeningId ? (
                    <TableHead className={HEAD}>Job</TableHead>
                  ) : null}
                  <TableHead className={HEAD}>
                    {mode === "video" ? "Invitation status" : "Call status"}
                  </TableHead>
                  <TableHead className={HEAD}>
                    {mode === "video" ? "Invite attempts" : "Attempts"}
                  </TableHead>
                  {mode === "video" ? null : <TableHead className={HEAD}>Duration</TableHead>}
                  {mode === "video" ? null : (
                    <TableHead className={`${HEAD} text-right`}>
                      Overall score
                    </TableHead>
                  )}
                  {mode === "video" ? null : (
                    <TableHead className={HEAD}>Recommendation</TableHead>
                  )}
                  {mode === "video" ? null : (
                    <TableHead className={HEAD}>Key variables</TableHead>
                  )}
                  <TableHead className={HEAD}>
                    {mode === "video" ? "Timestamp" : "Completed date"}
                  </TableHead>
                  {mode === "video" ? null : (
                    <TableHead className={HEAD}>Recruiter decision</TableHead>
                  )}
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
                          {result.candidateEmail ? (
                            <Tooltip>
                              <TooltipTrigger
                                nativeButton={false}
                                render={
                                  <Link
                                    href={screeningResultPath(result.id)}
                                    className="block truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                                  >
                                    {result.candidateName}
                                  </Link>
                                }
                              />
                              <TooltipContent side="top" align="start">
                                {result.candidateEmail}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Link
                              href={screeningResultPath(result.id)}
                              className="block truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              {result.candidateName}
                            </Link>
                          )}
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
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      {mode === "video" ? (
                        <VideoStatusBadge result={result} />
                      ) : (
                        result.callStatus
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                      {mode === "video"
                        ? result.attemptsUsed
                        : `${result.attemptsUsed}/${result.attemptsMax}`}
                    </TableCell>
                    {mode === "video" ? null : (
                      <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                        {result.duration}
                      </TableCell>
                    )}
                    {mode === "video" ? null : (
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
                    )}
                    {mode === "video" ? null : (
                      <TableCell className="py-2.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {result.recommendation === "Needs review" &&
                          result.recommendationTooltip ? (
                            <Tooltip>
                              <TooltipTrigger className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                                <Badge
                                  text={result.recommendation}
                                  className={REC_CLASSES[result.recommendation]}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                {result.recommendationTooltip}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Badge
                              text={result.recommendation}
                              className={REC_CLASSES[result.recommendation]}
                            />
                          )}
                          {result.knockoutFailed ? (
                            <Badge
                              text="Knockout"
                              className="bg-destructive/10 text-destructive"
                            />
                          ) : null}
                        </div>
                      </TableCell>
                    )}
                    {mode === "video" ? null : (
                      <TableCell className="py-2.5">
                        <div className="flex max-w-56 flex-wrap gap-1">
                          {result.keyVariables.map((variable) => (
                            <span
                              key={variable}
                              className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {result.completedDate}
                    </TableCell>
                    {mode === "video" ? null : (
                      <TableCell className="py-2.5">
                        <Badge
                          text={result.decision}
                          className={DECISION_CLASSES[result.decision]}
                        />
                      </TableCell>
                    )}
                    <TableCell className="py-2.5 text-right">
                      <ResultRowActions
                        result={result}
                        onAction={flash}
                        onResultUpdated={(updated) =>
                          setResults((previous) =>
                            previous.map((row) =>
                              row.id === updated.id ? updated : row
                            )
                          )
                        }
                        mode={mode}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
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
        )}
        {!loading && pagination.total > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {`Showing ${
                (pagination.page - 1) * pagination.limit + 1
              }–${Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )} of ${pagination.total.toLocaleString("en-IN")}`}
            </p>
            <div
              className="flex items-center gap-1"
              role="navigation"
              aria-label="Results pages"
            >
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Previous page"
                disabled={loading || pagination.page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft aria-hidden />
              </Button>
              {getPageItems(pagination.page, pagination.totalPages).map(
                (item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1.5 text-xs text-muted-foreground"
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      type="button"
                      size="icon-sm"
                      variant={item === pagination.page ? "secondary" : "outline"}
                      aria-label={`Page ${item}`}
                      aria-current={item === pagination.page ? "page" : undefined}
                      disabled={loading}
                      onClick={() => setPage(item)}
                    >
                      {item}
                    </Button>
                  )
              )}
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                aria-label="Next page"
                disabled={loading || pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPage((value) =>
                    Math.min(pagination.totalPages, value + 1)
                  )
                }
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
