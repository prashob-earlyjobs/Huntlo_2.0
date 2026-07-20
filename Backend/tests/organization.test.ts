import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { TeamInvitationModel } from '../src/modules/organizations/invitation.model.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { CustomRoleModel } from '../src/modules/organizations/role.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerOrg(agent: ReturnType<typeof request.agent>, email: string, orgName: string) {
  const response = await agent.post('/api/v1/auth/register').send({
    email,
    password: 'Password123!',
    firstName: 'Owner',
    lastName: 'User',
    organizationName: orgName,
  });
  return response;
}

describe('Organization & Team API', () => {
  const app = createApp();
  let agentA: ReturnType<typeof request.agent>;
  let agentB: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await startMemoryMongo();
    resetEnvCache();
    await connectDatabase();
    agentA = request.agent(app);
    agentB = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    await Promise.all([
      TeamInvitationModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      CustomRoleModel.deleteMany({}),
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
    ]);
  });

  it('returns current organization for authenticated owner', async () => {
    const register = await registerOrg(agentA, 'owner-a@huntlo.ai', 'Alpha Corp');
    const token = register.body.data.accessToken as string;

    const response = await agentA
      .get('/api/v1/organization')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.name).toBe('Alpha Corp');
    expect(response.body.data.seatLimit).toBe(3);
    expect(response.body.data.occupiedSeats).toBe(1);
  });

  it('lists team members and permission matrix', async () => {
    const register = await registerOrg(agentA, 'owner-b@huntlo.ai', 'Beta Corp');
    const token = register.body.data.accessToken as string;

    const response = await agentA
      .get('/api/v1/team')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data.members).toHaveLength(1);
    expect(response.body.data.members[0].role).toBe('owner');
    expect(response.body.data.permissionMatrix.owner).toBeDefined();
    expect(response.body.data.metrics.activeMembers).toBe(1);
  });

  it('creates an active team account and returns temporary credentials once', async () => {
    const register = await registerOrg(agentA, 'owner-create@huntlo.ai', 'Create Corp');
    const token = register.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/team/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Riya Recruiter',
        email: 'riya@huntlo.ai',
        role: 'recruiter',
        allowedModules: ['sourcing', 'candidates', 'outreach'],
      })
      .expect(201);

    expect(created.body.data.member.name).toBe('Riya Recruiter');
    expect(created.body.data.member.status).toBe('active');
    expect(created.body.data.member.allowedModules).toEqual([
      'sourcing',
      'candidates',
      'outreach',
    ]);
    expect(created.body.data.member.permissions).toContain('sourcing:view');
    expect(created.body.data.member.permissions).toContain('outreach:launch');
    expect(created.body.data.member.permissions).not.toContain('jobs:view');
    expect(created.body.data.credentials.email).toBe('riya@huntlo.ai');
    expect(created.body.data.credentials.temporaryPassword).toBeTruthy();

    const login = await agentB
      .post('/api/v1/auth/login')
      .send({
        email: created.body.data.credentials.email,
        password: created.body.data.credentials.temporaryPassword,
      })
      .expect(200);

    expect(login.body.data.user.email).toBe('riya@huntlo.ai');
    expect(login.body.data.permissions).toContain('sourcing:view');
    expect(login.body.data.permissions).not.toContain('jobs:view');

    const me = await agentB
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);

    expect(me.body.data.permissions).toEqual(login.body.data.permissions);

    const denied = await agentB
      .get('/api/v1/jobs')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(403);

    expect(denied.body.error.code).toBe('FORBIDDEN');
  });

  it('restricts admins with an explicit module allow-list', async () => {
    const register = await registerOrg(agentA, 'owner-admin-limit@huntlo.ai', 'Admin Limit Corp');
    const token = register.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/team/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Limited Admin',
        email: 'limited-admin@huntlo.ai',
        role: 'admin',
        allowedModules: ['team', 'settings'],
      })
      .expect(201);

    expect(created.body.data.member.permissions).toContain('team:manage');
    expect(created.body.data.member.permissions).not.toContain('jobs:view');

    const login = await agentB
      .post('/api/v1/auth/login')
      .send({
        email: created.body.data.credentials.email,
        password: created.body.data.credentials.temporaryPassword,
      })
      .expect(200);

    expect(login.body.data.permissions).toContain('team:view');
    expect(login.body.data.permissions).not.toContain('candidates:view');
  });

  it('resets passwords and enforces suspend, activate, and deactivate actions', async () => {
    const register = await registerOrg(agentA, 'owner-actions@huntlo.ai', 'Actions Corp');
    const token = register.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/team/members')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Action Member',
        email: 'action-member@huntlo.ai',
        role: 'recruiter',
        allowedModules: ['candidates'],
      })
      .expect(201);

    const memberId = created.body.data.member.id as string;
    const originalPassword = created.body.data.credentials.temporaryPassword as string;

    const reset = await agentA
      .post(`/api/v1/team/members/${memberId}/reset-password`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(reset.body.data.email).toBe('action-member@huntlo.ai');
    expect(reset.body.data.temporaryPassword).toBeTruthy();
    expect(reset.body.data.temporaryPassword).not.toBe(originalPassword);

    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'action-member@huntlo.ai', password: originalPassword })
      .expect(401);

    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'action-member@huntlo.ai',
        password: reset.body.data.temporaryPassword,
      })
      .expect(200);

    await agentA
      .patch(`/api/v1/team/members/${memberId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'suspended' })
      .expect(200);

    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'action-member@huntlo.ai',
        password: reset.body.data.temporaryPassword,
      })
      .expect(403);

    await agentA
      .patch(`/api/v1/team/members/${memberId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'active' })
      .expect(200);

    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'action-member@huntlo.ai',
        password: reset.body.data.temporaryPassword,
      })
      .expect(200);

    await agentA
      .delete(`/api/v1/team/members/${memberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'action-member@huntlo.ai',
        password: reset.body.data.temporaryPassword,
      })
      .expect(403);
  });

  it('creates and accepts invitations within seat limits', async () => {
    const register = await registerOrg(agentA, 'owner-c@huntlo.ai', 'Gamma Corp');
    const token = register.body.data.accessToken as string;

    const invite = await agentA
      .post('/api/v1/team/invitations')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'recruiter@huntlo.ai', role: 'recruiter' })
      .expect(201);

    expect(invite.body.data.invitation.email).toBe('recruiter@huntlo.ai');
    expect(invite.body.data.token).toBeTruthy();

    const accepted = await agentB
      .post(`/api/v1/team/invitations/${invite.body.data.token}/accept`)
      .send({
        firstName: 'Rec',
        lastName: 'Ruiter',
        password: 'Password123!',
      })
      .expect(200);

    expect(accepted.body.data.member.role).toBe('recruiter');
    expect(accepted.body.data.member.email).toBe('recruiter@huntlo.ai');
  });

  it('prevents one organisation from reading another organisation member', async () => {
    const regA = await registerOrg(agentA, 'iso-a@huntlo.ai', 'Iso Alpha');
    const regB = await registerOrg(agentB, 'iso-b@huntlo.ai', 'Iso Beta');

    const tokenA = regA.body.data.accessToken as string;
    const tokenB = regB.body.data.accessToken as string;

    const teamA = await agentA
      .get('/api/v1/team')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    const memberAId = teamA.body.data.members[0].id as string;

    const cross = await agentB
      .get(`/api/v1/team/members/${memberAId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    expect(cross.body.error.code).toBe('NOT_FOUND');
  });

  it('prevents one organisation from updating another organisation', async () => {
    const regA = await registerOrg(agentA, 'patch-a@huntlo.ai', 'Patch Alpha');
    await registerOrg(agentB, 'patch-b@huntlo.ai', 'Patch Beta');

    const tokenB = (
      await agentB.post('/api/v1/auth/login').send({
        email: 'patch-b@huntlo.ai',
        password: 'Password123!',
      })
    ).body.data.accessToken as string;

    // Org B cannot change org A via shared endpoints — PATCH uses JWT org only.
    const updated = await agentB
      .patch('/api/v1/organization')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hijacked Name' })
      .expect(200);

    expect(updated.body.data.name).toBe('Hijacked Name');

    const tokenA = regA.body.data.accessToken as string;
    const orgA = await agentA
      .get('/api/v1/organization')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(orgA.body.data.name).toBe('Patch Alpha');
  });

  it('blocks recruiter from managing team invitations', async () => {
    const ownerReg = await registerOrg(agentA, 'mgr-owner@huntlo.ai', 'Mgr Org');
    const ownerToken = ownerReg.body.data.accessToken as string;

    const invite = await agentA
      .post('/api/v1/team/invitations')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: 'limited@huntlo.ai', role: 'recruiter' })
      .expect(201);

    await agentB
      .post(`/api/v1/team/invitations/${invite.body.data.token}/accept`)
      .send({
        firstName: 'Lim',
        lastName: 'Ited',
        password: 'Password123!',
      })
      .expect(200);

    const login = await agentB.post('/api/v1/auth/login').send({
      email: 'limited@huntlo.ai',
      password: 'Password123!',
    });
    const recruiterToken = login.body.data.accessToken as string;

    await agentB
      .post('/api/v1/team/invitations')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ email: 'another@huntlo.ai', role: 'analyst' })
      .expect(403);
  });

  it('prevents removing the workspace owner', async () => {
    const register = await registerOrg(agentA, 'owner-rm@huntlo.ai', 'Owner Lock');
    const token = register.body.data.accessToken as string;

    const team = await agentA
      .get('/api/v1/team')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const ownerMemberId = team.body.data.members[0].id as string;

    await agentA
      .delete(`/api/v1/team/members/${ownerMemberId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('supports custom role CRUD scoped to organisation', async () => {
    const regA = await registerOrg(agentA, 'role-a@huntlo.ai', 'Role Alpha');
    const regB = await registerOrg(agentB, 'role-b@huntlo.ai', 'Role Beta');
    const tokenA = regA.body.data.accessToken as string;
    const tokenB = regB.body.data.accessToken as string;

    const created = await agentA
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Sourcing Lead',
        permissions: ['sourcing:view', 'sourcing:create', 'candidates:view'],
      })
      .expect(201);

    const roleId = created.body.data.id as string;

    await agentB
      .patch(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Stolen Role' })
      .expect(404);

    await agentA
      .patch(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Sourcing Lead II' })
      .expect(200);

    await agentA
      .delete(`/api/v1/roles/${roleId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
  });
});
