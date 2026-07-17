import { Router } from 'express';

import {
  requireAuth,
  requireOrganization,
  requirePermission,
  scopeToOrganizationMiddleware,
} from '../../middleware/auth.js';
import { getRequestId } from '../../middleware/request-id.js';
import { asyncHandler } from '../../shared/http/async-handler.js';
import { successResponse } from '../../shared/http/response.js';
import { outreachAiService } from './ai.service.js';
import { emailPlansService } from './plans.service.js';
import { sequenceTemplatesService } from './sequences.service.js';
import { outreachTemplatesService } from './templates.service.js';
import { listAllowedVariables } from './variables.js';
import {
  getDefaultTemplateForSlot,
  listApprovedTemplates,
  listTemplatesForSlot,
  WHATSAPP_TEMPLATE_SLOTS,
} from './whatsapp-template-catalogue.js';
import { whatsappPlansService } from './whatsapp-plans.service.js';
import {
  createSequenceTemplateSchema,
  createTemplateSchema,
  generateOutreachSchema,
  idParamSchema,
  listSequenceTemplatesQuerySchema,
  listTemplatesQuerySchema,
  previewTemplateSchema,
  rewriteOutreachSchema,
  updateSequenceTemplateSchema,
  updateTemplateSchema,
  validateVariablesSchema,
} from './outreach.validation.js';
import {
  createOutreachPlanSchema,
  createWhatsAppPlanSchema,
  listOutreachPlansQuerySchema,
  listWhatsAppPlansQuerySchema,
  planIdParamSchema,
  updateOutreachPlanSchema,
  updateWhatsAppPlanSchema,
} from './plan.validation.js';
import { campaignRoutes } from './campaign.routes.js';
import { voiceRoutes } from '../voice/voice.routes.js';

const orgAuth = [requireAuth, requireOrganization, scopeToOrganizationMiddleware];
const readPerm = requirePermission('outreach:view', 'outreach:manage');
const writePerm = requirePermission(

  'outreach:create',
  'outreach:edit',
  'outreach:manage'
);

export const outreachRouter = Router();

outreachRouter.use('/campaigns', voiceRoutes);
outreachRouter.use('/campaigns', campaignRoutes);

/* ------------------------------------------------------------------ */
/* Templates                                                            */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/templates/variables',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      { variables: listAllowedVariables() },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

