import type { ApiCampaignEnrollment } from "@/lib/api/outreach";

/** Single candidate status for campaign table (replaces reply + qualification columns). */
export type CandidatePipelineStatus =
  | "Awaiting reply"
  | "Answered"
  | "Not interested"
  | "In qualification"
  | "Qualified"
  | "Not qualified"
  | "In screening"
  | "Shortlisted"
  | "Rejected";

export function deriveCandidatePipelineStatus(
  enrollment: ApiCampaignEnrollment,
  options?: { autoScreening?: boolean }
): CandidatePipelineStatus {
  const qual = enrollment.qualificationState?.status ?? "pending";
  const screening = enrollment.screeningState?.status ?? "not_started";
  const screeningDecision = enrollment.screeningState?.decision ?? null;
  const disposition = enrollment.replyState?.disposition?.toLowerCase() ?? null;
  const hasReply = Boolean(enrollment.replyState?.hasReply);

  if (
    enrollment.status === "opted_out" ||
    disposition === "opt_out" ||
    (enrollment.status === "stopped" && disposition === "not_interested")
  ) {
    return "Not interested";
  }

  if (qual === "rejected") {
    return "Not qualified";
  }

  if (qual === "qualified") {
    if (screening === "completed") {
      if (screeningDecision === "shortlisted") return "Shortlisted";
      if (screeningDecision === "rejected") return "Rejected";
      return "Qualified";
    }
    const screeningId = enrollment.screeningState?.screeningId;
    const inScreening =
      screening === "scheduled" &&
      (options?.autoScreening || Boolean(screeningId));
    if (inScreening) {
      return "In screening";
    }
    return "Qualified";
  }

  if (qual === "in_progress") {
    return "In qualification";
  }

  if (hasReply) {
    if (disposition === "not_interested") {
      return "Not interested";
    }
    return "Answered";
  }

  return "Awaiting reply";
}

export function pipelineStatusBadgeClass(status: CandidatePipelineStatus): string {
  switch (status) {
    case "Qualified":
    case "Shortlisted":
      return "bg-success/10 text-success";
    case "Not interested":
    case "Not qualified":
    case "Rejected":
      return "bg-destructive/10 text-destructive";
    case "In qualification":
    case "In screening":
    case "Answered":
      return "bg-info/10 text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}
