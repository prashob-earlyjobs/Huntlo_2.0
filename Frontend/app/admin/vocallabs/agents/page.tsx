import type { Metadata } from "next";

import { AdminVocallabsAgents } from "@/components/admin/admin-vocallabs-agents";

export const metadata: Metadata = { title: "Agents" };

export default function AdminVocallabsAgentsPage() {
  return <AdminVocallabsAgents />;
}
