export type RealtimeTarget = {
  organizationId: string;
  userId?: string | null;
};

export type RealtimeBroadcaster = (
  event: string,
  data: unknown,
  target?: RealtimeTarget
) => void;

let broadcaster: RealtimeBroadcaster | null = null;

export function setRealtimeBroadcaster(fn: RealtimeBroadcaster | null): void {
  broadcaster = fn;
}

export function emitRealtime(
  event: string,
  data: unknown,
  target?: RealtimeTarget
): void {
  if (!broadcaster) return;
  try {
    broadcaster(event, data, target);
  } catch {
    // Never let realtime fan-out break request/worker paths.
  }
}

function orgTarget(
  organizationId: string,
  userId?: string | null
): RealtimeTarget {
  return { organizationId, userId: userId ?? null };
}

export type SourcingProgressPayload = {
  sessionId: string;
  organizationId: string;
  status: string;
  progress: number;
  totalResults: number;
  estimatedResults: number;
  newCandidateCount?: number;
  userId?: string;
};

export type CandidateSearchPollPayload = {
  organizationId: string;
  userId?: string | null;
  sessionId: string;
  savedSessionId: string;
  status: string;
  polling: boolean;
  candidates?: unknown[];
  newCandidates?: unknown[];
  newCandidateCount: number;
  totalDocs: number;
  canFetchMore: boolean;
  profilesPagination?: unknown;
  regionExpandFallbackUsed?: boolean;
  error?: string | null;
};

/** Full candidate-search poll event for annotate→apply→WS flow. */
export function emitCandidateSearchPoll(payload: CandidateSearchPollPayload): void {
  const event = {
    type: 'candidates.search.poll' as const,
    sessionId: payload.sessionId,
    savedSessionId: payload.savedSessionId,
    status: payload.status,
    polling: payload.polling,
    candidates: payload.candidates ?? [],
    newCandidates: payload.newCandidates ?? [],
    newCandidateCount: payload.newCandidateCount,
    totalDocs: payload.totalDocs,
    canFetchMore: payload.canFetchMore,
    profilesPagination: payload.profilesPagination ?? {},
    regionExpandFallbackUsed: Boolean(payload.regionExpandFallbackUsed),
    error: payload.error ?? null,
    timestamp: new Date().toISOString(),
  };

  emitRealtime(
    'candidates.search.poll',
    event,
    orgTarget(payload.organizationId, payload.userId)
  );

  if (
    payload.status === 'completed' ||
    payload.status === 'partial' ||
    payload.status === 'failed' ||
    payload.status === 'cancelled'
  ) {
    emitRealtime(
      'candidates.search.completed',
      event,
      orgTarget(payload.organizationId, payload.userId)
    );
  }
}

/** Event name for AI search progress: `candidates.search.poll` (legacy progress shape). */
export function emitSourcingProgress(payload: SourcingProgressPayload): void {
  emitRealtime(
    'candidates.search.poll',
    {
      type: 'candidates.search.poll',
      sessionId: payload.sessionId,
      savedSessionId: payload.sessionId,
      status: payload.status,
      polling: !['completed', 'partial', 'failed', 'cancelled'].includes(payload.status),
      progress: payload.progress,
      totalResults: payload.totalResults,
      estimatedResults: payload.estimatedResults,
      newCandidateCount: payload.newCandidateCount ?? 0,
      totalDocs: payload.totalResults,
      canFetchMore: false,
      candidates: [],
      newCandidates: [],
      profilesPagination: {},
      regionExpandFallbackUsed: false,
      error: null,
      timestamp: new Date().toISOString(),
    },
    orgTarget(payload.organizationId, payload.userId)
  );
  if (
    payload.status === 'completed' ||
    payload.status === 'partial' ||
    payload.status === 'failed' ||
    payload.status === 'cancelled'
  ) {
    emitRealtime(
      'candidates.search.completed',
      {
        type: 'candidates.search.poll',
        sessionId: payload.sessionId,
        savedSessionId: payload.sessionId,
        status: payload.status,
        polling: false,
        progress: payload.progress,
        totalResults: payload.totalResults,
        estimatedResults: payload.estimatedResults,
        newCandidateCount: payload.newCandidateCount ?? 0,
        totalDocs: payload.totalResults,
        canFetchMore: false,
        candidates: [],
        newCandidates: [],
        profilesPagination: {},
        regionExpandFallbackUsed: false,
        error: null,
        timestamp: new Date().toISOString(),
      },
      orgTarget(payload.organizationId, payload.userId)
    );
  }
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
  userId?: string;
};

/** Event name for bulk contact reveal progress: `candidates.reveal.bulk` */
export function emitBulkRevealProgress(payload: BulkRevealProgressPayload): void {
  emitRealtime(
    'candidates.reveal.bulk',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type ConversationMessageCreatedPayload = {
  organizationId: string;
  threadId: string;
  messageId: string;
  campaignId: string | null;
  candidateId: string;
  direction: string;
  channel: string;
  userId?: string;
};

export function emitConversationMessageCreated(
  payload: ConversationMessageCreatedPayload
): void {
  emitRealtime(
    'conversation.message.created',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type CampaignThreadUpdatedPayload = {
  organizationId: string;
  campaignId: string | null;
  threadId: string;
  status: string;
  unreadCount: number;
  qualificationStatus: string;
  userId?: string;
};

export function emitCampaignThreadUpdated(payload: CampaignThreadUpdatedPayload): void {
  emitRealtime(
    'campaign.thread.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type ConversationQualificationUpdatedPayload = {
  organizationId: string;
  threadId: string;
  qualificationStatus: string;
  interest?: string | null;
  source: 'ai' | 'recruiter';
  userId?: string;
};

export function emitConversationQualificationUpdated(
  payload: ConversationQualificationUpdatedPayload
): void {
  emitRealtime(
    'conversation.qualification.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
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
  userId?: string;
};

export function emitScreeningResultUpdated(payload: ScreeningResultUpdatedPayload): void {
  emitRealtime(
    'screening.result.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type CampaignUpdatedPayload = {
  organizationId: string;
  campaignId: string;
  status: string;
  stats?: Record<string, unknown>;
  userId?: string;
};

export function emitCampaignUpdated(payload: CampaignUpdatedPayload): void {
  emitRealtime(
    'campaign.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type InterviewUpdatedPayload = {
  organizationId: string;
  interviewId: string;
  status: string;
  candidateId?: string | null;
  jobId?: string | null;
  startAt?: string | null;
  userId?: string;
};

export function emitInterviewUpdated(payload: InterviewUpdatedPayload): void {
  emitRealtime(
    'interview.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type UsageUpdatedPayload = {
  organizationId: string;
  metric?: string;
  used?: number;
  limit?: number;
  remaining?: number;
  userId?: string;
};

export function emitUsageUpdated(payload: UsageUpdatedPayload): void {
  emitRealtime(
    'usage.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type IntegrationUpdatedPayload = {
  organizationId: string;
  integrationId: string;
  provider: string;
  status: string;
  userId?: string;
};

export function emitIntegrationUpdated(payload: IntegrationUpdatedPayload): void {
  emitRealtime(
    'integration.updated',
    payload,
    orgTarget(payload.organizationId, payload.userId)
  );
}

export type NotificationCreatedPayload = {
  organizationId: string;
  userId: string;
  notification: unknown;
};

export function emitNotificationCreated(payload: NotificationCreatedPayload): void {
  emitRealtime('notification.created', payload, {
    organizationId: payload.organizationId,
    userId: payload.userId,
  });
}
