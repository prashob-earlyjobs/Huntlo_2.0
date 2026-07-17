import { getEnv } from '../../config/env.js';

export const GEMINI_JOBS_MODEL = 'gemini-2.5-flash';

export type ParsedJobDescription = {
  title: string | null;
  department: string | null;
  employmentType: string | null;
  workplaceType: string | null;
  location: string | null;
  openings: number | null;
  experienceMin: number | null;
  experienceMax: number | null;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: string | null;
  industryPreference: string | null;
  education: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  priority: string | null;
  tags: string[];
  model: string;
  summary: string;
};

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Data',
  'Sales',
  'Product',
  'People',
] as const;

const EMPLOYMENT_TYPES = ['Full-time', 'Contract', 'Internship', 'Part-time'] as const;
const WORKPLACE_TYPES = ['On-site', 'Hybrid', 'Remote'] as const;
const SENIORITY_LEVELS = [
  'Junior',
  'Mid',
  'Senior',
  'Staff',
  'Principal',
  'Manager',
  'Director',
] as const;
const CURRENCIES = ['INR', 'USD', 'EUR'] as const;
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

function pickClosest<T extends string>(
  value: unknown,
  options: readonly T[],
  fallback: T | null = null
): T | null {
  if (value == null) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;
  const exact = options.find((option) => option.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  const partial = options.find(
    (option) =>
      raw.toLowerCase().includes(option.toLowerCase()) ||
      option.toLowerCase().includes(raw.toLowerCase())
  );
  return partial ?? fallback;
}

function asString(value: unknown, max = 50_000): string | null {
  if (value == null) return null;
  const text = Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean).join('\n')
    : String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

function asStringList(value: unknown, maxItems = 30): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, maxItems);
    }
    return [];
  }
  return value
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, maxItems);
}

function asNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeParsed(raw: Record<string, unknown>, model: string): ParsedJobDescription {
  return {
    title: asString(raw.title, 200),
    department: pickClosest(raw.department, DEPARTMENTS),
    employmentType: pickClosest(raw.employmentType, EMPLOYMENT_TYPES, 'Full-time'),
    workplaceType: pickClosest(raw.workplaceType, WORKPLACE_TYPES, 'Hybrid'),
    location: asString(raw.location, 120),
    openings: asNumber(raw.openings),
    experienceMin: asNumber(raw.experienceMin),
    experienceMax: asNumber(raw.experienceMax),
    requiredSkills: asStringList(raw.requiredSkills),
    preferredSkills: asStringList(raw.preferredSkills),
    seniority: pickClosest(raw.seniority, SENIORITY_LEVELS),
    industryPreference: asString(raw.industryPreference, 200),
    education: asString(raw.education, 500),
    description: asString(raw.description),
    responsibilities: asString(raw.responsibilities),
    requirements: asString(raw.requirements),
    benefits: asString(raw.benefits),
    minSalary: asNumber(raw.minSalary),
    maxSalary: asNumber(raw.maxSalary),
    currency: pickClosest(raw.currency, CURRENCIES, 'INR'),
    priority: pickClosest(raw.priority, PRIORITIES, 'Medium'),
    tags: asStringList(raw.tags, 20),
    model,
    summary: asString(raw.summary, 240) || 'Parsed job description fields.',
  };
}

