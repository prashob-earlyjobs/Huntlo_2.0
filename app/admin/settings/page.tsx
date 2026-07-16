import type { Metadata } from "next";

import { AdminSettingsWorkspace } from "@/components/admin/admin-settings-workspace";

export const metadata: Metadata = { title: "Platform settings" };

export default function AdminSettingsPage() {
  return <AdminSettingsWorkspace />;
}
