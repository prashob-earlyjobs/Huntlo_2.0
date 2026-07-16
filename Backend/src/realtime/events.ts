export type RealtimeBroadcaster = (event: string, data: unknown) => void;

let broadcaster: RealtimeBroadcaster | null = null;

export function setRealtimeBroadcaster(fn: RealtimeBroadcaster | null): void {
  broadcaster = fn;
}

export function emitRealtime(event: string, data: unknown): void {
  if (!broadcaster) return;
  try {
    broadcaster(event, data);
  } catch {
    // Never let realtime fan-out break request/worker paths.
  }
}

export type SourcingProgressPayload = {
  sessionId: string;
  organizationId: string;
  status: string;
  progress: number;
  totalResults: number;
  estimatedResults: number;
  newCandidateCount?: number;
};

/** Event name for AI search progress: `candidates.search.poll` */
export function emitSourcingProgress(payload: SourcingProgressPayload): void {
  emitRealtime('candidates.search.poll', payload);
}

export type BulkRevealProgressPayload = {
  jobId: string;
  organizationId: string;
  status: string;
  progress: number;
  counts: {
    success: number;
    cacheHit: number;
    previouslyRevealed: number;
    missing: number;
    failed: number;
    quotaExhausted: number;
  };
};

/** Event name for bulk contact reveal progress: `candidates.reveal.bulk` */
export function emitBulkRevealProgress(payload: BulkRevealProgressPayload): void {
  emitRealtime('candidates.reveal.bulk', payload);
}

export type ConversationMessageCreatedPayload = {
  organizationId: string;
  threadId: string;
  messageId: string;
  campaignId: string | null;
  candidateId: string;
  direction: string;
  channel: string;
};

export function emitConversationMessageCreated(
  payload: ConversationMessageCreatedPayload
): void {
  emitRealtime('conversation.message.created', payload);
}

export type CampaignThreadUpdatedPayload = {
  organizationId: string;
  campaignId: string | null;
  threadId: string;
  status: string;
  unreadCount: number;
  qualificationStatus: string;
};

export function emitCampaignThreadUpdated(payload: CampaignThreadUpdatedPayload): void {
  emitRealtime('campaign.thread.updated', payload);
}

export type ConversationQualificationUpdatedPayload = {
  organizationId: string;
  threadId: string;
  qualificationStatus: string;
  interest?: string | null;
  source: 'ai' | 'recruiter';
};

export function emitConversationQualificationUpdated(
  payload: ConversationQualificationUpdatedPayload
): void {
  emitRealtime('conversation.qualification.updated', payload);
}

export type ScreeningResultUpdatedPayload = {
  organizationId: string;
  screeningId: string;
  resultId: string;
  candidateId: string;
  callStatus: string;
  overallScore: number | null;
  recommendation: string | null;
  recruiterDecision: string;
};

export function emitScreeningResultUpdated(payload: ScreeningResultUpdatedPayload): void {
  emitRealtime('screening.result.updated', payload);
}
