import mongoose from 'mongoose';

import { getEnv } from '../../config/env.js';
import { getLogger } from '../../config/logger.js';
import { sendMetaWhatsAppTemplate } from '../../providers/meta-whatsapp/meta.send.js';
import {
  getHuntloWhatsAppCredentials,
  isHuntloWhatsAppConfigured,
} from '../../providers/meta-whatsapp/meta.config.js';
import { AppError } from '../../shared/errors/app-error.js';
import { normalizePhone } from '../../shared/validation/phone.js';
import { UserModel } from '../auth/user.model.js';
import {
  WhatsAppTemplateModel,
  toPublicWhatsAppTemplate,
  type PublicWhatsAppTemplate,
  type WhatsAppTemplateDocument,
} from './whatsapp-template.model.js';
import {
  WhatsAppLifecycleSendModel,
  type WhatsAppLifecycleSendDocument,
} from './whatsapp-lifecycle-send.model.js';

type WhatsAppTemplateDefault = {
  key: string;
  name: string;
  metaTemplateName: string | null;
  bodyText: string;
  enabled: boolean;
};

/**
 * Meta-approved lifecycle templates.
 * Body uses {{1}} (first name). CTA URL button uses a separate dynamic param ({{2}} in product copy).
 * Override names via env, e.g. HUNTLO_WA_TEMPLATE_SIGNUP=welcome_signup
 */
const WHATSAPP_TEMPLATE_DEFAULTS: WhatsAppTemplateDefault[] = [
  {
    key: 'event.signup_whatsapp',
    name: 'Signup - welcome',
    metaTemplateName: 'welcome_signup',
    bodyText: [
      'Hi {{1}},',
      'Welcome to Huntlo',
      'Your 7-day trial is now active.',
      "Let's help you find your first candidate today.",
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.no_login_whatsapp',
    name: 'No login - workspace ready',
    metaTemplateName: 'workspace_ready_signup',
    bodyText: [
      'Hi {{1}},',
      'Your Huntlo workspace is ready.',
      'It takes less than a minute to discover your first candidate.',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.profile_unlocked_whatsapp',
    name: 'Profile unlocked - launch campaign',
    metaTemplateName: 'campaign_reachout',
    bodyText: [
      'You found the right candidate.',
      'Now reach out in minutes using Email or WhatsApp campaigns.',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.interested_candidate_whatsapp',
    name: 'Interested candidate',
    metaTemplateName: 'candidate_interested',
    bodyText: [
      'A candidate is interested.',
      'Review the conversation and move them to the next stage.',
    ].join('\n'),
    enabled: true,
  },
];

export const WHATSAPP_LIFECYCLE_TEMPLATE_KEYS = {
  signup: 'event.signup_whatsapp',
  noLogin: 'event.no_login_whatsapp',
  profileUnlocked: 'event.profile_unlocked_whatsapp',
  interestedCandidate: 'event.interested_candidate_whatsapp',
} as const;

const WHATSAPP_LIFECYCLE_DELAYS_MS = {
  signup: 0,
  noLogin: 2 * 60 * 60 * 1000,
  profileUnlocked: 0,
  interestedCandidate: 0,
} as const;

/** Env overrides for approved Meta template names. */
const META_TEMPLATE_ENV_KEYS: Record<string, string> = {
  'event.signup_whatsapp': 'HUNTLO_WA_TEMPLATE_SIGNUP',
  'event.no_login_whatsapp': 'HUNTLO_WA_TEMPLATE_NO_LOGIN',
  'event.profile_unlocked_whatsapp': 'HUNTLO_WA_TEMPLATE_PROFILE_UNLOCKED',
  'event.interested_candidate_whatsapp': 'HUNTLO_WA_TEMPLATE_INTERESTED',
};

/**
 * Templates whose Meta CTA URL button has a dynamic suffix.
 * - welcome_signup: static Start Here URL (sending a param → Meta #132018). Opt in with HUNTLO_WA_SIGNUP_URL_BUTTON=1.
 * - workspace_ready_signup / campaign_reachout: URL CTA requires the dynamic param (missing → Meta #131008).
 */
function templateHasDynamicUrlButton(templateKey: string): boolean {
  if (
    templateKey === 'event.no_login_whatsapp' ||
    templateKey === 'event.profile_unlocked_whatsapp'
  ) {
    const envKey =
      templateKey === 'event.no_login_whatsapp'
        ? 'HUNTLO_WA_NO_LOGIN_URL_BUTTON'
        : 'HUNTLO_WA_PROFILE_UNLOCKED_URL_BUTTON';
    const flag = String(process.env[envKey] || '1').trim().toLowerCase();
    return flag !== '0' && flag !== 'false' && flag !== 'no';
  }
  if (templateKey === 'event.signup_whatsapp') {
    const flag = String(process.env.HUNTLO_WA_SIGNUP_URL_BUTTON || '').trim().toLowerCase();
    return flag === '1' || flag === 'true' || flag === 'yes';
  }
  return false;
}

/** Body {{n}} count for approved Meta templates (do not invent extras). */
function resolveBodyParameters(
  templateKey: string,
  firstName: string
): string[] {
  if (
    templateKey === 'event.signup_whatsapp' ||
    templateKey === 'event.no_login_whatsapp'
  ) {
    return [firstName];
  }
  // campaign_reachout (and others without body vars) — empty body component.
  return [];
}

function resolveCtaButtonLabel(templateKey: string): string | null {
  if (templateKey === 'event.no_login_whatsapp') return 'Visit website';
  if (templateKey === 'event.signup_whatsapp') return 'Start Here';
  if (templateKey === 'event.profile_unlocked_whatsapp') return 'Launch Campaign';
  // candidate_interested has no CTA button in Meta.
  return null;
}

let seedPromise: Promise<void> | null = null;

function log() {
  return getLogger().child({ component: 'whatsapp-templates' });
}

async function ensureWhatsAppTemplatesSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      for (const def of WHATSAPP_TEMPLATE_DEFAULTS) {
        await WhatsAppTemplateModel.updateOne(
          { key: def.key },
          {
            $setOnInsert: {
              key: def.key,
              name: def.name,
              enabled: def.enabled,
            },
            $set: {
              // Keep preview copy + Meta name in sync with product defaults.
              bodyText: def.bodyText,
              ...(def.metaTemplateName
                ? { metaTemplateName: def.metaTemplateName }
                : {}),
            },
          },
          { upsert: true }
        );
      }
    })().finally(() => {
      seedPromise = null;
    });
  }
  await seedPromise;
}

