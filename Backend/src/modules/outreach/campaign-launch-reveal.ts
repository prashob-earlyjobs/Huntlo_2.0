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
import type { OutreachCampaignDocument } from './campaign.model.js';
import { OutreachEnrollmentModel } from './enrollment.model.js';

const log = () => createChildLogger({ module: 'outreach-launch-reveal' });

/**
 * FJ ≈ 40/min; leave ~half for other traffic. Worst mobile ≈ 8 calls → ≤2 starts/min.
 * Soft-poll window matches session / People Scout (10s × 60s).
 */
const LAUNCH_MOBILE_MAX_STARTS_PER_MIN = 2;
const LAUNCH_MOBILE_MIN_START_GAP_MS = Math.ceil(
  60_000 / LAUNCH_MOBILE_MAX_STARTS_PER_MIN
);
const LAUNCH_MOBILE_SOFT_POLL_INTERVAL_MS = 10_000;
const LAUNCH_MOBILE_SOFT_POLL_WINDOW_MS = 60_000;

export type LaunchRevealSummary = {
  emailNeeded: number;
  phoneNeeded: number;
  emailUnlocked: number;
  phoneUnlocked: number;
  emailCreditsCharged: number;
  phoneCreditsCharged: number;
  skipped: number;
  failed: number;
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
 * Soft-poll after empty mobile reveal (sourced path). Each getRevealStatus
 * re-hits FJ lookup and appends kind:reveal poll DB entries while the session
 * is in_progress.
 */
async function softPollSourcedMobile(
  actor: Actor,
  candidateId: string
): Promise<RevealOutcome | null> {
  const deadline = Date.now() + LAUNCH_MOBILE_SOFT_POLL_WINDOW_MS;
  while (Date.now() < deadline) {
    try {
      const status = await revealService.getRevealStatus(actor, candidateId);
      const value = (status.mobile.values?.[0] || '').trim();
      if (status.mobile.revealed && value) {
        return {
          found: true,
          value,
          charged: true,
          creditsCharged: 0, // filled by caller from quota cost when unknown
        };
      }
    } catch (err) {
      log().warn(
        {
          candidateId,
          err: err instanceof Error ? err.message : String(err),
        },
        'launch mobile soft-poll attempt failed'
      );
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;
    await sleep(Math.min(LAUNCH_MOBILE_SOFT_POLL_INTERVAL_MS, remaining));
  }
  return null;
}

async function runContactReveal(
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
export async function enrichCampaignContactsForLaunch(input: {
  organizationId: string;
  userId: string;
  campaign: OutreachCampaignDocument;
}): Promise<LaunchRevealSummary> {
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
        softPollWindowMs: LAUNCH_MOBILE_SOFT_POLL_WINDOW_MS,
      },
      ...summary,
    },
    'launch contact unlock finished'
  );

  return summary;
}
