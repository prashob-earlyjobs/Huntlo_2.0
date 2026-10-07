import type { Metadata } from "next";

import { AdminVoiceDemoLeadsWorkspace } from "@/components/admin/admin-voice-demo-leads-workspace";

export const metadata: Metadata = { title: "AI Voice Demo" };

export default function AdminVoiceDemoLeadsPage() {
  return <AdminVoiceDemoLeadsWorkspace />;
}
