import { getEnv } from '../../../config/env.js';
import {
  buildZohoOAuthAuthorizeUrl,
  exchangeZohoAuthCode,
  getZohoDcConfig,
  getZohoOAuthConfig,
  getZohoRecruitOAuthRedirectUri,
  refreshZohoAccessToken,
  resolveZohoDataCenter,
  ZOHO_RECRUIT_SCOPES,
} from '../../../providers/zoho/zoho.oauth.js';
import { fetchZohoRecruitOrg, listZohoRecruitCandidatesForJob, listZohoRecruitJobOpenings, changeZohoRecruitCandidateStatus, createZohoRecruitCandidateNote } from '../../../providers/zoho/zoho.recruit.js';
import type { AtsProvider } from './types.js';

function tokenExpiry(expiresIn: unknown): Date | null {
  const sec = Number(expiresIn);
  return Number.isFinite(sec) && sec > 0 ? new Date(Date.now() + sec * 1000) : null;
}

function dataCenterFromCtx(ctx: { config?: Record<string, unknown> }): string | undefined {
  const config = ctx.config || {};
  if (typeof config.zohoDataCenter === 'string' && config.zohoDataCenter.trim()) {
    // Heal stale rows that stored US DC while api_domain is India (or vice versa).
    const healed = resolveZohoDataCenter({
      dataCenter: config.zohoDataCenter,
      apiDomain: config.apiDomain,
    });
    // Prefer api_domain when it disagrees with a defaulted "com".
    if (config.zohoDataCenter === 'com' && healed !== 'com') return healed;
    return config.zohoDataCenter;
  }
  const fromApi = resolveZohoDataCenter({ apiDomain: config.apiDomain });
  return fromApi !== 'com' || config.apiDomain ? fromApi : undefined;
}

async function ensureAccessToken(ctx: {
  accessToken?: string | null;
  refreshToken?: string | null;
  config?: Record<string, unknown>;
}): Promise<string> {
  if (ctx.accessToken?.trim()) return ctx.accessToken.trim();
  if (!ctx.refreshToken?.trim()) {
    throw Object.assign(new Error('Zoho Recruit is not connected.'), { statusCode: 400 });
  }
  const tokens = await refreshZohoAccessToken(ctx.refreshToken, dataCenterFromCtx(ctx));
  return String(tokens.access_token || '');
}

