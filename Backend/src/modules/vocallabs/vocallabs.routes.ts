import fs from 'node:fs/promises';

import { Router } from 'express';
import { z } from 'zod';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { emitAiCallUpdated } from '../../realtime/events.js';
import { AppError } from '../../shared/errors/app-error.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import {
  listVocallabsAgentsAssignedToUser,
  vocallabsAgentIsAssignedToUser,
} from '../admin/vocallabs-agent-assignments.service.js';
import { assignedAgentSummaryFromRylo } from './assigned-agent-summary.js';
import { createImportUpload } from '../../middleware/upload.js';
import {
  addCampaignContactsFromCsv,
  addCampaignContactsFromFile,
  buildSampleContactsCsv,
  listCampaignContacts,
  markCampaignContactsCallInitiated,
  requiredSampleColumns,
} from './campaign-contacts.js';
import {
  getStoredVocallabsCampaign,
  listStoredVocallabsCampaigns,
  markCampaignActive,
  saveCampaignContactGroup,
  saveVocallabsCampaign,
  type StoredVocallabsCampaign,
} from './vocallabs-campaigns.service.js';
import {
  activateRyloCampaign,
  attachRyloCampaignContactGroup,
  createRyloCampaign,
  createRyloCampaignContactGroup,
  getRyloAiAgent,
  listRyloCampaigns,
  updateRyloAiAgent,
  RyloRequestError,
  createRyloTestContact,
  type RyloCampaign,
} from '../../providers/rylo/index.js';
import { listRyloPostCallDataKeys } from '../../providers/rylo/rylo.post-call-data.js';

const updateAssignedAgentSchema = z.object({
  welcomeMessage: z.string().max(8_000),
  agentPrompt: z.string().max(80_000),
});

const PROMPT_PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function promptVariableKeys(...texts: string[]): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const text of texts) {
    for (const match of text.matchAll(PROMPT_PLACEHOLDER)) {
      const key = match[1]?.trim();
      if (!key || key === 'contact_id' || seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  }
  return keys;
}

function inputsForScript(
  existing: unknown,
  contactId: string,
  keys: string[]
): Record<string, unknown> {
  const current = asRecord(existing);
  const inputs: Record<string, unknown> = {};
  const savedContactId =
    contactId || (typeof current.contact_id === 'string' ? current.contact_id.trim() : '');
  if (savedContactId) inputs.contact_id = savedContactId;
  for (const key of keys) {
    const previous = current[key];
    inputs[key] =
      previous && typeof previous === 'object'
        ? previous
        : { key, about: `Value for ${key.replace(/_/g, ' ')}` };
  }
  return inputs;
}

const testAssignedAgentSchema = z.object({
  phone: z.string().trim().min(8).max(32),
  values: z.record(z.string(), z.string().max(500)).optional(),
});

const createCampaignSchema = z.object({
  name: z.string().trim().min(1).max(120),
  agentId: z.string().trim().min(1).max(80),
});

const uploadContactsSchema = z.object({
  csv: z.string().trim().min(1).max(200_000),
});

const contactFileUpload = createImportUpload().single('file');

function customerError(error: RyloRequestError): AppError {
  const message = error.message.replace(/\bVocallabs\b/gi, "Huntlo");
  return new AppError(error.statusCode, error.code, message);
}

function campaignFromStored(row: StoredVocallabsCampaign): RyloCampaign {
  return {
    id: row.campaignId,
    name: row.name,
    agentId: row.agentId,
    agentName: '',
    active: row.active,
    concurrency: null,
    pendingCount: 0,
    contactCount: 0,
    createdAt: row.createdAt,
  };
}

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('outreach:view', 'outreach:manage');
const testPerm = requirePermission(
  'outreach:create',
  'outreach:edit',
  'outreach:launch',
  'outreach:manage'
);

export const vocallabsRouter = Router();

vocallabsRouter.get(
  '/campaigns',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const stored = await listStoredVocallabsCampaigns(req.organizationId!);
    if (!stored.length) {
      successResponse(res, { items: [] }, { meta: { requestId: getRequestId(req) } });
      return;
    }
    try {
      const live = await listRyloCampaigns();
      const liveById = new Map(live.map((campaign) => [campaign.id, campaign]));
      const items = stored.map((row) => {
        const live = liveById.get(row.campaignId) ?? campaignFromStored(row);
        return { ...live, active: live.active || row.active };
      });
      successResponse(res, { items }, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) {
        successResponse(
          res,
          { items: stored.map(campaignFromStored) },
          { meta: { requestId: getRequestId(req) } }
        );
        return;
      }
      throw error;
    }
  })
);

