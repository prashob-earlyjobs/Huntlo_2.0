/**
 * Frontend filterForm ↔ Future Jobs query mapping helpers + geo expansion.
 */

import type { FutureJobsFilterForm, FutureJobsSkillsBuckets } from './futureJobs.types.js';
import { countryRegionsFromFilterForm } from './futureJobs.mapper.js';

export {
  DEFAULT_FILTER_FORM,
  FILTER_FORM_RANGE_KEYS,
  enrichFilterFormSkillsFromPrompt,
  ensureSkillsForFutureJobs,
  filterFormFromAnnotation,
  filterFormFromCreateResponse,
  mergeFilterFormIntoSession,
  normalizeFilterFormForUi,
  normalizeRegionForFutureJobs,
  countryRegionsFromFilterForm,
} from './futureJobs.mapper.js';

/** Geo expansion order for pending/empty matching when a region filter exists. */
export const GEO_EXPAND_STEPS = ['60_km', '120_km'] as const;
export type GeoExpandStep = (typeof GEO_EXPAND_STEPS)[number];

const GEO_RADIUS_KM: Record<string, number> = {
  '25_km': 25,
  '50_km': 50,
  '60_km': 60,
  '100_km': 100,
  '120_km': 120,
  '200_km': 200,
};

export function parseGeoDistanceKm(value: unknown): number | null {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!raw) return null;
  if (GEO_RADIUS_KM[raw] != null) return GEO_RADIUS_KM[raw];
  const match = raw.match(/^(\d+)\s*_?\s*km$/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function hasRegionOrLocationFilter(form: Partial<FutureJobsFilterForm> | null | undefined): boolean {
  if (!form || typeof form !== 'object') return false;
  const location = form.location as unknown;
  if (Array.isArray(location) && location.some((v) => String(v ?? '').trim())) return true;
  if (typeof location === 'string' && location.trim()) return true;
  const regions = form.selectRegion as unknown;
  if (Array.isArray(regions) && regions.some((v) => String(v ?? '').trim())) return true;
  return false;
}

/**
 * Next geo expansion step for pending/empty results.
 * Returns null when expansion is not valid (no location filter, or already at/beyond 120_km).
 */
export function nextGeoExpandStep(
  form: Partial<FutureJobsFilterForm> | null | undefined,
  currentStep: GeoExpandStep | null | undefined
): GeoExpandStep | null {
  if (!hasRegionOrLocationFilter(form)) return null;

  const currentKm = parseGeoDistanceKm(form?.geoDistance) ?? 50;

  if (!currentStep) {
    if (currentKm < 60) return '60_km';
    if (currentKm < 120) return '120_km';
    return null;
  }

  if (currentStep === '60_km' && currentKm < 120) return '120_km';
  return null;
}

/** Apply a geo expand step onto a copy of the filter form (does not mutate original). */
export function applyGeoExpandStep(
  form: FutureJobsFilterForm,
  step: GeoExpandStep
): FutureJobsFilterForm {
  return {
    ...form,
    geoDistance: step,
  };
}

export function canExpandGeoFurther(
  form: Partial<FutureJobsFilterForm> | null | undefined,
  regionExpandStep: GeoExpandStep | null | undefined
): boolean {
  return nextGeoExpandStep(form, regionExpandStep) != null;
}

function skillList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const s = String(item ?? '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function normalizeSkillsBuckets(raw: unknown): FutureJobsSkillsBuckets {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { mandatory: [], core: [], secondary: [] };
  }
  const obj = raw as Record<string, unknown>;
  return {
    mandatory: skillList(obj.mandatory),
    core: skillList(obj.core),
    secondary: skillList(obj.secondary),
  };
}

/** True when mandatory/core buckets or keywordSkills constrain the search. */
export function hasStrictSkillsFilter(
  form: Partial<FutureJobsFilterForm> | null | undefined
): boolean {
  return canRelaxSkillsFilter(form);
}

/**
 * True when at least one more skill can be peeled (mandatory → core → keyword).
 * Secondary-only forms are already soft — no further skills relax.
 */
export function canRelaxSkillsFilter(
  form: Partial<FutureJobsFilterForm> | null | undefined
): boolean {
  return nextSkillsRelaxStep(form as FutureJobsFilterForm) != null;
}

