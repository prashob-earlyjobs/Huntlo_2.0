import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { WorkflowBuilder } from "@/components/huntlo-360/workflow-builder";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Create Workflow" };

export default function NewWorkflowPage() {
  return (
    <>
      <PageHeader
        title="Create Workflow"
        description="Seven steps from job to scheduled interviews. No messages or calls are sent from this preview."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.huntlo360} />}
          >
            <ArrowLeft aria-hidden />
            Back to Huntlo 360
          </Button>
        }
      />
      <WorkflowBuilder />
    </>
  );
}
