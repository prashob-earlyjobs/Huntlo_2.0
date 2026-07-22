import type { Conversation } from "@/lib/mock-conversations";
import {
  deriveCandidatePipelineStatus,
  pipelineStatusBadgeClass,
  type CandidatePipelineStatus,
} from "@/lib/enrollment-pipeline-status";

const QUAL_TO_ENROLLMENT: Record<
  Conversation["qualification"],
  string
> = {
  Pending: "pending",
  "In progress": "in_progress",
  Qualified: "qualified",
  Rejected: "rejected",
};

const REPLY_TO_DISPOSITION: Record<Conversation["replyStatus"], string | null> = {
  "Awaiting reply": null,
  Replied: null,
  Interested: "interested",
  "Not interested": "not_interested",
};

function normalizeScreeningStatus(raw: string): string {
  const v = raw.toLowerCase();
  if (v === "scheduled" || v === "completed" || v === "skipped" || v === "not_started") {
    return v;
  }
  if (v.includes("scheduled")) return "scheduled";
  if (v.includes("completed")) return "completed";
  return "not_started";
}

/** Unified pipeline label — same rules as campaign candidates table. */
export function conversationPipelineStatus(
  conversation: Conversation
): CandidatePipelineStatus {
  if (conversation.pipelineStatus) {
    return conversation.pipelineStatus;
  }

  return deriveCandidatePipelineStatus(
    {
      id: conversation.enrollmentId ?? conversation.id,
      candidateId: conversation.candidateId ?? "",
      name: conversation.candidateName,
      company: null,
      title: null,
      email: null,
      phone: null,
      status: conversation.replyStatus === "Awaiting reply" ? "active" : "replied",
      currentStepIndex: 0,
      contactAvailability: null,
      replyState: {
        hasReply: conversation.replyStatus !== "Awaiting reply",
        disposition: REPLY_TO_DISPOSITION[conversation.replyStatus],
        repliedAt: null,
      },
      qualificationState: {
        status:
          conversation.qualificationStatus ??
          QUAL_TO_ENROLLMENT[conversation.qualification] ??
          "pending",
      },
      screeningState: {
        status: normalizeScreeningStatus(conversation.screeningStatus),
        screeningId: conversation.screeningId ?? null,
      },
      schedulingState: null,
      nextActionAt: null,
      lastActionAt: null,
      stopReason: null,
    },
    { autoScreening: conversation.autoScreening }
  );
}

export { pipelineStatusBadgeClass, type CandidatePipelineStatus };
