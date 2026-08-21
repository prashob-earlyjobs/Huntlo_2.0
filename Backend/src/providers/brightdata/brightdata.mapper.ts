import type { FutureJobsFilterForm, FutureJobsProfileDoc } from '../future-jobs/futureJobs.types.js';

const COUNTRY_CODES: Record<string, string> = {
  india: 'IN',
  'united states': 'US',
  usa: 'US',
  us: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  uae: 'AE',
  'united arab emirates': 'AE',
  singapore: 'SG',
  germany: 'DE',
  canada: 'CA',
  australia: 'AU',
};

type BrightDataFilter =
  | { name: string; operator: string; value?: unknown }
  | {
      operator: 'and' | 'or';
      filters: BrightDataFilter[];
      combine_nested_fields?: boolean;
    };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function queryValues(queries: Record<string, unknown>, key: string): string[] {
  const entry = asRecord(queries[key]);
  const raw = entry?.value ?? queries[key];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  return [];
}

function asStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) return [raw.trim()];
  if (typeof raw === 'boolean' || typeof raw === 'number') return [String(raw)];
  return [];
}

/** Search (Elasticsearch) only indexes these top-level fields. Nested paths 500. */
const SEARCH_INDEX_FIELDS = new Set([
  'name',
  'first_name',
  'last_name',
  'city',
  'country_code',
  'position',
  'about',
  'location',
  'url',
  'current_company_name',
  'educations_details',
]);

const MAX_GROUP_RULES = 4;
/** Values inside one field rule (arrays for includes/in). Not the group-rule cap. */
const MAX_FIELD_VALUES = 12;

function uniqueValues(values: string[], limit = MAX_FIELD_VALUES): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, limit);
}

/** One field rule. Multiple values use an array so we do not nest OR groups. */
function fieldFilter(
  name: string,
  operator: 'includes' | 'in',
  values: string[],
  limit = MAX_FIELD_VALUES
): BrightDataFilter | null {
  if (!SEARCH_INDEX_FIELDS.has(name)) return null;
  const unique = uniqueValues(values, limit);
  if (!unique.length) return null;
  return {
    name,
    operator,
    value: operator === 'in' || unique.length > 1 ? unique : unique[0],
  };
}

function andGroup(filters: BrightDataFilter[]): BrightDataFilter | null {
  const compact = filters.filter(Boolean).slice(0, MAX_GROUP_RULES);
  if (!compact.length) return null;
  if (compact.length === 1) return compact[0]!;
  return { operator: 'and', filters: compact };
}

/**
 * Dataset Filter/Search: max 4 rules per group and max 3 nesting levels.
 * Huntlo emits a single AND of field rules (depth 1). Multi-value fields use
 * `includes`/`in` arrays (up to MAX_FIELD_VALUES) instead of nested OR groups.
 */
export function buildBrightDataSearchFilter(raw: unknown): BrightDataFilter | null {
  const dataset = asRecord(raw);
  if (!dataset) return null;

  const used = new Set<string>([
    'position',
    'current_company.title',
    'country_code',
    'city',
    'location',
    'about',
    'current_company.name',
    'current_company_name',
    'experience.company',
    'experience.title',
    'experience.duration',
    'education.title',
    'education.degree',
    'education.field',
    'educations_details',
    'certifications.title',
    'honors_and_awards.title',
    'current_company.location',
  ]);

  const clauses: BrightDataFilter[] = [];

  const title = fieldFilter('position', 'includes', [
    ...asStringList(dataset.position),
    ...asStringList(dataset['current_company.title']),
  ]);
  if (title) clauses.push(title);

  const countries = uniqueValues(
    asStringList(dataset.country_code).map((value) => value.toUpperCase())
  );
  if (countries.length) {
    clauses.push({
      name: 'country_code',
      operator: 'in',
      value: countries,
    });
  }

  const city = fieldFilter('city', 'includes', asStringList(dataset.city));
  if (city) clauses.push(city);

  const aboutValues = uniqueValues([
    ...asStringList(dataset.about),
    ...asStringList(dataset['certifications.title']),
    ...asStringList(dataset['honors_and_awards.title']),
    ...asStringList(dataset['experience.title']),
    ...asStringList(dataset['experience.company']),
    ...asStringList(dataset.educations_details),
    ...asStringList(dataset['education.title']),
    ...asStringList(dataset['education.degree']),
    ...asStringList(dataset['education.field']),
  ]);
  const companies = uniqueValues([
    ...asStringList(dataset['current_company.name']),
    ...asStringList(dataset.current_company_name),
  ]);
  const hq = fieldFilter('location', 'includes', asStringList(dataset['current_company.location']), 2);

  if (clauses.length < MAX_GROUP_RULES && companies.length && aboutValues.length === 0) {
    const company = fieldFilter('current_company_name', 'includes', companies);
    if (company) clauses.push(company);
  } else if (companies.length) {
    aboutValues.push(...companies);
  }

  const about = fieldFilter('about', 'includes', aboutValues);
  if (about && clauses.length < MAX_GROUP_RULES) clauses.push(about);

  if (hq && clauses.length < MAX_GROUP_RULES) clauses.push(hq);

  for (const [name, rawValue] of Object.entries(dataset)) {
    if (clauses.length >= MAX_GROUP_RULES) break;
    if (used.has(name) || name.startsWith('huntlo.') || name.includes('.')) continue;
    if (!SEARCH_INDEX_FIELDS.has(name)) continue;
    const values = asStringList(rawValue);
    if (!values.length) continue;
    const extra =
      name === 'country_code'
        ? fieldFilter(name, 'in', values.map((value) => value.toUpperCase()))
        : fieldFilter(name, 'includes', values);
    if (extra) clauses.push(extra);
  }

  return andGroup(clauses);
}

