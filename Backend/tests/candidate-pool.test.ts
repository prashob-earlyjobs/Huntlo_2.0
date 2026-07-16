import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { resetEnvCache } from '../src/config/env.js';
import { clearRateLimits } from '../src/middleware/rate-limit.js';
import { OnboardingModel } from '../src/modules/auth/onboarding.model.js';
import { UserSessionModel } from '../src/modules/auth/session.model.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import {
  CandidateImportJobModel,
  CandidateListModel,
  CandidateNoteModel,
  processImportJob,
  sanitizeSpreadsheetValue,
  SavedCandidateModel,
} from '../src/modules/candidates/index.js';
import { OrganizationMemberModel } from '../src/modules/organizations/member.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(
  agent: ReturnType<typeof request.agent>,
  suffix = Date.now().toString()
) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `pool-${suffix}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Pool',
    lastName: 'Tester',
    organizationName: `Pool Org ${suffix}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

describe('Candidate pool, lists, notes, import', () => {
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
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      SavedCandidateModel.deleteMany({}),
      CandidateListModel.deleteMany({}),
      CandidateNoteModel.deleteMany({}),
      CandidateImportJobModel.deleteMany({}),
    ]);
  });

  it('creates and lists pool candidates with pagination, search, and status filter', async () => {
    const auth = await registerAndAuth(agent, `list-${Date.now()}`);

    const created = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543210',
        currentTitle: 'Senior Engineer',
        location: 'Bengaluru',
        skills: ['React', 'Node'],
        status: 'saved',
        tags: ['priority'],
      });
    expect(created.status).toBe(201);
    expect(created.body.data.name).toBe('Priya Sharma');
    expect(created.body.data.email).toBe('priya@example.com');
    expect(created.body.data.phone).toBe('+919876543210');
    expect(created.body.data.status).toBe('saved');
    expect(created.body.data.pipelineStatus).toBe('Saved');

    await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Other Person', status: 'new' });

    const listed = await agent
      .get('/api/v1/candidate-pool')
      .query({ status: 'saved', page: 1, limit: 10 })
      .set('Authorization', `Bearer ${auth.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data.items).toHaveLength(1);
    expect(listed.body.data.items[0].name).toBe('Priya Sharma');
    expect(listed.body.data.pagination.total).toBe(1);

    const searched = await agent
      .get('/api/v1/candidate-pool')
      .query({ search: 'Priya' })
      .set('Authorization', `Bearer ${auth.token}`);
    expect(searched.status).toBe(200);
    expect(searched.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(searched.body.data.items.some((c: { name: string }) => c.name === 'Priya Sharma')).toBe(
      true
    );
  });

  it('isolates candidates by organization', async () => {
    const orgA = await registerAndAuth(agent, `orga-${Date.now()}`);
    const orgB = await registerAndAuth(agent, `orgb-${Date.now()}`);

    const created = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${orgA.token}`)
      .send({ name: 'Secret Candidate', email: 'secret@example.com' });
    expect(created.status).toBe(201);
    const candidateId = created.body.data.id as string;

    const cross = await agent
      .get(`/api/v1/candidate-pool/${candidateId}`)
      .set('Authorization', `Bearer ${orgB.token}`);
    expect(cross.status).toBe(404);

    const listB = await agent
      .get('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${orgB.token}`);
    expect(listB.status).toBe(200);
    expect(listB.body.data.items).toHaveLength(0);
  });

  it('creates list, bulk-adds candidates, and updates candidateCount', async () => {
    const auth = await registerAndAuth(agent, `lists-${Date.now()}`);

    const listRes = await agent
      .post('/api/v1/candidate-lists')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Bengaluru React Developers', description: 'Local FE talent' });
    expect(listRes.status).toBe(201);
    expect(listRes.body.data.candidateCount).toBe(0);
    const listId = listRes.body.data.id as string;

    const c1 = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Cand One', email: 'one@example.com' });
    const c2 = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Cand Two', email: 'two@example.com' });

    const bulk = await agent
      .post('/api/v1/candidate-pool/bulk/add-to-list')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        ids: [c1.body.data.id, c2.body.data.id],
        listId,
      });
    expect(bulk.status).toBe(200);
    expect(bulk.body.data.added).toBe(2);

    const listGet = await agent
      .get(`/api/v1/candidate-lists/${listId}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(listGet.status).toBe(200);
    expect(listGet.body.data.candidateCount).toBe(2);

    const remove = await agent
      .post('/api/v1/candidate-pool/bulk/remove-from-list')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ ids: [c1.body.data.id], listId });
    expect(remove.status).toBe(200);
    expect(remove.body.data.removed).toBe(1);

    const listAfter = await agent
      .get(`/api/v1/candidate-lists/${listId}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(listAfter.body.data.candidateCount).toBe(1);
  });

  it('supports notes CRUD', async () => {
    const auth = await registerAndAuth(agent, `notes-${Date.now()}`);

    const cand = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Noted Person' });
    const candidateId = cand.body.data.id as string;

    const created = await agent
      .post(`/api/v1/candidate-pool/${candidateId}/notes`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ body: 'Prefers hybrid work', visibility: 'team' });
    expect(created.status).toBe(201);
    expect(created.body.data.body).toBe('Prefers hybrid work');
    const noteId = created.body.data.id as string;

    const listed = await agent
      .get(`/api/v1/candidate-pool/${candidateId}/notes`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.data.items).toHaveLength(1);

    const updated = await agent
      .patch(`/api/v1/candidate-pool/${candidateId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ body: 'Updated note' });
    expect(updated.status).toBe(200);
    expect(updated.body.data.body).toBe('Updated note');

    const deleted = await agent
      .delete(`/api/v1/candidate-pool/${candidateId}/notes/${noteId}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deleted).toBe(true);
  });

  it('bulk updates status', async () => {
    const auth = await registerAndAuth(agent, `bulk-${Date.now()}`);

    const c1 = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'A', status: 'new' });
    const c2 = await agent
      .post('/api/v1/candidate-pool')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'B', status: 'new' });

    const bulk = await agent
      .post('/api/v1/candidate-pool/bulk/status')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        ids: [c1.body.data.id, c2.body.data.id],
        status: 'contacted',
      });
    expect(bulk.status).toBe(200);
    expect(bulk.body.data.modified).toBe(2);

    const get = await agent
      .get(`/api/v1/candidate-pool/${c1.body.data.id}`)
      .set('Authorization', `Bearer ${auth.token}`);
    expect(get.body.data.status).toBe('contacted');
    expect(get.body.data.pipelineStatus).toBe('Contacted');
  });

  it('imports CSV via preview + commit, processes job, deletes temp file', async () => {
    const auth = await registerAndAuth(agent, `import-${Date.now()}`);

    const csvPath = path.join(os.tmpdir(), `huntlo-test-import-${Date.now()}.csv`);
    fs.writeFileSync(
      csvPath,
      [
        'Name,Email,Phone,Title,Company',
        'Alice Imported,alice@example.com,9876543211,Engineer,Acme',
        'Bob Imported,bob@example.com,9876543212,Designer,Beta',
        "Evil Formula,evil@example.com,9876543213,=cmd|'/C calc',EvilCo",
      ].join('\n'),
      'utf8'
    );

    try {
      const preview = await agent
        .post('/api/v1/candidate-imports/preview')
        .set('Authorization', `Bearer ${auth.token}`)
        .attach('file', csvPath);
      expect(preview.status).toBe(201);
      expect(preview.body.data.headers).toContain('Name');
      expect(preview.body.data.suggestedColumnMapping.name).toBe('Name');
      expect(preview.body.data.suggestedColumnMapping.email).toBe('Email');
      const jobId = preview.body.data.id as string;
      const storagePath = (
        await CandidateImportJobModel.findById(jobId)
      )?.storagePath as string;
      expect(storagePath).toBeTruthy();
      expect(fs.existsSync(storagePath)).toBe(true);

      const commit = await agent
        .post('/api/v1/candidate-imports')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({
          jobId,
          columnMapping: preview.body.data.suggestedColumnMapping,
        });
      expect(commit.status).toBe(201);
      expect(commit.body.data.status).toBe('queued');

      await processImportJob(jobId);

      const job = await CandidateImportJobModel.findById(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.totals?.imported).toBeGreaterThanOrEqual(2);
      expect(job?.storagePath).toBeNull();
      expect(fs.existsSync(storagePath)).toBe(false);

      const pool = await agent
        .get('/api/v1/candidate-pool')
        .set('Authorization', `Bearer ${auth.token}`);
      expect(pool.body.data.items.length).toBeGreaterThanOrEqual(3);
      expect(
        pool.body.data.items.some((c: { name: string }) => c.name === 'Alice Imported')
      ).toBe(true);

      const evil = pool.body.data.items.find(
        (c: { email: string | null }) => c.email === 'evil@example.com'
      );
      expect(evil).toBeTruthy();
      expect(String(evil.currentTitle)).toBe("cmd|'/C calc'");
      expect(String(evil.currentTitle)).not.toMatch(/^=/);
    } finally {
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    }
  });

  it('sanitizes spreadsheet formula injection', () => {
    expect(sanitizeSpreadsheetValue('=cmd')).toBe('cmd');
    expect(sanitizeSpreadsheetValue('+abc')).toBe('abc');
    expect(sanitizeSpreadsheetValue('-2+3')).toBe('2+3');
    expect(sanitizeSpreadsheetValue('@SUM(A1)')).toBe('SUM(A1)');
    expect(sanitizeSpreadsheetValue('  =HYPERLINK')).toBe('HYPERLINK');
    expect(sanitizeSpreadsheetValue('Normal Name')).toBe('Normal Name');
    expect(sanitizeSpreadsheetValue('+919876543210')).toBe('+919876543210');
  });

  it('detects duplicate rows in import file', async () => {
    const auth = await registerAndAuth(agent, `dup-${Date.now()}`);

    const csvPath = path.join(os.tmpdir(), `huntlo-test-dup-${Date.now()}.csv`);
    fs.writeFileSync(
      csvPath,
      [
        'Name,Email,Phone',
        'Same Person,same@example.com,9876500001',
        'Same Person Again,same@example.com,9876500002',
      ].join('\n'),
      'utf8'
    );

    try {
      const preview = await agent
        .post('/api/v1/candidate-imports/preview')
        .set('Authorization', `Bearer ${auth.token}`)
        .attach('file', csvPath);
      expect(preview.status).toBe(201);
      expect(preview.body.data.totals.duplicatesInFile).toBeGreaterThanOrEqual(1);

      const jobId = preview.body.data.id as string;
      await agent
        .post('/api/v1/candidate-imports')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({
          jobId,
          columnMapping: preview.body.data.suggestedColumnMapping,
        });

      await processImportJob(jobId);

      const job = await CandidateImportJobModel.findById(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.totals?.imported).toBe(1);
      expect(job?.totals?.duplicatesInFile).toBe(1);

      const count = await SavedCandidateModel.countDocuments({
        organizationId: auth.organizationId,
        deletedAt: null,
      });
      expect(count).toBe(1);
    } finally {
      if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath);
    }
  });
});
