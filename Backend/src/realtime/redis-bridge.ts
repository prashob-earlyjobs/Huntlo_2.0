import { Redis } from 'ioredis';

import { getLogger } from '../config/logger.js';
import { getRedisUrl } from '../bull-outreach/redis.js';
import { setRealtimeBroadcaster, type RealtimeBroadcaster, type RealtimeTarget } from './events.js';

const CHANNEL = 'huntlo:realtime';

type BridgePayload = {
  event: string;
  data: unknown;
  target?: RealtimeTarget;
};

let publisher: Redis | null = null;
let subscriber: Redis | null = null;

function getPublisher(): Redis | null {
  const url = getRedisUrl();
  if (!url) return null;
  if (!publisher) {
    publisher = new Redis(url, { maxRetriesPerRequest: null });
  }
  return publisher;
}

export function publishRealtimeBridge(payload: BridgePayload): void {
  const pub = getPublisher();
  if (!pub) return;
  void pub.publish(CHANNEL, JSON.stringify(payload)).catch((error: unknown) => {
    getLogger()
      .child({ component: 'realtime-redis' })
      .warn({ err: error }, 'Failed to publish realtime event');
  });
}

/** Worker: forward emitRealtime → Redis (API forwards to WebSockets). */
export function attachWorkerRealtimeBridge(): void {
  setRealtimeBroadcaster((event, data, target) => {
    publishRealtimeBridge({ event, data, target });
  });
}

/** API: listen for worker events and push to connected browsers. */
export function startApiRealtimeRedisSubscriber(forward: RealtimeBroadcaster): void {
  const url = getRedisUrl();
  if (!url) return;
  if (subscriber) return;

  const logger = getLogger().child({ component: 'realtime-redis' });
  subscriber = new Redis(url, { maxRetriesPerRequest: null });
  void subscriber.subscribe(CHANNEL).catch((error: unknown) => {
    logger.warn({ err: error }, 'Realtime Redis subscribe failed');
  });

  subscriber.on('message', (_channel: string, raw: string) => {
    try {
      const payload = JSON.parse(String(raw)) as BridgePayload;
      if (!payload?.event) return;
      forward(payload.event, payload.data, payload.target);
    } catch {
      // ignore bad payloads
    }
  });

  logger.info('Realtime Redis subscriber started');
}

export async function stopRealtimeRedisBridge(): Promise<void> {
  if (subscriber) {
    await subscriber.quit().catch(() => undefined);
    subscriber = null;
  }
  if (publisher) {
    await publisher.quit().catch(() => undefined);
    publisher = null;
  }
}
