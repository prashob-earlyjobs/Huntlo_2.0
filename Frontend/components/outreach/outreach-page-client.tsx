"use client";

import Link from "next/link";
import {
  CheckCircle2,
  MailCheck,
  MessagesSquare,
  Plus,
  Send,
  ThumbsUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  OutreachMetricsSkeleton,
  OutreachWorkspaceSkeleton,
} from "@/components/outreach/outreach-skeleton";
import { OutreachWorkspace } from "@/components/outreach/outreach-workspace";
import { ApiFeedback } from "@/components/shared/api-feedback";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getApiErrorMessage,
  outreachApi,
  type OutreachOverview,
  type PaginationMeta,
} from "@/lib/api";
import type { OutreachCampaign, OutreachMetric } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

const DEFAULT_PAGE_SIZE = 10;

const EMPTY_PAGINATION: PaginationMeta = {
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 1,
};

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatRate(value: number): string {
  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${rounded}%`;
}

function toOutreachMetrics(overview: OutreachOverview): OutreachMetric[] {
  return [
    {
      id: "active",
      label: "Active Campaigns",
      value: formatCount(overview.activeCampaigns),
      change: "—",
      trend: "flat",
      comparison: "running or scheduled",
      tooltip: "Campaigns currently running or scheduled.",
      icon: Send,
    },
    {
      id: "enrolled",
      label: "Candidates Enrolled",
      value: formatCount(overview.candidatesEnrolled),
      change: "—",
      trend: "flat",
      comparison: "across outreach",
      tooltip: "Candidates enrolled in outreach sequences.",
      icon: Users,
    },
    {
      id: "sent",
      label: "Messages Sent",
      value: formatCount(overview.messagesSent),
      change: "—",
      trend: "flat",
      comparison: "all channels",
      tooltip: "All messages and calls across email, WhatsApp and AI voice.",
      icon: MailCheck,
    },
    {
      id: "reply",
      label: "Reply Rate",
      value: formatRate(overview.replyRate),
      change: "—",
      trend: "flat",
      comparison: "of contacted",
      tooltip: "Candidates who replied at least once, out of those contacted.",
      icon: MessagesSquare,
    },
    {
      id: "positive",
      label: "Positive Reply Rate",
      value: formatRate(overview.positiveReplyRate),
      change: "—",
      trend: "flat",
      comparison: "of replies",
      tooltip: "Replies classified as interested by the AI assistant.",
      icon: ThumbsUp,
    },
    {
      id: "qualified",
      label: "Qualified Candidates",
      value: formatCount(overview.qualified),
      change: "—",
      trend: "flat",
      comparison: "passed screening",
      tooltip: "Candidates who passed qualification questions.",
      icon: CheckCircle2,
    },
  ];
}

export function OutreachPageClient() {
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [metrics, setMetrics] = useState<OutreachMetric[]>([]);
  const [pagination, setPagination] =
    useState<PaginationMeta>(EMPTY_PAGINATION);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = search.trim();
      setDebouncedSearch((prev) => {
        if (prev !== next) setPage(1);
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [next, overview] = await Promise.all([
          outreachApi.listCampaignsPage({
            page,
            limit: DEFAULT_PAGE_SIZE,
            ...(debouncedSearch ? { q: debouncedSearch } : {}),
          }),
          outreachApi.getOverview(),
        ]);
        if (cancelled) return;
        setCampaigns(next.items);
        setPagination(next.pagination);
        if (next.pagination.page !== page) {
          setPage(next.pagination.page);
        }
        setMetrics(toOutreachMetrics(overview));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load outreach campaigns."));
        setMetrics([]);
        setCampaigns([]);
        setPagination(EMPTY_PAGINATION);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, reloadToken]);

  useRealtimeRefresh(
    ["campaign.updated", "campaign.status.changed", "conversation.message.created"],
    () => setReloadToken((value) => value + 1)
  );

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Campaigns across email, WhatsApp, and voice with reply tracking."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.outreachNew} />}
          >
            <Plus aria-hidden />
            Create Campaign
          </Button>
        }
      />

      {loading && metrics.length === 0 ? (
        <OutreachMetricsSkeleton />
      ) : metrics.length > 0 ? (
        <MetricStrip metrics={metrics} columns="6" className="min-w-0" />
      ) : null}

      {error ? (
        <ApiFeedback
          state="error"
          message={error}
          onRetry={() => setReloadToken((value) => value + 1)}
        />
      ) : null}
      {loading && campaigns.length === 0 ? (
        <OutreachWorkspaceSkeleton />
      ) : (
        <OutreachWorkspace
          campaigns={campaigns}
          pagination={pagination}
          search={search}
          onSearchChange={setSearch}
          onPageChange={setPage}
          onCampaignsChange={setCampaigns}
        />
      )}
    </>
  );
}
