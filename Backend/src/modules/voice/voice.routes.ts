import { Router } from 'express';
import { z } from 'zod';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { AppError } from '../../shared/errors/app-error.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { VoiceCallModel } from './voice-call.model.js';
import {
  buildJdVoiceTokens,
  defaultResultPrompt,
  defaultResultSchema,
  launchBulkVoiceCalls,
  normalizeVoiceRetryConfig,
  resolveIntroduction,
  resolveVoiceTokens,
  syncVoiceAgent,
} from './voice-dialer.service.js';
import { buildRoshniAgentPrompt, qualificationQuestionsForRoshni } from './roshni-prompt.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const managePerm = requirePermission('outreach:manage', 'outreach:view');

const voiceAgentBodySchema = z.object({
  objective: z.string().min(1).max(4000).optional(),
  introduction: z.string().max(1000).optional().nullable(),
  /** When omitted, Huntlo builds the full Roshni screening agent prompt from the campaign JD. */
  agentPrompt: z.string().max(60000).optional().nullable(),
  useRoshni: z.boolean().optional(),
  resultPrompt: z.string().max(8000).optional().nullable(),
  resultFields: z.array(z.string()).max(40).optional(),
  tone: z.enum(['professional', 'friendly', 'direct']).optional(),
  language: z.string().max(40).optional().nullable(),
  voicePersona: z.string().max(40).optional().nullable(),
  personaName: z.string().max(80).optional().nullable(),
  callAttempts: z.number().int().min(1).max(11).optional(),
  retryIntervalHours: z.number().int().optional(),
  retriesEnabled: z.boolean().optional(),
});

const launchVoiceBodySchema = z.object({
  candidateIds: z.array(z.string()).max(500).optional(),
  enrollmentIds: z.array(z.string()).max(500).optional(),
});

export const voiceRoutes = Router({ mergeParams: true });

