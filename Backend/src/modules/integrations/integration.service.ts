import mongoose from 'mongoose';

import { getEnv } from '../../config/env.js';
import { recordAuditEvent } from '../../shared/audit/audit.service.js';
import { AppError } from '../../shared/errors/app-error.js';
import { emitIntegrationUpdated } from '../../realtime/events.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { getGoogleOAuthConfig } from '../../providers/gmail/gmail.oauth.js';
import { getOutlookOAuthConfig, getOutlookOAuthRedirectUri } from '../../providers/outlook/outlook.oauth.js';
import {
  buildZohoOAuthAuthorizeUrl,
  fetchZohoUserEmail,
  getZohoOAuthConfig,
  getZohoOAuthRedirectUri,
  getZohoRecruitOAuthRedirectUri,
  normalizeZohoDataCenter,
  ZOHO_RECRUIT_SCOPES,
} from '../../providers/zoho/zoho.oauth.js';
import { resolveZohoAccountId } from '../../providers/zoho/zoho.fetch.js';
import { isGupshupWhatsAppConfigured } from '../../providers/gupshup/gupshup.config.js';
import { isHuntloWhatsAppConfigured } from '../../providers/meta-whatsapp/meta.config.js';
import { isHunarConfigured } from '../../providers/hunar/hunar.config.js';
import {
  getFutureJobsConfig,
  shouldUseFutureJobsMock,
} from '../../providers/future-jobs/futureJobs.auth.js';
import {
  createOAuthStateToken,
  createPkcePair,
  decryptJson,
  decryptSecret,
  encryptJson,
  encryptSecret,
  maskIntegrationSecrets,
} from './credentials.js';
import { OAuthStateModel } from './oauth-state.model.js';
import { huntloWhatsAppProvider } from './providers/huntlo-whatsapp.provider.js';
import { hunarProvider } from './providers/hunar.provider.js';
import {
  INTEGRATION_PROVIDERS,
  PROVIDER_CATEGORY,
  type IntegrationCategory,
  type IntegrationProviderId,
  type IntegrationStatus,
  type UserIntegrationDocument,
  UserIntegrationModel,
} from './user-integration.model.js';
import { PROVIDER_CATALOG, getProviderAdapter } from './providers/registry.js';
import type {
  AtsProvider,
  EmailProvider,
  ProviderConnectResult,
  ProviderContext,
  ProviderTokenBundle,
} from './providers/types.js';

const EMAIL_PROVIDERS: IntegrationProviderId[] = [
  'gmail',
  'outlook',
  'zoho-mail',
  'smtp',
];

const WHATSAPP_PROVIDERS: IntegrationProviderId[] = [
  'huntlo-whatsapp',
  'meta-whatsapp',
  'gupshup',
];

const OAUTH_REDIRECT_PROVIDERS: IntegrationProviderId[] = [
  'outlook',
  'zoho-mail',
  'zoho-recruit',
];

export type SafeIntegrationDto = {
  id: string;
  provider: IntegrationProviderId;
  category: IntegrationCategory;
  status: IntegrationStatus;
  isDefault: boolean;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  providerAccountId: string | null;
  config: Record<string, unknown>;
  scopes: string[];
  lastTestedAt: string | null;
  lastSyncAt: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  disconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  connectedIdentity: string | null;
};

function assertProvider(raw: string): IntegrationProviderId {
  if (!(INTEGRATION_PROVIDERS as readonly string[]).includes(raw)) {
    throw new AppError(404, 'PROVIDER_NOT_FOUND', `Unknown integration provider: ${raw}`);
  }
  return raw as IntegrationProviderId;
}

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function publicConfig(config: Record<string, unknown>): Record<string, unknown> {
  return maskIntegrationSecrets({ ...config });
}

export function toSafeIntegration(doc: UserIntegrationDocument): SafeIntegrationDto {
  const displayName = doc.displayName || null;
  const email = doc.email || null;
  const phone = doc.phone || null;
  const accountId = doc.providerAccountId || null;
  const identity =
    email ||
    phone ||
    (displayName && displayName.includes('@') ? displayName : null) ||
    (accountId && accountId.includes('@') ? accountId : null) ||
    displayName ||
    null;
  return {
    id: String(doc._id),
    provider: doc.provider,
    category: doc.category,
    status: doc.status,
    isDefault: Boolean(doc.isDefault),
    displayName,
    email,
    phone,
    providerAccountId: accountId,
    config: publicConfig((doc.config || {}) as Record<string, unknown>),
    scopes: Array.isArray(doc.scopes) ? doc.scopes : [],
    lastTestedAt: toIso(doc.lastTestedAt),
    lastSyncAt: toIso(doc.lastSyncAt),
    errorCode: doc.errorCode || null,
    errorMessage: doc.errorMessage || null,
    disconnectedAt: toIso(doc.disconnectedAt),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    connectedIdentity: identity,
  };
}

