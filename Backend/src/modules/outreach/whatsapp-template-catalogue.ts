/**
 * Product catalogue of Meta/Gupshup WhatsApp Business templates for cold
 * outbound outreach (steps 1–3). Reply follow-ups after a candidate replies
 * are free-text / AI — not these templates.
 *
 * Huntlo IDs must match approved template names on the WABA (unless overridden
 * via META_WHATSAPP_FORCE_TEST_TEMPLATE / Gupshup env mappings).
 */

export const WHATSAPP_TEMPLATE_SLOTS = [
  'opening',
  'no_reply_1',
  'no_reply_2',
] as const;
export type WhatsAppTemplateSlot = (typeof WHATSAPP_TEMPLATE_SLOTS)[number];

/** Legacy categories kept for API compatibility with older clients. */
export const WHATSAPP_TEMPLATE_CATEGORIES = [
  'opening',
  'follow_up',
  'no_reply_fallback',
  'reply_follow_up',
  'scheduling',
] as const;
export type ApprovedWhatsAppTemplateCategory =
  (typeof WHATSAPP_TEMPLATE_CATEGORIES)[number];

export type ApprovedWhatsAppTemplateVariable = {
  key: string;
  /** Semantic merge key used when building Meta body params. */
  mergeKey: 'first_name' | 'job_title';
  description: string;
  sample: string;
};

export type ApprovedWhatsAppTemplate = {
  id: string;
  /** Meta Cloud API template name (usually same as id). */
  metaName: string;
  name: string;
  slot: WhatsAppTemplateSlot;
  category: ApprovedWhatsAppTemplateCategory;
  language: string;
  body: string;
  variables: ApprovedWhatsAppTemplateVariable[];
  /** Default pick for this slot in UI / AI. */
  isDefault?: boolean;
};

const FIRST_NAME: ApprovedWhatsAppTemplateVariable = {
  key: '1',
  mergeKey: 'first_name',
  description: 'Candidate first name (FirstName)',
  sample: 'Alex',
};

const JOB_TITLE: ApprovedWhatsAppTemplateVariable = {
  key: '2',
  mergeKey: 'job_title',
  description: 'Open role / job title from campaign (JobTitle)',
  sample: 'Senior Backend Engineer',
};

const TWO_VARS = [FIRST_NAME, JOB_TITLE];

export const APPROVED_WHATSAPP_TEMPLATES: ApprovedWhatsAppTemplate[] = [
  {
    id: 'opening_message_01',
    metaName: 'opening_message_01',
    name: 'Opening message',
    slot: 'opening',
    category: 'opening',
    language: 'en',
    isDefault: true,
    body:
      'Hi {{1}},\n' +
      '\n' +
      'Your profile has been shortlisted through our candidate matching process for the {{2}} position.\n' +
      '\n' +
      'To review the opportunity details and next steps, please reply to this message.',
    variables: TWO_VARS,
  },
  {
    id: 'profile_review_reminder_v1',
    metaName: 'profile_review_reminder_v1',
    name: 'Profile review reminder',
    slot: 'opening',
    category: 'opening',
    language: 'en',
    body:
      'Hi {{1}},\n' +
      'This is a follow-up regarding the profile review communication shared earlier for the {{2}} requirement.\n' +
      'If you would like to receive additional information regarding the recruitment process and next steps, please reply to this message.\n' +
      'Thank you.',
    variables: TWO_VARS,
  },
  {
    id: 'role_alignment_review',
    metaName: 'role_alignment_review',
    name: 'Role alignment review',
    slot: 'opening',
    category: 'opening',
    language: 'en',
    body:
      'Hi {{1}},\n' +
      'During our recruitment review process, your professional experience was identified as relevant to a current requirement for a {{2}} role.\n' +
      'If you would like to receive more information regarding the opportunity and process, please reply to this message.\n' +
      'Thank you.',
    variables: TWO_VARS,
  },
  {
    id: 'recruitment_update_reminder_v1',
    metaName: 'recruitment_update_reminder_v1',
    name: 'Recruitment update reminder',
    slot: 'no_reply_1',
    category: 'no_reply_fallback',
    language: 'en',
    body:
      'Hi {{1}},\n' +
      'We are following up regarding the previous communication about the review of your profile for the {{2}} requirement.\n' +
      'If you would like further information or wish to continue the recruitment process, please reply to this message.\n' +
      'Thank you for your time.',
    variables: TWO_VARS,
  },
  {
    id: 'final_profile_follow_up_v1',
    metaName: 'final_profile_follow_up_v1',
    name: 'Final profile follow-up',
    slot: 'no_reply_2',
    category: 'no_reply_fallback',
    language: 'en',
    isDefault: true,
    body:
      'Hi {{1}},\n' +
      'This is the final follow-up regarding the profile review for the {{2}} requirement.\n' +
      'If you would like to receive additional information or continue with the recruitment process, please reply to this message.\n' +
      'Thank you for your time and consideration.',
    variables: TWO_VARS,
  },
  {
    id: 'profile_review_closure_v1',
    metaName: 'profile_review_closure_v1',
    name: 'Profile review closure',
    slot: 'no_reply_2',
    category: 'no_reply_fallback',
    language: 'en',
    body:
      'Hi {{1}},\n' +
      'This is a final update regarding the profile review communication shared earlier for the {{2}} requirement.\n' +
      'We understand that you may not be available to continue the process at this time.\n' +
      'Should your availability or circumstances change, you may reply to this message to reconnect regarding your profile review.\n' +
      'Thank you for your time.',
    variables: TWO_VARS,
  },
];

