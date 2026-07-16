import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { AssessmentsHome } from "@/components/assessments/assessments-home";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Assessments" };

const ASSESSMENT_METRICS = [
  {
    id: "active",
    label: "Active assessments",
    value: "—",
    change: "",
    comparison: "",
    trend: "flat" as const,
    tooltip: "Running campaigns",
  },
  {
    id: "completion",
    label: "Completion rate",
    value: "—",
    change: "",
    comparison: "",
    trend: "flat" as const,
    tooltip: "Completed vs invited",
  },
  {
    id: "avg",
    label: "Avg. score",
    value: "—",
    change: "",
    comparison: "",
    trend: "flat" as const,
    tooltip: "Across completed attempts",
  },
];

export default function AssessmentsPage() {
  return (
    <>
      <PageHeader
        title="Assessments"
        description="Skill assessments, invitations, and scorecards for shortlisted candidates."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.assessments} />}
          >
            <Plus aria-hidden />
            New campaign
          </Button>
        }
      />

      <MetricStrip metrics={ASSESSMENT_METRICS} />

      <AssessmentsHome />
    </>
  );
}
