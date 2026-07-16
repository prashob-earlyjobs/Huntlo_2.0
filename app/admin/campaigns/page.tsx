import type { Metadata } from "next";

import { AdminCampaignsWorkspace } from "@/components/admin/admin-campaigns-workspace";

export const metadata: Metadata = { title: "Campaigns" };

export default function AdminCampaignsPage() {
  return <AdminCampaignsWorkspace />;
}