vocallabsRouter.post(
  '/campaigns',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const body = createCampaignSchema.parse(req.body ?? {});
    const assigned = await vocallabsAgentIsAssignedToUser(req.userId!, body.agentId);
    if (!assigned) throw AppError.notFound('Agent not found');
    try {
      const data = await createRyloCampaign({ name: body.name, agentId: body.agentId });
      await saveVocallabsCampaign({
        organizationId: req.organizationId!,
        userId: req.userId!,
        campaignId: data.id,
        name: data.name,
        agentId: data.agentId,
      });
      successResponse(res, data, { statusCode: 201, meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

async function columnsForCampaign(organizationId: string, campaignId: string): Promise<string[]> {
  const campaign = await getStoredVocallabsCampaign(organizationId, campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  try {
    const agent = await getRyloAiAgent(campaign.agentId);
    return requiredSampleColumns({
      inputsNeeded: agent.record?.inputs_needed,
      texts: [agent.welcomeMessage, agent.agentPrompt, agent.analyticsPrompt],
    });
  } catch (error) {
    if (error instanceof RyloRequestError) throw customerError(error);
    throw error;
  }
}

vocallabsRouter.get(
  '/campaigns/:id/contact-sample',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const columns = await columnsForCampaign(req.organizationId!, String(req.params.id || ''));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="campaign-contacts.csv"');
    res.send(buildSampleContactsCsv(columns));
  })
);

async function requireLaunchCampaign(organizationId: string, campaignId: string) {
  const campaign = await getStoredVocallabsCampaign(organizationId, campaignId);
  if (!campaign) throw AppError.notFound('Campaign not found');
  const contacts = await listCampaignContacts(organizationId, campaignId);
  if (!contacts.length) throw AppError.validation('Add candidates before launching.');
  return { campaign, contacts };
}

vocallabsRouter.post(
  '/campaigns/:id/launch/group',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const campaignId = String(req.params.id || '');
    const { campaign, contacts } = await requireLaunchCampaign(req.organizationId!, campaignId);
    try {
      const launched = await createRyloCampaignContactGroup({
        campaignName: campaign.name,
        contacts,
      });
      await saveCampaignContactGroup({
        organizationId: req.organizationId!,
        campaignId,
        groupId: launched.groupId,
        groupName: launched.groupName,
      });
      successResponse(res, launched, { statusCode: 201, meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

vocallabsRouter.post(
  '/campaigns/:id/launch/attach',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const campaignId = String(req.params.id || '');
    const { campaign, contacts } = await requireLaunchCampaign(req.organizationId!, campaignId);
    try {
      await attachRyloCampaignContactGroup({
        campaignId: campaign.campaignId,
        groupId: campaign.contactGroupId,
        contacts,
      });
      successResponse(res, { attached: true }, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

vocallabsRouter.post(
  '/campaigns/:id/launch/start',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const campaignId = String(req.params.id || '');
    const campaign = await getStoredVocallabsCampaign(req.organizationId!, campaignId);
    if (!campaign) throw AppError.notFound('Campaign not found');
    try {
      await activateRyloCampaign(campaign.campaignId);
      await markCampaignActive(req.organizationId!, campaign.campaignId);
      await markCampaignContactsCallInitiated(req.organizationId!, campaignId);
      emitAiCallUpdated({
        organizationId: req.organizationId!,
        campaignId,
        contactId: '',
        callStatus: 'call initiated',
      });
      successResponse(res, { active: true }, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

vocallabsRouter.get(
  '/campaigns/:id/contacts',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const campaignId = String(req.params.id || '');
    const items = await listCampaignContacts(req.organizationId!, campaignId);
    const campaign = await getStoredVocallabsCampaign(req.organizationId!, campaignId);
    const answerColumns = campaign
      ? await listRyloPostCallDataKeys(campaign.agentId).catch(() => [])
      : [];
    successResponse(res, { items, answerColumns }, { meta: { requestId: getRequestId(req) } });
  })
);

vocallabsRouter.post(
  '/campaigns/:id/contacts',
  ...orgAuth,
  testPerm,
  contactFileUpload,
  asyncHandler(async (req, res) => {
    const campaignId = String(req.params.id || '');
    const columns = await columnsForCampaign(req.organizationId!, campaignId);
    if (req.file) {
      try {
        const buffer = await fs.readFile(req.file.path);
        const items = await addCampaignContactsFromFile({
          organizationId: req.organizationId!,
          campaignId,
          filename: req.file.originalname,
          buffer,
          columns,
        });
        successResponse(res, { items }, { statusCode: 201, meta: { requestId: getRequestId(req) } });
      } finally {
        await fs.unlink(req.file.path).catch(() => undefined);
      }
      return;
    }
    const body = uploadContactsSchema.parse(req.body ?? {});
    const items = await addCampaignContactsFromCsv({
      organizationId: req.organizationId!,
      campaignId,
      csv: body.csv,
      columns,
    });
    successResponse(res, { items }, { statusCode: 201, meta: { requestId: getRequestId(req) } });
  })
);

vocallabsRouter.get(
  '/agents',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const assigned = await listVocallabsAgentsAssignedToUser(req.userId!);
    const items = await Promise.all(
      assigned.map(async (item) => {
        try {
          const agent = await getRyloAiAgent(item.id);
          return assignedAgentSummaryFromRylo(item, agent);
        } catch {
          return item;
        }
      })
    );
    successResponse(res, { items }, { meta: { requestId: getRequestId(req) } });
  })
);

vocallabsRouter.get(
  '/agents/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const assigned = await vocallabsAgentIsAssignedToUser(req.userId!, id);
    if (!assigned) throw AppError.notFound('Agent not found');
    try {
      const data = await getRyloAiAgent(id);
      successResponse(res, data, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

vocallabsRouter.patch(
  '/agents/:id',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const assigned = await vocallabsAgentIsAssignedToUser(req.userId!, id);
    if (!assigned) throw AppError.notFound('Agent not found');
    const body = updateAssignedAgentSchema.parse(req.body ?? {});
    try {
      const agent = await getRyloAiAgent(id);
      const keys = promptVariableKeys(body.welcomeMessage, body.agentPrompt);
      await updateRyloAiAgent({
        agentId: id,
        name: agent.name,
        contactId: agent.contactId,
        welcomeMessage: body.welcomeMessage,
        agentPrompt: body.agentPrompt,
        analyticsPrompt: agent.analyticsPrompt,
        language: agent.language,
        callTokenId: agent.callTokenId,
        voiceId: agent.voiceId,
        inputsNeeded: inputsForScript(agent.record.inputs_needed, agent.contactId, keys),
      });
      const fresh = await getRyloAiAgent(id);
      successResponse(
        res,
        {
          ...fresh,
          welcomeMessage: body.welcomeMessage.trim(),
          agentPrompt: body.agentPrompt.trim(),
        },
        { meta: { requestId: getRequestId(req) } }
      );
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);

vocallabsRouter.post(
  '/agents/:id/test',
  ...orgAuth,
  testPerm,
  asyncHandler(async (req, res) => {
    const id = String(req.params.id || '').trim();
    const assigned = await vocallabsAgentIsAssignedToUser(req.userId!, id);
    if (!assigned) throw AppError.notFound('Agent not found');
    const body = testAssignedAgentSchema.parse(req.body ?? {});
    try {
      const data = await createRyloTestContact({
        agentId: id,
        phone: body.phone,
        values: body.values ?? {},
      });
      successResponse(res, data, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);