function catalogConfigured(provider: IntegrationProviderId): boolean {
  switch (provider) {
    case 'gmail':
      return Boolean(getGoogleOAuthConfig());
    case 'outlook':
      return Boolean(getOutlookOAuthConfig());
    case 'zoho-mail':
    case 'zoho-recruit':
      return Boolean(getZohoOAuthConfig());
    case 'smtp':
    case 'calendly':
    case 'zwayam-amplify':
      return true;
    case 'meta-whatsapp':
      return Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN?.trim());
    case 'gupshup':
      return isGupshupWhatsAppConfigured();
    case 'huntlo-whatsapp':
      return isHuntloWhatsAppConfigured();
    case 'hunar':
      return isHunarConfigured();
    case 'future-jobs': {
      const cfg = getFutureJobsConfig();
      return shouldUseFutureJobsMock() || Boolean(cfg.apiKey);
    }
    default:
      return false;
  }
}

function validateRedirectUri(redirectUri: string): void {
  const env = getEnv();
  const allowed = new Set<string>([
    ...env.CORS_ORIGINS,
    env.FRONTEND_URL.replace(/\/$/, ''),
  ]);
  let parsed: URL;
  try {
    parsed = new URL(redirectUri);
  } catch {
    throw new AppError(400, 'INVALID_REDIRECT_URI', 'Invalid OAuth redirect URI.');
  }
  const origin = `${parsed.protocol}//${parsed.host}`;
  const frontendOrigin = new URL(env.FRONTEND_URL).origin;
  if (!allowed.has(origin) && origin !== frontendOrigin) {
    throw new AppError(400, 'INVALID_REDIRECT_URI', 'OAuth redirect URI is not allowed.');
  }
}

async function buildProviderContext(
  doc: UserIntegrationDocument
): Promise<ProviderContext> {
  return {
    organizationId: String(doc.organizationId),
    userId: String(doc.userId),
    integrationId: String(doc._id),
    accessToken: decryptSecret(doc.encryptedAccessToken),
    refreshToken: decryptSecret(doc.encryptedRefreshToken),
    credentials: decryptJson(doc.encryptedCredentials),
    config: (doc.config || {}) as Record<string, unknown>,
    email: doc.email,
    displayName: doc.displayName,
  };
}

/** Best-effort: fill Zoho mailbox email when OAuth connect skipped account lookup. */
async function backfillZohoMailboxEmail(
  doc: UserIntegrationDocument
): Promise<UserIntegrationDocument> {
  if (doc.provider !== 'zoho-mail') return doc;
  if (doc.email && doc.email.includes('@')) return doc;
  if (String(doc.config?.zohoAuthMode || '') === 'smtp') return doc;

  try {
    const accessToken = await integrationsService.ensureFreshAccessToken(
      String(doc.organizationId),
      String(doc._id)
    );
    if (!accessToken) return doc;

    const dataCenter =
      typeof doc.config?.zohoDataCenter === 'string'
        ? doc.config.zohoDataCenter
        : undefined;

    let email: string | null = null;
    let accountId: string | null = null;
    let resolvedDc = dataCenter;

    try {
      const resolved = await resolveZohoAccountId(accessToken, dataCenter, doc.email);
      email = resolved.email;
      accountId = resolved.accountId || null;
      resolvedDc = resolved.dataCenter;
    } catch {
      // Fall through to userinfo.
    }

    if (!email || !email.includes('@')) {
      email = await fetchZohoUserEmail(accessToken, resolvedDc || dataCenter);
    }
    if (!email || !email.includes('@')) return doc;

    doc.email = email.toLowerCase();
    if (!doc.displayName) doc.displayName = email;
    if (accountId) {
      doc.providerAccountId = accountId;
    }
    doc.config = {
      ...(doc.config || {}),
      ...(accountId ? { zohoAccountId: accountId } : {}),
      ...(resolvedDc ? { zohoDataCenter: resolvedDc } : {}),
    };
    await doc.save();
  } catch {
    // Leave identity empty; UI falls back to provider label.
  }
  return doc;
}

async function clearDefaultForCategory(
  organizationId: string,
  userId: string,
  category: IntegrationCategory,
  exceptId?: string
) {
  const filter: Record<string, unknown> = {
    organizationId,
    userId,
    category,
    isDefault: true,
  };
  if (exceptId) filter._id = { $ne: exceptId };
  await UserIntegrationModel.updateMany(filter, { $set: { isDefault: false } });
}

async function ensureDefaultOnConnect(doc: UserIntegrationDocument) {
  const isEmail = EMAIL_PROVIDERS.includes(doc.provider);
  const isWhatsApp = WHATSAPP_PROVIDERS.includes(doc.provider);
  if (!isEmail && !isWhatsApp) return;

  // Huntlo WhatsApp is always the preferred default when connected.
  if (doc.provider === 'huntlo-whatsapp') {
    await clearDefaultForCategory(
      String(doc.organizationId),
      String(doc.userId),
      'whatsapp',
      String(doc._id)
    );
    doc.isDefault = true;
    await doc.save();
    return;
  }

  const existingDefault = await UserIntegrationModel.findOne({
    organizationId: doc.organizationId,
    userId: doc.userId,
    category: doc.category,
    isDefault: true,
    status: { $in: ['connected', 'needs_attention', 'testing'] },
  }).lean();
  if (!existingDefault) {
    doc.isDefault = true;
    await doc.save();
  }
}

