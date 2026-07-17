import { createHash } from 'node:crypto';

import mongoose from 'mongoose';

const SENSITIVE_METADATA_KEYS = new Set([
  'password',
  'currentpassword',
  'newpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'apikey',
  'email',
  'phone',
  'mobile',
  'body',
  'bodytext',
  'bodyhtml',
  'message',
  'messagetext',
  'content',
]);

function sanitizeMetadataValue(value: unknown, depth = 0): unknown {
  if (depth > 4) return undefined;
  if (value == null) return value;
  if (typeof value === 'string') {
    return value.length > 200 ? `${value.slice(0, 200)}…` : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeMetadataValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (
        SENSITIVE_METADATA_KEYS.has(lower) ||
        lower.includes('password') ||
        lower.includes('token')
      ) {
        continue;
      }
      const next = sanitizeMetadataValue(child, depth + 1);
      if (next !== undefined) out[key] = next;
    }
    return out;
  }
  return undefined;
}

/** Strip passwords, tokens, contact values, and message bodies from audit metadata. */
export function sanitizeAuditMetadata(
  metadata?: Record<string, unknown> | null
): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') return {};
  return (sanitizeMetadataValue(metadata) as Record<string, unknown>) || {};
}

const auditLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, default: 'auth', index: true },
    relatedEntityType: { type: String, default: null, maxlength: 80 },
    relatedEntityId: { type: String, default: null, maxlength: 80 },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 300 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, module: 1, createdAt: -1 });

export type AuditLogDocument = mongoose.InferSchemaType<typeof auditLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const AuditLogModel = (mongoose.models.AuditLog ??
  mongoose.model('AuditLog', auditLogSchema)) as mongoose.Model<AuditLogDocument>;

export type AuditEventInput = {
  action: string;
  module?: string;
  userId?: mongoose.Types.ObjectId | string | null;
  organizationId?: mongoose.Types.ObjectId | string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(input: AuditEventInput): Promise<void> {
  await AuditLogModel.create({
    action: input.action,
    module: input.module ?? 'auth',
    userId: input.userId ?? null,
    organizationId: input.organizationId ?? null,
    relatedEntityType: input.relatedEntityType ?? null,
    relatedEntityId: input.relatedEntityId ?? null,
    ipHash: input.ipHash ?? null,
    userAgent: input.userAgent ? String(input.userAgent).slice(0, 300) : null,
    metadata: sanitizeAuditMetadata(input.metadata),
  });
}

/** Short fingerprint for UI display — never the raw IP. */
export function fingerprintIpHash(ipHash: string | null | undefined): string {
  if (!ipHash) return '—';
  return createHash('sha256').update(ipHash).digest('hex').slice(0, 12);
}
