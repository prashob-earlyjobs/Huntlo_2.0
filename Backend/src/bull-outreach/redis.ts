export function getRedisUrl(): string {
  return String(process.env.REDIS_URL || 'redis://127.0.0.1:6379').trim();
}

/** Fresh connection options for each BullMQ Queue/Worker (do not share one client). */
export function getBullConnection() {
  return {
    url: getRedisUrl(),
    maxRetriesPerRequest: null as null,
  };
}
