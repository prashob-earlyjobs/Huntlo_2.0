import type { Metadata } from "next";

import { ProfileWorkspace } from "@/components/profile/profile-workspace";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your personal details, security, notifications and appearance."
      />
      <ProfileWorkspace />
    </>
  );
}
