import {
  CANDIDATE_STATUS_TONES,
  type CandidateStatus,
} from "@/lib/mock-candidates";
import {
  STATUS_DOT_CLASSES,
  STATUS_TONE_CLASSES,
} from "@/lib/status-tones";
import { cn } from "@/lib/utils";

export function PipelineStatusBadge({
  status,
  className,
}: {
  status: CandidateStatus;
  className?: string;
}) {
  const tone = CANDIDATE_STATUS_TONES[status];
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
