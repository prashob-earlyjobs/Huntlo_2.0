/**
 * Provision Meetxo / Kaamlelo 7-day trial workspace + 2 users.
 *
 * Usage (from Backend/):
 *   npx tsx scripts/provision-kaamlelo-trial.ts
 *
 * Uses MONGODB_URI from Backend/.env. Creates org, assigns Trial,
 * bumps WhatsApp + AI voice quotas to 100 each.
 */
import { config } from 'dotenv';
config();

import crypto from 'node:crypto';
import dns from 'node:dns';
import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { adminConsoleService } from '../src/modules/admin/admin-console.service.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { plansService } from '../src/modules/plans/plans.service.js';
import { normalizeEmail } from '../src/shared/validation/email.js';
import { quotaService } from '../src/shared/usage/quota.service.js';
import type { UsageMetric } from '../src/shared/usage/metrics.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
} catch {
  // ignore
}

const ORG_NAME = 'Meetxo Office (Kaamlelo)';
const TARGET_WHATSAPP = 100;
const TARGET_VOICE = 100;

const USERS = [
  {
    email: 'lovely@kaamlelo.com',
    firstName: 'Lovely',
    lastName: 'Kaamlelo',
    role: 'owner' as const,
  },
  {
    email: 'shreya@kaamlelo.com',
    firstName: 'Shreya',
    lastName: 'Kaamlelo',
    role: 'admin' as const,
  },
];

function tempPassword(prefix: string): string {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `${prefix}-${suffix}!`;
}

async function setMetricLimit(
  userId: string,
  organizationId: string,
  metric: UsageMetric,
  target: number
) {
  const usage = (await quotaService.getUsage(organizationId, metric)) as {
    limit: number;
  };
  const delta = target - usage.limit;
  if (delta === 0) return usage;
  return adminConsoleService.adjustQuota(userId, {
    metric,
    delta,
    reason: 'Meetxo/Kaamlelo 7-day trial custom quotas (100 WA / 100 voice)',
  });
}

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set (check Backend/.env).');
  process.exit(1);
}

const dbName = process.env.MONGODB_URI.includes('huntlo_2_Prod')
  ? 'PRODUCTION (huntlo_2_Prod)'
  : process.env.MONGODB_URI.includes('huntlo_2_QA')
    ? 'QA'
    : 'other';

console.log(`Target database: ${dbName}`);

await connectDatabase();

try {
  await plansService.ensureDefaultPlans();

  const credentials: Array<{ email: string; password: string; role: string }> = [];
  let owner: Awaited<ReturnType<typeof adminConsoleService.createUser>> | null = null;
  let organizationId: string | null = null;

  for (const spec of USERS) {
    const email = normalizeEmail(spec.email);
    const existing = await UserModel.findOne({ email, deletedAt: null });
    if (existing) {
      console.log(`Already exists: ${email} (${existing._id}) — skipping create`);
      if (spec.role === 'owner') {
        organizationId = existing.organizationId.toHexString();
        owner = await adminConsoleService.getUser(existing._id.toHexString());
      }
      continue;
    }

    const password = tempPassword(spec.firstName);
    if (!organizationId) {
      owner = await adminConsoleService.createUser({
        email,
        password,
        firstName: spec.firstName,
        lastName: spec.lastName,
        organizationName: ORG_NAME,
        role: spec.role,
      });
      organizationId = owner.organization?.id ?? null;
      if (!organizationId) {
        throw new Error('Failed to resolve organization id after owner create');
      }
      credentials.push({ email, password, role: spec.role });
      console.log(`Created owner ${email} in org ${organizationId}`);
    } else {
      const user = await adminConsoleService.createUser({
        email,
        password,
        firstName: spec.firstName,
        lastName: spec.lastName,
        organizationId,
        role: spec.role,
      });
      credentials.push({ email, password, role: spec.role });
      console.log(`Created ${spec.role} ${email} (${user.id})`);
    }
  }

  if (!owner || !organizationId) {
    // Both existed — load owner by email
    const lovely = await UserModel.findOne({
      email: normalizeEmail(USERS[0]!.email),
      deletedAt: null,
    });
    if (!lovely) {
      throw new Error('Could not resolve owner user lovely@kaamlelo.com');
    }
    owner = await adminConsoleService.getUser(lovely._id.toHexString());
    organizationId = lovely.organizationId.toHexString();
  }

  const assigned = await adminConsoleService.assignPlan(owner.id, 'trial');
  console.log(
    `Assigned Trial to org ${organizationId} (plan=${assigned.organization?.plan ?? 'Trial'})`
  );

  await setMetricLimit(owner.id, organizationId, 'whatsapp_outreach', TARGET_WHATSAPP);
  await setMetricLimit(owner.id, organizationId, 'ai_voice_minutes', TARGET_VOICE);
  await setMetricLimit(owner.id, organizationId, 'team_seats', 2);

  const usage = await quotaService.getUsage(organizationId);
  const relevant = (Array.isArray(usage) ? usage : []).filter((u) =>
    ['whatsapp_outreach', 'ai_voice_minutes', 'team_seats'].includes(u.metric)
  );

  console.log('\n=== Credentials (share securely; change on first login) ===');
  for (const c of credentials) {
    console.log(`${c.email}  |  ${c.role}  |  ${c.password}`);
  }
  if (credentials.length === 0) {
    console.log('(no new passwords — users already existed)');
  }
  console.log('\n=== Quotas ===');
  for (const u of relevant) {
    console.log(`${u.metric}: limit=${u.limit} used=${u.used} remaining=${u.remaining}`);
  }
  console.log(`\nOrganization: ${ORG_NAME} (${organizationId})`);
  console.log(`Login: ${process.env.FRONTEND_URL || 'https://app.huntlo.com'}/login`);
} finally {
  await disconnectDatabase();
  await mongoose.disconnect().catch(() => undefined);
}
