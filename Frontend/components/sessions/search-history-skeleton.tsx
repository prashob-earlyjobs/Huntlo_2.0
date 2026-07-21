import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function HistoryMetricSkeleton() {
  return (
    <div className="border-b border-border px-4 py-3 last:border-b-0 sm:border-b-0">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-7 w-14" />
    </div>
  );
}

function HistoryRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-44 max-w-[55%]" />
        <Skeleton className="h-3 w-64 max-w-[75%]" />
      </div>
      <Skeleton className="hidden h-4 w-28 md:block" />
      <Skeleton className="hidden h-4 w-10 lg:block" />
      <Skeleton className="hidden h-4 w-10 lg:block" />
      <Skeleton className="hidden h-4 w-16 xl:block" />
      <Skeleton className="hidden h-4 w-20 xl:block" />
      <Skeleton className="h-5 w-16 rounded-md" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function SearchHistoryMetricsSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-busy
      className={cn(
        "grid grid-cols-1 overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border",
        className
      )}
    >
      <HistoryMetricSkeleton />
      <HistoryMetricSkeleton />
      <HistoryMetricSkeleton />
    </div>
  );
}

export function SearchHistoryTableSkeleton({
  rows = 8,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <section
      aria-busy
      aria-label="Loading search history"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="hidden border-b border-border px-4 py-2.5 lg:flex lg:gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <HistoryRowSkeleton key={index} />
      ))}
    </section>
  );
}

/** Full-page skeleton for route `loading.tsx` and client fetch. */
export function SearchHistoryPageSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy
      aria-label="Loading search history"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <SearchHistoryMetricsSkeleton />
      <SearchHistoryTableSkeleton />
    </div>
  );
}
