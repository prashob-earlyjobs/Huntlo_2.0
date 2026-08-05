import type { Metadata } from "next";

import { AdminIntegrationsWorkspace } from "@/components/admin/admin-integrations-workspace";

export const metadata: Metadata = { title: "Integrations" };

export default function AdminIntegrationsPage() {
  return <AdminIntegrationsWorkspace />;
}
