import { Skeleton } from "@/components/ui/skeleton";

export default function AiCallsLoading() {
  return (
    <div aria-busy className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-8 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