/** profile_review_reminder_v1 is also the default no-reply-1 option (same Meta template). */
const SLOT_EXTRA: Partial<Record<WhatsAppTemplateSlot, string[]>> = {
  no_reply_1: ['profile_review_reminder_v1'],
};

/** Legacy plan / campaign IDs → current catalogue IDs. */
export const WHATSAPP_TEMPLATE_ALIASES: Record<string, string> = {
  professional_intro: 'opening_message_01',
  role_opportunity: 'role_alignment_review',
  no_reply_1_bump: 'profile_review_reminder_v1',
  no_reply_1_value: 'recruitment_update_reminder_v1',
  no_reply_2_final: 'final_profile_follow_up_v1',
  no_reply_2_door_open: 'profile_review_closure_v1',
  // Older Huntlo 2.0 placeholders
  recruiter_opening_v1: 'opening_message_01',
  recruiter_opening_short_v1: 'role_alignment_review',
  follow_up_gentle_v1: 'recruitment_update_reminder_v1',
  no_reply_fallback_v1: 'final_profile_follow_up_v1',
};

/** Meta body component parameter order for each template. */
export const WHATSAPP_META_VARIABLE_MAP: Record<string, Array<'FirstName' | 'JobTitle'>> = {
  opening_message_01: ['FirstName', 'JobTitle'],
  profile_review_reminder_v1: ['FirstName', 'JobTitle'],
  role_alignment_review: ['FirstName', 'JobTitle'],
  recruitment_update_reminder_v1: ['FirstName', 'JobTitle'],
  final_profile_follow_up_v1: ['FirstName', 'JobTitle'],
  profile_review_closure_v1: ['FirstName', 'JobTitle'],
};

export const WHATSAPP_FREE_TEXT_TEMPLATE_ID = 'free_text';

export function resolveCanonicalTemplateId(templateId: string | null | undefined): string | null {
  const raw = String(templateId || '').trim();
  if (!raw) return null;
  if (raw === WHATSAPP_FREE_TEXT_TEMPLATE_ID) return WHATSAPP_FREE_TEXT_TEMPLATE_ID;
  return WHATSAPP_TEMPLATE_ALIASES[raw] || raw;
}

export function listApprovedTemplates(): ApprovedWhatsAppTemplate[] {
  return APPROVED_WHATSAPP_TEMPLATES;
}

export function listTemplatesForSlot(slot: WhatsAppTemplateSlot): ApprovedWhatsAppTemplate[] {
  const extras = new Set(SLOT_EXTRA[slot] ?? []);
  return APPROVED_WHATSAPP_TEMPLATES.filter(
    (template) => template.slot === slot || extras.has(template.id)
  );
}

export function getDefaultTemplateForSlot(
  slot: WhatsAppTemplateSlot
): ApprovedWhatsAppTemplate | null {
  const inSlot = listTemplatesForSlot(slot);
  return inSlot.find((template) => template.isDefault) ?? inSlot[0] ?? null;
}

export function getApprovedTemplate(id: string): ApprovedWhatsAppTemplate | null {
  const canonical = resolveCanonicalTemplateId(id);
  if (!canonical || canonical === WHATSAPP_FREE_TEXT_TEMPLATE_ID) return null;
  return APPROVED_WHATSAPP_TEMPLATES.find((template) => template.id === canonical) ?? null;
}

export function isColdOutboundWhatsAppTemplate(templateId: string | null | undefined): boolean {
  return Boolean(getApprovedTemplate(templateId || ''));
}

export function getMetaTemplateLanguage(template?: ApprovedWhatsAppTemplate | null): string {
  const env = String(process.env.META_WHATSAPP_TEMPLATE_LANGUAGE || '').trim();
  if (env) return env;
  // WABA templates in this product are approved as `en` (not `en_US`).
  return template?.language || 'en';
}

export function isForceTestWhatsAppTemplate(): boolean {
  return String(process.env.META_WHATSAPP_FORCE_TEST_TEMPLATE || '').toLowerCase() === 'true';
}

export function getMetaTemplateName(template: ApprovedWhatsAppTemplate): string {
  if (isForceTestWhatsAppTemplate()) {
    return 'hello_world';
  }
  return template.metaName;
}

/**
 * Body params for the template name actually sent to Meta.
 * `hello_world` (force-test) expects zero parameters — do not send catalogue vars.
 */
export function buildMetaBodyParameters(
  templateId: string,
  mergeContext: Record<string, string>
): string[] {
  if (isForceTestWhatsAppTemplate()) return [];
  return buildWhatsAppTemplateParams(templateId, mergeContext);
}

