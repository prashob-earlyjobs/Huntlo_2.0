import type { Metadata } from "next";

import { PlansWorkspace } from "@/components/plans/plans-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Plans & Usage" };

export default function PlansPage() {
  return (
    <>
      <PageHeader
        title="Plans & Usage"
        description="Plan limits, credit balances, and billing history."
      />
      <PlansWorkspace />
    </>
  );
}
