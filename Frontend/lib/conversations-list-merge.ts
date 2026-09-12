import type {
  CandidatePipelineStatus,
  Conversation,
  ReplyStatus,
} from "@/lib/mock-conversations";

function sameChannels(
  left: Conversation["channels"] | undefined,
  right: Conversation["channels"] | undefined
) {
  const a = left ?? [];
  const b = right ?? [];
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/** Fields that affect the inbox list row UI. */
export function conversationListRowEqual(a: Conversation, b: Conversation): boolean {
  return (
    a.id === b.id &&
    a.lastMessage === b.lastMessage &&
    a.lastTime === b.lastTime &&
    a.unread === b.unread &&
    (a.unreadCount ?? 0) === (b.unreadCount ?? 0) &&
    a.replyStatus === b.replyStatus &&
    a.pipelineStatus === b.pipelineStatus &&
    a.qualification === b.qualification &&
    a.qualificationStatus === b.qualificationStatus &&
    a.overallAIDescription === b.overallAIDescription &&
    a.candidateName === b.candidateName &&
    a.campaignName === b.campaignName &&
    a.campaignType === b.campaignType &&
    a.sequenceStep === b.sequenceStep &&
    a.nextAction === b.nextAction &&
    a.status === b.status &&
    a.email === b.email &&
    a.phone === b.phone &&
    sameChannels(a.channels, b.channels)
  );
}

/**
 * Replace list from a silent realtime refetch while keeping object identity
 * for rows whose visible fields did not change (avoids full-list flash).
 */
export function mergeConversationListPreserve(
  existing: Conversation[],
  incoming: Conversation[]
): Conversation[] {
  if (existing.length === 0) return incoming;
  const prevById = new Map(existing.map((row) => [row.id, row]));
  let changed = existing.length !== incoming.length;
  const next = incoming.map((row, index) => {
    const prior = prevById.get(row.id);
    if (prior && conversationListRowEqual(prior, row)) {
      if (existing[index] !== prior) changed = true;
      // Keep richer in-memory events if the list payload is empty/shorter.
      if (
        prior.events?.length &&
        (row.events?.length ?? 0) < prior.events.length
      ) {
        return prior;
      }
      return prior;
    }
    changed = true;
    if (
      prior?.events?.length &&
      (row.events?.length ?? 0) < prior.events.length
    ) {
      return { ...row, events: prior.events };
    }
    return row;
  });
  if (!changed && next.every((row, index) => row === existing[index])) {
    return existing;
  }
  return next;
}

function normalizeHcgAiStatusKey(value: string | null | undefined): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function statusFromHcgOverallAi(value: string | null | undefined): {
  replyStatus: ReplyStatus;
  pipelineStatus: CandidatePipelineStatus;
} | null {
  const key = normalizeHcgAiStatusKey(value);
  if (!key) return null;
  const map: Record<
    string,
    { replyStatus: ReplyStatus; pipelineStatus: CandidatePipelineStatus }
  > = {
    awaiting_reply: {
      replyStatus: "Awaiting reply",
      pipelineStatus: "Awaiting reply",
    },
    interested: { replyStatus: "Interested", pipelineStatus: "Answered" },
    not_interested: {
      replyStatus: "Not interested",
      pipelineStatus: "Not interested",
    },
    in_qualification: {
      replyStatus: "Replied",
      pipelineStatus: "In qualification",
    },
    qualified: { replyStatus: "Replied", pipelineStatus: "Qualified" },
    not_qualified: { replyStatus: "Replied", pipelineStatus: "Not qualified" },
    in_screening: { replyStatus: "Replied", pipelineStatus: "In screening" },
    shortlisted: { replyStatus: "Replied", pipelineStatus: "Shortlisted" },
    rejected: { replyStatus: "Not interested", pipelineStatus: "Rejected" },
  };
  return map[key] ?? null;
}

export type HcgRealtimePatch = {
  campaignId?: string | null;
  email?: string | null;
  phone?: string | null;
  overallAIStatus?: string | null;
  reasons?: Array<string> | null;
};

export function isHcgStatusOnlyEvent(patch: HcgRealtimePatch): boolean {
  const reasons = (patch.reasons ?? []).map((r) => String(r));
  if (reasons.length === 0) return Boolean(patch.overallAIStatus);
  return reasons.every((r) => r === "status" || r === "questions");
}

/** Patch matching rows in place from an HCG status socket event. */
export function patchConversationsFromHcgStatus(
  existing: Conversation[],
  patch: HcgRealtimePatch
): Conversation[] | null {
  const status = statusFromHcgOverallAi(patch.overallAIStatus);
  if (!status) return null;
  const campaignId = String(patch.campaignId || "").trim();
  if (!campaignId) return null;
  const email = String(patch.email || "")
    .trim()
    .toLowerCase();
  const phone = String(patch.phone || "").trim();

  let changed = false;
  const next = existing.map((row) => {
    if (String(row.campaignId) !== campaignId) return row;
    if (email && String(row.email || "").trim().toLowerCase() !== email) {
      return row;
    }
    if (phone && String(row.phone || "").replace(/\D/g, "") !== phone.replace(/\D/g, "")) {
      return row;
    }
    // Without email/phone, refuse to patch all campaign rows.
    if (!email && !phone) return row;
    if (
      row.pipelineStatus === status.pipelineStatus &&
      row.replyStatus === status.replyStatus
    ) {
      return row;
    }
    changed = true;
    return {
      ...row,
      pipelineStatus: status.pipelineStatus,
      replyStatus: status.replyStatus,
    };
  });
  return changed ? next : existing;
}
