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

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestTimingMiddleware);

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
