import { createHash } from 'node:crypto';

import { Router } from 'express';

import { consumeRateLimit } from '../../middleware/rate-limit.js';
import { getRequestId } from '../../middleware/request-id.js';
import { getClientIp } from '../auth/auth.types.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { submitContactEnquiry } from './contact-enquiry.service.js';
import { submitContactEnquirySchema } from './contact-enquiry.validation.js';

export const contactEnquiryRouter = Router();

function hashIp(ip: string): string {
  return createHash('sha256').update(ip.trim()).digest('hex').slice(0, 32);
}

function enforceRateLimits(ip: string, email: string): void {
  const ipLimit = consumeRateLimit(`contact-enquiry:ip:${ip}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    throw new AppError(
      429,
      'RATE_LIMITED',
      'Too many enquiries from this network. Please try again later.',
      { details: [{ message: `Retry after ${ipLimit.retryAfterSeconds}s` }] }
    );
  }

  const emailKey = email.trim().toLowerCase();
  const emailLimit = consumeRateLimit(`contact-enquiry:email:${emailKey}`, 3, 60 * 60 * 1000);
  if (!emailLimit.allowed) {
    throw new AppError(
      429,
      'RATE_LIMITED',
      'Too many enquiries for this email. Please try again later.',
      { details: [{ message: `Retry after ${emailLimit.retryAfterSeconds}s` }] }
    );
  }
}

contactEnquiryRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = submitContactEnquirySchema.parse(req.body ?? {});
    const ip = getClientIp(req);
    enforceRateLimits(ip, body.workEmail);

    const result = await submitContactEnquiry(body, { ipHash: hashIp(ip) });

    // Honeypot: acknowledge without confirming a stored enquiry id.
    if ('honeypot' in result) {
      successResponse(
        res,
        { received: true },
        { statusCode: 201, meta: { requestId: getRequestId(req) } }
      );
      return;
    }

    successResponse(
      res,
      { id: result.id, received: true as const, duplicate: result.duplicate === true },
      { statusCode: 201, meta: { requestId: getRequestId(req) } }
    );
  })
);
