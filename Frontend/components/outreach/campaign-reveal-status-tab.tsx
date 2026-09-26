"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ApiFeedback } from "@/components/shared/api-feedback";
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
  getApiErrorMessage,
  mapApiErrorToUiState,
  outreachApi,
  type ApiUiState,
  type CampaignRevealStatus,
  type RevealContactStatus,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<RevealContactStatus, string> = {
  already_revealed: "Already revealed",
  succeeded: "Succeeded",
  in_process: "In process",
  queued: "Queued",
  not_found: "Not found",
  waiting: "Waiting",
};

const STATUS_CLASS: Record<RevealContactStatus, string> = {
  already_revealed: "bg-muted text-muted-foreground",
  succeeded: "bg-success/10 text-success",
  in_process: "bg-primary/10 text-primary",
  queued: "bg-warning/10 text-warning",
  not_found: "bg-destructive/10 text-destructive",
  waiting: "bg-muted text-muted-foreground",
};

const FILTERS: Array<{ id: "all" | RevealContactStatus; label: string; countKey?: keyof CampaignRevealStatus["summary"] }> = [
  { id: "all", label: "All", countKey: "total" },
  { id: "already_revealed", label: "Already revealed", countKey: "alreadyRevealed" },
  { id: "succeeded", label: "Succeeded", countKey: "succeeded" },
  { id: "in_process", label: "In process", countKey: "inProcess" },
  { id: "queued", label: "Queued", countKey: "queued" },
  { id: "not_found", label: "Not found", countKey: "notFound" },
  { id: "waiting", label: "Waiting", countKey: "waiting" },
];

function StatusBadge({ status }: { status: RevealContactStatus | null }) {
  if (!status) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        STATUS_CLASS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function queueSummary(data: CampaignRevealStatus): string {
  const { queue, summary } = data;
  if (queue.phase === "running") {
    const who = queue.currentCandidateName || "the next candidate";
    const channel =
      queue.currentContactType === "email"
        ? "email"
        : queue.currentContactType === "mobile"
          ? "mobile"
          : "contact";
    return `Revealing ${channel} for ${who} now. ${summary.queued.toLocaleString("en-IN")} still queued.`;
  }
  if (queue.phase === "queued") {
    const when = queue.runAt
      ? new Date(queue.runAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
      : null;
    return when
      ? `Reveal queue is waiting. Next check at ${when}. ${summary.queued.toLocaleString("en-IN")} still queued.`
      : `Reveal queue is waiting. ${summary.queued.toLocaleString("en-IN")} still queued.`;
  }
  if (queue.phase === "failed") {
    return queue.lastError
      ? `Reveal queue stopped. ${queue.lastError}`
      : "Reveal queue stopped before every candidate was checked.";
  }
  if (queue.phase === "finished") {
    return "Reveal queue finished for this campaign.";
  }
  return "Reveal has not started. People who already have a contact are listed as already revealed.";
}

export function CampaignRevealStatusTab({
  campaignId,
  active,
}: {
  campaignId: string;
  active: boolean;
}) {
  const [data, setData] = useState<CampaignRevealStatus | null>(null);
  const [state, setState] = useState<ApiUiState>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function load(background: boolean) {
      if (background) setRefreshing(true);
      else setState("loading");
      try {
        const next = await outreachApi.getRevealStatus(campaignId);
        if (cancelled) return;
        setData(next);
        setState(next.included && next.items.length === 0 ? "empty" : "success");
        setMessage(null);
      } catch (err) {
        if (cancelled) return;
        if (!background) {
          setState(mapApiErrorToUiState(err));
          setMessage(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    }

    void load(false);
    return () => {
      cancelled = true;
    };
  }, [active, campaignId, attempt]);

  useEffect(() => {
    if (!active || !data) return;
    if (data.queue.phase !== "running" && data.queue.phase !== "queued") return;
    let cancelled = false;
    const timer = window.setInterval(() => {
      void (async () => {
        setRefreshing(true);
        try {
          const next = await outreachApi.getRevealStatus(campaignId);
          if (cancelled) return;
          setData(next);
          setState(next.included && next.items.length === 0 ? "empty" : "success");
        } catch {
          /* keep the last successful snapshot while the queue is live */
        } finally {
          if (!cancelled) setRefreshing(false);
        }
      })();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [active, campaignId, data]);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    return data.items.filter((row) => {
      const statusMatch =
        filter === "all" ||
        row.status === filter ||
        row.email === filter ||
        row.mobile === filter;
      if (!statusMatch) return false;
      if (!needle) return true;
      return (
        row.name.toLowerCase().includes(needle) ||
        (row.headline || "").toLowerCase().includes(needle)
      );
    });
  }, [data, filter, query]);

  if (!active) return null;

  if (state !== "success" && state !== "empty") {
    return (
      <ApiFeedback
        state={state}
        message={message}
        onRetry={() => setAttempt((value) => value + 1)}
        emptyTitle="No reveal status"
        emptyDescription="Reveal progress for this campaign will show up here."
      />
    );
  }

  if (!data?.included) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        This campaign does not unlock email or mobile numbers.
      </p>
    );
  }

  const showEmail = data.channels.includes("email");
  const showMobile = data.channels.includes("mobile");

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact reveal</h3>
            <p className="mt-1 text-sm text-muted-foreground">{queueSummary(data)}</p>
          </div>
          {refreshing ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
              Updating
            </span>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((item) => {
            const count = data.summary[item.countKey || "total"];
            if (item.id !== "all" && count === 0 && filter !== item.id) return null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium",
                  filter === item.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                <span className="tabular-nums">{count.toLocaleString("en-IN")}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search candidates"
        aria-label="Search reveal status"
        className="max-w-sm"
      />

      <div className="max-h-[32rem] overflow-auto rounded-xl border border-border bg-card">
        <Table>
          <caption className="sr-only">Contact reveal status for enrolled candidates</caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-medium text-muted-foreground">Candidate</TableHead>
              {showEmail ? (
                <TableHead className="text-xs font-medium text-muted-foreground">Email</TableHead>
              ) : null}
              {showMobile ? (
                <TableHead className="text-xs font-medium text-muted-foreground">Mobile</TableHead>
              ) : null}
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Queue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3 + Number(showEmail) + Number(showMobile)}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No candidates match this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.enrollmentId}>
                  <TableCell className="py-2.5">
                    <p className="text-sm font-medium text-foreground">{row.name}</p>
                    {row.headline ? (
                      <p className="mt-0.5 max-w-sm truncate text-xs text-muted-foreground">
                        {row.headline}
                      </p>
                    ) : null}
                  </TableCell>
                  {showEmail ? (
                    <TableCell>
                      <StatusBadge status={row.email} />
                    </TableCell>
                  ) : null}
                  {showMobile ? (
                    <TableCell>
                      <StatusBadge status={row.mobile} />
                    </TableCell>
                  ) : null}
                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {row.queuePosition == null ? "—" : row.queuePosition.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
