import Link from "next/link";
import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function JobNotFound() {
  return (
    <div className="space-y-4">
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="This hiring requirement may have been archived or the link is incorrect."
        actionLabel="Back to Jobs"
        actionHref={ROUTES.jobs}
      />
      <div className="flex justify-center">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.jobsNew} />}
        >
          Create Job
        </Button>
      </div>
    </div>
  );
}
