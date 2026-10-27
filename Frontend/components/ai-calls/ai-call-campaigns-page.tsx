"use client";

import { Megaphone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CampaignCard } from "@/components/ai-calls/campaign-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, vocallabsApi, type VocallabsCampaign } from "@/lib/api";

function CampaignsSkeleton() {
  return (
    <div aria-busy className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

export function AiCallCampaignsPage() {
  const [campaigns, setCampaigns] = useState<VocallabsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    vocallabsApi
      .listCampaigns()
      .then((page) => {
        if (!cancelled) setCampaigns(page.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setCampaigns([]);
          setError(getApiErrorMessage(err, "Could not load campaigns."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter((campaign) =>
      `${campaign.name} ${campaign.agentName}`.toLowerCase().includes(q)
    );
  }, [campaigns, query]);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Calling campaigns for your voice agents."
      />

      {campaigns.length > 0 || query ? (
        <div className="relative max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search campaigns…"
            aria-label="Search campaigns"
            className="pl-8"
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <CampaignsSkeleton /> : null}

      {!loading && filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={campaigns.length === 0 ? "No campaigns yet" : "No campaigns match this search"}
          description={
            campaigns.length === 0
              ? "Campaigns you launch from an agent are saved here."
              : "Try a different name, or clear the search."
          }
        />
      ) : null}

      {!loading && filtered.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((campaign) => (
            <li key={campaign.id}>
              <CampaignCard campaign={campaign} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
