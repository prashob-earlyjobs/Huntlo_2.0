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
import { outreachRouter, campaignRoutes } from './modules/outreach/index.js';
import { conversationsRouter } from './modules/conversations/index.js';
import { huntlo360Router } from './modules/huntlo-360/index.js';
import { screeningRouter } from './modules/screening/index.js';
import {
  hunarVoiceWebhookRouter,
  voiceDefaultsRouter,
} from './modules/voice/index.js';
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
import {
  analyticsRouter,
  dashboardRouter,
  reportsRouter,
} from './modules/analytics/index.js';
import {
  notificationsRouter,
  realtimeRouter,
} from './modules/notifications/index.js';
import { adminJobsRouter, adminConsoleRouter } from './modules/admin/index.js';
import {
  adminWebhooksRouter,
  webhooksRouter,
} from './modules/webhooks/index.js';
import {
  auditLogsRouter,
  preferencesRouter,
  profileRouter,
  settingsRouter,
  usersMeRouter,
} from './modules/users/index.js';
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
  app.use('/api/v1/webhooks', webhooksRouter);
  app.use('/api/v1/public/webhooks', webhookRouter);
  // Spec-primary Hunar voice callbacks + legacy aliases.
  app.use('/api/integrations/voice/hunar', hunarVoiceWebhookRouter);
  app.use('/api/v1/webhooks/hunar', hunarVoiceWebhookRouter);
  app.use('/api/v1/public/webhooks/hunar', hunarVoiceWebhookRouter);
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
  app.use('/api/v1/admin/jobs', adminJobsRouter);
  app.use('/api/v1/admin/webhooks', adminWebhooksRouter);
  app.use('/api/v1/admin', adminConsoleRouter);
  app.use('/api/v1/integrations', integrationsRouter);
  app.use('/api/v1/outreach', outreachRouter);
  // Canonical campaign execution surface — same handlers as /api/v1/outreach/campaigns
  app.use('/api/v1/outreach-campaigns', campaignRoutes);
  app.use('/api/v1/conversations', conversationsRouter);
  app.use('/api/v1/huntlo-360', huntlo360Router);
  app.use('/api/v1/screenings', screeningRouter);
  app.use('/api/v1/voice', voiceDefaultsRouter);
  app.use('/api/v1/assessments', assessmentsRouter);
  app.use('/api/v1/interviews', interviewsRouter);
  app.use('/api/v1/availability', availabilityRouter);
  app.use('/api/v1/scheduling', schedulingRouter);
  app.use('/api/v1/billing', billingRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/realtime', realtimeRouter);
  app.use('/api/v1/profile', profileRouter);
  app.use('/api/v1/preferences', preferencesRouter);
  app.use('/api/v1/users', usersMeRouter);
  app.use('/api/v1/settings', settingsRouter);
  app.use('/api/v1/audit-logs', auditLogsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
