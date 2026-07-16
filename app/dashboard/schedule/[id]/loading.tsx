import { Skeleton } from "@/components/ui/skeleton";

export default function InterviewDetailLoading() {
  return (
    <div aria-busy className="space-y-4">
      <Skeleton className="h-8 w-28" />
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex gap-3">
          <Skeleton className="size-12 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-28" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
