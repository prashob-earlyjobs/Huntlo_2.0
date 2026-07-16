import type { Metadata } from "next";

import { ModulePage } from "@/components/shared/module-page";
import { MODULE_PAGES } from "@/lib/mock-modules";

export const metadata: Metadata = { title: "Assessments" };

export default function AssessmentsPage() {
  return <ModulePage data={MODULE_PAGES.assessments} />;
}
