import { Skeleton } from "@/components/ui/skeleton";

export default function EasyScoutLoading() {
  return (
    <div aria-busy className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-44 rounded-xl" />
    </div>
  );
}
