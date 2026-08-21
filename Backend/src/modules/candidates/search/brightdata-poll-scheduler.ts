import { createChildLogger } from '../../../config/logger.js';
import { SourcingSessionModel } from '../../sourcing/sourcing-session.model.js';

const INTERVAL_MS = 5_000;
/** Wall-clock budget for Bright Data snapshots (filter can take several minutes). */
export const BRIGHTDATA_POLL_DEADLINE_MS = 30 * 60_000;
/** If lastPolledAt is older than this, getProgress may run one safety tick. */
const STALE_HEARTBEAT_MS = 15_000;

const ACTIVE = new Set(['creating', 'pending', 'queued', 'running', 'polling']);

const timers = new Map<string, ReturnType<typeof setTimeout>>();
const startedAt = new Map<string, number>();

function log() {
  return createChildLogger({ component: 'brightdata-poll-scheduler' });
}

export function stopBrightDataPoll(savedSessionId: string): void {
  const timer = timers.get(savedSessionId);
  if (timer) clearTimeout(timer);
  timers.delete(savedSessionId);
  startedAt.delete(savedSessionId);
}

export function isBrightDataPollScheduled(savedSessionId: string): boolean {
  return timers.has(savedSessionId);
}

export function isBrightDataPollHeartbeatStale(
  savedSessionId: string,
  lastPolledAt?: Date | null
): boolean {
  if (!timers.has(savedSessionId)) return true;
  if (!lastPolledAt) return true;
  return Date.now() - lastPolledAt.getTime() > STALE_HEARTBEAT_MS;
}

/**
 * In-API owner for Bright Data progress: self-rescheduling poll until the
 * session is terminal or the wall-clock deadline elapses. Dedupes by session id.
 */
export function scheduleBrightDataPoll(savedSessionId: string): void {
  // Already owned — do not reset the wall-clock deadline.
  if (timers.has(savedSessionId)) return;

  startedAt.set(savedSessionId, Date.now());

  const tick = async (): Promise<void> => {
    const began = startedAt.get(savedSessionId) ?? Date.now();
    const overdue = Date.now() - began >= BRIGHTDATA_POLL_DEADLINE_MS;

    try {
      const { pollSourcingSessionById } = await import('../../sourcing/sourcing.poller.js');
      await pollSourcingSessionById(savedSessionId);
    } catch (error) {
      log().warn(
        { err: error, sourcingSessionId: savedSessionId },
        'Bright Data scheduled poll tick failed'
      );
    }

    const session = await SourcingSessionModel.findById(savedSessionId)
      .select('status searchVendor pollAttemptCount')
      .lean();

    if (!session || !ACTIVE.has(String(session.status))) {
      stopBrightDataPoll(savedSessionId);
      return;
    }

    if (overdue) {
      try {
        const { failBrightDataSessionTimeout } = await import(
          '../../sourcing/sourcing.poller.js'
        );
        await failBrightDataSessionTimeout(savedSessionId);
      } catch (error) {
        log().warn(
          { err: error, sourcingSessionId: savedSessionId },
          'Bright Data deadline fail failed'
        );
      }
      stopBrightDataPoll(savedSessionId);
      return;
    }

    timers.set(
      savedSessionId,
      setTimeout(() => {
        void tick();
      }, INTERVAL_MS)
    );
  };

  // Immediate first tick (apply already created the snapshot).
  timers.set(
    savedSessionId,
    setTimeout(() => {
      void tick();
    }, 0)
  );
}
