import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { recordCampaignActivity } from './campaign-activity.model.js';
import {
  OutreachCampaignModel,
  defaultChannelConfig,
  defaultStats,
  mapMode,
  mapModeToCampaignType,
  type CampaignMode,
  type CampaignType,
  type OutreachCampaignDocument,
} from './campaign.model.js';
import { compileBuilderToCampaign } from './compile-builder.js';
import { BUILDER_STEP_SCHEMAS, draftCampaignSchema } from './campaign.validation.js';
import type { z } from 'zod';

export const BUILDER_STEPS_SINGLE = [
  'details',
  'channel',
  'message',
  'candidates',
  'qualification',
  'review',
] as const;
export const BUILDER_STEPS_MULTI = [
  'details',
  'sequence',
  'personalize',
  'candidates',
  'qualification',
  'review',
] as const;
export type BuilderStepKey =
  | (typeof BUILDER_STEPS_SINGLE)[number]
  | (typeof BUILDER_STEPS_MULTI)[number];

type DraftInput = z.infer<typeof draftCampaignSchema>;

function stepsForMode(mode: CampaignMode): readonly string[] {
  return mode === 'single' ? BUILDER_STEPS_SINGLE : BUILDER_STEPS_MULTI;
}

async function loadCampaignForBuilder(
  organizationId: string,
  campaignId: string
): Promise<OutreachCampaignDocument> {
  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    throw new AppError(400, 'INVALID_ID', 'Invalid campaign id.');
  }
  const doc = await OutreachCampaignModel.findOne({
    _id: campaignId,
    organizationId,
    deletedAt: null,
  });
  if (!doc) throw new AppError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign not found.');
  return doc;
}

function assertBuilderEditable(doc: OutreachCampaignDocument) {
  if (!['draft', 'scheduled', 'paused'].includes(doc.status)) {
    throw new AppError(
      400,
      'CAMPAIGN_NOT_EDITABLE',
      `Cannot edit the builder for a ${doc.status} campaign.`
    );
  }
}

/**
 * Accepts both legacy BuilderState shapes (e.g. `{ steps: [...] }`) and the
 * new per-step field names (e.g. `{ sequence: [...] }`) so older frontend
 * builds keep working while the builder UI migrates. Merging is liberal —
 * compileBuilderToCampaign() is the strict gate at launch time.
 */
function normalizeStepPayload(
  stepKey: string,
  payload: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...payload };
  if (stepKey === 'sequence' && !next.sequence && Array.isArray(next.steps)) {
    next.sequence = next.steps;
  }
  if (stepKey === 'channel' && !next.channel && typeof next.selectedChannel === 'string') {
    next.channel = next.selectedChannel;
  }
  if (stepKey === 'details' && !next.mode && typeof next.campaignType === 'string') {
    next.mode = mapMode(next.campaignType as CampaignType);
  }
  return next;
}

function isStepComplete(stepKey: string, value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (stepKey === 'sequence') return Array.isArray(record.sequence) && record.sequence.length > 0;
  if (stepKey === 'message') return Boolean(record.body || record.templateId);
  if (stepKey === 'channel') return Boolean(record.channel || record.selectedChannel);
  if (stepKey === 'candidates') {
    const source = (record.candidateSource || {}) as Record<string, unknown>;
    return Boolean(
      (record.candidateIds as unknown[] | undefined)?.length ||
        (source.candidateIds as unknown[] | undefined)?.length
    );
  }
  return Object.keys(record).length > 0;
}

