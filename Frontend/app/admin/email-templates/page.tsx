import type { Metadata } from "next";

import { AdminEmailTemplatesWorkspace } from "@/components/admin/admin-email-templates-workspace";

export const metadata: Metadata = { title: "Email templates" };

export default function AdminEmailTemplatesPage() {
  return <AdminEmailTemplatesWorkspace />;
}
