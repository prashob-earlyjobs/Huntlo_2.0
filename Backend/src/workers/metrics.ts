export type WorkerMetricsSnapshot = {
  workerId: string;
  startedAt: string;
  uptimeMs: number;
  jobsLeased: number;
  jobsCompleted: number;
  jobsFailed: number;
  jobsRetried: number;
  jobsCancelledSkipped: number;
  activeJobs: number;
  lastPollAt: string | null;
  lastError: string | null;
};

export class WorkerMetrics {
  readonly workerId: string;
  readonly startedAt = new Date();
  jobsLeased = 0;
  jobsCompleted = 0;
  jobsFailed = 0;
  jobsRetried = 0;
  jobsCancelledSkipped = 0;
  activeJobs = 0;
  lastPollAt: Date | null = null;
  lastError: string | null = null;

  constructor(workerId: string) {
    this.workerId = workerId;
  }

  snapshot(): WorkerMetricsSnapshot {
    return {
      workerId: this.workerId,
      startedAt: this.startedAt.toISOString(),
      uptimeMs: Date.now() - this.startedAt.getTime(),
      jobsLeased: this.jobsLeased,
      jobsCompleted: this.jobsCompleted,
      jobsFailed: this.jobsFailed,
      jobsRetried: this.jobsRetried,
      jobsCancelledSkipped: this.jobsCancelledSkipped,
      activeJobs: this.activeJobs,
      lastPollAt: this.lastPollAt?.toISOString() ?? null,
      lastError: this.lastError,
    };
  }
}
