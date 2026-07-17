import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { BlogArticleModel } from '../src/modules/admin/blog.model.js';
import { PlatformSettingsModel } from '../src/modules/admin/platform-settings.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerUser(
  agent: ReturnType<typeof request.agent>,
  email: string,
  opts?: { platformAdmin?: boolean }
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'Tester',
    organizationName: `Admin Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  const userId = response.body.data.user.id as string;
  if (opts?.platformAdmin) {
    await UserModel.updateOne({ _id: userId }, { $set: { platformAdmin: true } });
  }
  // Re-login so token is fresh (platformAdmin is checked from DB, not JWT)
  const login = await agent.post('/api/v1/auth/login').send({
    email,
    password: 'Password123!',
  });
  expect(login.status).toBe(200);
  return {
    token: login.body.data.accessToken as string,
    userId,
    organizationId: login.body.data.organization.id as string,
    email,
  };
}

describe('Admin console security + APIs', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      BlogArticleModel.deleteMany({}),
      PlatformSettingsModel.deleteMany({}),
    ]);
  });

  it('denies normal organization owners from admin endpoints', async () => {
    const owner = await registerUser(agent, `owner-${Date.now()}@huntlo.ai`);

    const denied = await agent
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(denied.status).toBe(403);
    expect(denied.body.error?.message || '').toMatch(/platform admin/i);

    const plansDenied = await agent
      .get('/api/v1/admin/plans')
      .set('Authorization', `Bearer ${owner.token}`);
    expect(plansDenied.status).toBe(403);
  });

  it('allows platform admins and records mutations in the audit log', async () => {
    const admin = await registerUser(agent, `padmin-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });

    const dashboard = await agent
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(dashboard.status).toBe(200);
    expect(dashboard.body.data.metrics.length).toBeGreaterThan(0);

    const users = await agent
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(users.status).toBe(200);
    expect(users.body.data.items.length).toBeGreaterThanOrEqual(1);
    // Emails are masked for PII
    expect(users.body.data.items[0].email).toMatch(/•|@/);

    const target = await registerUser(agent, `member-${Date.now()}@huntlo.ai`);

    const suspended = await agent
      .post(`/api/v1/admin/users/${target.userId}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(suspended.status).toBe(200);
    expect(suspended.body.data.status).toBe('Suspended');

    const audit = await AuditLogModel.findOne({ action: 'admin.user.suspended' });
    expect(audit).toBeTruthy();
    expect(audit!.module).toBe('admin');
    expect(JSON.stringify(audit!.metadata || {})).not.toMatch(/Password123/);

    const activated = await agent
      .post(`/api/v1/admin/users/${target.userId}/activate`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(activated.status).toBe(200);

    const settings = await agent
      .get('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(settings.status).toBe(200);
    expect(settings.body.data.providers.length).toBeGreaterThan(0);
    for (const provider of settings.body.data.providers) {
      expect(provider).toHaveProperty('configured');
      expect(provider).toHaveProperty('status');
      expect(provider).not.toHaveProperty('secretValue');
      expect(provider).not.toHaveProperty('secretsCiphertext');
    }

    const patchSettings = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        providers: [
          {
            provider: 'gemini',
            secretValue: 'sk-test-secret-value-should-never-return',
          },
        ],
      });
    expect(patchSettings.status).toBe(200);
    const gemini = patchSettings.body.data.providers.find(
      (p: { id: string }) => p.id === 'gemini'
    );
    expect(gemini.configured).toBe(true);
    expect(gemini.maskedIdentifier).toBeTruthy();
    expect(JSON.stringify(patchSettings.body)).not.toContain('sk-test-secret-value');

    const settingsAudit = await AuditLogModel.findOne({
      action: 'admin.platform_settings.updated',
    });
    expect(settingsAudit).toBeTruthy();
    expect(JSON.stringify(settingsAudit!.metadata || {})).not.toContain(
      'sk-test-secret-value'
    );

    const blog = await agent
      .post('/api/v1/admin/blog')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        title: 'Launch notes',
        excerpt: 'Shipping admin APIs',
        body: 'Details here',
      });
    expect(blog.status).toBe(201);
    const articleId = blog.body.data.id as string;

    const published = await agent
      .post(`/api/v1/admin/blog/${articleId}/publish`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(published.status).toBe(200);
    expect(published.body.data.status).toBe('published');

    const health = await agent
      .get('/api/v1/admin/provider-health')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(health.status).toBe(200);
  });

  it('supports PLATFORM_ADMIN_EMAILS allowlist without platformAdmin flag', async () => {
    const email = `allowlist-${Date.now()}@huntlo.ai`;
    process.env.PLATFORM_ADMIN_EMAILS = email;
    resetEnvCache();

    const user = await registerUser(agent, email);
    const res = await agent
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${user.token}`);
    expect(res.status).toBe(200);

    delete process.env.PLATFORM_ADMIN_EMAILS;
    resetEnvCache();
  });

  it('enforces explicit admin permissions for sensitive mutations', async () => {
    const admin = await registerUser(agent, `scoped-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });
    await UserModel.updateOne(
      { _id: admin.userId },
      { $set: { adminPermissions: ['admin:dashboard:read', 'admin:users:read'] } }
    );

    const readOk = await agent
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(readOk.status).toBe(200);

    const writeDenied = await agent
      .post(`/api/v1/admin/users/${admin.userId}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(writeDenied.status).toBe(403);
    expect(writeDenied.body.error?.message || '').toMatch(/permission/i);

    const settingsDenied = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ maintenanceMode: true });
    expect(settingsDenied.status).toBe(403);
  });
});
