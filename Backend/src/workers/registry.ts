import { BACKGROUND_JOB_TYPES, type BackgroundJobType } from './job.model.js';

export type JobHandlerContext = {
  jobId: string;
  type: BackgroundJobType;
  organizationId: string | null;
  entityType: string | null;
  entityId: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  leaseOwner: string;
  signal: AbortSignal;
};

export type JobHandlerResult = {
  result?: Record<string, unknown>;
  /** When set, schedule another run (used by recurring sweeps). */
  rescheduleInMs?: number;
  reschedulePayload?: Record<string, unknown>;
};

export type JobHandler = (ctx: JobHandlerContext) => Promise<JobHandlerResult | void>;

const handlers = new Map<BackgroundJobType, JobHandler>();

export function registerJobHandler(type: BackgroundJobType, handler: JobHandler): void {
  if (!BACKGROUND_JOB_TYPES.includes(type)) {
    throw new Error(`Unknown job type: ${type}`);
  }
  handlers.set(type, handler);
}

export function getJobHandler(type: BackgroundJobType): JobHandler | undefined {
  return handlers.get(type);
}

export function listRegisteredJobTypes(): BackgroundJobType[] {
  return [...handlers.keys()];
}

export function clearJobHandlers(): void {
  handlers.clear();
}
