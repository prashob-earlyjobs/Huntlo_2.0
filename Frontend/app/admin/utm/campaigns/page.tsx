import type { Metadata } from "next";

import { AdminUtmCampaignsWorkspace } from "@/components/admin/admin-utm-campaigns-workspace";

export const metadata: Metadata = { title: "UTM campaigns" };

export default function AdminUtmCampaignsPage() {
  return <AdminUtmCampaignsWorkspace />;
}
