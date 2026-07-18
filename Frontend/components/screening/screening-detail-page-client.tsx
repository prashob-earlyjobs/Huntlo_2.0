"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { ScreeningDetail } from "@/components/screening/screening-detail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage, screeningApi } from "@/lib/api";
import type { ScreeningBatch } from "@/lib/mock-screening";
import { ROUTES } from "@/lib/routes";

export function ScreeningDetailPageClient({ id }: { id: string }) {
  const [batch, setBatch] = useState<ScreeningBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const next = await screeningApi.getBatch(id);
        if (cancelled) return;
        if (!next) {
          setMissing(true);
          return;
        }
        setBatch(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load screening."));
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
        render={<Link href={ROUTES.screening} />}
      >
        <ArrowLeft aria-hidden />
        Screening
      </Button>

      {loading ? (
        <ScreeningDetailSkeleton />
      ) : missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Screening not found</h1>
          <p className="text-sm text-muted-foreground">
            This screening may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      ) : batch ? (
        <div className="mt-4">
          <ScreeningDetail batch={batch} />
        </div>
      ) : null}
    </>
  );
}

function ScreeningDetailSkeleton() {
  return (
    <div aria-busy className="mt-4 space-y-4">
      {/* Header card: title, status, meta line, action buttons */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-56 max-w-full" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-28" />
            ))}
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Skeleton className="h-9 w-full max-w-xs" />

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="mt-3 h-7 w-14" />
          </div>
        ))}
      </div>

      {/* Objective card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-2 h-3.5 w-56" />
      </div>
    </div>
  );
}