/**
 * Human-readable preview of what the candidate receives for a cold-outbound
 * template (substitutes {{1}}, {{2}}, … and named tokens). Meta itself is
 * called with template name + body parameters — not this string.
 */
export function renderWhatsAppTemplatePreview(
  templateId: string,
  mergeContext: Record<string, string>
): string {
  const template = getApprovedTemplate(templateId);
  if (!template) return '';

  if (isForceTestWhatsAppTemplate()) {
    return 'hello_world (Meta test template — no body variables)';
  }

  const params = buildWhatsAppTemplateParams(templateId, mergeContext);
  const context: Record<string, string> = { ...mergeContext };
  params.forEach((value, index) => {
    context[String(index + 1)] = value;
  });

  return template.body.replace(/\{\{\s*([0-9]+|[a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (full, raw) => {
    const key = String(raw);
    const fromContext = context[key];
    if (fromContext != null && String(fromContext).trim() !== '') {
      return String(fromContext);
    }
    if (key === '1' || key === 'first_name') {
      return context.first_name || context['1'] || 'there';
    }
    if (key === '2' || key === 'job_title') {
      return context.job_title || context['2'] || 'this role';
    }
    return full;
  });
}

/** Env override keys for Gupshup provider template IDs. */
export const GUPSHUP_TEMPLATE_ENV_KEYS: Record<string, string> = {
  opening_message_01: 'GUPSHUP_TEMPLATE_OPENING_MESSAGE_01',
  profile_review_reminder_v1: 'GUPSHUP_TEMPLATE_PROFILE_REVIEW_REMINDER_V1',
  role_alignment_review: 'GUPSHUP_TEMPLATE_ROLE_ALIGNMENT_REVIEW',
  recruitment_update_reminder_v1: 'GUPSHUP_TEMPLATE_RECRUITMENT_UPDATE_REMINDER_V1',
  final_profile_follow_up_v1: 'GUPSHUP_TEMPLATE_FINAL_PROFILE_FOLLOW_UP_V1',
  profile_review_closure_v1: 'GUPSHUP_TEMPLATE_PROFILE_REVIEW_CLOSURE_V1',
};

export function resolveGupshupTemplateId(templateId: string): string | null {
  const template = getApprovedTemplate(templateId);
  if (!template) return null;
  const envKey = GUPSHUP_TEMPLATE_ENV_KEYS[template.id];
  const fromEnv = envKey ? String(process.env[envKey] || '').trim() : '';
  return fromEnv || template.id;
}

/**
 * Build ordered Meta/Gupshup body parameter strings from merge context.
 * Falls back to samples when a value is missing (Meta rejects empty params).
 */
export function buildWhatsAppTemplateParams(
  templateId: string,
  mergeContext: Record<string, string>
): string[] {
  const template = getApprovedTemplate(templateId);
  if (!template) return [];

  return template.variables.map((variable) => {
    const fromMerge = String(mergeContext[variable.mergeKey] || '').trim();
    if (fromMerge) return fromMerge;
    // Aliases commonly present in merge context
    if (variable.mergeKey === 'first_name') {
      return (
        String(mergeContext.first_name || mergeContext.FirstName || mergeContext['1'] || '').trim() ||
        variable.sample
      );
    }
    return (
      String(
        mergeContext.job_title ||
          mergeContext.JobTitle ||
          mergeContext.current_title ||
          mergeContext['2'] ||
          ''
      ).trim() || variable.sample
    );
  });
}

export type TemplateVariableValidationResult = {
  valid: boolean;
  missing: string[];
  unknown: string[];
};

export function validateTemplateVariables(
  templateId: string,
  vars: Record<string, string> | null | undefined
): TemplateVariableValidationResult {
  const template = getApprovedTemplate(templateId);
  if (!template) {
    if (resolveCanonicalTemplateId(templateId) === WHATSAPP_FREE_TEXT_TEMPLATE_ID) {
      return { valid: true, missing: [], unknown: [] };
    }
    return { valid: false, missing: [], unknown: [] };
  }

  const provided = vars ?? {};
  const requiredKeys = template.variables.map((variable) => variable.key);
  const providedKeys = Object.keys(provided);

  // Allow either positional keys ("1","2") or semantic keys (FirstName/JobTitle / first_name).
  const missing = requiredKeys.filter((key) => {
    if (provided[key]?.trim()) return false;
    const variable = template.variables.find((item) => item.key === key);
    if (!variable) return true;
    const semantic =
      provided[variable.mergeKey] ||
      provided[variable.mergeKey === 'first_name' ? 'FirstName' : 'JobTitle'];
    return !String(semantic || '').trim();
  });

  const known = new Set([
    ...requiredKeys,
    'FirstName',
    'JobTitle',
    'first_name',
    'job_title',
  ]);
  const unknown = providedKeys.filter((key) => !known.has(key));

  return { valid: missing.length === 0, missing, unknown };
}

export function assertTemplateAllowedInSlot(
  templateId: string,
  slot: WhatsAppTemplateSlot
): boolean {
  return listTemplatesForSlot(slot).some(
    (template) => template.id === resolveCanonicalTemplateId(templateId)
  );
}
