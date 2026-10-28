import type { Metadata } from "next";

import { AiCallCampaignsPage } from "@/components/ai-calls/ai-call-campaigns-page";

export const metadata: Metadata = { title: "Campaigns" };

export default function AiCallCampaignsRoute() {
  return <AiCallCampaignsPage />;
}