export type SkillsRelaxStepResult = {
  form: FutureJobsFilterForm;
  /** Bucket the skill was removed from. */
  bucket: 'mandatory' | 'core' | 'keyword';
  /** Skill / keyword token that was removed. */
  removed: string;
};

function skillsToKeyword(buckets: FutureJobsSkillsBuckets): string {
  const parts = [...buckets.mandatory, ...buckets.core, ...buckets.secondary];
  return parts.join(', ');
}

function keywordTokens(keyword: string): string[] {
  return String(keyword ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Peel exactly one skill constraint (not all at once):
 * 1) last mandatory skill
 * 2) else last core skill
 * 3) else last keywordSkills token (when no structured mandatory/core)
 * Secondary skills are never removed.
 * Returns null when nothing left to peel.
 */
export function nextSkillsRelaxStep(
  form: Partial<FutureJobsFilterForm> | null | undefined
): SkillsRelaxStepResult | null {
  if (!form || typeof form !== 'object') return null;

  const buckets = normalizeSkillsBuckets(form.skills);
  const base = form as FutureJobsFilterForm;

  if (buckets.mandatory.length > 0) {
    const removed = buckets.mandatory[buckets.mandatory.length - 1]!;
    const skills: FutureJobsSkillsBuckets = {
      mandatory: buckets.mandatory.slice(0, -1),
      core: [...buckets.core],
      secondary: [...buckets.secondary],
    };
    return {
      form: {
        ...base,
        skills,
        keywordSkills: skillsToKeyword(skills),
      },
      bucket: 'mandatory',
      removed,
    };
  }

  if (buckets.core.length > 0) {
    const removed = buckets.core[buckets.core.length - 1]!;
    const skills: FutureJobsSkillsBuckets = {
      mandatory: [],
      core: buckets.core.slice(0, -1),
      secondary: [...buckets.secondary],
    };
    return {
      form: {
        ...base,
        skills,
        keywordSkills: skillsToKeyword(skills),
      },
      bucket: 'core',
      removed,
    };
  }

  // Structured secondary-only → already soft.
  if (buckets.secondary.length > 0) return null;

  // Keyword-only forms map into core in the payload mapper — peel one token.
  const tokens = keywordTokens(String(base.keywordSkills ?? ''));
  if (tokens.length === 0) return null;
  const removed = tokens[tokens.length - 1]!;
  const remaining = tokens.slice(0, -1);
  return {
    form: {
      ...base,
      skills: { mandatory: [], core: [], secondary: [] },
      keywordSkills: remaining.join(', '),
    },
    bucket: 'keyword',
    removed,
  };
}

/**
 * @deprecated Prefer nextSkillsRelaxStep — kept as a one-skill peel alias.
 */
export function applySkillsRelaxStep(form: FutureJobsFilterForm): FutureJobsFilterForm {
  const step = nextSkillsRelaxStep(form);
  return step ? step.form : form;
}

/** Cap provider PATCHes when peeling many skills one-by-one. */
export const MAX_SKILLS_RELAX_STEPS = 12;

function csvList(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(', ');
  }
  return String(value ?? '').trim();
}

function skillPhrase(form: Partial<FutureJobsFilterForm>): string {
  const buckets = form.skills;
  const parts: string[] = [];
  if (buckets && typeof buckets === 'object') {
    const mandatory = csvList(buckets.mandatory);
    const core = csvList(buckets.core);
    const secondary = csvList(buckets.secondary);
    if (mandatory) parts.push(`must have ${mandatory}`);
    if (core) parts.push(core);
    if (secondary) parts.push(`nice to have ${secondary}`);
  }
  const keywords = csvList(form.keywordSkills);
  if (keywords && !parts.some((p) => p.toLowerCase().includes(keywords.toLowerCase()))) {
    parts.push(keywords);
  }
  return parts.join(', ');
}

/**
 * Turn structured drawer filters into a natural-language requirement string
 * for POST /wl/search `jdText`.
 */
