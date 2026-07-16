import type { Metadata } from "next";

import { AdminCandidatesWorkspace } from "@/components/admin/admin-candidates-workspace";

export const metadata: Metadata = { title: "Candidates" };

export default function AdminCandidatesPage() {
  return <AdminCandidatesWorkspace />;
}
