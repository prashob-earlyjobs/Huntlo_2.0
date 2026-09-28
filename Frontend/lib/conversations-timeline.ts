/**
 * Chronological conversation timeline helpers.
 * Always sort bubbles by absolute sentAt so merge/realtime/hydration cannot reshuffle order.
 */

export type TimelineEventLike = {
  id: string;
  sentAt?: string | null;
};

/** Milliseconds for sorting. Missing/invalid timestamps sort last (end of thread). */
export function conversationEventTimeMs(
  event: Pick<TimelineEventLike, "sentAt">
): number {
  const raw = event.sentAt;
  if (!raw) return Number.POSITIVE_INFINITY;
  const ms = Date.parse(String(raw));
  return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
}

/**
 * Oldest → newest by sentAt. Equal times break ties on id so order stays
 * deterministic across refreshes and channel merges.
 */
export function sortConversationEventsByTime<T extends TimelineEventLike>(
  events: T[]
): T[] {
  return [...events].sort((a, b) => {
    const aAt = conversationEventTimeMs(a);
    const bAt = conversationEventTimeMs(b);
    if (aAt !== bAt) return aAt - bAt;
    return String(a.id).localeCompare(String(b.id));
  });
}
