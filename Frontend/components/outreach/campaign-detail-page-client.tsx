"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { CampaignDetail } from "@/components/outreach/campaign-detail";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, outreachApi } from "@/lib/api";
import type { OutreachCampaign } from "@/lib/mock-outreach";
import { ROUTES } from "@/lib/routes";

export function CampaignDetailPageClient({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<OutreachCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const next = await outreachApi.getCampaign(id);
        if (cancelled) return;
        if (!next) {
          setMissing(true);
          return;
        }
        setCampaign(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load campaign."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading campaign…</p>
      ) : missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Campaign not found</h1>
          <p className="text-sm text-muted-foreground">
            This campaign may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error ? (
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
