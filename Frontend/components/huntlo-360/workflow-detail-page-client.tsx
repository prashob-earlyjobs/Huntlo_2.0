"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { WorkflowDetail } from "@/components/huntlo-360/workflow-detail";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, huntlo360Api } from "@/lib/api";
import type { Workflow360 } from "@/lib/mock-360";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export function WorkflowDetailPageClient({ id }: { id: string }) {
  const [workflow, setWorkflow] = useState<Workflow360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await huntlo360Api.getWorkflow(id);
      if (!next) {
        setMissing(true);
        setWorkflow(null);
        return;
      }
      setWorkflow(next);
      setMissing(false);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load workflow."));
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

  useRealtimeRefresh(
    [
      "campaign.updated",
      "campaign.thread.updated",
      "hcg.gmail.updated",
      "hcg.whatsapp.updated",
      "hcg.hunar.updated",
      "hcg.zyvkay.updated",
      "screening.result.updated",
      "interview.updated",
    ],
    (event) => {
      const data =
        event?.data && typeof event.data === "object"
          ? (event.data as { campaignId?: string | null; workflowId?: string | null })
          : null;
      if (data?.workflowId && String(data.workflowId) !== String(id)) {
        return;
      }
      if (
        data?.campaignId &&
        workflow?.campaignId &&
        String(data.campaignId) !== String(workflow.campaignId)
      ) {
        return;
      }
      void refresh();
    },
    { debounceMs: 800 }
  );

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.huntlo360} />}
      >
        <ArrowLeft aria-hidden />
        Huntlo 360
      </Button>

      {loading && !workflow ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading workflow…</p>
      ) : missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Workflow not found</h1>
          <p className="text-sm text-muted-foreground">
            This workflow may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error && !workflow ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : workflow ? (
        <div className="mt-4">
          <WorkflowDetail workflow={workflow} />
        </div>
      ) : null}
    </>
  );
}
