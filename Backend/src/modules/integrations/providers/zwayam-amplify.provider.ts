import {
  listAmplifyJobs,
  verifyAmplifyApiKey,
} from '../../../providers/zwayam-amplify/zwayam-amplify.client.js';
import type { AtsProvider } from './types.js';

function resolveApiKey(ctx: {
  refreshToken?: string | null;
  credentials?: Record<string, unknown> | null;
}): string {
  const fromToken = String(ctx.refreshToken || '').trim();
  if (fromToken) return fromToken;
  const fromCreds = String(ctx.credentials?.apiKey || ctx.credentials?.api_key || '').trim();
  return fromCreds;
}

export const zwayamAmplifyProvider: AtsProvider = {
  id: 'zwayam-amplify',

  async connect(_ctx, body) {
    const apiKey = String(body.apiKey || body.api_key || body.token || '').trim();
    const displayName = String(body.displayName || body.label || '').trim() || 'Zwayam Amplify';
    if (!apiKey) {
      throw Object.assign(new Error('Zwayam Amplify API key is required.'), { statusCode: 400 });
    }

    const verified = await verifyAmplifyApiKey(apiKey);
    return {
      mode: 'connected',
      message: 'Zwayam Amplify connected',
      tokens: {
        // Store API key like Calendly PAT (encrypted refreshToken).
        refreshToken: apiKey,
        accessToken: null,
        displayName,
        providerAccountId: 'zwayam-amplify',
        scopes: ['ats', 'jobs', 'applications'],
        credentials: { apiKey },
        config: {
          providerLabel: 'Zwayam Amplify',
          jobCountHint: verified.jobCount,
        },
      },
    };
  },

  async test(ctx) {
    const apiKey = resolveApiKey(ctx);
    if (!apiKey) return { ok: false, message: 'Zwayam Amplify is not connected.' };
    try {
      const verified = await verifyAmplifyApiKey(apiKey);
      return {
        ok: true,
        message:
          verified.jobCount > 0
            ? `Connected. ${verified.jobCount} job(s) available in Amplify.`
            : 'Connected. No Amplify jobs found yet.',
        details: { jobCount: verified.jobCount },
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Zwayam Amplify test failed',
      };
    }
  },

  async listJobs(ctx, query) {
    const apiKey = resolveApiKey(ctx);
    if (!apiKey) return { jobs: [], page: 1, pageSize: 20, total: 0 };
    const result = await listAmplifyJobs(apiKey, query);
    return {
      jobs: result.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        jobBoard: job.jobBoard,
        location: job.location,
      })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },

  async listApplications(ctx, input) {
    const apiKey = resolveApiKey(ctx);
    if (!apiKey) return { applications: [], page: 1, pageSize: 50, total: 0 };
    const { listAmplifyApplicationsForJob } = await import(
      '../../../providers/zwayam-amplify/zwayam-amplify.client.js'
    );
    const result = await listAmplifyApplicationsForJob(apiKey, input.jobId, {
      page: input.page,
      pageSize: input.pageSize,
    });
    return {
      applications: result.applications.map((app) => ({
        id: app.id,
        jobId: app.jobId,
        name: app.name,
        email: app.email,
        phone: app.phone,
        headline: app.headline,
        currentTitle: app.currentTitle,
        currentCompany: app.currentCompany,
        location: app.location,
        experienceYears: app.experienceYears,
        resumeUrl: app.resumeUrl,
        stage: app.stage,
      })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },
};
