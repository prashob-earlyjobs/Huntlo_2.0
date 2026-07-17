import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function JobsMetricsSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <OverviewMetricCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function JobRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-48 max-w-[60%]" />
        <Skeleton className="h-3 w-32 max-w-[45%]" />
      </div>
      <Skeleton className="hidden h-5 w-16 sm:block" />
      <Skeleton className="hidden h-4 w-20 md:block" />
      <Skeleton className="hidden h-4 w-16 lg:block" />
      <Skeleton className="hidden h-4 w-12 xl:block" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function JobsWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <section
      aria-busy
      aria-label="Loading jobs"
      className={cn("rounded-lg border border-border bg-card", className)}
    >
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-8 w-full max-w-sm rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      </div>
      <div className="hidden border-b border-border px-4 py-2 lg:flex lg:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <JobRowSkeleton key={index} />
      ))}
    </section>
  );
}

/** Full-page skeleton for route `loading.tsx`. */
export function JobsListSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy
      aria-label="Loading jobs"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <JobsMetricsSkeleton />
      <JobsWorkspaceSkeleton />
    </div>
  );
}

export function JobFormSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)} aria-busy aria-label="Loading job form">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-56 rounded-xl" />
      ))}
    </div>
  );
}

export function JobDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)} aria-busy aria-label="Loading job detail">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-xl" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
