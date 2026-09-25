import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { createChildLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import {
  revealQuotaService,
  revealService,
} from '../candidates/index.js';
import type { RevealedContactType } from '../candidates/revealed-contact.model.js';
import { SourcedCandidateModel } from '../sourcing/sourced-candidate.model.js';
import { runWithFutureJobsActor } from '../../providers/future-jobs/futureJobs.actor-context.js';
import { BullOutreachJobModel } from '../../bull-outreach/job.model.js';
import { pushToQueue } from '../../bull-outreach/queue.js';
import { scheduleJob } from '../../bull-outreach/schedule.js';
import { OutreachCampaignModel, type OutreachCampaignDocument } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';

const log = () => createChildLogger({ module: 'outreach-launch-reveal' });

/**
 * FJ ≈ 40/min; leave ~half for other traffic. Worst mobile = lookup + reveal + 1 poll.
 * Outreach only: one poll, 1 minute after reveal. Email is lookup + reveal (no poll).
 */
const LAUNCH_MOBILE_MAX_STARTS_PER_MIN = 2;
const LAUNCH_MOBILE_MIN_START_GAP_MS = Math.ceil(
  60_000 / LAUNCH_MOBILE_MAX_STARTS_PER_MIN
);
const LAUNCH_MOBILE_POLL_DELAY_MS = 60_000;

export type LaunchRevealSummary = {
  emailNeeded: number;
  phoneNeeded: number;
  emailUnlocked: number;
  phoneUnlocked: number;
  emailCreditsCharged: number;
  phoneCreditsCharged: number;
  skipped: number;
  failed: number;
  queued: number;
};

function emptySummary(): LaunchRevealSummary {
  return {
    emailNeeded: 0,
    phoneNeeded: 0,
    emailUnlocked: 0,
    phoneUnlocked: 0,
    emailCreditsCharged: 0,
    phoneCreditsCharged: 0,
    skipped: 0,
    failed: 0,
    queued: 0,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function channelsNeeded(campaign: OutreachCampaignDocument): {
  email: boolean;
  phone: boolean;
} {
  return {
    email: Boolean(campaign.channelConfig?.email?.enabled),
    phone: Boolean(
      campaign.channelConfig?.whatsapp?.enabled ||
        campaign.channelConfig?.ai_voice?.enabled
    ),
  };
}

async function resolveRevealCandidateId(
  organizationId: string,
  pool: {
    externalCandidateId?: string | null;
    linkedinUrl?: string | null;
    sourceType?: string | null;
    sourceId?: string | null;
  }
): Promise<
  | { mode: 'sourced'; id: string }
  | { mode: 'linkedin'; url: string; profileId?: string }
  | null
> {
  const external = pool.externalCandidateId?.trim();
  if (external) {
    const sourced = await SourcedCandidateModel.findOne({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      $or: [{ externalCandidateId: external }, { candidateId: external }],
    })
      .select('_id')
      .lean();
    if (sourced) {
      return { mode: 'sourced', id: sourced._id.toHexString() };
    }
    // revealService.resolveCandidate also accepts externalCandidateId directly.
    return { mode: 'sourced', id: external };
  }

  const linkedin = pool.linkedinUrl?.trim();
  if (linkedin) {
    return {
      mode: 'linkedin',
      url: linkedin,
      profileId: external || undefined,
    };
  }

  return null;
}

type Actor = { userId: string; organizationId: string };

type RevealOutcome = {
  found: boolean;
  value: string | null;
  charged: boolean;
  creditsCharged: number;
};

/**
 * One lookup poll, one minute after an empty mobile reveal.
 * Phone is 3 FutureJobs calls: lookup, reveal, this poll. Email does not poll.
 */
async function softPollSourcedMobile(
  actor: Actor,
  candidateId: string
): Promise<RevealOutcome | null> {
  await sleep(LAUNCH_MOBILE_POLL_DELAY_MS);
  try {
    const status = await revealService.getRevealStatus(actor, candidateId);
    const value = (status.mobile.values?.[0] || '').trim();
    if (status.mobile.revealed && value) {
      return {
        found: true,
        value,
        charged: true,
        creditsCharged: 0,
      };
    }
  } catch (err) {
    log().warn(
      {
        candidateId,
        err: err instanceof Error ? err.message : String(err),
      },
      'launch mobile poll failed'
    );
  }
  return null;
}

async function runContactReveal(
  actor: Actor,
  target: NonNullable<Awaited<ReturnType<typeof resolveRevealCandidateId>>>,
  contactType: RevealedContactType
): Promise<RevealOutcome> {
  return runWithFutureJobsActor(
    { userId: actor.userId, organizationId: actor.organizationId },
    () => runContactRevealInner(actor, target, contactType)
  );
}

async function runContactRevealInner(
  actor: Actor,
  target: NonNullable<Awaited<ReturnType<typeof resolveRevealCandidateId>>>,
  contactType: RevealedContactType
): Promise<RevealOutcome> {
  const result =
    target.mode === 'sourced'
      ? await revealService.reveal(actor, target.id, contactType)
      : await revealService.revealByLinkedin(actor, {
          linkedinUrl: target.url,
          contactType,
          profileId: target.profileId,
        });

  const value = (result.value || result.values?.[0] || '').trim() || null;
  if (result.found && value) {
    return {
      found: true,
      value,
      charged: Boolean(result.charged),
      creditsCharged: result.creditsCharged || 0,
    };
  }

  // Mobile + sourced: soft-poll (lookup/reveal DB sessions already started by reveal()).
  if (contactType === 'mobile' && target.mode === 'sourced') {
    const polled = await softPollSourcedMobile(actor, target.id);
    if (polled?.value) {
      return {
        found: true,
        value: polled.value,
        charged: true,
        creditsCharged: polled.creditsCharged,
      };
    }
  }

  return {
    found: false,
    value: null,
    charged: false,
    creditsCharged: 0,
  };
}

/**
 * Before launch validation, unlock missing email/phone on enrolled pool
 * candidates according to enabled channels. Charges reveal credits via
 * revealService (same path as manual unlock).
 *
 * Mobile: queued 1-at-a-time with soft-poll + ≥30s between starts (FJ 40/min).
 * Email: unchanged (no soft-poll / no start-gap queue).
 */
export async function enrichCampaignContactsForLaunch(
  input: {
    organizationId: string;
    userId: string;
    campaign: OutreachCampaignDocument;
  },
  options?: { enqueue?: boolean }
): Promise<LaunchRevealSummary> {
  const { organizationId, userId, campaign } = input;
  const needed = channelsNeeded(campaign);
  if (!needed.email && !needed.phone) return emptySummary();

  const orgOid = new mongoose.Types.ObjectId(organizationId);
  const enrollments = await OutreachEnrollmentModel.find({
    campaignId: campaign._id,
    organizationId: orgOid,
  }).lean();
  if (!enrollments.length) return emptySummary();

  const candidateIds = enrollments.map((row) => row.candidateId);
  const candidates = await SavedCandidateModel.find({
    _id: { $in: candidateIds },
    organizationId: orgOid,
    deletedAt: null,
  });

  const summary = emptySummary();
  const work: Array<{
    candidate: (typeof candidates)[number];
    types: RevealedContactType[];
  }> = [];

  for (const candidate of candidates) {
    const types: RevealedContactType[] = [];
    if (needed.email && !candidate.email) types.push('email');
    if (needed.phone && !candidate.phone) types.push('mobile');
    if (!types.length) {
      summary.skipped += 1;
      continue;
    }
    if (types.includes('email')) summary.emailNeeded += 1;
    if (types.includes('mobile')) summary.phoneNeeded += 1;
    work.push({ candidate, types });
  }

  if (!work.length) return summary;

  const quota = await revealQuotaService.getStatus(organizationId);
  const emailCreditsRequired = summary.emailNeeded * quota.email.costPerReveal;
  const phoneCreditsRequired = summary.phoneNeeded * quota.mobile.costPerReveal;

  if (emailCreditsRequired > quota.email.remaining) {
    throw new AppError(
      409,
      'EMAIL_REVEAL_QUOTA_EXCEEDED',
      `Launch needs ${summary.emailNeeded} email unlock(s) (${emailCreditsRequired} credits) but only ${quota.email.remaining} email reveal credits remain.`,
      {
        meta: {
          emailNeeded: summary.emailNeeded,
          creditsRequired: emailCreditsRequired,
          remaining: quota.email.remaining,
        },
      }
    );
  }
  if (phoneCreditsRequired > quota.mobile.remaining) {
    throw new AppError(
      409,
      'MOBILE_REVEAL_QUOTA_EXCEEDED',
      `Launch needs ${summary.phoneNeeded} mobile unlock(s) (${phoneCreditsRequired} credits) but only ${quota.mobile.remaining} mobile reveal credits remain.`,
      {
        meta: {
          phoneNeeded: summary.phoneNeeded,
          creditsRequired: phoneCreditsRequired,
          remaining: quota.mobile.remaining,
        },
      }
    );
  }

  if (options?.enqueue) {
    summary.queued = work.length;
    await scheduleLaunchRevealJob({
      organizationId,
      userId,
      campaignId: String(campaign._id),
    });
    log().info(
      { campaignId: String(campaign._id), organizationId, queued: summary.queued },
      'launch contact unlock queued'
    );
    return summary;
  }

  const actor: Actor = { userId, organizationId };
  const mobileCost = quota.mobile.costPerReveal;
  const emailCost = quota.email.costPerReveal;

  type WorkItem = (typeof work)[number] & {
    target: NonNullable<Awaited<ReturnType<typeof resolveRevealCandidateId>>>;
  };

  const resolved: WorkItem[] = [];
  for (const item of work) {
    const target = await resolveRevealCandidateId(organizationId, item.candidate);
    if (!target) {
      summary.failed += 1;
      continue;
    }
    resolved.push({ ...item, target });
  }

  // --- Email first (no soft-poll / no FJ start-gap queue) ---
  for (const item of resolved) {
    if (!item.types.includes('email')) continue;

    let emailValue: string | null = item.candidate.email ?? null;
    try {
      const outcome = await runContactReveal(actor, item.target, 'email');
      if (!outcome.found || !outcome.value) {
        summary.failed += 1;
      } else {
        emailValue = outcome.value;
        summary.emailUnlocked += 1;
        if (outcome.charged) {
          summary.emailCreditsCharged += outcome.creditsCharged || emailCost;
        }
      }
    } catch (error) {
      summary.failed += 1;
      log().warn(
        {
          campaignId: String(campaign._id),
          candidateId: item.candidate._id.toHexString(),
          contactType: 'email',
          err: error instanceof Error ? error.message : String(error),
        },
        'launch reveal failed'
      );
      if (
        error instanceof AppError &&
        error.statusCode === 409 &&
        /quota/i.test(error.message)
      ) {
        throw error;
      }
    }

    if (emailValue !== (item.candidate.email ?? null)) {
      item.candidate.email = emailValue;
      item.candidate.lastActivityAt = new Date();
      await item.candidate.save();
      await OutreachEnrollmentModel.updateOne(
        {
          campaignId: campaign._id,
          organizationId: orgOid,
          candidateId: item.candidate._id,
        },
        {
          $set: {
            'contactAvailability.email': Boolean(emailValue),
            'contactAvailability.phone': Boolean(item.candidate.phone),
          },
        }
      );
    }
  }

  // --- Mobile queue: 1 at a time, soft-poll, ≤2 starts/min ---
  let lastMobileStartAt = 0;
  for (const item of resolved) {
    if (!item.types.includes('mobile')) continue;
    if (item.candidate.phone) continue;

    if (lastMobileStartAt > 0) {
      const waitMs = LAUNCH_MOBILE_MIN_START_GAP_MS - (Date.now() - lastMobileStartAt);
      if (waitMs > 0) {
        log().info(
          {
            campaignId: String(campaign._id),
            waitMs,
            maxStartsPerMin: LAUNCH_MOBILE_MAX_STARTS_PER_MIN,
          },
          'launch mobile queue pacing'
        );
        await sleep(waitMs);
      }
    }

    lastMobileStartAt = Date.now();
    let phoneValue: string | null = item.candidate.phone ?? null;

    try {
      const outcome = await runContactReveal(actor, item.target, 'mobile');
      if (!outcome.found || !outcome.value) {
        summary.failed += 1;
      } else {
        phoneValue = outcome.value;
        summary.phoneUnlocked += 1;
        if (outcome.charged) {
          summary.phoneCreditsCharged += outcome.creditsCharged || mobileCost;
        }
      }
    } catch (error) {
      summary.failed += 1;
      log().warn(
        {
          campaignId: String(campaign._id),
          candidateId: item.candidate._id.toHexString(),
          contactType: 'mobile',
          err: error instanceof Error ? error.message : String(error),
        },
        'launch reveal failed'
      );
      if (
        error instanceof AppError &&
        error.statusCode === 409 &&
        /quota/i.test(error.message)
      ) {
        throw error;
      }
    }

    if (phoneValue !== (item.candidate.phone ?? null)) {
      item.candidate.phone = phoneValue;
      item.candidate.lastActivityAt = new Date();
      await item.candidate.save();
      await OutreachEnrollmentModel.updateOne(
        {
          campaignId: campaign._id,
          organizationId: orgOid,
          candidateId: item.candidate._id,
        },
        {
          $set: {
            'contactAvailability.email': Boolean(item.candidate.email),
            'contactAvailability.phone': Boolean(phoneValue),
          },
        }
      );
    }
  }

  log().info(
    {
      campaignId: String(campaign._id),
      organizationId,
      mobileQueue: {
        maxStartsPerMin: LAUNCH_MOBILE_MAX_STARTS_PER_MIN,
        minStartGapMs: LAUNCH_MOBILE_MIN_START_GAP_MS,
        pollDelayMs: LAUNCH_MOBILE_POLL_DELAY_MS,
      },
      ...summary,
    },
    'launch contact unlock finished'
  );

  return summary;
}

function clipText(value: string | null | undefined, max: number): string | null {
  const text = value?.trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

/** Sourcing-session launches store the session id on candidateSource.label. */
export function sourcingSessionIdFromLabel(label: string | null | undefined): string | null {
  const value = label?.trim() || '';
  return /^[a-fA-F0-9]{24}$/.test(value) ? value : null;
}

/**
 * Copy a sourcing session into the pool and enroll it.
 * Runs on the reveal queue so launch does not wait on one request per person.
 */
export async function prepareSourcingAudienceForLaunch(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
}): Promise<number> {
  const campaign = await OutreachCampaignModel.findOne({
    _id: input.campaignId,
    organizationId: input.organizationId,
    deletedAt: null,
  });
  const sessionId = sourcingSessionIdFromLabel(campaign?.candidateSource?.label);
  if (!campaign || !sessionId) return 0;

  const orgOid = new mongoose.Types.ObjectId(input.organizationId);
  const sessionOid = new mongoose.Types.ObjectId(sessionId);
  const requestedIds = (campaign.candidateSource.candidateIds || []).filter((id) =>
    /^[a-fA-F0-9]{24}$/.test(id)
  );
  const sourced = await SourcedCandidateModel.find({
    organizationId: orgOid,
    sourcingSessionId: sessionOid,
    ...(requestedIds.length
      ? { _id: { $in: requestedIds.map((id) => new mongoose.Types.ObjectId(id)) } }
      : {}),
  });
  if (!sourced.length) return 0;

  const now = new Date();
  const ownerOid = new mongoose.Types.ObjectId(input.userId);
  await SavedCandidateModel.bulkWrite(
    sourced.map((candidate) => {
      const externalCandidateId =
        candidate.candidateId ||
        candidate.externalCandidateId ||
        candidate._id.toHexString();
      return {
        updateOne: {
          filter: {
            organizationId: orgOid,
            externalCandidateId,
            deletedAt: null,
          },
          update: {
            $setOnInsert: {
              organizationId: orgOid,
              externalCandidateId,
              sourceType: 'sourcing' as const,
              sourceId: sessionId,
              ownerUserId: ownerOid,
              assignedUserId: null,
              status: 'saved' as const,
              jobIds: [],
              listIds: [],
              tags: [],
              customFields: {},
              name: clipText(candidate.name || candidate.basicProfile?.name, 200) || 'Unknown',
              email: null,
              phone: null,
              linkedinUrl:
                candidate.linkedinProfileUrl || candidate.basicProfile?.linkedinUrl || null,
              headline: clipText(candidate.basicProfile?.headline, 500),
              currentTitle: clipText(
                candidate.currentRole ?? candidate.currentEmployment?.title,
                500
              ),
              currentCompany: clipText(
                candidate.currentCompany ?? candidate.currentEmployment?.company,
                200
              ),
              location: clipText(candidate.location, 200),
              experienceYears: candidate.experienceYears ?? null,
              skills: (candidate.skills || []).map((skill) => skill.slice(0, 120)).slice(0, 50),
              archivedAt: null,
              deletedAt: null,
              createdAt: now,
            },
          },
          upsert: true,
        },
      };
    }),
    { ordered: false }
  );

  const externalIds = sourced.map(
    (candidate) =>
      candidate.candidateId || candidate.externalCandidateId || candidate._id.toHexString()
  );
  const pool = await SavedCandidateModel.find({
    organizationId: orgOid,
    externalCandidateId: { $in: externalIds },
    deletedAt: null,
  }).select('_id');

  const existing = await OutreachEnrollmentModel.find({
    campaignId: campaign._id,
    candidateId: { $in: pool.map((row) => row._id) },
  })
    .select('candidateId')
    .lean();
  const existingSet = new Set(existing.map((row) => String(row.candidateId)));
  const toInsert = pool
    .filter((row) => !existingSet.has(row._id.toHexString()))
    .map((row) => ({
      organizationId: orgOid,
      campaignId: campaign._id,
      candidateId: row._id,
      currentStepIndex: 0,
      status: 'pending' as const,
      contactAvailability: {
        email: false,
        phone: false,
        optedOut: false,
      },
      stopReason: null,
      nextActionAt: null,
    }));
  if (toInsert.length) {
    await OutreachEnrollmentModel.insertMany(toInsert, { ordered: false });
  }

  campaign.candidateSource.candidateIds = pool.map((row) => row._id.toHexString());
  await campaign.save();
  return pool.length;
}

/** Pending people who already have the channel contact should send before reveals. */
export async function pendingEnrollmentIdsReadyToSend(input: {
  organizationId: string;
  campaignId: string;
}): Promise<string[]> {
  const campaign = await OutreachCampaignModel.findOne({
    _id: input.campaignId,
    organizationId: input.organizationId,
    status: 'running',
    deletedAt: null,
  });
  if (!campaign) return [];

  const needed = channelsNeeded(campaign);
  if (!needed.email && !needed.phone) return [];

  const orgOid = new mongoose.Types.ObjectId(input.organizationId);
  const enrollments = await OutreachEnrollmentModel.find({
    campaignId: campaign._id,
    organizationId: orgOid,
    status: 'pending',
  });
  if (!enrollments.length) return [];

  const candidates = await SavedCandidateModel.find({
    _id: { $in: enrollments.map((row) => row.candidateId) },
    organizationId: orgOid,
    deletedAt: null,
  }).select('_id email phone');
  const byId = new Map(candidates.map((row) => [row._id.toHexString(), row]));
  const ready: string[] = [];

  for (const enrollment of enrollments) {
    if (enrollment.contactAvailability?.optedOut) continue;
    const candidate = byId.get(String(enrollment.candidateId));
    if (!candidate) continue;
    const emailOk = !needed.email || Boolean(candidate.email?.trim());
    const phoneOk = !needed.phone || Boolean(candidate.phone?.trim());
    if (!emailOk || !phoneOk) continue;
    enrollment.contactAvailability.email = Boolean(candidate.email?.trim());
    enrollment.contactAvailability.phone = Boolean(candidate.phone?.trim());
    await enrollment.save();
    ready.push(String(enrollment._id));
  }

  return ready;
}

async function scheduleLaunchRevealJob(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
  runAt?: Date;
  prepareAudience?: boolean;
}): Promise<void> {
  const campaignId = new mongoose.Types.ObjectId(input.campaignId);
  const busy = await BullOutreachJobModel.exists({
    kind: 'launch_reveal',
    campaignId,
    status: { $in: ['pending', 'queued', 'running'] },
  });
  if (busy) return;

  const job = await scheduleJob({
    kind: 'launch_reveal',
    organizationId: input.organizationId,
    campaignId: input.campaignId,
    stepId: 'launch-reveal',
    runAt: input.runAt ?? new Date(),
    details: {
      userId: input.userId,
      ...(input.prepareAudience ? { prepareAudience: true } : {}),
    },
  });
  if (!job) return;
  if ((input.runAt?.getTime() ?? 0) > Date.now()) return;

  try {
    job.status = 'queued';
    await job.save();
    await pushToQueue(String(job._id));
  } catch (error) {
    job.status = 'pending';
    job.lastError = error instanceof Error ? error.message : 'queue push failed';
    await job.save();
  }
}

/** Queue pool sync, enrollment, and reveal. Returns before any of that work runs. */
export async function enqueueSourcingSessionLaunch(input: {
  organizationId: string;
  userId: string;
  campaign: OutreachCampaignDocument;
}): Promise<LaunchRevealSummary> {
  const summary = emptySummary();
  const sessionId = sourcingSessionIdFromLabel(input.campaign.candidateSource?.label);
  if (!sessionId) return summary;

  const needed = channelsNeeded(input.campaign);
  const count = await SourcedCandidateModel.countDocuments({
    organizationId: new mongoose.Types.ObjectId(input.organizationId),
    sourcingSessionId: new mongoose.Types.ObjectId(sessionId),
  });
  if (!count) {
    throw new AppError(400, 'AUDIENCE_EMPTY', 'This sourcing session has no candidates.');
  }
  if (needed.email) summary.emailNeeded = count;
  if (needed.phone) summary.phoneNeeded = count;

  const quota = await revealQuotaService.getStatus(input.organizationId);
  const emailCreditsRequired = summary.emailNeeded * quota.email.costPerReveal;
  const phoneCreditsRequired = summary.phoneNeeded * quota.mobile.costPerReveal;
  if (emailCreditsRequired > quota.email.remaining) {
    throw new AppError(
      409,
      'EMAIL_REVEAL_QUOTA_EXCEEDED',
      `Launch needs ${summary.emailNeeded} email unlock(s) (${emailCreditsRequired} credits) but only ${quota.email.remaining} email reveal credits remain.`
    );
  }
  if (phoneCreditsRequired > quota.mobile.remaining) {
    throw new AppError(
      409,
      'MOBILE_REVEAL_QUOTA_EXCEEDED',
      `Launch needs ${summary.phoneNeeded} mobile unlock(s) (${phoneCreditsRequired} credits) but only ${quota.mobile.remaining} mobile reveal credits remain.`
    );
  }

  summary.queued = count;
  await scheduleLaunchRevealJob({
    organizationId: input.organizationId,
    userId: input.userId,
    campaignId: String(input.campaign._id),
    prepareAudience: true,
  });
  return summary;
}

export type LaunchRevealStepResult = {
  continueInMs: number | null;
  enrollmentId: string | null;
  ready: boolean;
};

/** One call+poll for this campaign. The caller schedules the next job. */
export async function processNextCampaignLaunchReveal(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
}): Promise<LaunchRevealStepResult> {
  const none = { continueInMs: null, enrollmentId: null, ready: false };
  const campaign = await OutreachCampaignModel.findOne({
    _id: input.campaignId,
    organizationId: input.organizationId,
    deletedAt: null,
  });
  if (!campaign || !['draft', 'scheduled', 'paused', 'running'].includes(campaign.status)) {
    return none;
  }

  const needed = channelsNeeded(campaign);
  if (!needed.email && !needed.phone) return none;

  const orgOid = new mongoose.Types.ObjectId(input.organizationId);
  const enrollments = await OutreachEnrollmentModel.find({
    campaignId: campaign._id,
    organizationId: orgOid,
    status: { $nin: ['skipped', 'opted_out', 'stopped', 'failed', 'completed'] },
  });
  const candidates = await SavedCandidateModel.find({
    _id: { $in: enrollments.map((row) => row.candidateId) },
    organizationId: orgOid,
    deletedAt: null,
  });
  const byId = new Map(candidates.map((row) => [row._id.toHexString(), row]));

  const next = enrollments.find((enrollment) => {
    const candidate = byId.get(String(enrollment.candidateId));
    if (!candidate) return false;
    return (needed.email && !candidate.email) || (needed.phone && !candidate.phone);
  });
  if (!next) return none;

  const candidate = byId.get(String(next.candidateId))!;
  const contactType: RevealedContactType =
    needed.email && !candidate.email ? 'email' : 'mobile';
  const target = await resolveRevealCandidateId(input.organizationId, candidate);
  if (!target) {
    next.status = 'skipped';
    next.stopReason = 'missing_contact';
    await next.save();
    return { continueInMs: 0, enrollmentId: String(next._id), ready: false };
  }

  let value: string | null = null;
  try {
    const outcome = await runContactReveal(
      { userId: input.userId, organizationId: input.organizationId },
      target,
      contactType
    );
    value = outcome.found ? outcome.value : null;
  } catch (error) {
    log().warn(
      {
        campaignId: input.campaignId,
        candidateId: candidate._id.toHexString(),
        contactType,
        err: error instanceof Error ? error.message : String(error),
      },
      'queued launch reveal failed'
    );
    if (error instanceof AppError && error.statusCode === 409 && /quota/i.test(error.message)) {
      throw error;
    }
  }

  if (contactType === 'email') candidate.email = value;
  else candidate.phone = value;
  if (value) {
    candidate.lastActivityAt = new Date();
    await candidate.save();
  }

  next.contactAvailability.email = Boolean(candidate.email);
  next.contactAvailability.phone = Boolean(candidate.phone);
  const emailOk = !needed.email || Boolean(candidate.email);
  const phoneOk = !needed.phone || Boolean(candidate.phone);
  const laterChannelStillOpen =
    (contactType === 'email' && needed.phone && !candidate.phone) ||
    (contactType === 'mobile' && needed.email && !candidate.email);
  if (!value && !laterChannelStillOpen && (!emailOk || !phoneOk)) {
    next.status = 'skipped';
    next.stopReason = 'missing_contact';
  }
  await next.save();

  const remaining = enrollments.some((enrollment) => {
    if (enrollment.status === 'skipped') return false;
    if (String(enrollment._id) === String(next._id)) {
      return !emailOk || !phoneOk;
    }
    const row = byId.get(String(enrollment.candidateId));
    if (!row) return false;
    return (needed.email && !row.email) || (needed.phone && !row.phone);
  });

  return {
    continueInMs: remaining ? (contactType === 'mobile' ? LAUNCH_MOBILE_MIN_START_GAP_MS : 0) : null,
    enrollmentId: String(next._id),
    ready: next.status !== 'skipped' && emailOk && phoneOk,
  };
}
