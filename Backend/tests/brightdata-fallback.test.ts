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
import { candidateSearchService } from '../src/modules/candidates/search/search.service.js';
import { maybeTopUpWithBrightData } from '../src/modules/sourcing/brightdata-fallback.service.js';
import { quotaService, SOURCING_QUOTA_COST } from '../src/modules/sourcing/quota.service.js';
import { SearchQuotaModel } from '../src/modules/sourcing/quota.model.js';
import { SourcedCandidateModel } from '../src/modules/sourcing/sourced-candidate.model.js';
import { SourcingSessionModel } from '../src/modules/sourcing/sourcing-session.model.js';
import { finalizeSession, pollSourcingSessions } from '../src/modules/sourcing/sourcing.poller.js';
import { QuotaCounterModel } from '../src/shared/usage/index.js';
import {
  resetMockFutureJobsState,
  setMockFutureJobsMode,
} from '../src/providers/future-jobs/index.js';
import {
  resetMockBrightDataState,
  setMockBrightDataMode,
} from '../src/providers/bright-data/index.js';
import { startMemoryMongo, stopMemoryMongo } from './helpers/memory-mongo.js';

async function registerAndAuth(agent: ReturnType<typeof request.agent>) {
  const response = await agent.post('/api/v1/auth/register').send({
    email: `brightdata-${Date.now()}-${Math.random().toString(36).slice(2)}@huntlo.ai`,
    password: 'Password123!',
    firstName: 'Bright',
    lastName: 'Data',
    organizationName: `Bright Data Org ${Date.now()}`,
  });
  expect(response.status).toBe(201);
  return {
    token: response.body.data.accessToken as string,
    organizationId: response.body.data.organization.id as string,
    userId: response.body.data.user.id as string,
  };
}

async function createBaseSession(options: {
  organizationId: string;
  userId: string;
  totalResults?: number;
  pollAttemptCount?: number;
  futureJobsSessionId?: string;
}) {
  const session = await SourcingSessionModel.create({
    organizationId: options.organizationId,
    ownerUserId: options.userId,
    userId: options.userId,
    name: 'Node.js developers in Bangalore',
    prompt: 'nodejs developer from bangalore having 2 years of exp',
    naturalLanguageQuery: 'nodejs developer from bangalore having 2 years of exp',
    filterForm: {
      currentTitle: 'Node.js Developer',
      location: ['Bangalore'],
      yearsExpMin: '2',
      yearsExpMax: '4',
    },
    status: 'polling',
    polling: true,
    futureJobsSessionId: options.futureJobsSessionId ?? `mock-fj-bd-${Date.now()}`,
    estimatedResults: 0,
    totalResults: options.totalResults ?? 0,
    totalDocs: options.totalResults ?? 0,
    pollAttemptCount: options.pollAttemptCount ?? 0,
    startedAt: new Date(),
    quotaConsumed: SOURCING_QUOTA_COST,
  });
  await quotaService.reserve(options.organizationId, session._id.toHexString(), SOURCING_QUOTA_COST);
  return session;
}

