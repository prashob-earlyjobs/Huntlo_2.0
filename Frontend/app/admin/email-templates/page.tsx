import type { Metadata } from "next";

import { AdminEmailTemplatesWorkspace } from "@/components/admin/admin-email-templates-workspace";

export const metadata: Metadata = { title: "Message templates" };

export default function AdminEmailTemplatesPage() {
  return <AdminEmailTemplatesWorkspace />;
}
