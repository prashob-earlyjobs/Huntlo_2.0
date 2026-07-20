import { PlansWorkspaceSkeleton } from "@/components/plans/plans-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlansLoading() {
  return (
    <>
      <div className="mb-4 space-y-1">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <PlansWorkspaceSkeleton />
    </>
  );
}
