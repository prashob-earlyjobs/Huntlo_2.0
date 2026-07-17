import { getEnv } from '../config/env.js';

export type WorkerRuntimeConfig = {
  concurrency: number;
  pollIntervalMs: number;
  leaseMs: number;
  heartbeatMs: number;
  shutdownTimeoutMs: number;
  sweepIntervalMs: number;
};

export function getWorkerRuntimeConfig(): WorkerRuntimeConfig {
  const env = getEnv();
  return {
    concurrency: env.WORKER_CONCURRENCY,
    pollIntervalMs: env.WORKER_POLL_INTERVAL_MS,
    leaseMs: env.WORKER_LEASE_MS,
    heartbeatMs: env.WORKER_HEARTBEAT_MS,
    shutdownTimeoutMs: env.WORKER_SHUTDOWN_TIMEOUT_MS,
    sweepIntervalMs: env.WORKER_SWEEP_INTERVAL_MS,
  };
}
