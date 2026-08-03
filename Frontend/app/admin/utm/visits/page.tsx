import type { Metadata } from "next";

import { AdminUtmVisitsWorkspace } from "@/components/admin/admin-utm-visits-workspace";

export const metadata: Metadata = { title: "Attributed visits" };

export default function AdminUtmVisitsPage() {
  return <AdminUtmVisitsWorkspace />;
}
