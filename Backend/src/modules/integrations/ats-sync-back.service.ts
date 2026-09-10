import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { decryptJson, decryptSecret } from './credentials.js';
import { integrationsService } from './integration.service.js';
import { getProviderAdapter } from './providers/registry.js';
import type { AtsProvider } from './providers/types.js';
import { UserIntegrationModel, type IntegrationProviderId } from './user-integration.model.js';

const logger = getLogger().child({ module: 'ats-sync-back' });

export type AtsOutreachSyncResult = {
  skipped: boolean;
  reason?: string;
  ok?: boolean;
  message?: string;
  provider?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

/**
 * Map Huntlo enrollment terminal state → Zoho Candidate_Status label.
 * Labels are org-configurable in Zoho; status update is best-effort.
 */
export function mapEnrollmentToAtsStatus(input: {
  status: string;
  stopReason: string | null;
  qualificationStatus: string | null;
}): string | null {
  const qual = String(input.qualificationStatus || '').toLowerCase();
  const stop = String(input.stopReason || '').toLowerCase();
  const status = String(input.status || '').toLowerCase();

  if (qual === 'qualified') return 'Qualified';
  if (qual === 'rejected' || stop === 'qualification_rejected') return 'Rejected';
  if (status === 'opted_out' || stop === 'candidate_opted_out') return 'Junk Candidate';
  if (status === 'completed' || stop === 'sequence_completed') return 'Contacted';
  if (stop === 'candidate_replied') return 'Contacted';
  if (stop === 'recruiter_stopped') return 'Contacted';
  return null;
}

export function buildAtsSyncNote(input: {
  campaignName: string;
  status: string;
  stopReason: string | null;
  qualificationStatus: string | null;
  qualificationReason?: string | null;
}): { title: string; content: string } {
  const qual = input.qualificationStatus || 'n/a';
  const stop = input.stopReason || 'n/a';
  const lines = [
    `Huntlo outreach update for campaign "${input.campaignName}".`,
    `Enrollment status: ${input.status}`,
    `Stop reason: ${stop}`,
    `Qualification: ${qual}`,
  ];
  if (input.qualificationReason?.trim()) {
    lines.push(`Qualification detail: ${input.qualificationReason.trim()}`);
  }
  lines.push(`Synced at: ${new Date().toISOString()}`);
  return {
    title: `Huntlo: ${input.status}${qual !== 'n/a' && qual !== 'pending' ? ` / ${qual}` : ''}`,
    content: lines.join('\n'),
  };
}

function syncKey(enrollment: {
  status: string;
  stopReason: string | null;
  qualificationState?: { status?: string } | null;
}): string {
  return [
    enrollment.status,
    enrollment.stopReason || '',
    enrollment.qualificationState?.status || '',
  ].join('|');
}

/**
 * Best-effort write-back of outreach outcome to the ATS (Zoho Recruit).
 * No-ops when the pool candidate was not imported from an ATS with sync support.
 */
export async function syncEnrollmentOutcomeToAts(
  enrollmentId: string
): Promise<AtsOutreachSyncResult> {
  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return { skipped: true, reason: 'invalid_enrollment' };
  }

  const enrollment = await OutreachEnrollmentModel.findById(enrollmentId);
  if (!enrollment) return { skipped: true, reason: 'enrollment_not_found' };

  const key = syncKey(enrollment);
  const prior = asRecord(enrollment.atsSyncBack);
  if (asString(prior?.lastKey) === key && prior?.lastOk === true) {
    return { skipped: true, reason: 'already_synced' };
  }

  const candidate = await SavedCandidateModel.findById(enrollment.candidateId);
  if (!candidate || candidate.deletedAt) {
    return { skipped: true, reason: 'candidate_not_found' };
  }

  const fields = asRecord(candidate.customFields) || {};
  const providerRaw =
    asString(fields.atsProvider) ||
    (candidate.sourceType === 'ats'
      ? asString(candidate.externalCandidateId)?.split(':')[0] || null
      : null);

  if (!providerRaw || providerRaw === 'zwayam' || providerRaw === 'zwayam-amplify') {
    return { skipped: true, reason: 'not_ats_or_unsupported' };
  }

  const provider = providerRaw as IntegrationProviderId;
  let adapter: AtsProvider | undefined;
  try {
    adapter = getProviderAdapter(provider) as AtsProvider;
  } catch {
    return { skipped: true, reason: 'provider_unknown', provider };
  }
  if (!adapter || typeof adapter.syncOutreachOutcome !== 'function') {
    return { skipped: true, reason: 'provider_no_sync', provider };
  }

  const atsCandidateId =
    asString(fields.atsApplyId) ||
    (() => {
      const ext = asString(candidate.externalCandidateId);
      if (!ext) return null;
      const prefix = `${provider}:`;
      if (ext.startsWith(prefix)) return ext.slice(prefix.length);
      // Heal mistaken zwayam: prefix from early Zoho imports.
      if (provider === 'zoho-recruit' && ext.startsWith('zwayam:')) {
        return ext.slice('zwayam:'.length);
      }
      return null;
    })();

  if (!atsCandidateId) {
    return { skipped: true, reason: 'missing_ats_candidate_id' };
  }

  const campaign = await OutreachCampaignModel.findById(enrollment.campaignId)
    .select('name ownerUserId')
    .lean();
  const campaignName = asString(campaign?.name) || 'Outreach campaign';
  const preferredUserId = campaign?.ownerUserId ? String(campaign.ownerUserId) : undefined;

  let integrationId: string | null = null;
  try {
    const connected = await integrationsService.listConnectedAts(
      String(enrollment.organizationId),
      preferredUserId
    );
    const match = connected.find((row) => row.provider === provider);
    integrationId = match?.integrationId || null;
  } catch {
    integrationId = null;
  }
  if (!integrationId) {
    return { skipped: true, reason: 'ats_not_connected', provider };
  }

  await integrationsService.ensureFreshAccessToken(
    String(enrollment.organizationId),
    integrationId
  );

  const fresh = await UserIntegrationModel.findById(integrationId);
  if (!fresh) return { skipped: true, reason: 'integration_missing', provider };

  const note = buildAtsSyncNote({
    campaignName,
    status: enrollment.status,
    stopReason: enrollment.stopReason,
    qualificationStatus: enrollment.qualificationState?.status || null,
    qualificationReason: enrollment.qualificationState?.reason || null,
  });
  const candidateStatus = mapEnrollmentToAtsStatus({
    status: enrollment.status,
    stopReason: enrollment.stopReason,
    qualificationStatus: enrollment.qualificationState?.status || null,
  });

  try {
    const ctx = {
      organizationId: String(fresh.organizationId),
      userId: String(fresh.userId),
      integrationId: String(fresh._id),
      accessToken: decryptSecret(fresh.encryptedAccessToken),
      refreshToken: decryptSecret(fresh.encryptedRefreshToken),
      credentials: decryptJson(fresh.encryptedCredentials),
      config: (fresh.config || {}) as Record<string, unknown>,
      email: fresh.email,
      displayName: fresh.displayName,
    };

    const result = await adapter.syncOutreachOutcome!(ctx, {
      externalCandidateId: atsCandidateId,
      jobId: asString(fields.atsJobId) || asString(candidate.sourceId),
      candidateStatus,
      noteTitle: note.title,
      noteContent: note.content,
    });

    enrollment.atsSyncBack = {
      lastKey: key,
      lastAt: new Date(),
      lastOk: result.ok,
      lastMessage: result.message,
      provider,
    };
    enrollment.markModified('atsSyncBack');
    await enrollment.save();

    candidate.customFields = {
      ...fields,
      atsStage: candidateStatus || fields.atsStage,
      atsLastSyncAt: new Date().toISOString(),
      atsLastSyncMessage: result.message,
    };
    candidate.markModified('customFields');
    await candidate.save();

    return {
      skipped: false,
      ok: result.ok,
      message: result.message,
      provider,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ATS sync failed';
    logger.warn({ err: error, enrollmentId, provider }, 'ats sync-back failed');
    enrollment.atsSyncBack = {
      lastKey: key,
      lastAt: new Date(),
      lastOk: false,
      lastMessage: message,
      provider,
    };
    enrollment.markModified('atsSyncBack');
    await enrollment.save().catch(() => undefined);
    return { skipped: false, ok: false, message, provider };
  }
}

/** Fire-and-forget wrapper for workers / stopEnrollment. */
export function queueAtsEnrollmentSync(enrollmentId: string): void {
  void syncEnrollmentOutcomeToAts(enrollmentId).catch((error) => {
    logger.warn({ err: error, enrollmentId }, 'ats sync-back queue error');
  });
}
