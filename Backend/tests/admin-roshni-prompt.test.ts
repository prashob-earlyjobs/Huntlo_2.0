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
import { PlatformSettingsModel } from '../src/modules/admin/platform-settings.model.js';
import {
  getActiveRoshniPromptDefaults,
  getBundledRoshniPromptTemplate,
  invalidateRoshniPromptCache,
  ROSHNI_INTRODUCTION,
} from '../src/modules/voice/roshni-prompt.js';
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

describe('Admin-managed Roshni voice prompts', () => {
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
    invalidateRoshniPromptCache();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
      PlatformSettingsModel.deleteMany({}),
    ]);
  });

  it('falls back to the bundled file when platform settings are empty', async () => {
    const defaults = await getActiveRoshniPromptDefaults();
    expect(defaults.introduction).toBe(ROSHNI_INTRODUCTION);
    expect(defaults.agentPrompt).toContain('You are Roshni');
    expect(defaults.agentPrompt).toBe(getBundledRoshniPromptTemplate());
    expect(defaults.source).toBe('file');
    expect(defaults.version).toBe(0);
  });

  it('requires admin:settings:write and validates placeholders', async () => {
    const owner = await registerUser(agent, `owner-prompt-${Date.now()}@huntlo.ai`);
    const denied = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        roshniPrompt: {
          introduction: 'Hello {callee_name}',
          agentPrompt: getBundledRoshniPromptTemplate(),
        },
      });
    expect(denied.status).toBeGreaterThanOrEqual(400);

    const admin = await registerUser(agent, `padmin-prompt-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });

    const missingPlaceholder = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: 'Hello there',
          agentPrompt: 'You are Roshni without required tokens',
        },
      });
    expect(missingPlaceholder.status).toBe(400);

    const customIntro = 'Hi, am I speaking with {callee_name}?';
    const customAgent = getBundledRoshniPromptTemplate().replace(
      'You are Roshni, a friendly and sharp AI recruiter',
      'You are Roshni, a custom admin-managed AI recruiter'
    );

    const saved = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: customIntro,
          agentPrompt: customAgent,
        },
      });
    expect(saved.status).toBe(200);
    expect(saved.body.data.roshniPrompt.version).toBe(1);
    expect(saved.body.data.roshniPrompt.effectiveIntroduction).toBe(customIntro);
    expect(saved.body.data.roshniPrompt.effectiveAgentPrompt).toContain(
      'custom admin-managed'
    );
    expect(JSON.stringify(saved.body)).not.toMatch(/Password123/);

    const audit = await AuditLogModel.findOne({
      action: 'admin.platform_settings.updated',
    }).sort({ createdAt: -1 });
    expect(audit).toBeTruthy();
    expect(audit!.metadata).toMatchObject({
      roshniPromptUpdated: true,
      roshniPromptVersion: 1,
    });
    expect(JSON.stringify(audit!.metadata || {})).not.toContain(customAgent);
    expect(JSON.stringify(audit!.metadata || {})).not.toContain(customIntro);
  });

  it('serves DB overrides via workspace defaults and invalidates cache on update', async () => {
    const admin = await registerUser(agent, `padmin-cache-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });
    const member = await registerUser(agent, `member-voice-${Date.now()}@huntlo.ai`);

    const before = await agent
      .get('/api/v1/voice/defaults')
      .set('Authorization', `Bearer ${member.token}`);
    expect(before.status).toBe(200);
    expect(before.body.data.source).toBe('file');
    expect(before.body.data.introduction).toBe(ROSHNI_INTRODUCTION);

    // Warm cache
    invalidateRoshniPromptCache();
    const warmed = await getActiveRoshniPromptDefaults();
    expect(warmed.source).toBe('file');

    const customIntro = 'Hello from admin, is this {callee_name}?';
    const customAgent = getBundledRoshniPromptTemplate();

    const patched = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: customIntro,
          agentPrompt: customAgent,
        },
      });
    expect(patched.status).toBe(200);
    expect(patched.body.data.roshniPrompt.version).toBe(1);

    const active = await getActiveRoshniPromptDefaults();
    expect(active.introduction).toBe(customIntro);
    expect(active.introductionSource).toBe('db');
    expect(active.version).toBe(1);

    const after = await agent
      .get('/api/v1/voice/defaults')
      .set('Authorization', `Bearer ${member.token}`);
    expect(after.status).toBe(200);
    expect(after.body.data.introduction).toBe(customIntro);
    expect(after.body.data.version).toBe(1);

    const cleared = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: null,
          agentPrompt: null,
        },
      });
    expect(cleared.status).toBe(200);
    expect(cleared.body.data.roshniPrompt.version).toBe(2);
    expect(cleared.body.data.roshniPrompt.introduction).toBeNull();
    expect(cleared.body.data.roshniPrompt.effectiveIntroduction).toBe(
      ROSHNI_INTRODUCTION
    );

    const reset = await getActiveRoshniPromptDefaults();
    expect(reset.introduction).toBe(ROSHNI_INTRODUCTION);
    expect(reset.source).toBe('file');
    expect(reset.version).toBe(2);
  });

  it('increments version only when prompt fields change', async () => {
    const admin = await registerUser(agent, `padmin-ver-${Date.now()}@huntlo.ai`, {
      platformAdmin: true,
    });
    const customIntro = 'Checking identity for {callee_name}?';

    const first = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: customIntro,
          agentPrompt: getBundledRoshniPromptTemplate(),
        },
      });
    expect(first.status).toBe(200);
    expect(first.body.data.roshniPrompt.version).toBe(1);

    const same = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: customIntro,
          agentPrompt: getBundledRoshniPromptTemplate(),
        },
      });
    expect(same.status).toBe(200);
    expect(same.body.data.roshniPrompt.version).toBe(1);

    const next = await agent
      .patch('/api/v1/admin/platform-settings')
      .set('Authorization', `Bearer ${admin.token}`)
      .send({
        roshniPrompt: {
          introduction: `Updated — ${customIntro}`,
        },
      });
    expect(next.status).toBe(200);
    expect(next.body.data.roshniPrompt.version).toBe(2);
  });
});
