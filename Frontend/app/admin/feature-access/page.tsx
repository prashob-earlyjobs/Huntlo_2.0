import type { Metadata } from "next";

import { AdminFeatureAccessWorkspace } from "@/components/admin/admin-feature-access-workspace";

export const metadata: Metadata = { title: "Feature access" };

export default function AdminFeatureAccessPage() {
  return <AdminFeatureAccessWorkspace />;
}
