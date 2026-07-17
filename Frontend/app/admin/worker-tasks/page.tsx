import type { Metadata } from "next";

import { AdminWorkerTasksWorkspace } from "@/components/admin/admin-worker-tasks-workspace";

export const metadata: Metadata = { title: "Worker tasks" };

export default function AdminWorkerTasksPage() {
  return <AdminWorkerTasksWorkspace />;
}
