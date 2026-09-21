import { AsyncLocalStorage } from 'node:async_hooks';

import type { NextFunction, Request, Response } from 'express';

export type FutureJobsActorStore = {
  userId: string | null;
  organizationId: string | null;
  /** Active outbound-debug session id (scout lookup or reveal). */
  outboundDebugId: string | null;
};

const actorStorage = new AsyncLocalStorage<FutureJobsActorStore>();

/** Start an empty actor store for the rest of the HTTP request. */
export function futureJobsActorMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  actorStorage.run(
    { userId: null, organizationId: null, outboundDebugId: null },
    () => next()
  );
}

/** Copy authenticated user/org onto the current ALS store (call after auth). */
export function bindFutureJobsActor(req: Request): void {
  const store = actorStorage.getStore();
  if (!store) return;
  store.userId = req.userId ?? req.auth?.sub ?? null;
  store.organizationId = req.organizationId ?? req.auth?.orgId ?? null;
}

export function setFutureJobsOutboundDebugId(debugId: string | null): void {
  const store = actorStorage.getStore();
  if (!store) return;
  store.outboundDebugId = debugId;
}

/** @deprecated use setFutureJobsOutboundDebugId */
export function setFutureJobsRevealDebugId(debugId: string | null): void {
  setFutureJobsOutboundDebugId(debugId);
}

/** Explicitly set actor for workers / nested calls outside Express. */
export function runWithFutureJobsActor<T>(
  actor: {
    userId?: string | null;
    organizationId?: string | null;
    outboundDebugId?: string | null;
    revealDebugId?: string | null;
  },
  fn: () => T
): T {
  return actorStorage.run(
    {
      userId: actor.userId ?? null,
      organizationId: actor.organizationId ?? null,
      outboundDebugId: actor.outboundDebugId ?? actor.revealDebugId ?? null,
    },
    fn
  );
}

export function getFutureJobsActor(): FutureJobsActorStore & {
  /** Alias for older call sites. */
  revealDebugId: string | null;
} {
  const store = actorStorage.getStore() ?? {
    userId: null,
    organizationId: null,
    outboundDebugId: null,
  };
  return {
    ...store,
    revealDebugId: store.outboundDebugId,
  };
}
