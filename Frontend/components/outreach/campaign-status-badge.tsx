import type { CampaignStatus } from "@/lib/mock-outreach";
import {
  STATUS_DOT_CLASSES,
  STATUS_TONE_CLASSES,
  type StatusTone,
} from "@/lib/status-tones";
import { cn } from "@/lib/utils";

/** Aligned with shared StatusBadge tones for Running / Completed / Scheduled. */
const STATUS_TONES: Record<CampaignStatus, StatusTone> = {
  Draft: "neutral",
  Scheduled: "info",
  Running: "brand",
  Paused: "warning",
  Completed: "info",
  Cancelled: "neutral",
  Failed: "danger",
};

export function CampaignStatusBadge({
  status,
  className,
}: {
  status: CampaignStatus;
  className?: string;
}) {
  const tone = STATUS_TONES[status];
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium whitespace-nowrap",
        STATUS_TONE_CLASSES[tone],
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          STATUS_DOT_CLASSES[tone],
          status === "Running" && "animate-pulse motion-reduce:animate-none"
        )}
      />
      {status}
    </span>
  );
}
