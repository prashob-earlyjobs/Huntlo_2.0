/**
 * Outreach personalization service — merge-token allowlist, alias resolution,
 * fallback syntax ({{token|fallback}}) and WhatsApp positional tokens ({{1}}, {{2}}).
 *
 * Canonical variable keys are snake_case; `VARIABLE_ALIASES` maps alternate
 * spellings (CamelCase, product-contract names, etc.) onto the canonical key.
 * Resolution is case-insensitive and underscore/hyphen/space-insensitive.
 */

export const ALLOWED_MESSAGE_VARIABLES = [
  'first_name',
  'last_name',
  'candidate_name',
  'job_title',
  'company_name',
  'location',
  'recruiter_name',
  'current_company',
  'current_role',
  'candidate_email',
  'candidate_phone',
] as const;

export type AllowedMessageVariable = (typeof ALLOWED_MESSAGE_VARIABLES)[number];

const ALLOWED_SET = new Set<string>(ALLOWED_MESSAGE_VARIABLES);

/** Alternate spellings (CamelCase, product-contract names) mapped to the canonical key. */
export const VARIABLE_ALIASES: Record<string, AllowedMessageVariable> = {
  FirstName: 'first_name',
  first_name: 'first_name',
  LastName: 'last_name',
  last_name: 'last_name',
  CandidateName: 'candidate_name',
  candidate_name: 'candidate_name',
  FullName: 'candidate_name',
  CurrentCompany: 'current_company',
  current_company: 'current_company',
  CurrentRole: 'current_role',
  current_role: 'current_role',
  JobTitle: 'job_title',
  job_title: 'job_title',
  SenderFirstName: 'recruiter_name',
  RecruiterName: 'recruiter_name',
  recruiter_name: 'recruiter_name',
  CandidateEmail: 'candidate_email',
  candidate_email: 'candidate_email',
  CandidatePhone: 'candidate_phone',
  candidate_phone: 'candidate_phone',
  CompanyName: 'company_name',
  company_name: 'company_name',
  Location: 'location',
  location: 'location',
};

/** Lowercase + strip separators so "FirstName", "first_name", "first name" all match. */
function normalizeKey(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

const CANONICAL_LOOKUP: Record<string, AllowedMessageVariable> = (() => {
  const map: Record<string, AllowedMessageVariable> = {};
  for (const key of ALLOWED_MESSAGE_VARIABLES) {
    map[normalizeKey(key)] = key;
  }
  for (const [alias, canonical] of Object.entries(VARIABLE_ALIASES)) {
    map[normalizeKey(alias)] = canonical;
  }
  return map;
})();

/** Resolve any supported alias/casing to its canonical snake_case key, or null if unknown. */
export function resolveVariableAlias(name: string): AllowedMessageVariable | null {
  return CANONICAL_LOOKUP[normalizeKey(name)] ?? null;
}

export function isPositionalVariable(name: string): boolean {
  return /^[0-9]+$/.test(name);
}

/**
 * Matches {{token}}, {{ token }}, {{token|Fallback text}} and positional {{1}}.
 * Fallback text may contain any characters except braces/pipe.
 */
const VARIABLE_RE =
  /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*|[0-9]+)\s*(?:\|\s*([^{}|]*?)\s*)?\}\}/g;

/** Canonicalize an extracted token name — resolves aliases, lowercases unknowns, keeps digits as-is. */
function canonicalizeTokenName(raw: string): string {
  if (isPositionalVariable(raw)) return raw;
  return resolveVariableAlias(raw) || raw.toLowerCase();
}

export function extractVariables(...texts: Array<string | null | undefined>): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    VARIABLE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VARIABLE_RE.exec(text)) !== null) {
      const name = match[1];
      if (name) found.add(canonicalizeTokenName(name));
    }
  }
  return [...found].sort();
}

/** Extract the `{{token|fallback}}` declarations in a template, keyed by canonical/positional name. */
export function resolveFallbackValues(
  ...texts: Array<string | null | undefined>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const text of texts) {
    if (!text) continue;
    VARIABLE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VARIABLE_RE.exec(text)) !== null) {
      const [, rawName, rawFallback] = match;
      if (!rawName || rawFallback == null) continue;
      const key = canonicalizeTokenName(rawName);
      if (result[key] === undefined) result[key] = rawFallback.trim();
    }
  }
  return result;
}

