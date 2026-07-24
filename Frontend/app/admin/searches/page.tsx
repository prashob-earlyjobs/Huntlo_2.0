import type { Metadata } from "next";

import { AdminSearchesWorkspace } from "@/components/admin/admin-searches-workspace";

export const metadata: Metadata = { title: "Searches" };

export default function AdminSearchesPage() {
  return <AdminSearchesWorkspace />;
}
