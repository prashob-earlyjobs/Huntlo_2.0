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
  requiredSampleColumns,
} from './campaign-contacts.js';
import {
  getStoredVocallabsCampaign,
  listStoredVocallabsCampaigns,
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
  RyloRequestError,
  testRyloAiAgent,
  type RyloCampaign,
} from '../../providers/rylo/index.js';

const testAssignedAgentSchema = z.object({
  phone: z.string().trim().min(8).max(20),
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
    active: false,
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
      const items = stored.map((row) => liveById.get(row.campaignId) ?? campaignFromStored(row));
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
    const items = await listCampaignContacts(req.organizationId!, String(req.params.id || ''));
    successResponse(res, { items }, { meta: { requestId: getRequestId(req) } });
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
      const data = await testRyloAiAgent({ agentId: id, phone: body.phone });
      successResponse(res, data, { meta: { requestId: getRequestId(req) } });
    } catch (error) {
      if (error instanceof RyloRequestError) throw customerError(error);
      throw error;
    }
  })
);