/**
 * When platform Huntlo WhatsApp credentials are configured, auto-connect them
 * for users who have no WhatsApp connection yet, and keep Huntlo as default.
 */
async function ensureHuntloWhatsAppDefault(organizationId: string, userId: string) {
  if (!isHuntloWhatsAppConfigured()) return;

  const huntlo = await UserIntegrationModel.findOne({
    organizationId,
    userId,
    provider: 'huntlo-whatsapp',
  });

  if (huntlo && huntlo.status === 'connected') {
    const defaultWa = await UserIntegrationModel.findOne({
      organizationId,
      userId,
      category: 'whatsapp',
      isDefault: true,
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    }).lean();
    if (!defaultWa) {
      await clearDefaultForCategory(organizationId, userId, 'whatsapp', String(huntlo._id));
      huntlo.isDefault = true;
      await huntlo.save();
    }
    return;
  }

  const anyConnected = await UserIntegrationModel.findOne({
    organizationId,
    userId,
    category: 'whatsapp',
    status: { $in: ['connected', 'needs_attention', 'testing'] },
  }).lean();
  if (anyConnected) return;

  try {
    if (typeof huntloWhatsAppProvider.connect !== 'function') return;
    const result = await huntloWhatsAppProvider.connect(
      { organizationId, userId },
      {}
    );
    if (result.mode !== 'connected' || !result.tokens) return;

    const doc = await findOrCreateIntegration({
      organizationId,
      userId,
      provider: 'huntlo-whatsapp',
    });
    await persistTokens(doc, result.tokens);
    await clearDefaultForCategory(organizationId, userId, 'whatsapp', String(doc._id));
    doc.isDefault = true;
    await doc.save();
  } catch {
    // Platform WhatsApp unavailable — leave catalog disconnected.
  }
}

/**
 * When platform Hunar voice credentials are configured, auto-connect Huntlo Voice AI
 * for users who have no voice connection yet.
 */
export async function ensureHunarVoiceDefault(organizationId: string, userId: string) {
  if (!isHunarConfigured()) return;

  const hunar = await UserIntegrationModel.findOne({
    organizationId,
    userId,
    provider: 'hunar',
  });

  if (hunar && hunar.status === 'connected') {
    const defaultVoice = await UserIntegrationModel.findOne({
      organizationId,
      userId,
      category: 'voice',
      isDefault: true,
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    }).lean();
    if (!defaultVoice) {
      await clearDefaultForCategory(organizationId, userId, 'voice', String(hunar._id));
      hunar.isDefault = true;
      await hunar.save();
    }
    if (hunar.displayName !== 'Huntlo Voice AI') {
      hunar.displayName = 'Huntlo Voice AI';
      await hunar.save();
    }
    return;
  }

  const anyConnected = await UserIntegrationModel.findOne({
    organizationId,
    userId,
    category: 'voice',
    status: { $in: ['connected', 'needs_attention', 'testing'] },
  }).lean();
  if (anyConnected) return;

  try {
    if (typeof hunarProvider.connect !== 'function') return;
    const result = await hunarProvider.connect(
      { organizationId, userId },
      {}
    );
    if (result.mode !== 'connected' || !result.tokens) return;

    const doc = await findOrCreateIntegration({
      organizationId,
      userId,
      provider: 'hunar',
    });
    await persistTokens(doc, result.tokens);
    doc.displayName = 'Huntlo Voice AI';
    await clearDefaultForCategory(organizationId, userId, 'voice', String(doc._id));
    doc.isDefault = true;
    await doc.save();
  } catch {
    // Platform voice unavailable — leave catalog disconnected.
  }
}

async function persistTokens(
  doc: UserIntegrationDocument,
  tokens: ProviderTokenBundle
): Promise<UserIntegrationDocument> {
  if (tokens.accessToken !== undefined) {
    doc.encryptedAccessToken = encryptSecret(tokens.accessToken);
  }
  if (tokens.refreshToken !== undefined) {
    doc.encryptedRefreshToken = encryptSecret(tokens.refreshToken);
  }
  if (tokens.credentials) {
    doc.encryptedCredentials = encryptJson(tokens.credentials);
  }
  if (tokens.expiresAt !== undefined) doc.tokenExpiresAt = tokens.expiresAt ?? null;
  if (tokens.email !== undefined) doc.email = tokens.email ?? null;
  if (tokens.displayName !== undefined) doc.displayName = tokens.displayName ?? null;
  if (tokens.phone !== undefined) doc.phone = tokens.phone ?? null;
  if (tokens.providerAccountId !== undefined) {
    doc.providerAccountId = tokens.providerAccountId ?? null;
  }
  if (tokens.scopes) doc.scopes = tokens.scopes;
  if (tokens.config) {
    doc.config = { ...(doc.config || {}), ...tokens.config };
  }
  doc.status = 'connected';
  doc.errorCode = null;
  doc.errorMessage = null;
  doc.disconnectedAt = null;
  await doc.save();
  await ensureDefaultOnConnect(doc);
  return doc;
}

