import Link from "next/link";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function SessionNotFound() {
  return (
    <div className="space-y-4">
      <EmptyState
        icon={Search}
        title="Search session not found"
        description="This search may have been deleted or the link is incorrect."
        actionLabel="Search History"
        actionHref={ROUTES.searchHistory}
      />
      <div className="flex justify-center">
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={ROUTES.search} />}
        >
          New Search
        </Button>
      </div>
    </div>
  );
}
