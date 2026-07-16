import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";
import {
  STATUS_DOT_CLASSES,
  STATUS_TONE_CLASSES,
  type StatusTone,
} from "@/lib/status-tones";

const STATUS_TONES: Record<Status, StatusTone> = {
  Draft: "neutral",
  Active: "success",
  Paused: "warning",
  "On Hold": "warning",
  Closed: "neutral",
  Archived: "neutral",
  Completed: "info",
  Scheduled: "info",
  Running: "brand",
  Failed: "danger",
  Connected: "success",
  Disconnected: "neutral",
  Qualified: "success",
  Interested: "success",
  "Not Interested": "neutral",
  Shortlisted: "brand",
  Rejected: "danger",
  "Awaiting Response": "warning",
  Contacted: "info",
  Screening: "brand",
  "Interview Scheduled": "info",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status;
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
        className={cn("size-1.5 rounded-full", STATUS_DOT_CLASSES[tone])}
      />
      {status}
    </span>
  );
}
