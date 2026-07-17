import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Body-only shimmer used while dashboard analytics load. */
export function DashboardBodySkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      aria-label="Loading dashboard"
      className={cn("space-y-4", className)}
    >
      <div className="space-y-2">
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-14 rounded-lg" />
      </div>

      <div className="space-y-2">
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <OverviewMetricCardSkeleton key={index} />
            ))}
          </div>
        </div>
        <Skeleton className="h-3 w-64 max-w-full" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>

      <div className="grid gap-6 border-t border-border pt-4 lg:grid-cols-12">
        <Skeleton className="h-36 rounded-lg lg:col-span-7" />
        <Skeleton className="h-36 rounded-lg lg:col-span-5" />
      </div>
    </div>
  );
}

/** Route-level loading placeholder mirroring the dashboard layout. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-label="Loading dashboard">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>
      <DashboardBodySkeleton />
    </div>
  );
}
