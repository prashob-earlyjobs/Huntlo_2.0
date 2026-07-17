import { OverviewMetricCardSkeleton } from "@/components/dashboard/overview-metric-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PoolRowSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Skeleton className="size-4 shrink-0 rounded-sm" />
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-40 max-w-[55%]" />
        <Skeleton className="h-3 w-56 max-w-[75%]" />
      </div>
      <Skeleton className="hidden h-5 w-24 sm:block" />
      <Skeleton className="hidden h-5 w-20 md:block" />
      <Skeleton className="hidden h-5 w-16 lg:block" />
      <Skeleton className="size-7 shrink-0 rounded-md" />
    </div>
  );
}

export function PoolWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy className={cn("space-y-4", className)}>
      <section className="rounded-xl border border-border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Skeleton className="h-8 min-w-0 flex-1 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-20 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-md" />
          <Skeleton className="h-7 w-24 rounded-md" />
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <PoolRowSkeleton key={index} />
        ))}
      </section>
    </div>
  );
}

export function CandidatesPageSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <OverviewMetricCardSkeleton key={index} />
          ))}
        </div>
      </div>
      <PoolWorkspaceSkeleton />
    </div>
  );
}

export function SavedListsWorkspaceSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-busy
      className={cn("grid gap-4 lg:grid-cols-[260px_1fr]", className)}
    >
      <aside className="h-fit rounded-xl border border-border bg-card p-3">
        <Skeleton className="mb-3 h-8 w-full rounded-lg" />
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`smart-${index}`} className="flex items-center gap-2 px-1 py-2">
              <Skeleton className="size-4 shrink-0 rounded" />
              <Skeleton className="h-3.5 flex-1 rounded" />
              <Skeleton className="h-3 w-5 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 mb-2 h-3 w-24" />
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`list-${index}`} className="flex items-center gap-2 px-1 py-2">
              <Skeleton className="size-4 shrink-0 rounded" />
              <Skeleton className="h-3.5 flex-1 rounded" />
              <Skeleton className="h-3 w-5 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-3 h-8 w-full rounded-lg" />
      </aside>

      <div className="space-y-4">
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-64 max-w-full" />
              <Skeleton className="h-3 w-28" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <PoolRowSkeleton key={index} />
          ))}
        </section>
      </div>
    </div>
  );
}

export function SavedListsPageSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <SavedListsWorkspaceSkeleton />
    </div>
  );
}
