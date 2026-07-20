import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function PlanCardSkeleton() {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4">
      <Skeleton className="mb-2 h-5 w-20 rounded-md" />
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-2 h-3 w-full max-w-[90%]" />
      <Skeleton className="mt-1 h-3 w-3/4 max-w-[70%]" />
      <Skeleton className="mt-4 h-8 w-28" />
      <div className="mt-4 space-y-2.5 border-t border-border pt-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-4 h-8 w-full rounded-lg" />
    </article>
  );
}

function QuotaCardSkeleton() {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-4 w-32" />
      <Skeleton className="mt-1 h-3 w-40 max-w-full" />
      <Skeleton className="mt-4 h-2 w-full rounded-full" />
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </article>
  );
}

export function PlansWorkspaceSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy className={cn("space-y-6", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-36 max-w-full" />
                </div>
              ))}
            </div>
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <QuotaCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-56 max-w-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <PlanCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <div className="space-y-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="hidden h-3.5 w-24 sm:block" />
              <Skeleton className="ml-auto h-3.5 w-16" />
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
