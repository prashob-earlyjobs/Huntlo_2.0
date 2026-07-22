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
): Promise<{ mode: 'sourced'; id: string } | { mode: 'linkedin'; url: string; profileId?: string } | null> {
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

/**
 * Before launch validation, unlock missing email/phone on enrolled pool
 * candidates according to enabled channels. Charges reveal credits via
 * revealService (same path as manual unlock).
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

  const actor = { userId, organizationId };

  for (const item of work) {
    const target = await resolveRevealCandidateId(organizationId, item.candidate);
    if (!target) {
      summary.failed += 1;
      continue;
    }

    let emailValue: string | null = item.candidate.email ?? null;
    let phoneValue: string | null = item.candidate.phone ?? null;

    for (const contactType of item.types) {
      try {
        const result =
          target.mode === 'sourced'
            ? await revealService.reveal(actor, target.id, contactType)
            : await revealService.revealByLinkedin(actor, {
                linkedinUrl: target.url,
                contactType,
                profileId: target.profileId,
              });

        if (!result.found || !result.value) {
          summary.failed += 1;
          continue;
        }

        if (contactType === 'email') {
          emailValue = result.value;
          summary.emailUnlocked += 1;
          if (result.charged) {
            summary.emailCreditsCharged += result.creditsCharged || quota.email.costPerReveal;
          }
        } else {
          phoneValue = result.value;
          summary.phoneUnlocked += 1;
          if (result.charged) {
            summary.phoneCreditsCharged += result.creditsCharged || quota.mobile.costPerReveal;
          }
        }
      } catch (error) {
        summary.failed += 1;
        log().warn(
          {
            campaignId: String(campaign._id),
            candidateId: item.candidate._id.toHexString(),
            contactType,
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
    }

    const emailChanged = emailValue !== (item.candidate.email ?? null);
    const phoneChanged = phoneValue !== (item.candidate.phone ?? null);
    if (emailChanged || phoneChanged) {
      if (emailChanged) item.candidate.email = emailValue;
      if (phoneChanged) item.candidate.phone = phoneValue;
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
      ...summary,
    },
    'launch contact unlock finished'
  );

  return summary;
}