export function filterFormToNaturalLanguage(
  form: Partial<FutureJobsFilterForm> | null | undefined
): string {
  if (!form || typeof form !== 'object') return '';

  const title = csvList(form.currentTitle);
  const location = csvList(form.location) || csvList(form.selectRegion);
  const min = String(form.yearsExpMin ?? '').trim();
  const max = String(form.yearsExpMax ?? '').trim();
  const skills = skillPhrase(form);
  const seniority = csvList(form.seniorityLevel);
  const industry = csvList(form.industry);
  const functionCategory = csvList(form.functionCategory);
  const currentCompany = csvList(form.currentCompany);
  const pastTitle = csvList(form.pastTitle);
  const pastCompany = csvList(form.pastCompany);
  const school = csvList(form.school);
  const certifications = csvList(form.certifications);
  const employmentType = csvList(form.employmentType);
  const openToWork = Boolean(form.openToWork);
  const geoKm = parseGeoDistanceKm(form.geoDistance);

  const clauses: string[] = [];
  if (title) {
    clauses.push(title);
  } else if (seniority && functionCategory) {
    clauses.push(`${seniority} ${functionCategory}`);
  } else if (functionCategory) {
    clauses.push(functionCategory);
  } else if (seniority) {
    clauses.push(`${seniority} candidates`);
  }

  if (location) {
    clauses.push(geoKm ? `in ${location} (within ${geoKm} km)` : `in ${location}`);
  }

  if (min && max) clauses.push(`with ${min} to ${max} years of experience`);
  else if (min) clauses.push(`with at least ${min} years of experience`);
  else if (max) clauses.push(`with up to ${max} years of experience`);

  if (skills) clauses.push(`skilled in ${skills}`);
  if (industry) clauses.push(`in the ${industry} industry`);
  if (currentCompany) clauses.push(`currently at ${currentCompany}`);
  if (pastTitle) clauses.push(`previously ${pastTitle}`);
  if (pastCompany) clauses.push(`previously at ${pastCompany}`);
  if (school) clauses.push(`educated at ${school}`);
  if (certifications) clauses.push(`certified in ${certifications}`);
  if (employmentType) clauses.push(`${employmentType} roles`);
  if (openToWork) clauses.push('who are currently open to work');

  if (clauses.length === 0) return '';
  if (title || functionCategory || seniority) {
    return `Need ${clauses.join(' ')}`;
  }
  return clauses.join(', ');
}

/** Combine the recruiter prompt with drawer filters into one Future Jobs jdText. */
export function buildJdTextFromPromptAndFilters(
  prompt: string,
  form?: Partial<FutureJobsFilterForm> | null
): string {
  const userText = String(prompt || '').trim();
  const fromFilters = filterFormToNaturalLanguage(form);
  if (userText && fromFilters) {
    const haystack = userText.toLowerCase();
    const needle = fromFilters.replace(/^need\s+/i, '').slice(0, 48).toLowerCase();
    if (needle && haystack.includes(needle)) return userText;
    return `${userText}. ${fromFilters}`;
  }
  return userText || fromFilters;
}

/** Future Jobs `/wl/search` structured filter clause. */
export type WlSearchRangeFilter = { type: 'RANGE'; value: [number, number] };
export type WlSearchEqualsFilter = { type: '='; value: string[] };

export type WlSearchFilters = {
  years_of_experience_raw?: WlSearchRangeFilter;
  country_region?: WlSearchEqualsFilter;
};

function parseYearsBound(value: unknown): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Build YoE RANGE from drawer yearsExpMin / yearsExpMax (no Gemini). */
export function yearsRangeFromFilterForm(
  form?: Partial<FutureJobsFilterForm> | null
): WlSearchRangeFilter | null {
  if (!form || typeof form !== 'object') return null;
  const lo = parseYearsBound(form.yearsExpMin);
  const hi = parseYearsBound(form.yearsExpMax);
  if (lo == null && hi == null) return null;
  const finalLo = lo != null ? lo : hi!;
  const finalHi = hi != null ? hi : lo!;
  return { type: 'RANGE', value: [finalLo, finalHi] };
}

/**
 * Heuristic YoE extract from NL (used when Gemini is unavailable).
 * e.g. "4–7 years", "around 2 years", "at least 5 years".
 */
