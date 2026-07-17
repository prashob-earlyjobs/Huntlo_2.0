import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CampaignDetailSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-busy
      aria-label="Loading campaign"
      className={cn("space-y-4", className)}
    >
      <Skeleton className="h-8 w-28" />

      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-7 w-56 max-w-full" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-border bg-card p-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-2 h-3 w-64 max-w-full" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40 max-w-[50%]" />
                <Skeleton className="h-3 w-56 max-w-[70%]" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