async function findOrCreateIntegration(input: {
  organizationId: string;
  userId: string;
  provider: IntegrationProviderId;
  email?: string | null;
}): Promise<UserIntegrationDocument> {
  const filter: Record<string, unknown> = {
    organizationId: input.organizationId,
    userId: input.userId,
    provider: input.provider,
  };
  if (input.email) filter.email = input.email;

  let doc = await UserIntegrationModel.findOne(filter);
  if (!doc && input.email) {
    // Reconnect same provider without email match
    doc = await UserIntegrationModel.findOne({
      organizationId: input.organizationId,
      userId: input.userId,
      provider: input.provider,
      status: { $in: ['disconnected', 'expired', 'needs_attention'] },
    }).sort({ updatedAt: -1 });
  }
  if (!doc) {
    doc = new UserIntegrationModel({
      organizationId: input.organizationId,
      userId: input.userId,
      provider: input.provider,
      category: PROVIDER_CATEGORY[input.provider],
      status: 'disconnected',
    });
  }
  return doc;
}

async function audit(
  action: string,
  organizationId: string,
  userId: string,
  metadata: Record<string, unknown>
) {
  await recordAuditEvent({
    action,
    module: 'integrations',
    organizationId,
    userId,
    metadata: maskIntegrationSecrets(metadata),
  });
}

function wrapProviderError(error: unknown): never {
  if (error instanceof AppError) throw error;
  const statusCode =
    error && typeof error === 'object' && 'statusCode' in error
      ? Number((error as { statusCode: number }).statusCode)
      : 500;
  const message = error instanceof Error ? error.message : 'Integration provider error';
  throw new AppError(
    Number.isFinite(statusCode) ? statusCode : 500,
    'INTEGRATION_PROVIDER_ERROR',
    message
  );
}

