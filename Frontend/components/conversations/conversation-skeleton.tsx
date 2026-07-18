import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function ConversationRowSkeleton() {
  return (
    <div className="flex items-start gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-28 max-w-[55%]" />
          <Skeleton className="ml-auto h-3 w-8" />
        </div>
        <Skeleton className="h-3 w-full max-w-[90%]" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function TimelineEventSkeleton() {
  return (
    <div className="flex gap-3">
      <Skeleton className="mt-1 size-7 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2 rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />
      </div>
    </div>
  );
}

export function ConversationInboxSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-busy
      aria-label="Loading conversations"
      className={cn(
        "grid min-h-0 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_minmax(0,1fr)_300px]",
        className
      )}
    >
      {/* Left — list */}
      <div className="flex min-h-0 flex-col border-b border-border lg:border-r lg:border-b-0">
        <div className="space-y-2 border-b border-border p-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-7 w-16 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-md" />
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-md" />
          </div>
        </div>
        <div className="min-h-0 flex-1 max-lg:max-h-64">
          {Array.from({ length: 7 }).map((_, index) => (
            <ConversationRowSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Center — timeline */}
      <div className="hidden min-h-0 flex-col border-b border-border lg:flex xl:border-r xl:border-b-0">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48 max-w-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <TimelineEventSkeleton key={index} />
          ))}
        </div>
        <div className="space-y-2 border-t border-border p-3">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right — context */}
      <div className="hidden min-h-0 flex-col xl:flex">
        <div className="space-y-3 border-b border-border p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[80%]" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-20" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversationsPageSkeleton() {
  return (
    <>
      <div className="shrink-0 space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <ConversationInboxSkeleton className="min-h-[28rem] flex-1" />
    </>
  );
}
