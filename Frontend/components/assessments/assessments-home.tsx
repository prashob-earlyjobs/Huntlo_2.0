"use client";

import { ClipboardList, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  assessmentsApi,
  getApiErrorMessage,
  type AssessmentCampaign,
} from "@/lib/api";
import { jobDetailPath, ROUTES } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const STATUS_OPTIONS: FilterOption[] = [
  { id: "Active", label: "Active" },
  { id: "Draft", label: "Draft" },
  { id: "Completed", label: "Completed" },
  { id: "Cancelled", label: "Cancelled" },
  { id: "Scheduled", label: "Scheduled" },
];

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Active" || status === "Running"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : status === "Draft" || status === "Scheduled"
        ? "bg-muted text-muted-foreground"
        : status === "Cancelled" || status === "Failed"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-foreground";
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

export function AssessmentsHome() {
  const [campaigns, setCampaigns] = useState<AssessmentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await assessmentsApi.listCampaigns();
        if (!cancelled) setCampaigns(rows);
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((row) => {
      if (statusFilter.length && !statusFilter.includes(row.status)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.templateName.toLowerCase().includes(q) ||
        (row.jobTitle || "").toLowerCase().includes(q)
      );
    });
  }, [campaigns, query, statusFilter]);

  async function launch(id: string) {
    try {
      const updated = await assessmentsApi.launchCampaign(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  async function cancel(id: string) {
    try {
      const updated = await assessmentsApi.cancelCampaign(id);
      setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
        Loading assessments…
      </div>
    );
  }

  if (!campaigns.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No assessment campaigns"
        description="Create a template, invite candidates by email or WhatsApp, and track scores here."
        actionLabel="Open assessments"
        actionHref={ROUTES.assessments}
      />
    );
  }

  return (
    <section className="space-y-3">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search campaigns…"
            className="pl-8"
          />
        </div>
        <FilterPopover
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onToggle={(id) =>
            setStatusFilter((prev) =>
              prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
            )
          }
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={HEAD}>Assessment</TableHead>
              <TableHead className={HEAD}>Job</TableHead>
              <TableHead className={`${HEAD} text-right`}>Invited</TableHead>
              <TableHead className={`${HEAD} text-right`}>Completed</TableHead>
              <TableHead className={HEAD}>Status</TableHead>
              <TableHead className={`${HEAD} w-10`} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.templateName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {row.jobId && row.jobTitle ? (
                    <Link
                      href={jobDetailPath(row.jobId)}
                      className="text-sm text-primary hover:underline"
                    >
                      {row.jobTitle}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.invited}</TableCell>
                <TableCell className="text-right tabular-nums">{row.completed}</TableCell>
                <TableCell>
                  <StatusPill status={row.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label="Campaign actions" />
                      }
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(row.status === "Draft" || row.status === "Scheduled") && (
                        <DropdownMenuItem onClick={() => void launch(row.id)}>
                          Launch
                        </DropdownMenuItem>
                      )}
                      {row.status === "Active" && (
                        <DropdownMenuItem onClick={() => void cancel(row.id)}>
                          Cancel
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
