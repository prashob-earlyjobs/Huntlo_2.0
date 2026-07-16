import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function MemberRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-36 max-w-[50%]" />
        <Skeleton className="h-3 w-48 max-w-[70%]" />
      </div>
      <Skeleton className="hidden h-5 w-20 sm:block" />
      <Skeleton className="hidden h-5 w-24 md:block" />
      <Skeleton className="hidden h-5 w-12 lg:block" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function TeamWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy className={cn("space-y-4", className)}>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <OverviewMetricCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <MemberRowSkeleton key={index} />
        ))}
      </section>
    </div>
  );
}