outreachRouter.get(
  '/templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listTemplatesQuerySchema.parse(req.query);
    const data = await outreachTemplatesService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/templates',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.create(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

outreachRouter.get(
  '/templates/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.patch(
  '/templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.update(
      req.organizationId!,
      req.userId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.delete(
  '/templates/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.post(
  '/templates/:id/duplicate',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await outreachTemplatesService.duplicate(
      req.organizationId!,
      req.userId!,
      id
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

outreachRouter.post(
  '/templates/:id/preview',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = previewTemplateSchema.parse(req.body ?? {});
    const data = await outreachTemplatesService.preview(
      req.organizationId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* Sequence templates                                                   */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/sequence-templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listSequenceTemplatesQuerySchema.parse(req.query);
    const data = await sequenceTemplatesService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/sequence-templates',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createSequenceTemplateSchema.parse(req.body ?? {});
    const data = await sequenceTemplatesService.create(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

outreachRouter.patch(
  '/sequence-templates/:id',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const body = updateSequenceTemplateSchema.parse(req.body ?? {});
    const data = await sequenceTemplatesService.update(
      req.organizationId!,
      id,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.delete(
  '/sequence-templates/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = idParamSchema.parse(req.params);
    const data = await sequenceTemplatesService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* Email outreach plans                                                 */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/plans',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listOutreachPlansQuerySchema.parse(req.query);
    const data = await emailPlansService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/plans',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createOutreachPlanSchema.parse(req.body ?? {});
    const data = await emailPlansService.create(req.organizationId!, req.userId!, body);
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

outreachRouter.get(
  '/plans/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = planIdParamSchema.parse(req.params);
    const data = await emailPlansService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

const updateOutreachPlanHandler = asyncHandler(async (req, res) => {
  const { id } = planIdParamSchema.parse(req.params);
  const body = updateOutreachPlanSchema.parse(req.body ?? {});
  const data = await emailPlansService.update(req.organizationId!, id, body);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

outreachRouter.put('/plans/:id', ...orgAuth, writePerm, updateOutreachPlanHandler);
outreachRouter.patch('/plans/:id', ...orgAuth, writePerm, updateOutreachPlanHandler);

outreachRouter.delete(
  '/plans/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = planIdParamSchema.parse(req.params);
    const data = await emailPlansService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* WhatsApp outreach plans                                              */
/* ------------------------------------------------------------------ */

outreachRouter.get(
  '/whatsapp/templates',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      {
        templates: listApprovedTemplates(),
        slots: WHATSAPP_TEMPLATE_SLOTS.map((slot) => ({
          slot,
          templates: listTemplatesForSlot(slot),
          defaultTemplateId: getDefaultTemplateForSlot(slot)?.id ?? null,
        })),
        flow: {
          steps: [
            { step: 1, slot: 'opening', description: 'Opening Meta template (pick 1 of 2)' },
            {
              step: 2,
              slot: 'no_reply_1',
              description: 'No-reply follow-up 1 Meta template (pick 1 of 2)',
            },
            {
              step: 3,
              slot: 'no_reply_2',
              description: 'No-reply follow-up 2 Meta template (pick 1 of 2)',
            },
            {
              step: '4+',
              slot: null,
              description:
                'Reply follow-ups are free-text / AI questions (not Meta templates)',
            },
          ],
          placeholders: [
            { key: '{{1}}', meaning: 'Candidate first name (FirstName)' },
            { key: '{{2}}', meaning: 'Open role / job title (JobTitle)' },
          ],
        },
      },
      { meta: { requestId: getRequestId(req) } }
    );
  })
);

outreachRouter.get(
  '/whatsapp/plans',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const query = listWhatsAppPlansQuerySchema.parse(req.query);
    const data = await whatsappPlansService.list(req.organizationId!, query);
    successResponse(res, data.items, {
      meta: { requestId: getRequestId(req), pagination: data.pagination },
    });
  })
);

outreachRouter.post(
  '/whatsapp/plans',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = createWhatsAppPlanSchema.parse(req.body ?? {});
    const data = await whatsappPlansService.create(req.organizationId!, req.userId!, body);
    successResponse(res, data, {
      statusCode: 201,
      meta: { requestId: getRequestId(req) },
    });
  })
);

outreachRouter.get(
  '/whatsapp/plans/:id',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const { id } = planIdParamSchema.parse(req.params);
    const data = await whatsappPlansService.get(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

const updateWhatsAppPlanHandler = asyncHandler(async (req, res) => {
  const { id } = planIdParamSchema.parse(req.params);
  const body = updateWhatsAppPlanSchema.parse(req.body ?? {});
  const data = await whatsappPlansService.update(req.organizationId!, id, body);
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

outreachRouter.put('/whatsapp/plans/:id', ...orgAuth, writePerm, updateWhatsAppPlanHandler);
outreachRouter.patch('/whatsapp/plans/:id', ...orgAuth, writePerm, updateWhatsAppPlanHandler);

outreachRouter.delete(
  '/whatsapp/plans/:id',
  ...orgAuth,
  requirePermission('outreach:edit', 'outreach:delete', 'outreach:manage'),
  asyncHandler(async (req, res) => {
    const { id } = planIdParamSchema.parse(req.params);
    const data = await whatsappPlansService.remove(req.organizationId!, id);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

/* ------------------------------------------------------------------ */
/* AI + validation                                                      */
/* ------------------------------------------------------------------ */

const generateSequenceHandler = asyncHandler(async (req, res) => {
  const body = generateOutreachSchema.parse(req.body ?? {});
  const data = await outreachAiService.generate(
    req.organizationId!,
    req.userId!,
    body
  );
  successResponse(res, data, { meta: { requestId: getRequestId(req) } });
});

outreachRouter.post('/generate', ...orgAuth, writePerm, generateSequenceHandler);
outreachRouter.post('/ai/generate-sequence', ...orgAuth, writePerm, generateSequenceHandler);

outreachRouter.post(
  '/rewrite',
  ...orgAuth,
  writePerm,
  asyncHandler(async (req, res) => {
    const body = rewriteOutreachSchema.parse(req.body ?? {});
    const data = await outreachAiService.rewrite(
      req.organizationId!,
      req.userId!,
      body
    );
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);

outreachRouter.post(
  '/validate-variables',
  ...orgAuth,
  readPerm,
  asyncHandler(async (req, res) => {
    const body = validateVariablesSchema.parse(req.body ?? {});
    const data = outreachAiService.validateVariables(body);
    successResponse(res, data, { meta: { requestId: getRequestId(req) } });
  })
);
