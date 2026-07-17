import type { Request } from 'express';

import { hashIp } from '../../shared/auth/crypto.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import { getClientIp } from '../auth/auth.types.js';

/** Record every admin mutation with sanitized metadata. */
export async function recordAdminMutation(
  req: Request,
  input: {
    action: string;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await recordAuditEvent({
    action: input.action,
    module: 'admin',
    userId: req.auth?.sub ?? null,
    organizationId: null,
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    ipHash: hashIp(getClientIp(req)),
    userAgent: req.headers['user-agent'] ?? null,
    metadata: {
      ...(input.metadata || {}),
      adminEmail: undefined,
    },
  });
}
