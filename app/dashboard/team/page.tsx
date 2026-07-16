import type { Metadata } from "next";

import { TeamWorkspace } from "@/components/team/team-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        description="Manage members, roles, permissions and organisation settings for Acme Talent Partners. No authentication or real permissions are enforced."
      />
      <TeamWorkspace />
    </>
  );
}