function slugifyKey(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return base || 'template';
}

async function uniqueKey(name: string): Promise<string> {
  const base = slugifyKey(name);
  let candidate = `wa.${base}`;
  let attempt = 0;
  while (await WhatsAppTemplateModel.exists({ key: candidate })) {
    attempt += 1;
    candidate = `wa.${base}_${attempt}`;
    if (attempt > 50) {
      candidate = `wa.${base}_${new mongoose.Types.ObjectId().toHexString().slice(-8)}`;
      break;
    }
  }
  return candidate;
}

function toObjectId(
  value: string | mongoose.Types.ObjectId
): mongoose.Types.ObjectId {
  return typeof value === 'string' ? new mongoose.Types.ObjectId(value) : value;
}

function resolveMetaTemplateName(
  templateKey: string,
  storedName: string | null | undefined
): string | null {
  const envKey = META_TEMPLATE_ENV_KEYS[templateKey];
  const fromEnv = envKey ? String(process.env[envKey] || '').trim() : '';
  if (fromEnv) return fromEnv;
  const stored = String(storedName || '').trim();
  if (stored) return stored;
  const fallback = WHATSAPP_TEMPLATE_DEFAULTS.find((item) => item.key === templateKey);
  return fallback?.metaTemplateName || null;
}

function resolveMetaLanguage(): string {
  return String(process.env.HUNTLO_WA_TEMPLATE_LANGUAGE || process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || 'en').trim() || 'en';
}

/**
 * Post-login destinations for lifecycle WhatsApp CTAs (same `?next=` pattern as email/auth guard).
 * Override per template via HUNTLO_WA_NEXT_* env.
 */
const LIFECYCLE_NEXT_PATHS: Record<string, string> = {
  'event.signup_whatsapp': '/dashboard',
  'event.no_login_whatsapp': '/dashboard/search',
  'event.profile_unlocked_whatsapp': '/dashboard/outreach',
  'event.interested_candidate_whatsapp': '/dashboard/conversations',
};

