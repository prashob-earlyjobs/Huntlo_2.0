"use client";

import {
  Eye,
  MoreHorizontal,
  Phone,
  Search,
  StickyNote,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
import { getApiErrorMessage, screeningApi } from "@/lib/api";
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

const REC_CLASSES: Record<AiRecommendation, string> = {
  Shortlist: "bg-success/10 text-success",
  Reject: "bg-destructive/10 text-destructive",
  "Needs review": "bg-warning/10 text-warning",
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
}: {
  result: ScreeningResult;
  onAction: (message: string) => void;
}) {
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
        <DropdownMenuItem
          onClick={() => onAction(`Marked “${result.candidateName}” as shortlisted.`)}
        >
          Shortlist
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onAction(`Rejected “${result.candidateName}”.`)}
        >
          Reject
        </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ResultsWorkspace() {
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [recommendationFilter, setRecommendationFilter] = useState<string[]>([]);
  const [decisionFilter, setDecisionFilter] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const next = await screeningApi.listResults({ limit: 100 });
        if (cancelled) return;
        setResults(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load screening results."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return results.filter((result) => {
      if (
        normalized &&
        !`${result.candidateName} ${result.jobTitle} ${result.screeningName}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (
        recommendationFilter.length > 0 &&
        !recommendationFilter.includes(result.recommendation)
      )
        return false;
      if (
        decisionFilter.length > 0 &&
        !decisionFilter.includes(result.decision)
      )
        return false;
      return true;
    });
  }, [results, query, recommendationFilter, decisionFilter]);

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
              {filtered.length}
            </span>{" "}
            results
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                AI voice screening results with scores and recommendations
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Candidate</TableHead>
                  <TableHead className={HEAD}>Job</TableHead>
                  <TableHead className={HEAD}>Call status</TableHead>
                  <TableHead className={HEAD}>Attempts</TableHead>
                  <TableHead className={HEAD}>Duration</TableHead>
                  <TableHead className={`${HEAD} text-right`}>
                    Overall score
                  </TableHead>
                  <TableHead className={HEAD}>Recommendation</TableHead>
                  <TableHead className={HEAD}>Key variables</TableHead>
                  <TableHead className={HEAD}>Completed date</TableHead>
                  <TableHead className={HEAD}>Recruiter decision</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((result) => (
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
                          <Link
                            href={screeningDetailPath(result.screeningId)}
                            className="block truncate text-[11px] text-muted-foreground underline-offset-4 hover:underline"
                          >
                            {result.screeningName}
                          </Link>
                        </div>
                      </div>
                    </TableCell>
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
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      {result.callStatus}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                      {result.attemptsUsed}/{result.attemptsMax}
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
                      <Badge
                        text={result.recommendation}
                        className={REC_CLASSES[result.recommendation]}
                      />
                    </TableCell>
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
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {result.completedDate}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge
                        text={result.decision}
                        className={DECISION_CLASSES[result.decision]}
                      />
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <ResultRowActions result={result} onAction={flash} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No results match these filters"
            description="Adjust your filters, or run a voice screening batch to generate results."
            actionLabel="Go to AI Screening"
            actionHref={ROUTES.screening}
            className="m-4 border-0"
          />
        )}
      </section>
    </div>
  );
}
