import type { Metadata } from "next";

import { AdminPlansWorkspace } from "@/components/admin/admin-plans-workspace";

export const metadata: Metadata = { title: "Plans" };

export default function AdminPlansPage() {
  return <AdminPlansWorkspace />;
}
