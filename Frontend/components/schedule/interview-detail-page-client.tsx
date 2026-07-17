"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { InterviewDetail } from "@/components/schedule/interview-detail";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, schedulingApi } from "@/lib/api";
import type { Interview } from "@/lib/mock-schedule";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export function InterviewDetailPageClient({ id }: { id: string }) {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const next = await schedulingApi.getInterview(id);
      if (!next) {
        setMissing(true);
        return;
      }
      setInterview(next);
      setError(null);
      setMissing(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to load interview."));
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

  useRealtimeRefresh("interview.updated", () => {
    void refresh();
  });

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.interviews} />}
      >
        <ArrowLeft aria-hidden />
        Interviews
      </Button>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading interview…</p>
      ) : missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Interview not found</h1>
          <p className="text-sm text-muted-foreground">
            This interview may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : interview ? (
        <div className="mt-4">
          <InterviewDetail
            interview={interview}
            onInterviewChange={setInterview}
          />
        </div>
      ) : null}
    </>
  );
}