describe('Bright Data fallback', () => {
  const app = createApp();
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    process.env.FUTURE_JOBS_USE_MOCK = 'true';
    process.env.BRIGHTDATA_USE_MOCK = 'true';
    process.env.BRIGHTDATA_CANDIDATE_THRESHOLD = '120';
    resetEnvCache();
    await startMemoryMongo();
    await connectDatabase();
    agent = request.agent(app);
  }, 60_000);

  afterAll(async () => {
    await disconnectDatabase();
    await stopMemoryMongo();
  });

  beforeEach(async () => {
    clearRateLimits();
    resetMockFutureJobsState();
    resetMockBrightDataState();
    process.env.BRIGHTDATA_CANDIDATE_THRESHOLD = '120';
    resetEnvCache();
    await Promise.all([
      UserSessionModel.deleteMany({}),
      OnboardingModel.deleteMany({}),
      UserModel.deleteMany({}),
      OrganizationMemberModel.deleteMany({}),
      OrganizationModel.deleteMany({}),
      SearchQuotaModel.deleteMany({}),
      QuotaCounterModel.deleteMany({}),
      SourcingSessionModel.deleteMany({}),
      SourcedCandidateModel.deleteMany({}),
    ]);
  });

  it('tops up with Bright Data candidates when the session is below the threshold', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 5 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    const outcome = await maybeTopUpWithBrightData(session);

    expect(outcome.toppedUp).toBe(true);
    expect(outcome.addedCount).toBe(5);

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.usedBrightDataFallback).toBe(true);
    expect(refreshed?.candidateSource).toBe('bright_data');
    expect(refreshed?.totalResults).toBe(5);

    const stored = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(stored).toBe(5);
  });

  it('skips the top-up once the session already has enough candidates', async () => {
    process.env.BRIGHTDATA_CANDIDATE_THRESHOLD = '2';
    resetEnvCache();

    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 10 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 3 });
    for (let i = 0; i < 3; i += 1) {
      await SourcedCandidateModel.create({
        organizationId,
        sourcingSessionId: session._id,
        externalCandidateId: `fj-cand-${i}`,
        source: 'future_jobs',
        basicProfile: { name: `FJ Candidate ${i}` },
        currentEmployment: { title: 'Node.js Developer', company: 'Acme' },
        location: 'Bangalore',
        experienceYears: 3,
        skills: ['Node.js'],
        educationPreview: [],
        profileSignals: [],
        rawProviderReference: { id: `fj-cand-${i}` },
        rank: i + 1,
        matchScore: 4,
      });
    }

    const outcome = await maybeTopUpWithBrightData(session);

    expect(outcome.toppedUp).toBe(false);
    expect(outcome.addedCount).toBe(0);

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.usedBrightDataFallback ?? false).toBe(false);

    const bdCount = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(bdCount).toBe(0);
  });

  it('merges Bright Data candidates alongside existing Future Jobs candidates as "mixed"', async () => {
    process.env.BRIGHTDATA_CANDIDATE_THRESHOLD = '50';
    resetEnvCache();

    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 8 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 1 });
    await SourcedCandidateModel.create({
      organizationId,
      sourcingSessionId: session._id,
      externalCandidateId: 'fj-cand-mix-1',
      source: 'future_jobs',
      basicProfile: { name: 'Existing FJ Candidate' },
      currentEmployment: { title: 'Node.js Developer', company: 'Acme' },
      location: 'Bangalore',
      experienceYears: 3,
      skills: ['Node.js'],
      educationPreview: [],
      profileSignals: [],
      rawProviderReference: { id: 'fj-cand-mix-1' },
      rank: 1,
      matchScore: 4,
    });

    const outcome = await maybeTopUpWithBrightData(session);

    expect(outcome.toppedUp).toBe(true);
    expect(outcome.addedCount).toBe(8);

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.candidateSource).toBe('mixed');
    expect(refreshed?.totalResults).toBe(9);

    const total = await SourcedCandidateModel.countDocuments({ sourcingSessionId: session._id });
    expect(total).toBe(9);
  });

  it('does not duplicate a candidate that both Future Jobs and Bright Data return for the same session', async () => {
    process.env.BRIGHTDATA_CANDIDATE_THRESHOLD = '50';
    resetEnvCache();

    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 5 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 1 });
    // The mock Bright Data provider deterministically returns
    // https://www.linkedin.com/in/bd-mock-1 as its first profile — seed an
    // existing Future Jobs candidate with that same LinkedIn URL to simulate
    // both vendors independently surfacing the same real person under
    // unrelated externalCandidateIds (FJ's own id vs Bright Data's
    // `bright-data:`-prefixed id).
    await SourcedCandidateModel.create({
      organizationId,
      sourcingSessionId: session._id,
      externalCandidateId: 'fj-cand-overlap-1',
      source: 'future_jobs',
      basicProfile: { name: 'Overlap Candidate' },
      currentEmployment: { title: 'Node.js Developer', company: 'Acme' },
      location: 'Bangalore',
      experienceYears: 3,
      skills: ['Node.js'],
      educationPreview: [],
      profileSignals: [],
      linkedinProfileUrl: 'https://www.linkedin.com/in/bd-mock-1',
      linkedinUrlNormalized: 'https://www.linkedin.com/in/bd-mock-1',
      rawProviderReference: { id: 'fj-cand-overlap-1' },
      rank: 1,
      matchScore: 4,
    });

    const outcome = await maybeTopUpWithBrightData(session);

    // 5 Bright Data profiles came back, but one of them is the same real
    // person as the pre-existing Future Jobs candidate — only the 4
    // genuinely new ones should be added, not all 5.
    expect(outcome.toppedUp).toBe(true);
    expect(outcome.addedCount).toBe(4);

    const total = await SourcedCandidateModel.countDocuments({ sourcingSessionId: session._id });
    expect(total).toBe(5); // 1 pre-existing FJ + 4 new BD, not 6.

    const dupes = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      linkedinUrlNormalized: 'https://www.linkedin.com/in/bd-mock-1',
    });
    expect(dupes).toBe(1);
  });

  it('does not block finalization when Bright Data itself fails', async () => {
    setMockBrightDataMode({ alwaysFail: true });

    const { organizationId, userId } = await registerAndAuth(agent);
    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    const outcome = await maybeTopUpWithBrightData(session);

    expect(outcome.toppedUp).toBe(false);
    expect(outcome.addedCount).toBe(0);

    // Marked as attempted so subsequent poll ticks don't retry a dead provider.
    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.usedBrightDataFallback).toBe(true);
  });

  it('is idempotent — a second call after a successful top-up is a no-op', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 4 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    const first = await maybeTopUpWithBrightData(session);
    expect(first.toppedUp).toBe(true);

    const second = await maybeTopUpWithBrightData(session);
    expect(second.toppedUp).toBe(false);
    expect(second.addedCount).toBe(0);

    const stored = await SourcedCandidateModel.countDocuments({ sourcingSessionId: session._id });
    expect(stored).toBe(4);
  });

  it('claims the fallback atomically so two concurrent callers never both query Bright Data', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 4 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    // Simulates two poll ticks (e.g. the dedicated poll job and a sweep, or
    // an on-demand poll from getProgress) landing close enough together that
    // both would previously read usedBrightDataFallback=false before either
    // one persisted it, triggering Bright Data twice for the same session.
    const [first, second] = await Promise.all([
      maybeTopUpWithBrightData(session),
      maybeTopUpWithBrightData(session),
    ]);

    // Only one of them actually calls Bright Data — the other loses the
    // atomic claim and waits for the winner instead of racing ahead with a
    // stale "no candidates" result, so both report the same, correct outcome.
    expect(first.toppedUp).toBe(true);
    expect(second.toppedUp).toBe(true);
    expect(first.addedCount).toBe(4);
    expect(second.addedCount).toBe(4);

    // Only one Bright Data search's worth of candidates was ever persisted —
    // not 8 (4 + 4) from a double trigger.
    const stored = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(stored).toBe(4);
  });

  it('waits when a later poll tick loads an already-claimed in-flight fallback', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    // Mimic attempt 9 loading the session after attempt 8 already claimed
    // Bright Data but has not finished yet — completedAt is still null.
    await SourcingSessionModel.updateOne(
      { _id: session._id },
      { $set: { usedBrightDataFallback: true } }
    );
    session.usedBrightDataFallback = true;

    const finishInFlight = (async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await SourcingSessionModel.updateOne(
        { _id: session._id },
        {
          $set: {
            brightDataFallbackCompletedAt: new Date(),
            totalResults: 6,
            totalDocs: 6,
            candidateSource: 'bright_data',
          },
        }
      );
    })();

    const outcome = await maybeTopUpWithBrightData(session);
    await finishInFlight;
    expect(outcome.toppedUp).toBe(true);
    expect(outcome.addedCount).toBe(6);
  });

  it('does not finalize with a stale zero when a concurrent poll tick loses the claim race', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockBrightDataMode({ resultCount: 6 });

    const session = await createBaseSession({ organizationId, userId, totalResults: 0 });

    // Mirrors the exact poller pattern in sourcing.poller.ts: every terminal
    // branch does `await maybeTopUpWithBrightData(session)` immediately
    // followed by `finalizeSession(...)`. Before the fix, the tick that lost
    // the atomic Bright Data claim returned `{ toppedUp: false }` instantly,
    // won the race to finalize, and locked the session in as "completed, 0
    // results" — seconds before the other tick's real Bright Data snapshot
    // (which did find candidates) landed. That tick's own finalizeSession
    // call then found the session already terminal and silently skipped, so
    // the corrected total and completion notification never went out.
    const runPollTick = () =>
      maybeTopUpWithBrightData(session).then(() =>
        finalizeSession(session, 'completed', { reason: 'no-profiles-returned', attempt: 9 })
      );

    await Promise.all([runPollTick(), runPollTick()]);

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.status).toBe('completed');
    expect(refreshed?.totalResults).toBe(6);
    expect(refreshed?.candidateSource).toBe('bright_data');

    const stored = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(stored).toBe(6);
  });

  it('rescues a session when Future Jobs create fails before any polling starts', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockFutureJobsMode({ alwaysFail: true });
    setMockBrightDataMode({ resultCount: 7 });

    const session = await SourcingSessionModel.create({
      organizationId,
      ownerUserId: userId,
      userId,
      name: 'HR assistants in Mumbai',
      prompt: 'Find hr assistants in Mumbai, Maharashtra, India with 2-5 years of experience',
      naturalLanguageQuery:
        'Find hr assistants in Mumbai, Maharashtra, India with 2-5 years of experience',
      filterForm: {
        currentTitle: 'HR Assistant, Human Resources Assistant, HR Coordinator',
        location: ['Mumbai, Maharashtra, India'],
        yearsExpMin: '2',
        yearsExpMax: '5',
      },
      status: 'queued',
      polling: true,
      startedAt: new Date(),
      quotaConsumed: SOURCING_QUOTA_COST,
    });
    await quotaService.reserve(organizationId, session._id.toHexString(), SOURCING_QUOTA_COST);

    await candidateSearchService.runQueuedApply(session._id.toHexString());

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.status).toBe('completed');
    expect(refreshed?.usedBrightDataFallback).toBe(true);
    expect(refreshed?.totalResults).toBe(7);

    const stored = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(stored).toBe(7);
  });

  it('rescues a Future-Jobs-empty session end-to-end via the poller ladder', async () => {
    const { organizationId, userId } = await registerAndAuth(agent);
    setMockFutureJobsMode({ emptyProfiles: true });
    setMockBrightDataMode({ resultCount: 6 });

    // Pre-seed pollAttemptCount so the very first sweep tick lands on the
    // "no profiles returned after N attempts" terminal branch.
    const session = await createBaseSession({
      organizationId,
      userId,
      totalResults: 0,
      pollAttemptCount: 7,
    });

    await pollSourcingSessions();

    const refreshed = await SourcingSessionModel.findById(session._id);
    expect(refreshed?.status).toBe('completed');
    expect(refreshed?.usedBrightDataFallback).toBe(true);
    expect(refreshed?.totalResults).toBe(6);

    const stored = await SourcedCandidateModel.countDocuments({
      sourcingSessionId: session._id,
      source: 'bright_data',
    });
    expect(stored).toBe(6);
  });
});
