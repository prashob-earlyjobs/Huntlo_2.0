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

import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { OutreachWorkspace } from "@/components/outreach/outreach-workspace";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getApiErrorMessage,
  outreachApi,
  type OutreachOverview,
} from "@/lib/api";
import type { OutreachCampaign, OutreachMetric } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";

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

function OutreachMetricsSkeleton() {
  return (
    <div
      aria-busy
      className="overflow-hidden rounded-lg border border-border"
    >
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OverviewMetricCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function OutreachPageClient() {
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [metrics, setMetrics] = useState<OutreachMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [next, overview] = await Promise.all([
          outreachApi.listCampaigns({ limit: 100 }),
          outreachApi.getOverview(),
        ]);
        if (cancelled) return;
        setCampaigns(next);
        setMetrics(toOutreachMetrics(overview));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load outreach campaigns."));
        setMetrics([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <MetricStrip metrics={metrics} />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading campaigns…</p>
      ) : (
        <OutreachWorkspace
          campaigns={campaigns}
          onCampaignsChange={setCampaigns}
        />
      )}
    </>
  );
}
