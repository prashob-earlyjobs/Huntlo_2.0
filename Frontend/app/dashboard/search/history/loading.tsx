import { Skeleton } from "@/components/ui/skeleton";

export default function SearchHistoryLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading search history">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
