import mongoose from 'mongoose';
import type { Logger } from 'pino';

const SLOW_QUERY_MS = 250;
let timingInstrumented = false;

type TimedQuery = mongoose.Query<unknown, unknown> & {
  _huntloStartTime?: number;
  op?: string;
  mongooseCollection?: { name?: string };
};

export function instrumentMongooseTiming(logger: Logger): void {
  if (timingInstrumented) return;
  timingInstrumented = true;
  mongoose.plugin(createQueryTimingPlugin(logger));
}

/** Reset instrumentation flag — for tests only. */
export function resetQueryTimingInstrumentation(): void {
  timingInstrumented = false;
}

function createQueryTimingPlugin(logger: Logger) {
  const queryPattern =
    /^(find|findOne|findOneAndUpdate|countDocuments|updateOne|updateMany|deleteOne|deleteMany|aggregate)$/;

  return function queryTimingPlugin(schema: mongoose.Schema): void {
    schema.pre(queryPattern, function assignStartTime(this: TimedQuery) {
      this._huntloStartTime = Date.now();
    });

    schema.post(queryPattern, function logDuration(this: TimedQuery) {
      const startedAt = this._huntloStartTime;
      if (startedAt === undefined) return;

      const durationMs = Date.now() - startedAt;
      const collection =
        this.mongooseCollection?.name ??
        (typeof schema.options.collection === 'string'
          ? schema.options.collection
          : 'unknown');
      const op = this.op ?? 'query';

      const payload = {
        db: {
          collection,
          operation: op,
          durationMs,
        },
      };

      if (durationMs >= SLOW_QUERY_MS) {
        logger.warn(payload, 'Slow MongoDB query');
      } else {
        logger.debug(payload, 'MongoDB query completed');
      }
    });
  };
}
