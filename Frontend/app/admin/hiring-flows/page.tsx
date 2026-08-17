import type { Metadata } from "next";

import { AdminHiringFlowsWorkspace } from "@/components/admin/admin-hiring-flows-workspace";

export const metadata: Metadata = { title: "Hiring flows" };

export default function AdminHiringFlowsPage() {
  return <AdminHiringFlowsWorkspace />;
}