function filterFromDatasetFilters(raw: unknown): BrightDataFilter | null {
  return buildBrightDataSearchFilter(raw);
}

export function filterFromFutureJobsPayload(payload: Record<string, unknown>): BrightDataFilter | null {
  const fromDataset = filterFromDatasetFilters(payload.datasetFilters);
  if (fromDataset) return fromDataset;

  const queries = asRecord(payload.queries) ?? {};
  const jd = asRecord(payload.jdDetail);
  const prompt = typeof jd?.userText === 'string' ? jd.userText.trim() : '';
  const filters: BrightDataFilter[] = [];

  const titles = queryValues(queries, 'current_employers.title');
  const titleGroup = fieldFilter('position', 'includes', titles);
  if (titleGroup) filters.push(titleGroup);

  const companies = queryValues(queries, 'current_employers.name');
  const companyGroup = fieldFilter('current_company_name', 'includes', companies);
  if (companyGroup) filters.push(companyGroup);

  const cities = queryValues(queries, 'region');
  const cityGroup = fieldFilter('city', 'includes', cities);
  if (cityGroup) filters.push(cityGroup);

  const countries = queryValues(queries, 'country_region');
  const countryCodes = uniqueValues(
    countries.map((name) => COUNTRY_CODES[name.toLowerCase()] ?? '').filter(Boolean)
  );
  if (countryCodes.length) {
    filters.push({
      name: 'country_code',
      operator: 'in',
      value: countryCodes,
    });
  }

  const skills = queryValues(queries, 'skills');
  const skillGroup = fieldFilter('about', 'includes', skills);
  if (skillGroup) filters.push(skillGroup);

  if (filters.length === 0 && prompt) {
    const fromPrompt = fieldFilter('position', 'includes', [prompt.slice(0, 80)]);
    if (fromPrompt) filters.push(fromPrompt);
  }

  return andGroup(filters);
}

export function annotationFromPrompt(userText: string) {
  const trimmed = userText.trim();
  return {
    'current_employers.title': trimmed
      ? { presence: true, value: [trimmed.slice(0, 120)] }
      : { presence: false, value: [] },
    skills: {
      presence: Boolean(trimmed),
      value: {
        mandatory: [] as string[],
        core: [] as string[],
        secondary: trimmed ? trimmed.split(/[\s,]+/).filter(Boolean).slice(0, 8) : [],
      },
    },
  };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function currentCompany(record: Record<string, unknown>): { name: string; title: string } {
  const company = asRecord(record.current_company);
  return {
    name: asString(company?.name) || asString(record.current_company_name),
    title:
      asString(company?.title) ||
      asString(record.position) ||
      asString(record.headline),
  };
}

function skillsFromRecord(record: Record<string, unknown>): string[] {
  if (Array.isArray(record.skills)) {
    return record.skills.map((item) => String(item).trim()).filter(Boolean).slice(0, 12);
  }
  const about = asString(record.about);
  if (!about) return [];
  return about
    .split(/[,•|/]| and /i)
    .map((part) => part.trim())
    .filter((part) => part.length > 1 && part.length < 40)
    .slice(0, 8);
}

export function mapBrightDataRecordToFjDoc(
  record: Record<string, unknown>,
  sessionId: string,
  index: number
): FutureJobsProfileDoc {
  const company = currentCompany(record);
  const url =
    asString(record.url) ||
    asString(record.linkedin_url) ||
    asString(record.input_url);
  const id =
    asString(record.linkedin_id) ||
    asString(record.id) ||
    `${sessionId}-${index}`;
  const name =
    asString(record.name) ||
    [asString(record.first_name), asString(record.last_name)].filter(Boolean).join(' ') ||
    'Unknown';
  const city = asString(record.location) || asString(record.city);
  const country = asString(record.country_code) || asString(record.country);
  const region = city.includes(country) ? city : [city, country].filter(Boolean).join(', ');
  const title = asString(record.position) || company.title;
  const experienceYears = record.experience_count ?? record.years_of_experience;

  return {
    _id: id,
    sourcingSessionId: sessionId,
    finalScore: typeof record.score === 'number' ? record.score : undefined,
    profile: {
      name,
      linkedin_profile_url: url,
      profile_picture_permalink: asString(record.avatar) || asString(record.profile_image_url),
      region,
      years_of_experience_raw: experienceYears as number | string | undefined,
      skills: skillsFromRecord(record),
      current_employers_object: [
        {
          job_title: title || '—',
          name: company.name || '—',
        },
      ],
    },
  };
}

export function formHasCriteria(form: FutureJobsFilterForm): boolean {
  return Boolean(
    form.currentTitle.trim() ||
      form.keywordSkills.trim() ||
      form.location.length ||
      form.selectRegion.length ||
      form.currentCompany.length
  );
}