export const zohoRecruitProvider: AtsProvider = {
  id: 'zoho-recruit',

  async connect(_ctx, body) {
    const code = String(body.code || '').trim();
    if (code) {
      const redirectUri =
        String(body.redirectUri || '').trim() ||
        getZohoRecruitOAuthRedirectUri(getEnv().FRONTEND_URL);
      const exchanged = await zohoRecruitProvider.exchangeCode!({
        code,
        redirectUri,
        extras: {
          dataCenter: body.dataCenter || body.zohoDataCenter,
          accountsServer: body.accountsServer,
        },
      });
      return { mode: 'connected', message: 'Zoho Recruit connected', tokens: exchanged };
    }

    if (!getZohoOAuthConfig()) {
      throw Object.assign(
        new Error('Zoho OAuth is not configured. Set ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET.'),
        { statusCode: 503 }
      );
    }
    return {
      mode: 'credentials_required',
      message: 'Zoho Recruit OAuth redirect will be started by the integrations service.',
    };
  },

  buildAuthorizeUrl(input) {
    return buildZohoOAuthAuthorizeUrl({
      state: input.state,
      redirectUri: input.redirectUri,
      dataCenter: undefined,
      scopes: ZOHO_RECRUIT_SCOPES,
    });
  },

  async exchangeCode(input) {
    const accountsServer =
      typeof input.extras?.accountsServer === 'string'
        ? input.extras.accountsServer
        : undefined;
    const tokens = await exchangeZohoAuthCode({
      code: input.code,
      redirectUri: input.redirectUri,
      dataCenter: input.extras?.dataCenter,
      accountsServer,
    });
    const accessToken = String(tokens.access_token || '');
    const dataCenter = resolveZohoDataCenter({
      location: input.extras?.location,
      dataCenter: tokens.dataCenter,
      accountsServer,
      apiDomain: tokens.api_domain,
    });
    let orgName: string | null = null;
    let email: string | null = null;
    try {
      const org = await fetchZohoRecruitOrg(accessToken, dataCenter);
      orgName = org.companyName;
      email = org.primaryEmail;
    } catch {
      // Org lookup is best-effort at connect; test can re-validate later.
    }

    return {
      accessToken,
      refreshToken: typeof tokens.refresh_token === 'string' ? tokens.refresh_token : null,
      expiresAt: tokenExpiry(tokens.expires_in),
      email,
      displayName: orgName || email || 'Zoho Recruit',
      providerAccountId: email || orgName || 'zoho-recruit',
      scopes: [...ZOHO_RECRUIT_SCOPES],
      config: {
        providerLabel: 'Zoho Recruit',
        zohoAuthMode: 'oauth',
        zohoDataCenter: dataCenter,
        apiDomain: tokens.api_domain ?? null,
        recruitApiHost: getZohoDcConfig(dataCenter).recruitApiHost,
      },
    };
  },

  async refresh(ctx) {
    if (!ctx.refreshToken) {
      throw Object.assign(new Error('Zoho Recruit refresh token missing'), { statusCode: 400 });
    }
    const dataCenter = dataCenterFromCtx(ctx);
    const tokens = await refreshZohoAccessToken(ctx.refreshToken, dataCenter);
    return {
      accessToken: String(tokens.access_token || ''),
      expiresAt: tokenExpiry(tokens.expires_in),
    };
  },

  async test(ctx) {
    try {
      const accessToken = await ensureAccessToken(ctx);
      const dataCenter = dataCenterFromCtx(ctx);
      const org = await fetchZohoRecruitOrg(accessToken, dataCenter);
      const label = org.companyName || org.primaryEmail || 'Zoho Recruit org';
      return {
        ok: true,
        message: `Connected to ${label}.`,
        details: {
          companyName: org.companyName,
          primaryEmail: org.primaryEmail,
          type: org.type,
          planType: org.planType,
          dataCenter: dataCenter || 'com',
        },
      };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Zoho Recruit test failed',
      };
    }
  },

  async listJobs(ctx, query) {
    const accessToken = await ensureAccessToken(ctx);
    const result = await listZohoRecruitJobOpenings(accessToken, dataCenterFromCtx(ctx), query);
    return {
      jobs: result.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        jobBoard: job.clientName || 'Zoho Recruit',
        location: job.location,
      })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },

  async listApplications(ctx, input) {
    const accessToken = await ensureAccessToken(ctx);
    const result = await listZohoRecruitCandidatesForJob(
      accessToken,
      dataCenterFromCtx(ctx),
      input.jobId,
      { page: input.page, pageSize: input.pageSize }
    );
    return {
      applications: result.candidates.map((c) => ({
        id: c.id,
        jobId: c.jobId,
        name: c.name,
        email: c.email,
        phone: c.phone,
        headline: c.headline,
        currentTitle: c.currentTitle,
        currentCompany: c.currentCompany,
        location: c.location,
        experienceYears: c.experienceYears,
        resumeUrl: c.resumeUrl,
        stage: c.stage,
      })),
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },

  async syncOutreachOutcome(ctx, input) {
    const accessToken = await ensureAccessToken(ctx);
    const dataCenter = dataCenterFromCtx(ctx);
    const candidateId = String(input.externalCandidateId || '').trim();
    if (!candidateId) {
      return { ok: false, message: 'Missing Zoho candidate id.', statusUpdated: false, noteCreated: false };
    }

    let statusUpdated = false;
    let noteCreated = false;
    const errors: string[] = [];

    const status = String(input.candidateStatus || '').trim();
    if (status) {
      try {
        await changeZohoRecruitCandidateStatus(accessToken, dataCenter, {
          candidateId,
          status,
          comments: input.noteContent.slice(0, 2000),
          jobId: input.jobId,
        });
        statusUpdated = true;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Status update failed');
      }
    }

    try {
      await createZohoRecruitCandidateNote(accessToken, dataCenter, {
        candidateId,
        title: input.noteTitle,
        content: input.noteContent,
      });
      noteCreated = true;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Note create failed');
    }

    if (!statusUpdated && !noteCreated) {
      return {
        ok: false,
        message: errors.join('; ') || 'Zoho Recruit sync failed',
        statusUpdated,
        noteCreated,
      };
    }

    return {
      ok: true,
      message: statusUpdated
        ? noteCreated
          ? `Status set to ${status}; note added.`
          : `Status set to ${status}.`
        : 'Note added (status unchanged).',
      statusUpdated,
      noteCreated,
    };
  },
};
