import type { Metadata } from "next";

import { ModulePage } from "@/components/shared/module-page";
import { MODULE_PAGES } from "@/lib/mock-modules";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return <ModulePage data={MODULE_PAGES.reports} />;
}
