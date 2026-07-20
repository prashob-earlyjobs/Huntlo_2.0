"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ResultDetail } from "@/components/screening/result-detail";
import { ResultDetailSkeleton } from "@/components/screening/result-detail-skeleton";
import { ApiFeedback } from "@/components/shared/api-feedback";
import { Button } from "@/components/ui/button";
import { screeningApi, getApiErrorMessage, mapApiErrorToUiState } from "@/lib/api";
import type { ApiUiState } from "@/lib/api/errors";
import type { ScreeningResult, ScreeningResultDetail } from "@/lib/mock-screening";
import { ROUTES } from "@/lib/routes";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";

export function ScreeningResultDetailClient({ id }: { id: string }) {
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [detail, setDetail] = useState<ScreeningResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uiState, setUiState] = useState<ApiUiState>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setUiState("loading");
      setMessage(null);
    }
    try {
      const [summary, full] = await Promise.all([
        screeningApi.getResult(id),
        screeningApi.getResultDetail(id),
      ]);
      if (!summary || !full) {
        setResult(null);
        setDetail(null);
        setUiState("empty");
        setMessage("Screening result not found.");
        return;
      }
      setResult(summary);
      setDetail(full);
      setUiState("success");
    } catch (error) {
      setResult(null);
      setDetail(null);
      setUiState(mapApiErrorToUiState(error));
      setMessage(getApiErrorMessage(error, "Unable to load screening result."));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeRefresh("screening.result.updated", () => {
    void load({ silent: true });
  });

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.screeningResults} />}
      >
        <ArrowLeft aria-hidden />
        Screening Results
      </Button>

      {loading ? <ResultDetailSkeleton /> : null}

      {!loading && uiState !== "success" ? (
        <ApiFeedback
          state={uiState}
          message={message}
          onRetry={() => void load()}
          emptyTitle="Result not found"
          emptyDescription="This screening result may have been removed or is outside your workspace."
          emptyActionLabel="Back to results"
          emptyActionHref={ROUTES.screeningResults}
        />
      ) : null}

      {!loading && result && detail ? (
        <ResultDetail
          result={result}
          detail={detail}
          onChanged={() => void load({ silent: true })}
        />
      ) : null}
    </>
  );
}
