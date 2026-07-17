import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function OutreachMetricsSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      className={cn(
        "overflow-hidden rounded-lg border border-border",
        className
      )}
    >
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <OverviewMetricCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

function CampaignRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-44 max-w-[55%]" />
        <Skeleton className="h-3 w-28 max-w-[40%]" />
      </div>
      <Skeleton className="hidden h-5 w-20 sm:block" />
      <div className="hidden items-center gap-1 md:flex">
        <Skeleton className="size-6 rounded-md" />
        <Skeleton className="size-6 rounded-md" />
      </div>
      <Skeleton className="hidden h-4 w-10 lg:block" />
      <Skeleton className="hidden h-4 w-10 lg:block" />
      <Skeleton className="hidden h-4 w-10 xl:block" />
      <Skeleton className="hidden h-5 w-16 xl:block" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function OutreachWorkspaceSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div aria-busy className={cn("space-y-4", className)}>
      <section className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-40 max-w-[50%]" />
        </div>
        <div className="hidden border-b border-border px-4 py-2 lg:flex lg:gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-3 w-16" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <CampaignRowSkeleton key={index} />
        ))}
      </section>
    </div>
  );
}

export function OutreachPageSkeleton() {
  return (
    <div aria-busy className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <OutreachMetricsSkeleton />
      <OutreachWorkspaceSkeleton />
    </div>
  );
}
