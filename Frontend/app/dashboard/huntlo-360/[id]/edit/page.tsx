import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

import { WorkflowBuilder } from "@/components/huntlo-360/workflow-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ROUTES, workflowDetailPath } from "@/lib/routes";

export const metadata: Metadata = { title: "Edit Workflow" };

function EditWorkflowFallback() {
  return (
    <div aria-busy className="space-y-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default async function EditWorkflowPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
}) {
  const { id } = await params;
  const { step: stepRaw } = await searchParams;
  const parsedStep = Number(stepRaw);
  const initialStep =
    Number.isFinite(parsedStep) && parsedStep >= 0
      ? Math.floor(parsedStep)
      : undefined;

  return (
    <>
      <PageHeader
        title="Edit Workflow"
        description="Update the role, audience, messages, screening and scheduling — then save or relaunch."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={workflowDetailPath(id)} />}
            >
              <ArrowLeft aria-hidden />
              Back to Workflow
            </Button>
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href={ROUTES.huntlo360} />}
            >
              Huntlo 360
            </Button>
          </div>
        }
      />
      <Suspense fallback={<EditWorkflowFallback />}>
        <WorkflowBuilder workflowId={id} initialStep={initialStep} />
      </Suspense>
    </>
  );
}
