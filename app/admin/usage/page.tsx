import type { Metadata } from "next";

import { AdminUsageWorkspace } from "@/components/admin/admin-usage-workspace";

export const metadata: Metadata = { title: "Usage" };

export default function AdminUsagePage() {
  return <AdminUsageWorkspace />;
}