export function parseYearsExperienceRangeFromText(text: string): WlSearchRangeFilter | null {
  const raw = String(text || '').trim().toLowerCase();
  if (!raw) return null;

  const range =
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through|thru)\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?\.?)/i
    ) ||
    raw.match(
      /(\d+(?:\.\d+)?)\s*(?:-|–|—|to|through|thru)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?\.?)?\s*(?:of\s+)?(?:experience|exp\b)/i
    );
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return { type: 'RANGE', value: [Math.min(a, b), Math.max(a, b)] };
    }
  }

  const around = raw.match(
    /(?:around|about|approximately|roughly|~)\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?\.?)/i
  );
  if (around) {
    const n = Number(around[1]);
    if (Number.isFinite(n)) {
      const lo = Math.max(0, Math.floor(n - 1));
      const hi = Math.ceil(n + 1);
      return { type: 'RANGE', value: [lo, hi] };
    }
  }

  const atLeast = raw.match(
    /(?:at\s+least|minimum(?:\s+of)?|min\.?)\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?\.?)/i
  );
  if (atLeast) {
    const n = Number(atLeast[1]);
    if (Number.isFinite(n)) return { type: 'RANGE', value: [n, n] };
  }

  const upTo = raw.match(
    /(?:up\s+to|at\s+most|maximum(?:\s+of)?|max\.?)\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?\.?)/i
  );
  if (upTo) {
    const n = Number(upTo[1]);
    if (Number.isFinite(n)) return { type: 'RANGE', value: [0, n] };
  }

  const single = raw.match(
    /(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?\.?)\s*(?:of\s+)?(?:experience|exp\b)?/i
  );
  if (single) {
    const n = Number(single[1]);
    if (Number.isFinite(n)) return { type: 'RANGE', value: [n, n] };
  }

  return null;
}

/** Prefer drawer YoE; otherwise use a prompt-derived range. Also attach country_region. */
export function buildWlSearchFilters(input: {
  form?: Partial<FutureJobsFilterForm> | null;
  yearsFromPrompt?: WlSearchRangeFilter | null;
  countriesFromPrompt?: string[] | null;
}): WlSearchFilters | undefined {
  const fromForm = yearsRangeFromFilterForm(input.form);
  const yoe = fromForm ?? input.yearsFromPrompt ?? null;
  const fromFormCountries = countryRegionsFromFilterForm(input.form);
  const promptCountries = (input.countriesFromPrompt ?? [])
    .map((c) => String(c ?? '').trim())
    .filter(Boolean);
  const countries = fromFormCountries.length > 0 ? fromFormCountries : promptCountries;

  const filters: WlSearchFilters = {};
  if (yoe) filters.years_of_experience_raw = yoe;
  if (countries.length > 0) {
    filters.country_region = { type: '=', value: countries };
  }
  return Object.keys(filters).length > 0 ? filters : undefined;
}

/**
 * Heuristic country extract from NL (used when Gemini is unavailable).
 * Matches known country names / abbreviations as whole words.
 */
const KNOWN_COUNTRY_NAMES = [
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Saudi Arabia',
  'South Africa',
  'South Korea',
  'New Zealand',
  'Czech Republic',
  'Hong Kong',
  'Sri Lanka',
  'Afghanistan',
  'Argentina',
  'Australia',
  'Austria',
  'Bahrain',
  'Bangladesh',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'India',
  'Indonesia',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Kuwait',
  'Luxembourg',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Nepal',
  'Netherlands',
  'Nigeria',
  'Norway',
  'Oman',
  'Pakistan',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Singapore',
  'Spain',
  'Sweden',
  'Switzerland',
  'Thailand',
  'Turkey',
  'Ukraine',
  'Vietnam',
].sort((a, b) => b.length - a.length);

const COUNTRY_NAME_ALIASES: Record<string, string> = {
  usa: 'United States',
  us: 'United States',
  'u.s.': 'United States',
  'u.s.a.': 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  britain: 'United Kingdom',
  england: 'United Kingdom',
  uae: 'United Arab Emirates',
  emirates: 'United Arab Emirates',
  holland: 'Netherlands',
  luxemberg: 'Luxembourg',
  luxumbourg: 'Luxembourg',
};