/** POST /api/v1/outreach/campaigns/:id/voice-agent */
voiceRoutes.post(
  '/:id/voice-agent',
  ...orgAuth,
  managePerm,
  asyncHandler(async (req, res) => {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const body = voiceAgentBodySchema.parse(req.body || {});

    const campaign = await OutreachCampaignModel.findOne({
      _id: id,
      organizationId,
      deletedAt: null,
    });
    if (!campaign) throw AppError.notFound('Campaign not found');

    const jdTokens = await buildJdVoiceTokens(
      campaign.jobId ? String(campaign.jobId) : null
    );
    const tokens = {
      ...jdTokens,
      campaign_name: campaign.name,
    };

    const customPrompt = String(body.agentPrompt || '').trim();
    const useRoshni = body.useRoshni !== false && (!customPrompt || customPrompt.includes('You are Roshni'));

    const roshni = useRoshni
      ? await buildRoshniAgentPrompt({
          jobId: campaign.jobId ? String(campaign.jobId) : null,
          organizationId,
          campaignName: campaign.name,
          questions: qualificationQuestionsForRoshni(campaign.qualificationConfig),
        })
      : null;

    const agentPrompt = useRoshni
      ? customPrompt.includes('You are Roshni')
        ? resolveVoiceTokens(customPrompt, {
            ...tokens,
            ...roshni!.tokens,
          })
        : roshni!.agentPrompt
      : resolveVoiceTokens(customPrompt, tokens);
    const objective = resolveVoiceTokens(
      String(body.objective || '').trim() || roshni?.objective || `Outreach for ${campaign.name}`,
      tokens
    );
    const introduction = resolveIntroduction(
      body.tone,
      body.introduction
        ? resolveVoiceTokens(body.introduction, tokens)
        : roshni?.introduction || null
    );
    const resultPrompt =
      String(body.resultPrompt || '').trim() ||
      roshni?.resultPrompt ||
      defaultResultPrompt(body.resultFields);

    const synced = await syncVoiceAgent({
      name: `${campaign.name} · voice`.slice(0, 80),
      objective,
      introduction,
      agentPrompt,
      resultPrompt,
      resultSchema: roshni?.resultSchema || defaultResultSchema(),
      tone: body.tone,
      language: body.language,
      voicePersona: body.voicePersona,
      personaName: body.personaName,
      existingAgentId:
        typeof campaign.voiceAgentConfig?.agentId === 'string'
          ? campaign.voiceAgentConfig.agentId
          : null,
    });

    const retry = normalizeVoiceRetryConfig({
      enabled: body.retriesEnabled,
      callAttempts: body.callAttempts,
      retryIntervalHours: body.retryIntervalHours,
    });

    campaign.voiceAgentConfig = {
      agentId: synced.agentId,
      objective,
      introduction,
      agentPrompt,
      resultPrompt,
      tone: body.tone || 'professional',
      language: String(body.language || 'ENGLISH').toUpperCase(),
      voicePersona: body.voicePersona || null,
      personaName: body.personaName || null,
      retry,
      updatedAt: new Date().toISOString(),
    };
    campaign.markModified('voiceAgentConfig');
    if (!campaign.channelConfig.ai_voice.enabled) {
      campaign.channelConfig.ai_voice.enabled = true;
      campaign.markModified('channelConfig');
    }
    await campaign.save();

    successResponse(
      res,
      {
        agentId: synced.agentId,
        voiceAgentConfig: campaign.voiceAgentConfig,
        preview: { introduction, objective, agentPrompt },
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

/** GET /api/v1/outreach/campaigns/:id/voice-calls */
voiceRoutes.get(
  '/:id/voice-calls',
  ...orgAuth,
  managePerm,
  asyncHandler(async (req, res) => {
    const organizationId = req.organizationId!;
    const id = String(req.params.id);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

    const campaign = await OutreachCampaignModel.findOne({
      _id: id,
      organizationId,
      deletedAt: null,
    })
      .select('_id')
      .lean();
    if (!campaign) throw AppError.notFound('Campaign not found');

    const filter = { organizationId, campaignId: id };
    const [rows, total] = await Promise.all([
      VoiceCallModel.find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VoiceCallModel.countDocuments(filter),
    ]);

    successResponse(
      res,
      {
        items: rows.map((row) => ({
          id: String(row._id),
          callId: row.callId,
          requestId: row.requestId,
          candidateId: row.candidateId ? String(row.candidateId) : null,
          enrollmentId: row.enrollmentId ? String(row.enrollmentId) : null,
          contactName: row.contactName,
          toNumber: row.toNumber,
          status: row.status,
          lifecycleStatus: row.lifecycleStatus,
          durationSeconds: row.durationSeconds,
          durationMinutes: row.durationMinutes,
          retriesLeft: row.retriesLeft,
          recordingUrl: row.recordingUrl,
          summaryText: row.summaryText,
          callResult: row.callResult,
          startedAt: row.startedAt,
          endedAt: row.endedAt,
          updatedAt: row.updatedAt,
        })),
        page,
        limit,
        total,
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

/** POST /api/v1/outreach/campaigns/:id/launch-voice — bulk voice-only dial */
voiceRoutes.post(
  '/:id/launch-voice',
  ...orgAuth,
  managePerm,
  asyncHandler(async (req, res) => {
    const organizationId = req.organizationId!;
    const userId = req.userId!;
    const id = String(req.params.id);
    const body = launchVoiceBodySchema.parse(req.body || {});

    const campaign = await OutreachCampaignModel.findOne({
      _id: id,
      organizationId,
      deletedAt: null,
    });
    if (!campaign) throw AppError.notFound('Campaign not found');

    const agentId = String(campaign.voiceAgentConfig?.agentId || '').trim();
    if (!agentId) {
      throw new AppError(
        400,
        'VOICE_AGENT_REQUIRED',
        'Save a voice agent before launching AI voice calls.'
      );
    }

    const { OutreachEnrollmentModel } = await import('../outreach/enrollment.model.js');
    const { SavedCandidateModel } = await import('../candidates/saved-candidate.model.js');

    const enrollmentFilter: Record<string, unknown> = {
      organizationId,
      campaignId: id,
      'contactAvailability.optedOut': { $ne: true },
    };
    if (body.enrollmentIds?.length) {
      enrollmentFilter._id = { $in: body.enrollmentIds };
    }

    const enrollments = await OutreachEnrollmentModel.find(enrollmentFilter).lean();
    let candidateIds = enrollments.map((e) => String(e.candidateId));
    if (body.candidateIds?.length) {
      const allow = new Set(body.candidateIds);
      candidateIds = candidateIds.filter((cid) => allow.has(cid));
    }

    const candidates = await SavedCandidateModel.find({
      _id: { $in: candidateIds },
      organizationId,
      deletedAt: null,
    })
      .select('name phone')
      .lean();

    const byCandidate = new Map(candidates.map((c) => [String(c._id), c]));
    const contacts = enrollments
      .map((e) => {
        const c = byCandidate.get(String(e.candidateId));
        if (!c?.phone) return null;
        return {
          candidateId: String(e.candidateId),
          enrollmentId: String(e._id),
          name: String(c.name || 'Candidate'),
          phone: String(c.phone),
          customData: {
            key_0: String(campaign.name),
            key_1: String(campaign._id),
          },
        };
      })
      .filter(Boolean) as Array<{
      candidateId: string;
      enrollmentId: string;
      name: string;
      phone: string;
      customData: Record<string, string>;
    }>;

    const retry = normalizeVoiceRetryConfig(
      (campaign.voiceAgentConfig?.retry as {
        maxRetryCount?: number;
        retryIntervalHours?: number;
      }) || null
    );

    const launched = await launchBulkVoiceCalls({
      organizationId,
      userId,
      source: 'outreach',
      campaignId: id,
      agentId,
      contacts,
      retryConfig: retry,
    });

    if (campaign.status === 'draft' || campaign.status === 'scheduled') {
      campaign.status = 'running';
      campaign.launchedAt = campaign.launchedAt || new Date();
      await campaign.save();
    }

    successResponse(res, launched, { meta: { requestId: getRequestId(req) } });
  })
);
