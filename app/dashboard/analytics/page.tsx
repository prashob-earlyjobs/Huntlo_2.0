import type { Metadata } from "next";

import { ModulePage } from "@/components/shared/module-page";
import { MODULE_PAGES } from "@/lib/mock-modules";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <ModulePage data={MODULE_PAGES.analytics} />;
}
