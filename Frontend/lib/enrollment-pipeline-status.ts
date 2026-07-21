import type { ApiCampaignEnrollment } from "@/lib/api/outreach";

/** Single candidate status for campaign table (replaces reply + qualification columns). */
export type CandidatePipelineStatus =
  | "Awaiting reply"
  | "Interested"
  | "Not interested"
  | "In qualification"
  | "Qualified"
  | "Not qualified"
  | "In screening";

export function deriveCandidatePipelineStatus(
  enrollment: ApiCampaignEnrollment,
  options?: { autoScreening?: boolean }
): CandidatePipelineStatus {
  const qual = enrollment.qualificationState?.status ?? "pending";
  const screening = enrollment.screeningState?.status ?? "not_started";
  const disposition = enrollment.replyState?.disposition?.toLowerCase() ?? null;
  const hasReply = Boolean(enrollment.replyState?.hasReply);

  if (
    enrollment.status === "opted_out" ||
    disposition === "opt_out" ||
    disposition === "not_interested"
  ) {
    return "Not interested";
  }

  if (qual === "rejected") {
    return "Not qualified";
  }

  if (qual === "qualified") {
    const screeningId = enrollment.screeningState?.screeningId;
    const inScreening =
      screening === "scheduled" &&
      (options?.autoScreening || Boolean(screeningId));
    if (inScreening) {
      return "In screening";
    }
    if (screening === "completed") {
      return "Qualified";
    }
    return "Qualified";
  }

  if (qual === "in_progress") {
    return "In qualification";
  }

  if (hasReply) {
    if (disposition === "interested") {
      return qual === "pending" ? "Interested" : "In qualification";
    }
    if (disposition === "not_interested") {
      return "Not interested";
    }
    return "Interested";
  }

  return "Awaiting reply";
}

export function pipelineStatusBadgeClass(status: CandidatePipelineStatus): string {
  switch (status) {
    case "Qualified":
    case "Interested":
      return "bg-success/10 text-success";
    case "Not interested":
    case "Not qualified":
      return "bg-destructive/10 text-destructive";
    case "In qualification":
    case "In screening":
      return "bg-info/10 text-info";
    default:
      return "bg-muted text-muted-foreground";
  }
}
