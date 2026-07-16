"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { WorkflowDetail } from "@/components/huntlo-360/workflow-detail";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, huntlo360Api } from "@/lib/api";
import type { Workflow360 } from "@/lib/mock-360";
import { ROUTES } from "@/lib/routes";

export function WorkflowDetailPageClient({ id }: { id: string }) {
  const [workflow, setWorkflow] = useState<Workflow360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const next = await huntlo360Api.getWorkflow(id);
        if (cancelled) return;
        if (!next) {
          setMissing(true);
          return;
        }
        setWorkflow(next);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load workflow."));
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
        render={<Link href={ROUTES.huntlo360} />}
      >
        <ArrowLeft aria-hidden />
        Huntlo 360
      </Button>

      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading workflow…</p>
      ) : missing ? (
        <div className="mt-4 space-y-3">
          <h1 className="text-lg font-semibold">Workflow not found</h1>
          <p className="text-sm text-muted-foreground">
            This workflow may have been deleted or belongs to another workspace.
          </p>
        </div>
      ) : error ? (
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
