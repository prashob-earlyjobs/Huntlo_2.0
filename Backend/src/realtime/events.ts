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
