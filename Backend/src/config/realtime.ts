import { getEnv } from './env.js';

export interface RealtimeConfig {
  enabled: boolean;
  wsPath: string;
}

export function getRealtimeConfig(): RealtimeConfig {
  const env = getEnv();
  return {
    enabled: env.REALTIME_ENABLED,
    wsPath: env.REALTIME_WS_PATH.startsWith('/')
      ? env.REALTIME_WS_PATH
      : `/${env.REALTIME_WS_PATH}`,
  };
}
