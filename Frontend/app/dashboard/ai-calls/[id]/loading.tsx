import { Skeleton } from "@/components/ui/skeleton";

export default function AiCallAgentLoading() {
  return (
    <div aria-busy className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="size-9 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem]">
        <Skeleton className="h-[32rem] rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}
