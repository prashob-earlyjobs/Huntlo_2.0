"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { CampaignDetail } from "@/components/outreach/campaign-detail";
import { CampaignDetailSkeleton } from "@/components/outreach/campaign-detail-skeleton";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, outreachApi } from "@/lib/api";
import type { OutreachCampaign } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export function CampaignDetailPageClient({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<OutreachCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await outreachApi.getCampaign(id);
      if (!next) {
        setMissing(true);
        setCampaign(null);
        return;
      }
      setCampaign(next);
      setMissing(false);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load campaign."));
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useRealtimeRefresh(["campaign.updated", "campaign.thread.updated"], () => {
    void refresh();
  });

  if (loading && !campaign) {
    return <CampaignDetailSkeleton />;
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.outreach} />}
      >
        <ArrowLeft aria-hidden />
        Outreach
      </Button>

      {missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Campaign not found</h1>
          <p className="text-sm text-muted-foreground">
            This campaign may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error && !campaign ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : campaign ? (
        <div className="mt-4">
          <CampaignDetail campaign={campaign} />
        </div>
      ) : null}
    </>
  );
}
