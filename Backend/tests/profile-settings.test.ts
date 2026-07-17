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
import { UserPreferenceModel } from '../src/modules/users/user-preference.model.js';
import { WorkspaceSettingsModel } from '../src/modules/users/workspace-settings.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerOwner(agent: ReturnType<typeof request.agent>) {
  const email = `profile-${Date.now()}@huntlo.ai`;
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Ananya',
    lastName: 'Sharma',
    organizationName: `Profile Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
    email,
  };
}

describe('Profile, preferences, settings, audit logs', () => {
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
      UserPreferenceModel.deleteMany({}),
      WorkspaceSettingsModel.deleteMany({}),
      AuditLogModel.deleteMany({}),
    ]);
  });

  it('loads and updates profile for the authenticated user only', async () => {
    const auth = await registerOwner(agent);

    const get = await agent
      .get('/api/v1/profile')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.email).toBe(auth.email);
    expect(get.body.data.firstName).toBe('Ananya');

    const patch = await agent
      .patch('/api/v1/profile')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ jobTitle: 'Lead Recruiter', phone: '+919876543210' });
    expect(patch.status).toBe(200);
    expect(patch.body.data.jobTitle).toBe('Lead Recruiter');

    const audit = await AuditLogModel.findOne({ action: 'profile.updated' });
    expect(audit).toBeTruthy();
    expect(audit!.metadata).not.toHaveProperty('password');
  });

  it('syncs appearance and notification preferences to the account', async () => {
    const auth = await registerOwner(agent);

    const prefs = await agent
      .get('/api/v1/preferences')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(prefs.status).toBe(200);
    expect(prefs.body.data.theme).toBe('system');
    expect(prefs.body.data.notificationPreferences.candidateReplies.inApp).toBe(true);

    const updated = await agent
      .patch('/api/v1/preferences')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        appearance: { theme: 'dark', density: 'compact' },
        notificationPreferences: {
          productUpdates: { inApp: true, email: true, whatsapp: false },
        },
      });
    expect(updated.status).toBe(200);
    expect(updated.body.data.theme).toBe('dark');
    expect(updated.body.data.density).toBe('compact');
    expect(updated.body.data.notificationPreferences.productUpdates.email).toBe(true);
  });

  it('lists sessions and revokes a non-current session with safe retry semantics', async () => {
    const auth = await registerOwner(agent);

    // Create a second session via login
    const login = await agent.post('/api/v1/auth/login').send({
      email: auth.email,
      password: 'Password123!',
    });
    expect(login.status).toBe(200);

    const sessions = await agent
      .get('/api/v1/profile/sessions')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(sessions.status).toBe(200);
    expect(sessions.body.data.sessions.length).toBeGreaterThanOrEqual(1);

    const other = (sessions.body.data.sessions as Array<{ id: string; current: boolean }>).find(
      (s) => !s.current
    );

    if (other) {
      const revoked = await agent
        .delete(`/api/v1/profile/sessions/${other.id}`)
        .set('Authorization', `Bearer ${auth.token}`);
      expect(revoked.status).toBe(200);
      expect(revoked.body.data.revoked).toBe(true);
    }

    // Create a fresh secondary session for bulk-revoke (previous login may have been revoked).
    const loginAgain = await agent.post('/api/v1/auth/login').send({
      email: auth.email,
      password: 'Password123!',
    });
    expect(loginAgain.status).toBe(200);
    const bulkToken = loginAgain.body.data.accessToken as string;

    const bulk = await agent
      .delete('/api/v1/profile/sessions')
      .set('Authorization', `Bearer ${bulkToken}`)
      .send({ currentPassword: 'Password123!' });
    expect(bulk.status).toBe(200);
    expect(bulk.body.data.revoked).toBe(true);

    const bad = await agent
      .delete('/api/v1/profile/sessions')
      .set('Authorization', `Bearer ${bulkToken}`)
      .send({ currentPassword: 'wrong-password' });
    expect(bad.status).toBe(403);
  });

  it('requires settings:manage for workspace updates and records audit entries', async () => {
    const auth = await registerOwner(agent);

    const settings = await agent
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(settings.status).toBe(200);
    expect(settings.body.data.workspace.organisationName).toContain('Profile Org');

    const patch = await agent
      .patch('/api/v1/settings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        workspace: {
          organisationName: 'Acme Talent Partners',
          defaultTimezone: 'Asia/Kolkata',
          defaultCurrency: 'INR',
          dateFormat: 'DD MMM YYYY',
        },
        recruitingDefaults: { defaultCandidateStatus: 'Contacted' },
        screeningDefaults: { minimumShortlistScore: '75' },
      });
    expect(patch.status).toBe(200);
    expect(patch.body.data.workspace.organisationName).toBe('Acme Talent Partners');
    expect(patch.body.data.recruitingDefaults.defaultCandidateStatus).toBe('Contacted');
    expect(patch.body.data.screeningDefaults.minimumShortlistScore).toBe('75');

    // Demote to recruiter — settings manage should fail
    await OrganizationMemberModel.updateOne(
      { organizationId: auth.organizationId, userId: auth.userId },
      { $set: { role: 'recruiter' } }
    );
    await UserModel.updateOne({ _id: auth.userId }, { $set: { role: 'recruiter' } });

    const forbidden = await agent
      .patch('/api/v1/settings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ workspace: { organisationName: 'Nope' } });
    expect(forbidden.status).toBe(403);

    // Restore owner for audit list
    await OrganizationMemberModel.updateOne(
      { organizationId: auth.organizationId, userId: auth.userId },
      { $set: { role: 'owner' } }
    );
    await UserModel.updateOne({ _id: auth.userId }, { $set: { role: 'owner' } });

    const logs = await agent
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${auth.token}`);
    expect(logs.status).toBe(200);
    expect(logs.body.data.items.length).toBeGreaterThan(0);
    expect(logs.body.data.items[0]).toHaveProperty('ip');
    expect(JSON.stringify(logs.body.data.items)).not.toMatch(/Password123/);
  });

  it('requires current password when privacy consent actually changes', async () => {
    const auth = await registerOwner(agent);

    const denied = await agent
      .patch('/api/v1/settings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        privacy: { consentDataSharing: true },
      });
    expect(denied.status).toBe(403);

    const ok = await agent
      .patch('/api/v1/settings')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        privacy: { consentDataSharing: true },
        currentPassword: 'Password123!',
      });
    expect(ok.status).toBe(200);
    expect(ok.body.data.privacy.consentDataSharing).toBe(true);
  });
});
