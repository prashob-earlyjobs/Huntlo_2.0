import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Shimmer placeholder for screening result detail while data loads. */
export function ResultDetailSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-4", className)}
      aria-busy
      aria-label="Loading screening result"
    >
      <header className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Skeleton className="size-12 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-6 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-72 max-w-full" />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <Skeleton className="h-5 w-28 rounded-md" />
                <Skeleton className="h-5 w-24 rounded-md" />
              </div>
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-lg sm:w-28" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
          <Skeleton className="ml-auto h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>

      <Skeleton className="h-9 w-full max-w-xl" />

      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4"
            >
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
