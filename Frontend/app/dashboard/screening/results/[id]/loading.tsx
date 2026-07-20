import { ResultDetailSkeleton } from "@/components/screening/result-detail-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScreeningResultDetailLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <ResultDetailSkeleton />
    </div>
  );
}