function offlineParse(jdText: string): ParsedJobDescription {
  const lines = jdText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title = lines[0]?.slice(0, 200) || null;
  const rest = lines.slice(1).join('\n').trim() || jdText.trim();

  const skillMatches = Array.from(
    jdText.matchAll(
      /\b(React|TypeScript|JavaScript|Python|Java|Node\.?js|AWS|SQL|Kubernetes|Go|Rust|Figma|Salesforce)\b/gi
    )
  ).map((match) => match[1]);
  const requiredSkills = Array.from(new Set(skillMatches.map((s) => s))).slice(0, 12);

  const exp =
    jdText.match(/(\d+)\s*[-–to]+\s*(\d+)\s*(?:\+?\s*)?(?:years?|yrs?)/i) ||
    jdText.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
  const experienceMin = exp ? Number(exp[1]) : null;
  const experienceMax = exp && exp[2] ? Number(exp[2]) : experienceMin != null ? experienceMin + 3 : null;

  return normalizeParsed(
    {
      title,
      department: /design|figma|ui\/ux/i.test(jdText)
        ? 'Design'
        : /data|analytics|ml|ai engineer/i.test(jdText)
          ? 'Data'
          : /sales|account/i.test(jdText)
            ? 'Sales'
            : /product manager|product owner/i.test(jdText)
              ? 'Product'
              : /hr|people|talent/i.test(jdText)
                ? 'People'
                : 'Engineering',
      employmentType: /intern/i.test(jdText)
        ? 'Internship'
        : /contract|freelance/i.test(jdText)
          ? 'Contract'
          : 'Full-time',
      workplaceType: /remote/i.test(jdText)
        ? 'Remote'
        : /hybrid/i.test(jdText)
          ? 'Hybrid'
          : 'On-site',
      location: /bengaluru|bangalore/i.test(jdText)
        ? 'Bengaluru'
        : /hyderabad/i.test(jdText)
          ? 'Hyderabad'
          : /pune/i.test(jdText)
            ? 'Pune'
            : /mumbai/i.test(jdText)
              ? 'Mumbai'
              : /delhi|ncr|gurgaon|noida/i.test(jdText)
                ? 'Delhi NCR'
                : /remote/i.test(jdText)
                  ? 'Remote, IN'
                  : null,
      openings: 1,
      experienceMin,
      experienceMax,
      requiredSkills,
      preferredSkills: [],
      seniority: /principal/i.test(jdText)
        ? 'Principal'
        : /staff/i.test(jdText)
          ? 'Staff'
          : /director/i.test(jdText)
            ? 'Director'
            : /manager/i.test(jdText)
              ? 'Manager'
              : /junior|entry/i.test(jdText)
                ? 'Junior'
                : /mid[- ]?level|intermediate/i.test(jdText)
                  ? 'Mid'
                  : 'Senior',
      description: rest.slice(0, 8000),
      responsibilities: null,
      requirements: null,
      benefits: null,
      currency: /\$|usd/i.test(jdText) ? 'USD' : 'INR',
      priority: 'Medium',
      tags: requiredSkills.slice(0, 5),
      summary: 'Offline JD parse (heuristic fallback).',
    },
    'offline-draft'
  );
}

type GeminiCallResult =
  | { ok: true; text: string }
  | { ok: false; reason: 'key_missing' | 'api_error' | 'empty' };

async function callGeminiJson(prompt: string): Promise<GeminiCallResult> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) return { ok: false, reason: 'key_missing' };

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_JOBS_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error('[gemini.jobs] generateContent failed', res.status, errBody.slice(0, 400));
    return { ok: false, reason: 'api_error' };
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) return { ok: false, reason: 'empty' };
  return { ok: true, text };
}

/**
 * Extract structured job form fields from a pasted job description using Gemini.
 * Falls back to a deterministic offline parse when Gemini is unavailable.
 */
export async function parseJobDescription(jdText: string): Promise<ParsedJobDescription> {
  const text = String(jdText || '').trim();
  if (!text) {
    throw Object.assign(new Error('Paste a job description to autofill.'), { statusCode: 400 });
  }

  const offline = offlineParse(text);

  const result = await callGeminiJson(
    [
      'You extract structured hiring fields from a job description for a recruiting ATS.',
      'Return ONLY JSON with these keys:',
      JSON.stringify({
        title: 'string',
        department: DEPARTMENTS.join('|'),
        employmentType: EMPLOYMENT_TYPES.join('|'),
        workplaceType: WORKPLACE_TYPES.join('|'),
        location: 'city or Remote, IN',
        openings: 'number',
        experienceMin: 'number years',
        experienceMax: 'number years',
        requiredSkills: ['string'],
        preferredSkills: ['string'],
        seniority: SENIORITY_LEVELS.join('|'),
        industryPreference: 'string',
        education: 'string',
        description: 'short overview paragraph',
        responsibilities: 'newline-separated bullets',
        requirements: 'newline-separated bullets',
        benefits: 'newline-separated bullets',
        minSalary: 'number or null (annual)',
        maxSalary: 'number or null (annual)',
        currency: CURRENCIES.join('|'),
        priority: PRIORITIES.join('|'),
        tags: ['short tags'],
        summary: 'one sentence of what you extracted',
      }),
      'Use null for unknown scalars and [] for unknown arrays.',
      'Prefer the provided enum values when possible.',
      'Do not invent a company name or fake contact details.',
      `Job description:\n${text.slice(0, 20_000)}`,
    ].join('\n')
  );

  if (!result.ok) {
    const reason =
      result.reason === 'key_missing'
        ? 'GEMINI_API_KEY not set'
        : result.reason === 'api_error'
          ? `Gemini API error (model ${GEMINI_JOBS_MODEL})`
          : 'Gemini returned empty content';
    return { ...offline, summary: `Offline JD parse (${reason}).` };
  }

  try {
    const parsed = JSON.parse(result.text) as Record<string, unknown>;
    const normalized = normalizeParsed(parsed, GEMINI_JOBS_MODEL);
    // Keep pasted JD as description fallback if model omitted it.
    if (!normalized.description) normalized.description = offline.description;
    if (!normalized.title) normalized.title = offline.title;
    return normalized;
  } catch {
    return { ...offline, summary: 'Offline JD parse (invalid Gemini JSON).' };
  }
}
