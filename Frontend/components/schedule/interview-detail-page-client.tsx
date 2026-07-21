"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { InterviewDetail } from "@/components/schedule/interview-detail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
        <InterviewDetailSkeleton />
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

function InterviewDetailSkeleton() {
  return (
    <div aria-busy className="mt-4 space-y-4">
      {/* Header: avatar, name, status, meta, actions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
              <Skeleton className="mt-2 h-4 w-64 max-w-full" />
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Body: details card + sidebar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1.5 h-4 w-36 max-w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <Skeleton className="size-7 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-44 max-w-full" />
                    <Skeleton className="h-3 w-64 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-28" />
            <div className="mt-4 space-y-2.5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-3.5 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-4 h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
