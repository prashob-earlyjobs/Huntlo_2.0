import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function SessionResultRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Skeleton className="size-4 shrink-0 rounded-sm" />
      <Skeleton className="size-9 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-44 max-w-[55%]" />
        <Skeleton className="h-3 w-64 max-w-[80%]" />
      </div>
      <Skeleton className="hidden h-5 w-16 sm:block" />
      <Skeleton className="hidden h-5 w-24 md:block" />
      <Skeleton className="hidden h-5 w-20 lg:block" />
      <Skeleton className="hidden h-7 w-16 xl:block" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function SessionResultsTableSkeleton({
  rows = 8,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <section
      aria-busy
      aria-label="Loading candidates"
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
    >
      <div className="hidden border-b border-border px-4 py-2.5 lg:flex lg:gap-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <SessionResultRowSkeleton key={index} />
      ))}
    </section>
  );
}

/** Full-page shimmer for route loading and client fetch before session arrives. */
export function SessionResultsPageSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy
      aria-label="Loading search results"
    >
      <header className="rounded-lg border border-border bg-card px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-72 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
            <div className="flex flex-wrap gap-3 pt-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
          </div>
        </div>
      </header>

      <Skeleton className="h-12 w-full rounded-lg" />

      <section className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </section>

      <SessionResultsTableSkeleton rows={10} />
    </div>
  );
}
