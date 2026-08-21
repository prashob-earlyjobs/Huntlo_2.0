import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";

import { HiringFlowsWorkspace } from "@/components/templates/hiring-flows-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Hiring playbooks assigned to your organisation. You can add questions; the first WhatsApp message is set by Huntlo admin."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.outreach} />}
          >
            <Send aria-hidden />
            Outreach Campaigns
          </Button>
        }
      />
      <HiringFlowsWorkspace />
    </>
  );
}
