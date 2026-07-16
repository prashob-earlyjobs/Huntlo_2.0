import type { Metadata } from "next";

import { SettingsWorkspace } from "@/components/settings/settings-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace defaults, privacy controls and audit history. No real permissions or deletions are enforced."
      />
      <SettingsWorkspace />
    </>
  );
}
