import type { Metadata } from "next";

import { TeamWorkspace } from "@/components/team/team-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Members, roles, and organisation settings."
      />
      <TeamWorkspace />
    </>
  );
}
