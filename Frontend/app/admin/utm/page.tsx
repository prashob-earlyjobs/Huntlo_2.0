import type { Metadata } from "next";

import { AdminUtmWorkspace } from "@/components/admin/admin-utm-workspace";

export const metadata: Metadata = { title: "UTM attribution" };

export default function AdminUtmPage() {
  return <AdminUtmWorkspace />;
}