export const integrationsService = {
  /**
   * Provision platform-managed defaults (Huntlo WhatsApp + Huntlo Voice AI)
   * for a newly created user. Safe to call repeatedly.
   */
  async provisionDefaultsForUser(organizationId: string, userId: string) {
    await ensureHuntloWhatsAppDefault(organizationId, userId);
    await ensureHunarVoiceDefault(organizationId, userId);
  },

  async list(organizationId: string, userId: string, query?: { category?: string }) {
    await this.provisionDefaultsForUser(organizationId, userId);

    const filter: Record<string, unknown> = { organizationId, userId };
    if (query?.category) filter.category = query.category;

    const docs = await UserIntegrationModel.find(filter).sort({ updatedAt: -1 });
    for (const doc of docs) {
      if (
        doc.provider === 'zoho-mail' &&
        !(doc.email && doc.email.includes('@'))
      ) {
        await backfillZohoMailboxEmail(doc);
      }
    }
    const items = docs.map(toSafeIntegration);

    const catalog = PROVIDER_CATALOG.map((item) => {
      const connected = items.find(
        (row) =>
          row.provider === item.id &&
          (row.status === 'connected' ||
            row.status === 'needs_attention' ||
            row.status === 'expired' ||
            row.status === 'testing')
      );
      const google = item.id === 'gmail' ? getGoogleOAuthConfig() : null;
      return {
        ...item,
        configured: catalogConfigured(item.id),
        oauthClientId: google?.clientId ?? null,
        connection: connected || null,
      };
    });

    return { catalog, integrations: items };
  },

  async getById(organizationId: string, userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const doc = await UserIntegrationModel.findOne({
      _id: id,
      organizationId,
      userId,
    });
    if (!doc) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found.');
    return toSafeIntegration(doc);
  },

  async connect(
    organizationId: string,
    userId: string,
    providerRaw: string,
    body: Record<string, unknown>
  ) {
    const provider = assertProvider(providerRaw);
    const adapter = getProviderAdapter(provider);

    // OAuth redirect start for Outlook / Zoho when no code provided
    if (
      OAUTH_REDIRECT_PROVIDERS.includes(provider) &&
      !String(body.code || '').trim() &&
      String(body.mode || body.zohoAuthMode || 'oauth').toLowerCase() !== 'smtp'
    ) {
      return this.startOAuth(organizationId, userId, provider, body);
    }

    try {
      if (!('connect' in adapter) || typeof adapter.connect !== 'function') {
        throw new AppError(400, 'CONNECT_UNSUPPORTED', `Provider ${provider} cannot connect.`);
      }
      const result = await adapter.connect({ organizationId, userId }, body);
      if (result.mode === 'oauth_redirect') return result;
      if (result.mode === 'credentials_required' && OAUTH_REDIRECT_PROVIDERS.includes(provider)) {
        return this.startOAuth(organizationId, userId, provider, body);
      }
      if (result.mode !== 'connected' || !result.tokens) {
        return result;
      }

      const doc = await findOrCreateIntegration({
        organizationId,
        userId,
        provider,
        email: result.tokens.email,
      });
      await persistTokens(doc, result.tokens);
      if (provider === 'gmail') {
        const { ensureGmailWatch } = await import('../outreach/email-reply-sync.service.js');
        await ensureGmailWatch(organizationId, String(doc._id)).catch(() => undefined);
      }
      await audit('integration.connect', organizationId, userId, {
        provider,
        integrationId: String(doc._id),
        status: doc.status,
      });
      return {
        mode: 'connected' as const,
        message: result.message || 'Connected',
        integration: toSafeIntegration(doc),
      };
    } catch (error) {
      wrapProviderError(error);
    }
  },

  async startOAuth(
    organizationId: string,
    userId: string,
    provider: IntegrationProviderId,
    body: Record<string, unknown>
  ): Promise<ProviderConnectResult> {
    const env = getEnv();
    const adapter = getProviderAdapter(provider) as EmailProvider;

    let redirectUri = String(body.redirectUri || '').trim();
    if (!redirectUri) {
      if (provider === 'outlook') {
        redirectUri = getOutlookOAuthRedirectUri(env.FRONTEND_URL);
      } else if (provider === 'zoho-mail') {
        redirectUri = getZohoOAuthRedirectUri(env.FRONTEND_URL);
      } else if (provider === 'zoho-recruit') {
        redirectUri = getZohoRecruitOAuthRedirectUri(env.FRONTEND_URL);
      }
    }
    if (!redirectUri) {
      throw new AppError(503, 'OAUTH_REDIRECT_MISSING', 'OAuth redirect URI is not configured.');
    }
    validateRedirectUri(redirectUri);

    const state = createOAuthStateToken();
    const pkce = provider === 'outlook' ? createPkcePair() : null;
    const dataCenter =
      provider === 'zoho-mail' || provider === 'zoho-recruit'
        ? normalizeZohoDataCenter(body.dataCenter || body.zohoDataCenter)
        : undefined;

    await OAuthStateModel.create({
      state,
      organizationId,
      userId,
      provider,
      codeVerifier: pkce?.verifier ?? null,
      redirectUri,
      extras: {
        ...(dataCenter ? { dataCenter } : {}),
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    let authorizeUrl: string | null = null;
    if (provider === 'outlook' && adapter.buildAuthorizeUrl) {
      authorizeUrl = adapter.buildAuthorizeUrl({
        state,
        redirectUri,
        codeChallenge: pkce?.challenge,
      });
    } else if (provider === 'zoho-mail') {
      authorizeUrl = buildZohoOAuthAuthorizeUrl({
        state,
        redirectUri,
        dataCenter,
      });
    } else if (provider === 'zoho-recruit') {
      authorizeUrl = buildZohoOAuthAuthorizeUrl({
        state,
        redirectUri,
        dataCenter,
        scopes: ZOHO_RECRUIT_SCOPES,
      });
    }

    if (!authorizeUrl) {
      throw new AppError(
        503,
        'OAUTH_NOT_CONFIGURED',
        `${provider} OAuth is not configured on this server.`
      );
    }

    await audit('integration.oauth_start', organizationId, userId, {
      provider,
      redirectUri,
    });

    return {
      mode: 'oauth_redirect',
      authorizeUrl,
      state,
      message: 'Redirect user to authorizeUrl to continue.',
    };
  },

  async handleCallback(
    organizationId: string | null,
    userId: string | null,
    providerRaw: string,
    query: Record<string, unknown>
  ) {
    const provider = assertProvider(providerRaw);
    const code = String(query.code || '').trim();
    const state = String(query.state || '').trim();
    const error = String(query.error || '').trim();

    if (error) {
      throw new AppError(
        400,
        'OAUTH_DENIED',
        String(query.error_description || error || 'OAuth authorization denied.')
      );
    }
    if (!code || !state) {
      throw new AppError(400, 'OAUTH_CALLBACK_INVALID', 'OAuth code and state are required.');
    }

    const oauthState = await OAuthStateModel.findOne({ state, provider });
    if (!oauthState || oauthState.consumedAt || oauthState.expiresAt.getTime() < Date.now()) {
      throw new AppError(400, 'OAUTH_STATE_INVALID', 'OAuth state is invalid or expired.');
    }

    // Validate ownership when authenticated session is present
    if (organizationId && String(oauthState.organizationId) !== organizationId) {
      throw new AppError(403, 'OAUTH_STATE_MISMATCH', 'OAuth state does not belong to this organization.');
    }
    if (userId && String(oauthState.userId) !== userId) {
      throw new AppError(403, 'OAUTH_STATE_MISMATCH', 'OAuth state does not belong to this user.');
    }

    const ownerOrgId = String(oauthState.organizationId);
    const ownerUserId = String(oauthState.userId);

    oauthState.consumedAt = new Date();
    await oauthState.save();

    const adapter = getProviderAdapter(provider) as EmailProvider;
    if (!adapter.exchangeCode) {
      throw new AppError(400, 'OAUTH_UNSUPPORTED', `Provider ${provider} does not support OAuth callback.`);
    }

    try {
      const tokens = await adapter.exchangeCode({
        code,
        redirectUri: oauthState.redirectUri,
        codeVerifier: oauthState.codeVerifier || undefined,
        extras: {
          ...(oauthState.extras || {}),
          accountsServer: query['accounts-server'] || query.accounts_server,
          location: query.location,
        },
      });

      const doc = await findOrCreateIntegration({
        organizationId: ownerOrgId,
        userId: ownerUserId,
        provider,
        email: tokens.email,
      });
      await persistTokens(doc, tokens);
      if (provider === 'gmail') {
        const { ensureGmailWatch } = await import('../outreach/email-reply-sync.service.js');
        await ensureGmailWatch(ownerOrgId, String(doc._id)).catch(() => undefined);
      }
      await audit('integration.oauth_callback', ownerOrgId, ownerUserId, {
        provider,
        integrationId: String(doc._id),
      });

      return {
        mode: 'connected' as const,
        message: `${provider} connected`,
        integration: toSafeIntegration(doc),
      };
    } catch (err) {
      wrapProviderError(err);
    }
  },

  async test(organizationId: string, userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const doc = await UserIntegrationModel.findOne({ _id: id, organizationId, userId });
    if (!doc) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found.');

    const adapter = getProviderAdapter(doc.provider);
    const freshAccess = await this.ensureFreshAccessToken(organizationId, id);
    const ctx = await buildProviderContext(doc);
    if (freshAccess) ctx.accessToken = freshAccess;
    doc.status = 'testing';
    await doc.save();

    try {
      const result = await adapter.test(ctx);
      doc.lastTestedAt = new Date();
      const detailEmail =
        typeof result.details?.email === 'string'
          ? result.details.email.trim().toLowerCase()
          : '';
      if (detailEmail.includes('@')) {
        doc.email = detailEmail;
        if (!doc.displayName) doc.displayName = detailEmail;
      }
      const detailAccountId =
        typeof result.details?.accountId === 'string'
          ? result.details.accountId.trim()
          : '';
      if (detailAccountId) {
        doc.providerAccountId = detailAccountId;
        doc.config = {
          ...(doc.config || {}),
          zohoAccountId: detailAccountId,
        };
      }
      const detailDataCenter =
        typeof result.details?.dataCenter === 'string'
          ? result.details.dataCenter.trim()
          : '';
      if (detailDataCenter) {
        doc.config = {
          ...(doc.config || {}),
          zohoDataCenter: normalizeZohoDataCenter(detailDataCenter),
        };
      }
      if (result.ok) {
        doc.status = 'connected';
        doc.errorCode = null;
        doc.errorMessage = null;
      } else {
        doc.status = 'needs_attention';
        doc.errorCode = 'TEST_FAILED';
        doc.errorMessage = result.message;
      }
      await doc.save();
      emitIntegrationUpdated({
        organizationId,
        integrationId: id,
        provider: doc.provider,
        status: doc.status,
        userId,
      });
      if (!result.ok) {
        void notificationsService
          .create({
            organizationId,
            userId,
            type: 'integration_error',
            severity: 'error',
            title: 'Integration needs attention',
            message: result.message || `${doc.provider} failed a connection test.`,
            relatedEntityType: 'integration',
            relatedEntityId: id,
            actionUrl: '/dashboard/integrations',
          })
          .catch(() => undefined);
      }
      await audit('integration.test', organizationId, userId, {
        provider: doc.provider,
        integrationId: id,
        ok: result.ok,
      });
      return { ...result, integration: toSafeIntegration(doc) };
    } catch (error) {
      doc.status = 'needs_attention';
      doc.errorCode = 'TEST_FAILED';
      doc.errorMessage = error instanceof Error ? error.message : 'Test failed';
      doc.lastTestedAt = new Date();
      await doc.save();
      emitIntegrationUpdated({
        organizationId,
        integrationId: id,
        provider: doc.provider,
        status: doc.status,
        userId,
      });
      wrapProviderError(error);
    }
  },

  async patch(
    organizationId: string,
    userId: string,
    id: string,
    body: Record<string, unknown>
  ) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const doc = await UserIntegrationModel.findOne({ _id: id, organizationId, userId });
    if (!doc) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found.');

    if (typeof body.displayName === 'string') {
      doc.displayName = body.displayName.trim() || null;
    }
    if (typeof body.status === 'string' && ['disabled', 'connected', 'disconnected'].includes(body.status)) {
      doc.status = body.status as IntegrationStatus;
      if (body.status === 'disconnected') doc.disconnectedAt = new Date();
    }
    if (body.config && typeof body.config === 'object' && !Array.isArray(body.config)) {
      const safe = { ...(body.config as Record<string, unknown>) };
      // Never accept token fields through config patch
      delete safe.accessToken;
      delete safe.refreshToken;
      delete safe.password;
      delete safe.personalAccessToken;
      doc.config = { ...(doc.config || {}), ...safe };
    }

    await doc.save();
    await audit('integration.patch', organizationId, userId, {
      provider: doc.provider,
      integrationId: id,
    });
    return toSafeIntegration(doc);
  },

  async setDefault(organizationId: string, userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const doc = await UserIntegrationModel.findOne({ _id: id, organizationId, userId });
    if (!doc) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found.');
    if (doc.status === 'disconnected' || doc.status === 'disabled') {
      throw new AppError(400, 'INTEGRATION_INACTIVE', 'Cannot default a disconnected integration.');
    }

    await clearDefaultForCategory(organizationId, userId, doc.category, String(doc._id));
    doc.isDefault = true;
    await doc.save();
    await audit('integration.set_default', organizationId, userId, {
      provider: doc.provider,
      integrationId: id,
      category: doc.category,
    });
    return toSafeIntegration(doc);
  },

  async disconnect(organizationId: string, userId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid integration id.');
    }
    const doc = await UserIntegrationModel.findOne({ _id: id, organizationId, userId });
    if (!doc) throw new AppError(404, 'INTEGRATION_NOT_FOUND', 'Integration not found.');

    const wasDefault = doc.isDefault;
    const category = doc.category;
    const provider = doc.provider;

    doc.encryptedAccessToken = null;
    doc.encryptedRefreshToken = null;
    doc.encryptedCredentials = null;
    doc.tokenExpiresAt = null;
    doc.status = 'disconnected';
    doc.isDefault = false;
    doc.disconnectedAt = new Date();
    doc.errorCode = null;
    doc.errorMessage = null;
    await doc.save();
    emitIntegrationUpdated({
      organizationId,
      integrationId: id,
      provider,
      status: 'disconnected',
      userId,
    });

    if (
      wasDefault &&
      (EMAIL_PROVIDERS.includes(provider) || WHATSAPP_PROVIDERS.includes(provider))
    ) {
      const next =
        (await UserIntegrationModel.findOne({
          organizationId,
          userId,
          category,
          status: 'connected',
          provider: 'huntlo-whatsapp',
        })) ||
        (await UserIntegrationModel.findOne({
          organizationId,
          userId,
          category,
          status: 'connected',
        }).sort({ updatedAt: -1 }));
      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    await audit('integration.disconnect', organizationId, userId, {
      provider,
      integrationId: id,
    });
    return { disconnected: true, id };
  },

  /** Resolve decrypted credentials for internal campaign/scheduling use — never expose via HTTP. */
  async getDecryptedSecrets(organizationId: string, integrationId: string) {
    const doc = await UserIntegrationModel.findOne({
      _id: integrationId,
      organizationId,
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    });
    if (!doc) return null;
    return {
      provider: doc.provider,
      category: doc.category,
      accessToken: decryptSecret(doc.encryptedAccessToken),
      refreshToken: decryptSecret(doc.encryptedRefreshToken),
      credentials: decryptJson(doc.encryptedCredentials),
      config: doc.config,
      email: doc.email,
      displayName: doc.displayName,
      phone: doc.phone,
      providerAccountId: doc.providerAccountId || null,
      tokenExpiresAt: doc.tokenExpiresAt ?? null,
      integrationId: String(doc._id),
    };
  },

  /**
   * Return a usable OAuth access token, refreshing + persisting when expired.
   * Campaign send / reply sync must use this — raw access tokens expire in ~1h.
   */
  async ensureFreshAccessToken(
    organizationId: string,
    integrationId: string
  ): Promise<string | null> {
    const doc = await UserIntegrationModel.findOne({
      _id: integrationId,
      organizationId,
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    });
    if (!doc) return null;

    const current = decryptSecret(doc.encryptedAccessToken);
    const expiresAt = doc.tokenExpiresAt?.getTime() ?? 0;
    const skewMs = 60_000;
    if (current && expiresAt > Date.now() + skewMs) {
      return current;
    }

    const adapter = getProviderAdapter(doc.provider);
    const refresh =
      adapter && 'refresh' in adapter && typeof adapter.refresh === 'function'
        ? adapter.refresh.bind(adapter)
        : null;
    if (!refresh) {
      return current;
    }

    const ctx = await buildProviderContext(doc);
    if (!ctx.refreshToken && !current) return null;
    if (!ctx.refreshToken) return current;

    try {
      const tokens = await refresh(ctx);
      await persistTokens(doc, tokens);
      return tokens.accessToken || decryptSecret(doc.encryptedAccessToken);
    } catch (error) {
      doc.status = 'needs_attention';
      doc.errorCode = 'TOKEN_REFRESH_FAILED';
      doc.errorMessage =
        error instanceof Error ? error.message : 'Failed to refresh access token';
      await doc.save();
      return null;
    }
  },

  async getDefaultForCategory(
    organizationId: string,
    userId: string,
    category: IntegrationCategory
  ) {
    const doc = await UserIntegrationModel.findOne({
      organizationId,
      userId,
      category,
      isDefault: true,
      status: { $in: ['connected', 'needs_attention'] },
    });
    return doc ? toSafeIntegration(doc) : null;
  },

  /** Connected ATS providers for the organization (any team member's connection). */
  async listConnectedAts(organizationId: string, preferredUserId?: string) {
    const docs = await UserIntegrationModel.find({
      organizationId,
      category: 'ats',
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    }).sort({ isDefault: -1, updatedAt: -1 });

    const byProvider = new Map<string, (typeof docs)[number]>();
    for (const doc of docs) {
      if (preferredUserId && String(doc.userId) === preferredUserId) {
        byProvider.set(doc.provider, doc);
        continue;
      }
      if (!byProvider.has(doc.provider)) byProvider.set(doc.provider, doc);
    }

    // Only surface ATS adapters that can list jobs (step 1 Zoho Recruit = connect/test only).
    return [...byProvider.values()]
      .filter((doc) => {
        const adapter = getProviderAdapter(doc.provider) as AtsProvider;
        return typeof adapter.listJobs === 'function';
      })
      .map((doc) => ({
        provider: doc.provider,
        name:
          (typeof doc.config?.providerLabel === 'string' && doc.config.providerLabel) ||
          doc.displayName ||
          PROVIDER_CATALOG.find((item) => item.id === doc.provider)?.name ||
          doc.provider,
        integrationId: String(doc._id),
        status: doc.status,
        displayName: doc.displayName,
        isDefault: Boolean(doc.isDefault),
      }));
  },

  async resolveAtsIntegration(
    organizationId: string,
    providerRaw: string,
    preferredUserId?: string
  ) {
    const provider = assertProvider(providerRaw);
    if (PROVIDER_CATEGORY[provider] !== 'ats') {
      throw new AppError(400, 'NOT_ATS_PROVIDER', `${provider} is not an ATS integration.`);
    }

    const base = {
      organizationId,
      provider,
      status: { $in: ['connected', 'needs_attention', 'testing'] },
    };

    let doc = preferredUserId
      ? await UserIntegrationModel.findOne({ ...base, userId: preferredUserId }).sort({
          isDefault: -1,
          updatedAt: -1,
        })
      : null;
    if (!doc) {
      doc = await UserIntegrationModel.findOne(base).sort({ isDefault: -1, updatedAt: -1 });
    }
    if (!doc) {
      throw new AppError(
        404,
        'ATS_NOT_CONNECTED',
        `No connected ${provider} integration found. Connect it under Integrations → ATS.`
      );
    }
    return doc;
  },

  async listAtsJobs(
    organizationId: string,
    userId: string,
    providerRaw: string,
    query: { page?: number; pageSize?: number; search?: string } = {}
  ) {
    const doc = await this.resolveAtsIntegration(organizationId, providerRaw, userId);
    const adapter = getProviderAdapter(doc.provider);
    if (!('listJobs' in adapter) || typeof adapter.listJobs !== 'function') {
      throw new AppError(400, 'ATS_JOBS_UNSUPPORTED', 'This ATS provider cannot list jobs.');
    }
    await this.ensureFreshAccessToken(organizationId, String(doc._id));
    const fresh = await UserIntegrationModel.findById(doc._id);
    if (fresh?.errorCode === 'TOKEN_REFRESH_FAILED') {
      throw new AppError(
        400,
        'ATS_TOKEN_EXPIRED',
        fresh.errorMessage ||
          'Zoho Recruit token expired and could not be refreshed. Disconnect and reconnect under Integrations → ATS.'
      );
    }
    const ctx = await buildProviderContext(fresh || doc);
    try {
      return await adapter.listJobs(ctx, query);
    } catch (error) {
      wrapProviderError(error);
    }
  },

  async listAtsApplications(
    organizationId: string,
    userId: string,
    providerRaw: string,
    jobId: string,
    query: { page?: number; pageSize?: number } = {}
  ) {
    const doc = await this.resolveAtsIntegration(organizationId, providerRaw, userId);
    const adapter = getProviderAdapter(doc.provider);
    if (!('listApplications' in adapter) || typeof adapter.listApplications !== 'function') {
      throw new AppError(
        400,
        'ATS_APPLICATIONS_UNSUPPORTED',
        'This ATS provider cannot list applications.'
      );
    }
    await this.ensureFreshAccessToken(organizationId, String(doc._id));
    const fresh = await UserIntegrationModel.findById(doc._id);
    if (fresh?.errorCode === 'TOKEN_REFRESH_FAILED') {
      throw new AppError(
        400,
        'ATS_TOKEN_EXPIRED',
        fresh.errorMessage ||
          'Zoho Recruit token expired and could not be refreshed. Disconnect and reconnect under Integrations → ATS.'
      );
    }
    const ctx = await buildProviderContext(fresh || doc);
    try {
      return await adapter.listApplications(ctx, { jobId, ...query });
    } catch (error) {
      wrapProviderError(error);
    }
  },

  async importAtsApplications(
    organizationId: string,
    userId: string,
    providerRaw: string,
    input: { jobId: string; applicationIds: string[]; huntloJobId?: string | null }
  ) {
    const provider = assertProvider(providerRaw);
    const doc = await this.resolveAtsIntegration(organizationId, provider, userId);
    const adapter = getProviderAdapter(doc.provider);
    if (!('listApplications' in adapter) || typeof adapter.listApplications !== 'function') {
      throw new AppError(
        400,
        'ATS_APPLICATIONS_UNSUPPORTED',
        'This ATS provider cannot list applications.'
      );
    }
    await this.ensureFreshAccessToken(organizationId, String(doc._id));
    const fresh = await UserIntegrationModel.findById(doc._id);
    if (fresh?.errorCode === 'TOKEN_REFRESH_FAILED') {
      throw new AppError(
        400,
        'ATS_TOKEN_EXPIRED',
        fresh.errorMessage ||
          'ATS token expired and could not be refreshed. Disconnect and reconnect under Integrations → ATS.'
      );
    }
    const ctx = await buildProviderContext(fresh || doc);
    const { atsImportService } = await import('./ats-import.service.js');
    return atsImportService.importApplications({
      organizationId,
      userId,
      provider,
      jobId: input.jobId,
      applicationIds: input.applicationIds,
      huntloJobId: input.huntloJobId ?? null,
      listApplications: (args) => adapter.listApplications!(ctx, args),
    });
  },
};
