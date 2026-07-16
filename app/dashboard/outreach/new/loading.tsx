import { Skeleton } from "@/components/ui/skeleton";

export default function NewCampaignLoading() {
  return (
    <div aria-busy className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  );
}
