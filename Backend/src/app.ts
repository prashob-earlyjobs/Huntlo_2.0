import cors from 'cors';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { getCorsOptions } from './config/cors.js';
import { getEnv } from './config/env.js';
import { authRouter, onboardingRouter } from './modules/auth/index.js';
import {
  organizationRouter,
  rolesRouter,
  teamRouter,
} from './modules/organizations/index.js';
import { jobsRouter } from './modules/jobs/index.js';
import { sourcingRouter } from './modules/sourcing/index.js';
import {
  candidateImportsRouter,
  candidateListsRouter,
  candidatePoolRouter,
  candidatesRouter,
} from './modules/candidates/index.js';
import { peopleScoutRouter } from './modules/people-scout/index.js';
import {
  adminPlansRouter,
  plansRouter,
  usageRouter,
} from './modules/plans/index.js';
import { integrationsRouter } from './modules/integrations/index.js';
import { outreachRouter } from './modules/outreach/index.js';
import { conversationsRouter } from './modules/conversations/index.js';
import { huntlo360Router } from './modules/huntlo-360/index.js';
import { screeningRouter } from './modules/screening/index.js';
import { hunarWebhookRouter } from './modules/screening/hunar-webhook.routes.js';
import {
  assessmentsRouter,
  assessmentWebhookRouter,
} from './modules/assessments/index.js';
import {
  interviewsRouter,
  availabilityRouter,
  schedulingRouter,
  calendlyWebhookRouter,
} from './modules/scheduling/index.js';
import {
  billingRouter,
  dodoWebhookRouter,
  razorpayWebhookRouter,
} from './modules/billing/index.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { requestTimingMiddleware } from './middleware/request-timing.js';
import {
  healthRouter,
  openApiRouter,
  webhookRouter,
} from './modules/public/index.js';

export function createApp(): Express {
  const app = express();
  const env = getEnv();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(requestIdMiddleware);
  app.use(
    helmet({
      contentSecurityPolicy: env.APP_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors(getCorsOptions()));
  app.use(cookieParser());

  // Webhook routes require raw body capture before JSON parsing.
  app.use('/api/v1/public/webhooks', webhookRouter);
  app.use('/api/v1/webhooks/hunar', hunarWebhookRouter);
  app.use('/api/v1/public/webhooks/hunar', hunarWebhookRouter);
  app.use('/api/v1/webhooks/calendly', calendlyWebhookRouter);
  app.use('/api/v1/public/webhooks/calendly', calendlyWebhookRouter);
  app.use('/api/v1/webhooks/dodo', dodoWebhookRouter);
  app.use('/api/v1/public/webhooks/dodo', dodoWebhookRouter);
  app.use('/api/v1/webhooks/razorpay', razorpayWebhookRouter);
  app.use('/api/v1/public/webhooks/razorpay', razorpayWebhookRouter);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestTimingMiddleware);

  app.use('/api/v1/webhooks/assessments', assessmentWebhookRouter);
  app.use('/api/v1/public/webhooks/assessments', assessmentWebhookRouter);

  app.use('/api', healthRouter);
  app.use('/api/v1', openApiRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/onboarding', onboardingRouter);
  app.use('/api/v1/organization', organizationRouter);
  app.use('/api/v1/team', teamRouter);
  app.use('/api/v1/roles', rolesRouter);
  app.use('/api/v1/jobs', jobsRouter);
  app.use('/api/v1/sourcing', sourcingRouter);
  app.use('/api/v1/candidates', candidatesRouter);
  app.use('/api/v1/candidate-pool', candidatePoolRouter);
  app.use('/api/v1/candidate-lists', candidateListsRouter);
  app.use('/api/v1/candidate-imports', candidateImportsRouter);
  app.use('/api/v1/people-scout', peopleScoutRouter);
  app.use('/api/v1/plans', plansRouter);
  app.use('/api/v1/usage', usageRouter);
  app.use('/api/v1/admin/plans', adminPlansRouter);
  app.use('/api/v1/integrations', integrationsRouter);
  app.use('/api/v1/outreach', outreachRouter);
  app.use('/api/v1/conversations', conversationsRouter);
  app.use('/api/v1/huntlo-360', huntlo360Router);
  app.use('/api/v1/screenings', screeningRouter);
  app.use('/api/v1/assessments', assessmentsRouter);
  app.use('/api/v1/interviews', interviewsRouter);
  app.use('/api/v1/availability', availabilityRouter);
  app.use('/api/v1/scheduling', schedulingRouter);
  app.use('/api/v1/billing', billingRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
