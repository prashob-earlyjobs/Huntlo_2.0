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
        description="Four simple steps — set up the role, write messages, filter & book, then launch. Nothing is sent until you launch."
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
