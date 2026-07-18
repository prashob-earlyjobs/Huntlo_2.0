import { cn } from "@/lib/utils";
import type { InterviewStatus } from "@/lib/mock-schedule";
import {
  STATUS_DOT_CLASSES,
  STATUS_TONE_CLASSES,
  type StatusTone,
} from "@/lib/status-tones";

/** Scheduled / Completed aligned with shared StatusBadge (info). */
const STATUS_TONES: Record<InterviewStatus, StatusTone> = {
  Draft: "neutral",
  "Link Sent": "neutral",
  "Awaiting Booking": "warning",
  Scheduled: "info",
  Rescheduled: "info",
  Completed: "info",
  Cancelled: "neutral",
  "No Show": "danger",
  Expired: "danger",
};

export function InterviewStatusBadge({
  status,
  className,
}: {
  status: InterviewStatus;
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
