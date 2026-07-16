import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { WorkflowDetail } from "@/components/huntlo-360/workflow-detail";
import { Button } from "@/components/ui/button";
import { getWorkflow, WORKFLOWS_360 } from "@/lib/mock-360";
import { ROUTES } from "@/lib/routes";

export function generateStaticParams() {
  return WORKFLOWS_360.map((workflow) => ({ id: workflow.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const workflow = getWorkflow(id);
  return { title: workflow ? workflow.name : "Workflow" };
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workflow = getWorkflow(id);

  if (!workflow) {
    notFound();
  }

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
      <WorkflowDetail workflow={workflow} />
    </>
  );
}