const LIFECYCLE_NEXT_ENV_KEYS: Record<string, string> = {
  'event.signup_whatsapp': 'HUNTLO_WA_NEXT_SIGNUP',
  'event.no_login_whatsapp': 'HUNTLO_WA_NEXT_NO_LOGIN',
  'event.profile_unlocked_whatsapp': 'HUNTLO_WA_NEXT_PROFILE_UNLOCKED',
  'event.interested_candidate_whatsapp': 'HUNTLO_WA_NEXT_INTERESTED',
};

function sanitizeInternalNextPath(path: string, fallback: string): string {
  const trimmed = String(path || '').trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
    return fallback;
  }
  return trimmed;
}

function resolveLifecycleNextPath(templateKey: string): string {
  const fallback = LIFECYCLE_NEXT_PATHS[templateKey] || '/dashboard';
  const envKey = LIFECYCLE_NEXT_ENV_KEYS[templateKey];
  const fromEnv = envKey ? String(process.env[envKey] || '').trim() : '';
  if (fromEnv) return sanitizeInternalNextPath(fromEnv, fallback);
  return fallback;
}

function buildLoginWithNextLink(frontendUrl: string, nextPath: string): string {
  const next = sanitizeInternalNextPath(nextPath, '/dashboard');
  return `${frontendUrl}/login?next=${encodeURIComponent(next)}`;
}

/**
 * Meta URL buttons usually register a fixed base + dynamic suffix ({{1}} on the button).
 * Default: path+query without leading slash, e.g. `login?next=%2Fdashboard%2Fconversations`
 * (same pattern as email when the user has no active session).
 * Override with HUNTLO_WA_LOGIN_BUTTON_PARAM or HUNTLO_WA_LOGIN_BUTTON_MODE=full.
 */