export type VariableValidationResult = {
  valid: boolean;
  variables: string[];
  allowed: string[];
  unknown: string[];
  missingRecommended: string[];
  preview: string | null;
};

export function validateMessageVariables(input: {
  subject?: string | null;
  body?: string | null;
  sampleValues?: Record<string, string>;
  recommended?: string[];
  /** Reserved for callers that want to reason about channel-specific tokens. */
  channel?: string | null;
}): VariableValidationResult {
  const variables = extractVariables(input.subject, input.body);
  // Positional WhatsApp tokens ({{1}}, {{2}}, ...) are always considered known here —
  // strict allowlist enforcement (assertVariablesAllowed) gates them per-channel.
  const unknown = variables.filter((name) => !ALLOWED_SET.has(name) && !isPositionalVariable(name));
  const recommended = (input.recommended || []).map((v) => v.toLowerCase());
  const missingRecommended = recommended.filter((name) => !variables.includes(name));

  let preview: string | null = null;
  if (input.body) {
    preview = mergeMessageTemplate(input.body, {
      ...Object.fromEntries(ALLOWED_MESSAGE_VARIABLES.map((v) => [v, `[${v}]`])),
      ...(input.sampleValues || {}),
    });
  }

  return {
    valid: unknown.length === 0,
    variables,
    allowed: [...ALLOWED_MESSAGE_VARIABLES],
    unknown,
    missingRecommended,
    preview,
  };
}

/** Alias — same behavior, more descriptive name for template-authoring call sites. */
export const validateTemplateVariables = validateMessageVariables;

/**
 * Resolve a template against a merge context. Alias-aware, supports `{{token|fallback}}`
 * and positional `{{1}}` tokens. Never leaves a token unresolved when a fallback is present.
 * When a token has no value and no fallback, the original `{{token}}` text is preserved
 * verbatim so callers can still detect/highlight it.
 */
/**
 * WhatsApp cold templates use {{1}}, {{2}} while Huntlo merge context uses
 * semantic keys. Map the common outreach positions so free-text merge and
 * conversation previews never leave `{{1}}` / `{{2}}` unfilled when we already
 * know first_name / job_title.
 */
const POSITIONAL_MERGE_FALLBACKS: Record<string, AllowedMessageVariable[]> = {
  '1': ['first_name', 'candidate_name'],
  '2': ['job_title', 'current_role'],
  '3': ['company_name', 'current_company'],
  '4': ['recruiter_name'],
  '5': ['location'],
};

function lookupMergeValue(
  context: Record<string, string | null | undefined>,
  rawName: string
): string | null {
  const positional = isPositionalVariable(rawName);
  const canonical = canonicalizeTokenName(rawName);
  const direct = context[canonical] ?? (positional ? undefined : context[rawName]);
  if (direct != null && String(direct).trim() !== '') return String(direct);

  if (positional) {
    for (const key of POSITIONAL_MERGE_FALLBACKS[canonical] || []) {
      const fromSemantic = context[key];
      if (fromSemantic != null && String(fromSemantic).trim() !== '') {
        return String(fromSemantic);
      }
    }
  }
  return null;
}

export function mergeMessageTemplate(
  template: string,
  context: Record<string, string | null | undefined>
): string {
  return template.replace(VARIABLE_RE, (full, rawName: string, rawFallback?: string) => {
    const value = lookupMergeValue(context, rawName);
    if (value != null && String(value).trim() !== '') return String(value);
    if (rawFallback != null) return rawFallback.trim();
    return full;
  });
}

/** Backward-compatible name used across templates/preview call sites. */
export function renderTemplate(
  template: string,
  values: Record<string, string | null | undefined>
): string {
  return mergeMessageTemplate(template, values);
}

/** List merge tokens in a template that have neither a context value nor an inline fallback. */
export function listMissingVariables(
  template: string,
  context: Record<string, string | null | undefined>
): string[] {
  const fallbacks = resolveFallbackValues(template);
  const variables = extractVariables(template);
  return variables.filter((name) => {
    if (fallbacks[name] !== undefined) return false;
    const value = lookupMergeValue(context, name);
    return value == null || String(value).trim() === '';
  });
}

