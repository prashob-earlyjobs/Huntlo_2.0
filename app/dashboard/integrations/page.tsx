import type { Metadata } from "next";

import { IntegrationsWorkspace } from "@/components/integrations/integrations-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Integrations" };

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect the tools used for candidate outreach, screening, scheduling, and payments."
      />
      <IntegrationsWorkspace />
    </>
  );
}
