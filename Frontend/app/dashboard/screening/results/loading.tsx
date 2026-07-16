import { Skeleton } from "@/components/ui/skeleton";

export default function ScreeningResultsLoading() {
  return (
    <div aria-busy className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-14 rounded-xl" />
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}
