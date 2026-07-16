"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { ScreeningDetail } from "@/components/screening/screening-detail";
import { Button } from "@/components/ui/button";
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
        <p className="mt-4 text-sm text-muted-foreground">Loading screening…</p>
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