/** State / province / emirate → country for prompt extract. Longer keys first. */
const STATE_TO_COUNTRY: Record<string, string> = {
  // United States
  alabama: 'United States',
  alaska: 'United States',
  arizona: 'United States',
  arkansas: 'United States',
  california: 'United States',
  colorado: 'United States',
  connecticut: 'United States',
  delaware: 'United States',
  florida: 'United States',
  hawaii: 'United States',
  idaho: 'United States',
  illinois: 'United States',
  indiana: 'United States',
  iowa: 'United States',
  kansas: 'United States',
  kentucky: 'United States',
  louisiana: 'United States',
  maine: 'United States',
  maryland: 'United States',
  massachusetts: 'United States',
  michigan: 'United States',
  minnesota: 'United States',
  mississippi: 'United States',
  missouri: 'United States',
  montana: 'United States',
  nebraska: 'United States',
  nevada: 'United States',
  'new hampshire': 'United States',
  'new jersey': 'United States',
  'new mexico': 'United States',
  'new york': 'United States',
  'north carolina': 'United States',
  'north dakota': 'United States',
  ohio: 'United States',
  oklahoma: 'United States',
  oregon: 'United States',
  pennsylvania: 'United States',
  'rhode island': 'United States',
  'south carolina': 'United States',
  'south dakota': 'United States',
  tennessee: 'United States',
  texas: 'United States',
  utah: 'United States',
  vermont: 'United States',
  virginia: 'United States',
  // "georgia" / "washington" omitted — ambiguous with country Georgia / DC naming
  'west virginia': 'United States',
  wisconsin: 'United States',
  wyoming: 'United States',
  'washington dc': 'United States',
  'washington d.c.': 'United States',
  'district of columbia': 'United States',
  'washington state': 'United States',
  // India
  'andhra pradesh': 'India',
  'arunachal pradesh': 'India',
  assam: 'India',
  bihar: 'India',
  chhattisgarh: 'India',
  goa: 'India',
  gujarat: 'India',
  haryana: 'India',
  'himachal pradesh': 'India',
  jharkhand: 'India',
  karnataka: 'India',
  kerala: 'India',
  'madhya pradesh': 'India',
  maharashtra: 'India',
  manipur: 'India',
  meghalaya: 'India',
  mizoram: 'India',
  nagaland: 'India',
  odisha: 'India',
  orissa: 'India',
  punjab: 'India',
  rajasthan: 'India',
  sikkim: 'India',
  'tamil nadu': 'India',
  telangana: 'India',
  tripura: 'India',
  'uttar pradesh': 'India',
  uttarakhand: 'India',
  'west bengal': 'India',
  delhi: 'India',
  'new delhi': 'India',
  'jammu and kashmir': 'India',
  ladakh: 'India',
  puducherry: 'India',
  chandigarh: 'India',
  // Canada
  ontario: 'Canada',
  quebec: 'Canada',
  'british columbia': 'Canada',
  alberta: 'Canada',
  manitoba: 'Canada',
  saskatchewan: 'Canada',
  'nova scotia': 'Canada',
  'new brunswick': 'Canada',
  // UAE emirates
  dubai: 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  sharjah: 'United Arab Emirates',
  ajman: 'United Arab Emirates',
  // UK nations / regions already partly aliased; keep Scotland/Wales/NI
  scotland: 'United Kingdom',
  wales: 'United Kingdom',
  'northern ireland': 'United Kingdom',
};

const STATE_NAMES_BY_LENGTH = Object.keys(STATE_TO_COUNTRY).sort(
  (a, b) => b.length - a.length
);

export function parseCountriesFromText(text: string): string[] {
  const raw = String(text || '').trim();
  if (!raw) return [];

  const lower = raw.toLowerCase();
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (label: string) => {
    const s = String(label || '').trim();
    if (!s) return;
    const key = s.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(s);
  };

  for (const name of KNOWN_COUNTRY_NAMES) {
    const re = new RegExp(`\\b${name.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (re.test(raw)) push(name);
  }

  for (const [alias, canonical] of Object.entries(COUNTRY_NAME_ALIASES)) {
    const re = new RegExp(`\\b${alias.replace(/\./g, '\\.')}\\b`, 'i');
    if (re.test(lower)) push(canonical);
  }

  for (const state of STATE_NAMES_BY_LENGTH) {
    const re = new RegExp(`\\b${state.replace(/\s+/g, '\\s+').replace(/\./g, '\\.')}\\b`, 'i');
    if (re.test(lower)) push(STATE_TO_COUNTRY[state]!);
  }

  return out;
}
