/**
 * Message personalization variables — exact allowlist from product contract.
 */

export const ALLOWED_MESSAGE_VARIABLES = [
  'first_name',
  'last_name',
  'job_title',
  'company_name',
  'location',
  'recruiter_name',
  'current_company',
  'current_role',
] as const;

export type AllowedMessageVariable = (typeof ALLOWED_MESSAGE_VARIABLES)[number];

const ALLOWED_SET = new Set<string>(ALLOWED_MESSAGE_VARIABLES);

/** Matches {{first_name}} and {{ first_name }} */
const VARIABLE_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

export function extractVariables(...texts: Array<string | null | undefined>): string[] {
  const found = new Set<string>();
  for (const text of texts) {
    if (!text) continue;
    VARIABLE_RE.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VARIABLE_RE.exec(text)) !== null) {
      const name = match[1];
      if (name) found.add(name.toLowerCase());
    }
  }
  return [...found].sort();
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
}): VariableValidationResult {
  const variables = extractVariables(input.subject, input.body);
  const unknown = variables.filter((name) => !ALLOWED_SET.has(name));
  const recommended = (input.recommended || []).map((v) => v.toLowerCase());
  const missingRecommended = recommended.filter((name) => !variables.includes(name));

  let preview: string | null = null;
  if (input.body) {
    preview = renderTemplate(input.body, {
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

export function renderTemplate(
  template: string,
  values: Record<string, string | null | undefined>
): string {
  return template.replace(VARIABLE_RE, (_full, name: string) => {
    const key = name.toLowerCase();
    const value = values[key];
    return value == null || value === '' ? `{{${key}}}` : String(value);
  });
}

export function assertVariablesAllowed(
  subject: string | null | undefined,
  body: string
): string[] {
  const result = validateMessageVariables({ subject, body });
  if (!result.valid) {
    const err = Object.assign(
      new Error(
        `Unknown message variables: ${result.unknown.map((v) => `{{${v}}}`).join(', ')}. ` +
          `Allowed: ${ALLOWED_MESSAGE_VARIABLES.map((v) => `{{${v}}}`).join(', ')}.`
      ),
      { statusCode: 400, code: 'INVALID_VARIABLES', unknown: result.unknown }
    );
    throw err;
  }
  return result.variables;
}

export function listAllowedVariables(): Array<{ key: string; placeholder: string }> {
  return ALLOWED_MESSAGE_VARIABLES.map((key) => ({
    key,
    placeholder: `{{${key}}}`,
  }));
}