export type CandidateMergeSource = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  currentTitle?: string | null;
  currentCompany?: string | null;
  location?: string | null;
} | null;

export type CandidateMergeExtras = {
  /** Title of the role being pitched (distinct from the candidate's own current title). */
  jobTitle?: string | null;
  companyName?: string | null;
  recruiterName?: string | null;
  senderFirstName?: string | null;
  location?: string | null;
  /** WhatsApp template positional values — index 0 becomes {{1}}, index 1 becomes {{2}}, etc. */
  positional?: Array<string | null | undefined>;
  /** Any additional canonical-key overrides (e.g. custom fields). */
  extra?: Record<string, string | null | undefined>;
};

/** Build a merge context (canonical key → value) for a candidate + campaign/sender metadata. */
export function buildCandidateMergeContext(
  candidate: CandidateMergeSource,
  extras?: CandidateMergeExtras
): Record<string, string> {
  const context: Record<string, string> = {};
  const set = (key: AllowedMessageVariable | string, value: string | null | undefined) => {
    if (value != null && String(value).trim() !== '') context[key] = String(value).trim();
  };

  const fullName = String(candidate?.name || '').trim();
  const [firstName, ...restName] = fullName.split(/\s+/).filter(Boolean);

  set('first_name', firstName || null);
  set('last_name', restName.join(' ') || null);
  set('candidate_name', fullName || null);
  set('current_company', candidate?.currentCompany);
  set('current_role', candidate?.currentTitle);
  set('job_title', extras?.jobTitle ?? candidate?.currentTitle);
  set('company_name', extras?.companyName);
  set('location', extras?.location ?? candidate?.location);
  set('recruiter_name', extras?.recruiterName ?? extras?.senderFirstName);
  set('candidate_email', candidate?.email);
  set('candidate_phone', candidate?.phone);

  // Always mirror semantic values onto WhatsApp positional slots so {{1}}/{{2}}
  // resolve even when the step body was copied from a Meta template.
  if (context.first_name) set('1', context.first_name);
  if (context.job_title) set('2', context.job_title);
  if (context.company_name) set('3', context.company_name);
  if (context.recruiter_name) set('4', context.recruiter_name);
  if (context.location) set('5', context.location);

  if (extras?.positional?.length) {
    extras.positional.forEach((value, index) => set(String(index + 1), value));
  }
  if (extras?.extra) {
    for (const [key, value] of Object.entries(extras.extra)) {
      set(resolveVariableAlias(key) || key, value);
    }
  }

  return context;
}

export function assertVariablesAllowed(
  subject: string | null | undefined,
  body: string,
  options?: { channel?: string | null }
): string[] {
  const allowPositional = String(options?.channel || '').toLowerCase() === 'whatsapp';
  const variables = extractVariables(subject, body);
  const unknown = variables.filter((name) => {
    if (ALLOWED_SET.has(name)) return false;
    if (isPositionalVariable(name)) return !allowPositional;
    return true;
  });

  if (unknown.length) {
    const err = Object.assign(
      new Error(
        `Unknown message variables: ${unknown.map((v) => `{{${v}}}`).join(', ')}. ` +
          `Allowed: ${ALLOWED_MESSAGE_VARIABLES.map((v) => `{{${v}}}`).join(', ')}` +
          (allowPositional ? ' (plus positional {{1}}, {{2}}, ... for WhatsApp).' : '.')
      ),
      { statusCode: 400, code: 'INVALID_VARIABLES', unknown }
    );
    throw err;
  }
  return variables;
}

export function listAllowedVariables(): Array<{
  key: string;
  placeholder: string;
  aliases: string[];
}> {
  return ALLOWED_MESSAGE_VARIABLES.map((key) => ({
    key,
    placeholder: `{{${key}}}`,
    aliases: Object.keys(VARIABLE_ALIASES).filter(
      (alias) => VARIABLE_ALIASES[alias] === key && normalizeKey(alias) !== normalizeKey(key)
    ),
  }));
}
