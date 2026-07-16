import type { Metadata } from "next";
import Link from "next/link";
import { Send } from "lucide-react";

import { TemplatesWorkspace } from "@/components/templates/templates-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Templates" };

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Templates"
        description="Reusable emails, WhatsApp messages, voice scripts and qualification sets with personalisation placeholders."
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
      <TemplatesWorkspace />
    </>
  );
}
