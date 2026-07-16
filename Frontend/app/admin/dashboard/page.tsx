import type { Metadata } from "next";

import { AdminDashboardWorkspace } from "@/components/admin/admin-dashboard-workspace";

export const metadata: Metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return <AdminDashboardWorkspace />;
}
