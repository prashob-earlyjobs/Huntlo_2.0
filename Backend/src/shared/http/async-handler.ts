import type { RequestHandler } from 'express';

type AsyncRequestHandler = (
  ...args: Parameters<RequestHandler>
) => Promise<void>;

export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