function resolveLoginButtonParam(loginLink: string): string {
  const override = String(process.env.HUNTLO_WA_LOGIN_BUTTON_PARAM || '').trim();
  if (override) return override;

  const mode = String(process.env.HUNTLO_WA_LOGIN_BUTTON_MODE || 'path').toLowerCase();
  if (mode === 'full') return loginLink;

  try {
    const parsed = new URL(loginLink);
    const suffix = `${parsed.pathname || ''}${parsed.search || ''}`.replace(/^\//, '');
    return suffix || 'login';
  } catch {
    return loginLink.replace(/^\//, '') || 'login';
  }
}

async function scheduleLifecycleWhatsApp(input: {
  userId: string | mongoose.Types.ObjectId;
  templateKey: string;
  delayMs: number;
  sessionId?: string | mongoose.Types.ObjectId | null;
}): Promise<'scheduled' | 'skipped' | 'noop'> {
  await ensureWhatsAppTemplatesSeeded();

  const userId = toObjectId(input.userId);
  const template = await WhatsAppTemplateModel.findOne({ key: input.templateKey });
  if (!template || !template.enabled) return 'skipped';

  const user = await UserModel.findById(userId).select('phone').lean();
  if (!user?.phone) {
    log().warn(
      { userId, templateKey: input.templateKey },
      'Lifecycle WhatsApp skipped — no phone'
    );
    return 'noop';
  }

  const sendAt = new Date(Date.now() + Math.max(0, input.delayMs));
  const sessionId = input.sessionId ? toObjectId(input.sessionId) : null;

  try {
    await WhatsAppLifecycleSendModel.create({
      userId,
      templateKey: input.templateKey,
      sessionId,
      status: 'pending',
      sendAt,
      sentAt: null,
      skippedAt: null,
      skipReason: null,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return 'skipped';
    }
    throw error;
  }

  log().info(
    {
      userId,
      templateKey: input.templateKey,
      sendAt: sendAt.toISOString(),
      delayMs: input.delayMs,
    },
    'Lifecycle WhatsApp scheduled'
  );
  return 'scheduled';
}

async function processOneLifecycleSend(
  row: WhatsAppLifecycleSendDocument
): Promise<'sent' | 'skipped' | 'noop'> {
  if (row.status !== 'pending') return 'noop';

  const template = await WhatsAppTemplateModel.findOne({ key: row.templateKey });
  if (!template || !template.enabled) {
    row.status = 'skipped';
    row.skippedAt = new Date();
    row.skipReason = 'template_disabled';
    await row.save();
    return 'skipped';
  }

  const metaTemplateName = resolveMetaTemplateName(
    row.templateKey,
    template.metaTemplateName
  );
  if (!metaTemplateName) {
    row.status = 'skipped';
    row.skippedAt = new Date();
    row.skipReason = 'missing_meta_template_name';
    await row.save();
    log().warn(
      { userId: row.userId, templateKey: row.templateKey },
      'Lifecycle WhatsApp skipped — no Meta template name configured'
    );
    return 'skipped';
  }

  const user = await UserModel.findById(row.userId).select('phone email firstName').lean();
  if (!user?.phone) {
    row.status = 'skipped';
    row.skippedAt = new Date();
    row.skipReason = 'missing_phone';
    await row.save();
    return 'skipped';
  }

  let to: string;
  try {
    to = normalizePhone(String(user.phone));
  } catch {
    row.status = 'skipped';
    row.skippedAt = new Date();
    row.skipReason = 'invalid_phone';
    await row.save();
    return 'skipped';
  }

  const frontendUrl = getEnv().FRONTEND_URL.replace(/\/$/, '');
  const firstName = (user.firstName || '').trim() || 'there';
  const loginLink = buildLoginWithNextLink(
    frontendUrl,
    resolveLifecycleNextPath(row.templateKey)
  );
  const bodyParameters = resolveBodyParameters(row.templateKey, firstName);
  const urlButtonParameters = templateHasDynamicUrlButton(row.templateKey)
      ? [resolveLoginButtonParam(loginLink)]
      : [];

  const creds = getHuntloWhatsAppCredentials();
  if (!creds) {
    row.sendAt = new Date(Date.now() + 15 * 60 * 1000);
    await row.save();
    log().warn(
      { userId: row.userId, templateKey: row.templateKey },
      'Lifecycle WhatsApp send skipped — Huntlo WhatsApp not configured, will retry'
    );
    return 'noop';
  }

  try {
    await sendMetaWhatsAppTemplate({
      phoneNumberId: creds.phoneNumberId,
      accessToken: creds.accessToken,
      to,
      templateName: metaTemplateName,
      languageCode: resolveMetaLanguage(),
      bodyParameters,
      urlButtonParameters,
    });
  } catch (error) {
    row.sendAt = new Date(Date.now() + 15 * 60 * 1000);
    await row.save();
    log().warn(
      {
        userId: row.userId,
        to,
        templateKey: row.templateKey,
        metaTemplateName,
        bodyParameters,
        urlButtonParameters,
        err: error instanceof Error ? error.message : String(error),
      },
      'Lifecycle WhatsApp template send failed — will retry'
    );
    return 'noop';
  }

  row.status = 'sent';
  row.sentAt = new Date();
  await row.save();
  log().info(
    {
      userId: row.userId,
      to,
      templateKey: row.templateKey,
      metaTemplateName,
      bodyParameters,
      urlButtonParameters,
    },
    'Lifecycle WhatsApp template sent'
  );
  return 'sent';
}

export const whatsappTemplatesService = {
  async list(): Promise<{ items: PublicWhatsAppTemplate[] }> {
    await ensureWhatsAppTemplatesSeeded();
    const docs = await WhatsAppTemplateModel.find().lean();
    const rank = new Map(
      WHATSAPP_TEMPLATE_DEFAULTS.map((item, index) => [item.key, index])
    );
    const sorted = [...docs].sort((a, b) => {
      const aRank = rank.get(a.key) ?? 1000;
      const bRank = rank.get(b.key) ?? 1000;
      if (aRank !== bRank) return aRank - bRank;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    return {
      items: sorted.map((d) => toPublicWhatsAppTemplate(d as WhatsAppTemplateDocument)),
    };
  },

  async get(id: string): Promise<PublicWhatsAppTemplate> {
    const doc = await WhatsAppTemplateModel.findById(id);
    if (!doc) throw AppError.notFound('WhatsApp template not found');
    return toPublicWhatsAppTemplate(doc);
  },

  async create(
    input: { name: string; bodyText?: string; enabled?: boolean },
    actorUserId: string
  ): Promise<PublicWhatsAppTemplate> {
    const name = input.name.trim();
    if (!name) throw AppError.validation('Name is required');

    const doc = await WhatsAppTemplateModel.create({
      key: await uniqueKey(name),
      name,
      metaTemplateName: null,
      bodyText: (input.bodyText ?? '').trim(),
      enabled: input.enabled !== undefined ? Boolean(input.enabled) : true,
      updatedByUserId: new mongoose.Types.ObjectId(actorUserId),
    });

    return toPublicWhatsAppTemplate(doc);
  },

  async update(
    id: string,
    input: {
      name?: string;
      bodyText?: string;
      enabled?: boolean;
      metaTemplateName?: string | null;
    },
    actorUserId: string
  ): Promise<PublicWhatsAppTemplate> {
    const doc = await WhatsAppTemplateModel.findById(id);
    if (!doc) throw AppError.notFound('WhatsApp template not found');

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw AppError.validation('Name is required');
      doc.name = name;
    }
    if (input.bodyText !== undefined) {
      doc.bodyText = input.bodyText;
    }
    if (input.enabled !== undefined) {
      doc.enabled = Boolean(input.enabled);
    }
    if (input.metaTemplateName !== undefined) {
      doc.metaTemplateName = input.metaTemplateName
        ? String(input.metaTemplateName).trim()
        : null;
    }
    doc.updatedByUserId = new mongoose.Types.ObjectId(actorUserId);
    await doc.save();

    return toPublicWhatsAppTemplate(doc);
  },

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await WhatsAppTemplateModel.deleteOne({ _id: id });
    if (!result.deletedCount) throw AppError.notFound('WhatsApp template not found');
    return { deleted: true };
  },

  /**
   * Admin test send — same Meta template + button path as live lifecycle delivery.
   */
  async sendTest(
    id: string,
    input: { to: string; firstName?: string }
  ): Promise<{
    sent: boolean;
    to: string;
    metaTemplateName: string | null;
    whatsappConfigured: boolean;
    previewBody: string;
    buttonLabel: string | null;
    buttonUrl: string;
  }> {
    await ensureWhatsAppTemplatesSeeded();
    const template = await WhatsAppTemplateModel.findById(id);
    if (!template) throw AppError.notFound('WhatsApp template not found');

    const whatsappConfigured = isHuntloWhatsAppConfigured();
    const firstName = (input.firstName || 'Alex').trim() || 'Alex';
    const frontendUrl = getEnv().FRONTEND_URL.replace(/\/$/, '');
    const loginLink = buildLoginWithNextLink(
      frontendUrl,
      resolveLifecycleNextPath(template.key)
    );
    const previewBody = String(template.bodyText || '')
      .replace(/\{\{\s*(firstName|first_name|1)\s*\}\}/gi, firstName)
      .replace(/\{\{\s*(loginLink|login_link|2)\s*\}\}/gi, loginLink)
      .trim();

    const metaTemplateName = resolveMetaTemplateName(
      template.key,
      template.metaTemplateName
    );
    const buttonUrl = loginLink;
    const buttonLabel = resolveCtaButtonLabel(template.key);

    if (!whatsappConfigured) {
      log().warn(
        { templateId: id, metaTemplateName },
        'WhatsApp test send skipped — Huntlo WhatsApp not configured'
      );
      return {
        sent: false,
        to: input.to,
        metaTemplateName,
        whatsappConfigured: false,
        previewBody,
        buttonLabel,
        buttonUrl,
      };
    }

    if (!metaTemplateName) {
      throw AppError.validation(
        `“${template.name}” has no Meta template name. Only templates with an approved Meta name (e.g. Signup → welcome_signup) can be tested.`
      );
    }

    let to: string;
    try {
      to = normalizePhone(String(input.to));
    } catch {
      throw AppError.validation('Invalid phone number for WhatsApp test send');
    }

    const bodyParameters = resolveBodyParameters(template.key, firstName);
    const urlButtonParameters = templateHasDynamicUrlButton(template.key)
      ? [resolveLoginButtonParam(loginLink)]
      : [];

    const creds = getHuntloWhatsAppCredentials();
    if (!creds) {
      return {
        sent: false,
        to,
        metaTemplateName,
        whatsappConfigured: false,
        previewBody,
        buttonLabel,
        buttonUrl,
      };
    }

    try {
      await sendMetaWhatsAppTemplate({
        phoneNumberId: creds.phoneNumberId,
        accessToken: creds.accessToken,
        to,
        templateName: metaTemplateName,
        languageCode: resolveMetaLanguage(),
        bodyParameters,
        urlButtonParameters,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Meta WhatsApp template send failed';
      const statusCode =
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        typeof (error as { statusCode?: unknown }).statusCode === 'number'
          ? (error as { statusCode: number }).statusCode
          : 502;
      throw new AppError(
        statusCode >= 400 && statusCode < 500 ? statusCode : 502,
        'WHATSAPP_TEMPLATE_SEND_FAILED',
        message,
        { cause: error }
      );
    }

    log().info(
      { templateId: id, to, metaTemplateName, bodyParameters, urlButtonParameters },
      'WhatsApp template test sent'
    );

    return {
      sent: true,
      to,
      metaTemplateName,
      whatsappConfigured: true,
      previewBody,
      buttonLabel,
      buttonUrl,
    };
  },

  async onSignup(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'sent' | 'skipped' | 'noop'> {
    const outcome = await scheduleLifecycleWhatsApp({
      userId: input.userId,
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.signup,
      delayMs: WHATSAPP_LIFECYCLE_DELAYS_MS.signup,
    });
    if (outcome !== 'scheduled') return outcome;
    const row = await WhatsAppLifecycleSendModel.findOne({
      userId: toObjectId(input.userId),
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.signup,
      status: 'pending',
    });
    return row ? processOneLifecycleSend(row) : 'noop';
  },

  async onFirstLogin(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'skipped' | 'noop'> {
    return scheduleLifecycleWhatsApp({
      userId: input.userId,
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.noLogin,
      delayMs: WHATSAPP_LIFECYCLE_DELAYS_MS.noLogin,
    });
  },

  async onProfileUnlocked(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'sent' | 'skipped' | 'noop'> {
    const outcome = await scheduleLifecycleWhatsApp({
      userId: input.userId,
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.profileUnlocked,
      delayMs: WHATSAPP_LIFECYCLE_DELAYS_MS.profileUnlocked,
    });
    if (outcome !== 'scheduled') return outcome;
    const row = await WhatsAppLifecycleSendModel.findOne({
      userId: toObjectId(input.userId),
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.profileUnlocked,
      status: 'pending',
    });
    return row ? processOneLifecycleSend(row) : 'noop';
  },

  async onFirstReply(input: {
    userId: string | mongoose.Types.ObjectId;
  }): Promise<'scheduled' | 'sent' | 'skipped' | 'noop'> {
    const outcome = await scheduleLifecycleWhatsApp({
      userId: input.userId,
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.interestedCandidate,
      delayMs: WHATSAPP_LIFECYCLE_DELAYS_MS.interestedCandidate,
    });
    if (outcome !== 'scheduled') return outcome;
    const row = await WhatsAppLifecycleSendModel.findOne({
      userId: toObjectId(input.userId),
      templateKey: WHATSAPP_LIFECYCLE_TEMPLATE_KEYS.interestedCandidate,
      status: 'pending',
    });
    return row ? processOneLifecycleSend(row) : 'noop';
  },

  async processDueLifecycleSends(limit = 50): Promise<{
    processed: number;
    sent: number;
    skipped: number;
  }> {
    await ensureWhatsAppTemplatesSeeded();
    const due = await WhatsAppLifecycleSendModel.find({
      status: 'pending',
      sendAt: { $lte: new Date() },
    })
      .sort({ sendAt: 1 })
      .limit(Math.max(1, Math.min(200, limit)));

    let processed = 0;
    let sent = 0;
    let skipped = 0;

    for (const row of due) {
      const outcome = await processOneLifecycleSend(row);
      processed += 1;
      if (outcome === 'sent') sent += 1;
      if (outcome === 'skipped') skipped += 1;
    }

    return { processed, sent, skipped };
  },
};
