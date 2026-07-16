import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationsLoading() {
  return (
    <div aria-busy className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-px overflow-hidden rounded-xl border border-border lg:grid-cols-[300px_1fr_300px]">
        <Skeleton className="h-[480px] rounded-none" />
        <Skeleton className="h-[480px] rounded-none max-lg:hidden" />
        <Skeleton className="h-[480px] rounded-none max-lg:hidden" />
      </div>
    </div>
  );
}
