import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import {
  UserIntegrationModel,
} from '../src/modules/integrations/user-integration.model.js';
import { OAuthStateModel } from '../src/modules/integrations/oauth-state.model.js';
import { decryptSecret } from '../src/modules/integrations/credentials.js';
import { AuditLogModel } from '../src/shared/audit/audit.service.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({
      verify: async () => true,
      close: () => undefined,
    }),
  },
}));

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `int-${Date.now()}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Int',
    lastName: 'Tester',
    organizationName: `Int Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Integrations API', () => {
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
      AuditLogModel.deleteMany({}),
      OAuthStateModel.deleteMany({}),
      UserIntegrationModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      UserModel.deleteMany({}),
    ]);
  });

  it('lists catalog without leaking secrets', async () => {
    const auth = await registerAndAuth(agent);
    const res = await agent
      .get('/api/v1/integrations')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.catalog.length).toBeGreaterThanOrEqual(10);
    expect(res.body.data.integrations).toEqual([]);
    const raw = JSON.stringify(res.body);
    expect(raw).not.toMatch(/"accessToken"|"refreshToken"|"encryptedAccessToken"|"encryptedRefreshToken"/);
  });

  it('connects SMTP with encrypted credentials and never returns tokens', async () => {
    const auth = await registerAndAuth(agent);
    const connect = await agent
      .post('/api/v1/integrations/smtp/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        fromEmail: 'noreply@example.com',
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        security: 'tls',
        username: 'noreply@example.com',
        password: 'super-secret-smtp-password',
        displayName: 'Recruiting',
      });
    expect(connect.status).toBe(200);
    expect(connect.body.data.mode).toBe('connected');
    expect(connect.body.data.integration.email).toBe('noreply@example.com');
    expect(connect.body.data.integration.isDefault).toBe(true);
    const leaked = JSON.stringify(connect.body);
    expect(leaked).not.toContain('super-secret-smtp-password');
    expect(leaked).not.toMatch(/"accessToken"|"refreshToken"/);

    const stored = await UserIntegrationModel.findById(connect.body.data.integration.id);
    expect(stored).toBeTruthy();
    expect(stored!.encryptedRefreshToken).toBeTruthy();
    expect(decryptSecret(stored!.encryptedRefreshToken)).toBe('super-secret-smtp-password');
    expect(stored!.status).toBe('connected');

    const get = await agent
      .get(`/api/v1/integrations/${connect.body.data.integration.id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(get.status).toBe(200);
    expect(JSON.stringify(get.body)).not.toContain('super-secret-smtp-password');
  });

  it('starts Outlook OAuth with state + PKCE and validates callback ownership', async () => {
    process.env.MICROSOFT_CLIENT_ID = 'test-ms-client';
    process.env.MICROSOFT_CLIENT_SECRET = 'test-ms-secret';

    const auth = await registerAndAuth(agent);
    const start = await agent
      .post('/api/v1/integrations/outlook/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(start.status).toBe(200);
    expect(start.body.data.mode).toBe('oauth_redirect');
    expect(start.body.data.authorizeUrl).toContain('login.microsoftonline.com');
    expect(start.body.data.authorizeUrl).toContain('code_challenge');
    expect(start.body.data.state).toBeTruthy();

    const stateDoc = await OAuthStateModel.findOne({ state: start.body.data.state });
    expect(stateDoc).toBeTruthy();
    expect(stateDoc!.codeVerifier).toBeTruthy();
    expect(String(stateDoc!.userId)).toBe(auth.userId);

    const bad = await agent
      .get('/api/v1/integrations/outlook/callback')
      .query({ code: 'x', state: 'bogus' })
      .set('Authorization', `Bearer ${auth.token}`);
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe('OAUTH_STATE_INVALID');
  });

  it('sets default and disconnects without exposing secrets', async () => {
    const auth = await registerAndAuth(agent);

    const first = await agent
      .post('/api/v1/integrations/smtp/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        fromEmail: 'a@example.com',
        smtpHost: 'smtp.example.com',
        username: 'a@example.com',
        password: 'secret-a',
      });
    expect(first.status).toBe(200);

    const second = await agent
      .post('/api/v1/integrations/future-jobs/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(second.status).toBe(200);
    expect(second.body.data.integration.provider).toBe('future-jobs');

    const smtpId = first.body.data.integration.id as string;
    const def = await agent
      .post(`/api/v1/integrations/${smtpId}/default`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(def.status).toBe(200);
    expect(def.body.data.isDefault).toBe(true);

    const del = await agent
      .delete(`/api/v1/integrations/${smtpId}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(del.status).toBe(200);

    const stored = await UserIntegrationModel.findById(smtpId);
    expect(stored!.status).toBe('disconnected');
    expect(stored!.encryptedAccessToken).toBeNull();
    expect(stored!.encryptedRefreshToken).toBeNull();
  });

  it('rejects unknown provider', async () => {
    const auth = await registerAndAuth(agent);
    const res = await agent
      .post('/api/v1/integrations/not-a-provider/connect')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({});
    expect(res.status).toBe(400);
  });
});
