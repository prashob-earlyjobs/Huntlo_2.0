import type { Metadata } from "next";

import { PlansWorkspace } from "@/components/plans/plans-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Plans & Usage" };

export default function PlansPage() {
  return (
    <>
      <PageHeader
        title="Plans & Usage"
        description="Manage your Growth plan, credit balances, billing history and upgrades — no live payment providers."
      />
      <PlansWorkspace />
    </>
  );
}