export const builderService = {
  BUILDER_STEPS_SINGLE,
  BUILDER_STEPS_MULTI,

  async getBuilder(organizationId: string, campaignId: string) {
    const doc = await loadCampaignForBuilder(organizationId, campaignId);
    const mode = doc.mode || mapMode(doc.campaignType);
    const steps = stepsForMode(mode);
    const builderState = (doc.builderState || {}) as Record<string, unknown>;
    const completedSteps = steps.filter((key) => isStepComplete(key, builderState[key]));
    const compiled = compileBuilderToCampaign(doc);
    const lastSavedStep = doc.builderMeta?.lastSavedStep;

    return {
      campaignId: String(doc._id),
      mode,
      campaignType: doc.campaignType,
      status: doc.status,
      version: doc.version,
      steps,
      currentStep: lastSavedStep && steps.includes(lastSavedStep) ? lastSavedStep : steps[0],
      completedSteps,
      remainingSteps: steps.filter((key) => !completedSteps.includes(key)),
      builderState,
      builderMeta: doc.builderMeta,
      warnings: compiled.warnings,
      blockers: compiled.blockers,
    };
  },

  async saveBuilderStep(
    organizationId: string,
    userId: string,
    campaignId: string,
    stepKey: string,
    payload: unknown
  ) {
    const doc = await loadCampaignForBuilder(organizationId, campaignId);
    assertBuilderEditable(doc);

    const mode = doc.mode || mapMode(doc.campaignType);
    const validSteps = stepsForMode(mode);
    if (!validSteps.includes(stepKey)) {
      throw new AppError(
        400,
        'INVALID_BUILDER_STEP',
        `"${stepKey}" is not a valid builder step for a ${mode}-channel campaign. Valid steps: ${validSteps.join(', ')}.`
      );
    }

    const schema = BUILDER_STEP_SCHEMAS[stepKey];
    const rawPayload = normalizeStepPayload(stepKey, (payload || {}) as Record<string, unknown>);
    const parsed = (schema ? schema.parse(rawPayload) : rawPayload) as Record<string, unknown>;

    const builderState = { ...((doc.builderState as Record<string, unknown>) || {}) };
    builderState[stepKey] = {
      ...((builderState[stepKey] as Record<string, unknown>) || {}),
      ...parsed,
    };
    doc.builderState = builderState;

    // Details step may retarget mode/campaignType — keep both in sync immediately.
    if (stepKey === 'details') {
      if (typeof parsed.mode === 'string') {
        doc.campaignType = mapModeToCampaignType(parsed.mode);
      } else if (typeof parsed.campaignType === 'string') {
        doc.campaignType = parsed.campaignType as CampaignType;
      }
      if (typeof parsed.name === 'string') doc.name = parsed.name;
      if (parsed.description !== undefined) doc.description = parsed.description as string | null;
      if (parsed.objective !== undefined) doc.objective = parsed.objective as string | null;
      if (parsed.jobId !== undefined) {
        doc.jobId = parsed.jobId
          ? new mongoose.Types.ObjectId(parsed.jobId as string)
          : null;
      }
    }

    doc.builderMeta = {
      lastSavedStep: stepKey,
      mode: doc.mode || mapMode(doc.campaignType),
      singleChannel:
        stepKey === 'channel'
          ? String(parsed.channel || parsed.selectedChannel || doc.builderMeta?.singleChannel || '') ||
            null
          : doc.builderMeta?.singleChannel ?? null,
    };
    doc.version += 1;
    await doc.save();

    await recordCampaignActivity({
      organizationId,
      campaignId,
      actorUserId: userId,
      type: 'builder.step_saved',
      title: `Builder step saved: ${stepKey}`,
    });

    return this.getBuilder(organizationId, campaignId);
  },

  async createDraft(organizationId: string, userId: string, input: DraftInput) {
    const campaignType: CampaignType =
      input.campaignType || mapModeToCampaignType(input.mode || 'multi');
    const doc = await OutreachCampaignModel.create({
      organizationId,
      ownerUserId: userId,
      jobId: input.jobId || null,
      name: input.name?.trim() || 'Untitled campaign',
      sourceModule: input.sourceModule || 'outreach',
      campaignType,
      status: 'draft',
      channelConfig: defaultChannelConfig(),
      sequenceSteps: [],
      stats: defaultStats(),
      builderState: {},
      version: 1,
    });

    await recordCampaignActivity({
      organizationId,
      campaignId: String(doc._id),
      actorUserId: userId,
      type: 'campaign.draft_created',
      title: 'Draft campaign created',
    });

    return {
      id: String(doc._id),
      name: doc.name,
      status: doc.status,
      mode: doc.mode,
      campaignType: doc.campaignType,
      createdAt: doc.createdAt.toISOString(),
    };
  },
};
