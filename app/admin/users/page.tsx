import type { Metadata } from "next";

import { AdminUsersWorkspace } from "@/components/admin/admin-users-workspace";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <AdminUsersWorkspace />;
}
