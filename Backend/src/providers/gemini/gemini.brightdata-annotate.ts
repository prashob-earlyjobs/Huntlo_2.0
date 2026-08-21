import { getEnv } from '../../config/env.js';
import type { BrightDataFilterField } from '../brightdata/brightdata.catalog.js';

export const GEMINI_BRIGHTDATA_ANNOTATE_MODEL = 'gemini-2.5-flash';

const NOISE_PREFIXES = [
  'posts',
  'activity',
  'people_also_viewed',
  'similar_profiles',
  'bio_links',
  'recommendations',
  'avatar',
  'banner_image',
  'default_avatar',
];

const CITY_TO_COUNTRY: Record<string, { city: string; code: string }> = {
  bangalore: { city: 'Bangalore', code: 'IN' },
  bengaluru: { city: 'Bengaluru', code: 'IN' },
  mumbai: { city: 'Mumbai', code: 'IN' },
  delhi: { city: 'Delhi', code: 'IN' },
  hyderabad: { city: 'Hyderabad', code: 'IN' },
  pune: { city: 'Pune', code: 'IN' },
  chennai: { city: 'Chennai', code: 'IN' },
  gurgaon: { city: 'Gurgaon', code: 'IN' },
  gurugram: { city: 'Gurugram', code: 'IN' },
  kasargod: { city: 'Kasaragod', code: 'IN' },
  kasaragod: { city: 'Kasaragod', code: 'IN' },
  coimbatore: { city: 'Coimbatore', code: 'IN' },
  coimbathore: { city: 'Coimbatore', code: 'IN' },
  kovai: { city: 'Coimbatore', code: 'IN' },
  london: { city: 'London', code: 'GB' },
  'new york': { city: 'New York', code: 'US' },
  'san francisco': { city: 'San Francisco', code: 'US' },
  seattle: { city: 'Seattle', code: 'US' },
  austin: { city: 'Austin', code: 'US' },
  singapore: { city: 'Singapore', code: 'SG' },
  dubai: { city: 'Dubai', code: 'AE' },
  berlin: { city: 'Berlin', code: 'DE' },
  toronto: { city: 'Toronto', code: 'CA' },
  sydney: { city: 'Sydney', code: 'AU' },
};

const CITY_NEIGHBORS: Record<string, [string, string]> = {
  kasaragod: ['Kannur', 'Kanhangad'],
  kasargod: ['Kannur', 'Kanhangad'],
  kannur: ['Kasaragod', 'Kozhikode'],
  kanhangad: ['Kasaragod', 'Kannur'],
  bangalore: ['Hosur', 'Mysore'],
  bengaluru: ['Hosur', 'Mysuru'],
  mumbai: ['Navi Mumbai', 'Thane'],
  delhi: ['Noida', 'Gurugram'],
  gurgaon: ['Delhi', 'Noida'],
  gurugram: ['Delhi', 'Noida'],
  hyderabad: ['Secunderabad', 'Sangareddy'],
  pune: ['Pimpri-Chinchwad', 'Hinjawadi'],
  chennai: ['Tambaram', 'Chengalpattu'],
  coimbatore: ['Tiruppur', 'Erode'],
  coimbathore: ['Tiruppur', 'Erode'],
  kovai: ['Tiruppur', 'Erode'],
  london: ['Reading', 'Watford'],
  'new york': ['Jersey City', 'Newark'],
  'san francisco': ['Oakland', 'San Jose'],
  seattle: ['Bellevue', 'Redmond'],
  austin: ['Round Rock', 'San Antonio'],
  singapore: ['Johor Bahru', 'Batam'],
  dubai: ['Sharjah', 'Abu Dhabi'],
  berlin: ['Potsdam', 'Leipzig'],
  toronto: ['Mississauga', 'Vaughan'],
  sydney: ['Parramatta', 'Newcastle'],
};

export function expandNearbyCities(cities: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  function add(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  }

  for (const city of cities) add(city);
  const primary = cities[0]?.trim();
  if (primary) {
    const neighbors = CITY_NEIGHBORS[primary.toLowerCase()];
    if (neighbors) {
      add(neighbors[0]);
      add(neighbors[1]);
    }
  }
  return out;
}

const COUNTRY_TO_CODE: Record<string, string> = {
  india: 'IN',
  'united states': 'US',
  usa: 'US',
  us: 'US',
  'united kingdom': 'GB',
  uk: 'GB',
  uae: 'AE',
  singapore: 'SG',
  germany: 'DE',
  canada: 'CA',
  australia: 'AU',
};

const SKILL_FAMILIES: Array<{ match: RegExp; skills: string[] }> = [
  {
    match: /\bjava\b/i,
    skills: ['Java', 'Spring', 'Spring Boot', 'Hibernate', 'J2EE'],
  },
  {
    match: /\bnode\.?\s*js\b|\bnodejs\b/i,
    skills: ['Node.js', 'JavaScript', 'Express', 'TypeScript', 'REST'],
  },
  {
    match: /\breact\b/i,
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'HTML'],
  },
  {
    match: /\bpython\b/i,
    skills: ['Python', 'Django', 'Flask', 'SQL', 'REST'],
  },
  {
    match: /\btypescript\b/i,
    skills: ['TypeScript', 'JavaScript', 'Node.js', 'React'],
  },
  {
    match: /\bjavascript\b/i,
    skills: ['JavaScript', 'TypeScript', 'Node.js', 'React'],
  },
  {
    match: /\baws\b/i,
    skills: ['AWS', 'EC2', 'S3', 'Lambda', 'Cloud'],
  },
  {
    match: /\bgolang\b|\bgo\s+developer\b/i,
    skills: ['Go', 'Golang', 'Microservices', 'Docker', 'Kubernetes'],
  },
];

export function expandRelatedSkills(skills: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  function add(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  }

  for (const skill of skills) add(skill);

  const blob = skills.join(' ');
  for (const family of SKILL_FAMILIES) {
    if (family.match.test(blob)) {
      for (const skill of family.skills) add(skill);
    }
  }

  if (out.length < 4) {
    for (const family of SKILL_FAMILIES) {
      if (family.match.test(blob) || family.skills.some((skill) => seen.has(skill.toLowerCase()))) {
        for (const skill of family.skills) add(skill);
        if (out.length >= 4) break;
      }
    }
  }

  return out.slice(0, 8);
}

/** Closely related LinkedIn titles — keep searches broad within a practical value list. */
const TITLE_FAMILIES: Array<{ match: RegExp; titles: string[] }> = [
  {
    match: /\baccountant\b|\baccounts?\s+executive\b|\bbookkeeper\b/i,
    titles: ['Accountant', 'Accounts Executive', 'Finance Executive', 'Bookkeeper'],
  },
  {
    match: /\bsocial\s+media\b/i,
    titles: [
      'Social Media Manager',
      'Social Media Specialist',
      'Digital Marketing Manager',
      'Content Marketing Manager',
    ],
  },
  {
    match: /\bdigital\s+marketing\b|\bseo\s+(?:specialist|analyst|manager)\b/i,
    titles: [
      'Digital Marketing Manager',
      'Digital Marketing Specialist',
      'SEO Specialist',
      'Social Media Manager',
    ],
  },
  {
    match: /\bnode\.?\s*js\b|\bnodejs\b/i,
    titles: ['Node.js Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer'],
  },
  {
    match: /\bjava\b(?!\s*script)/i,
    titles: [
      'Java Developer',
      'Java Engineer',
      'Backend Developer',
      'Software Engineer',
      'Full Stack Developer',
      'Spring Boot Developer',
      'J2EE Developer',
      'Application Developer',
    ],
  },
  {
    match: /\bsap\b/i,
    titles: [
      'SAP Developer',
      'SAP Consultant',
      'SAP ABAP Developer',
      'SAP Fiori Developer',
      'SAP HANA Developer',
      'SAP Functional Consultant',
      'SAP Technical Consultant',
      'SAP Basis Consultant',
    ],
  },
  {
    match: /\breact\b|\bfrontend\b|\bfront[\s-]?end\b/i,
    titles: [
      'Frontend Developer',
      'React Developer',
      'UI Developer',
      'Software Engineer',
      'Full Stack Developer',
      'JavaScript Developer',
      'TypeScript Developer',
      'Web Developer',
    ],
  },
  {
    match: /\bbackend\b|\bback[\s-]?end\b/i,
    titles: [
      'Backend Developer',
      'Backend Engineer',
      'Software Engineer',
      'Full Stack Developer',
      'API Developer',
      'Node.js Developer',
      'Java Developer',
      'Application Developer',
    ],
  },
  {
    match: /\bfull[\s-]?stack\b/i,
    titles: [
      'Full Stack Developer',
      'Software Engineer',
      'Backend Developer',
      'Frontend Developer',
      'Web Developer',
      'MERN Stack Developer',
      'JavaScript Developer',
      'Application Developer',
    ],
  },
  {
    match: /\bsoftware\s+(?:engineer|developer)\b|\bsde\b/i,
    titles: [
      'Software Engineer',
      'Software Developer',
      'Full Stack Developer',
      'Application Developer',
      'Backend Developer',
      'Frontend Developer',
      'Java Developer',
      'Web Developer',
    ],
  },
  {
    match: /\bdata\s+scientist\b|\bml\s+engineer\b|\bmachine\s+learning\b/i,
    titles: ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst', 'AI Engineer'],
  },
  {
    match: /\bdata\s+analyst\b|\bbi\s+(?:analyst|developer)\b/i,
    titles: ['Data Analyst', 'Business Analyst', 'BI Analyst', 'Data Scientist'],
  },
  {
    match: /\bproduct\s+manager\b|\bpm\b|\bproduct\s+owner\b/i,
    titles: ['Product Manager', 'Product Owner', 'Associate Product Manager', 'Technical Product Manager'],
  },
  {
    match: /\brecruiter\b|\btalent\s+acquisition\b|\bsourcer\b/i,
    titles: ['Recruiter', 'Talent Acquisition Specialist', 'HR Recruiter', 'Technical Recruiter'],
  },
  {
    match: /\bhr\b|\bhuman\s+resources\b|\bpeople\s+ops\b/i,
    titles: ['HR Executive', 'HR Manager', 'People Operations', 'Talent Acquisition Specialist'],
  },
  {
    match: /\bdevops\b|\bsre\b|\bplatform\s+engineer\b/i,
    titles: ['DevOps Engineer', 'SRE', 'Platform Engineer', 'Cloud Engineer'],
  },
  {
    match: /\bqa\b|\bquality\s+assurance\b|\btest\s+engineer\b|\bsdet\b/i,
    titles: ['QA Engineer', 'Test Engineer', 'SDET', 'Quality Analyst'],
  },
  {
    match: /\bui\/?ux\b|\bux\s+designer\b|\bproduct\s+designer\b/i,
    titles: ['UI/UX Designer', 'Product Designer', 'UX Designer', 'UI Designer'],
  },
];

export function expandRelatedTitles(titles: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  function add(title: string) {
    const trimmed = title.replace(/\s+/g, ' ').trim();
    if (!trimmed || !isPlausibleTitle(trimmed)) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(trimmed);
  }

  for (const title of titles) add(title);

  const blob = titles.join(' ');
  for (const family of TITLE_FAMILIES) {
    if (family.match.test(blob)) {
      for (const title of family.titles) add(title);
    }
  }

  if (out.length < 8) {
    for (const family of TITLE_FAMILIES) {
      if (
        family.match.test(blob) ||
        family.titles.some((title) => seen.has(title.toLowerCase()))
      ) {
        for (const title of family.titles) add(title);
        if (out.length >= 8) break;
      }
    }
  }

  return out.slice(0, 8);
}

export type BrightDataDatasetFilters = Record<string, string[] | boolean | number>;

function skillsFromPrompt(text: string): string[] {
  const found: string[] = [];
  for (const family of SKILL_FAMILIES) {
    if (family.match.test(text)) found.push(family.skills[0]!);
  }
  return expandRelatedSkills(found);
}

function titlesFromPrompt(text: string): string[] {
  const found: string[] = [];
  for (const family of TITLE_FAMILIES) {
    if (family.match.test(text)) found.push(family.titles[0]!);
  }
  const extracted = extractJobTitle(text);
  if (extracted) found.unshift(extracted);
  return expandRelatedTitles(found);
}

function withExpandedCities(filters: BrightDataDatasetFilters): BrightDataDatasetFilters {
  const existing = Array.isArray(filters.city)
    ? filters.city
    : typeof filters.city === 'string' && filters.city.trim()
      ? [filters.city]
      : [];
  if (existing.length) {
    filters.city = expandNearbyCities(existing);
  }
  return filters;
}

const TITLE_FIELD_NAMES = new Set(['position', 'current_company.title', 'experience.title']);

export function isPlausibleTitle(value: string): boolean {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length < 2 || text.length > 72) return false;
  if ((text.match(/,/g) ?? []).length >= 2) return false;
  if (
    /\b(?:having|currently at|previously at|years? of exp|skills around|certified|dean'?s list|btech in|from nit|from iit)\b/i.test(
      text
    )
  ) {
    return false;
  }
  return true;
}

function keepTitles(values: string[]): string[] {
  return [...new Set(values.map((value) => value.replace(/\s+/g, ' ').trim()).filter(isPlausibleTitle))].slice(
    0,
    8
  );
}

function cleanTitleFields(filters: BrightDataDatasetFilters): BrightDataDatasetFilters {
  for (const key of TITLE_FIELD_NAMES) {
    const raw = filters[key];
    if (!Array.isArray(raw)) continue;
    const cleaned = keepTitles(raw.map(String));
    if (cleaned.length) filters[key] = cleaned;
    else delete filters[key];
  }
  return filters;
}

function mergeDatasetFilters(
  gemini: BrightDataDatasetFilters,
  fallback: BrightDataDatasetFilters
): BrightDataDatasetFilters {
  const out: BrightDataDatasetFilters = { ...fallback };
  for (const [key, value] of Object.entries(gemini)) {
    if (Array.isArray(value) && TITLE_FIELD_NAMES.has(key)) {
      const geminiTitles = keepTitles(value.map(String));
      const fallbackTitles = Array.isArray(out[key]) ? keepTitles((out[key] as string[]).map(String)) : [];
      out[key] = geminiTitles.length ? geminiTitles : fallbackTitles;
      continue;
    }
    if (Array.isArray(value) && value.length) {
      const existing = Array.isArray(out[key]) ? (out[key] as string[]) : [];
      out[key] = [...new Set([...value.map(String), ...existing.map(String)])];
      continue;
    }
    if (typeof value === 'string' && value.trim()) {
      out[key] = value;
      continue;
    }
    if (typeof value === 'boolean' || typeof value === 'number') {
      out[key] = value;
    }
  }
  return cleanTitleFields(out);
}

function withExpandedAboutSkills(
  filters: BrightDataDatasetFilters,
  userText: string
): BrightDataDatasetFilters {
  const existing = Array.isArray(filters.about)
    ? filters.about
    : typeof filters.about === 'string' && filters.about.trim()
      ? [filters.about]
      : [];
  const expanded = expandRelatedSkills(existing.length ? existing : skillsFromPrompt(userText));
  if (expanded.length >= 4 || expanded.length > existing.length) {
    filters.about = expanded;
  }
  return filters;
}

export function withExpandedPositionTitles(
  filters: BrightDataDatasetFilters,
  userText = ''
): BrightDataDatasetFilters {
  const existing = Array.isArray(filters.position)
    ? filters.position.map(String)
    : typeof filters.position === 'string' && String(filters.position).trim()
      ? [String(filters.position)]
      : [];
  const seed = existing.length ? existing : titlesFromPrompt(userText);
  const expanded = expandRelatedTitles(seed);
  if (expanded.length) {
    filters.position = keepTitles(expanded);
  }
  return filters;
}

function catalogForPrompt(fields: BrightDataFilterField[]): BrightDataFilterField[] {
  return fields.filter((field) => {
    if (field.type === 'url' && field.name !== 'url') return false;
    const root = field.name.split('.')[0] ?? field.name;
    return !NOISE_PREFIXES.includes(root);
  });
}

export function buildBrightDataAnnotatePrompt(
  userText: string,
  fields: BrightDataFilterField[]
): string {
  const catalog = catalogForPrompt(fields).map((field) => ({
    name: field.name,
    type: field.type,
    label: field.label,
    description: field.description.slice(0, 160),
  }));

  return [
    'You extract VALUES from a recruiter query. Huntlo will build the Bright Data Dataset API filter object.',
    'Do not write filter syntax. Do not return operator, name/value filter objects, and/or groups, or combine_nested_fields.',
    'The allowed field names come from Huntlo GET /api/v1/candidates/search/catalog.',
    'Return ONLY JSON with this shape:',
    JSON.stringify({ extracted: { 'catalog.field.name': ['value'] } }),
    'Catalog fields:',
    JSON.stringify(catalog),
    'Rules:',
    '- Use only catalog field names. Omit any field you cannot justify from the query.',
    '- Values only: arrays of strings, or a boolean/number when the catalog type requires it.',
    '- Do not invent employers, schools, or degrees that are not in the query. Nearby cities are an exception (see city rule).',
    '- position: current job title(s). Always return up to 8 closely related titles so search is broader — keep the primary title first. Example: "Accountant" → ["Accountant", "Accounts Executive", "Finance Executive", "Bookkeeper"]. Example: "Social Media Manager" → ["Social Media Manager", "Social Media Specialist", "Digital Marketing Manager", "Content Marketing Manager"]. Short job titles only, not sentences. Do not invent unrelated roles.',
    '- city: primary city first, then exactly two closest neighboring cities/towns so search is not too strict. Example: Kasaragod → ["Kasaragod", "Kannur", "Kanhangad"]. Bangalore → ["Bangalore", "Hosur", "Mysore"]. Do not replace the primary city with a metro. Do not add unrelated states.',
    '- country_code: ISO 3166-1 alpha-2 uppercase (IN for India, US, GB).',
    '- location: full location string only when the query gives more than a city.',
    '- about: profile about/skills keywords. Always return at least 4 related skills for the role (up to 8), not only the one word in the query. Example: "Java developers" → ["Java", "Spring", "Spring Boot", "Hibernate"] (add J2EE or Maven if helpful). Keep the primary skill first. Do not invent unrelated stacks (no React for a Java query).',
    '- education.title or educations_details: only if a school or degree is mentioned.',
    '- current_company.name / current_company.title: only if a company or current title is named.',
    '- experience.title: past titles only when the query asks for previous roles.',
    '- Years of experience: a single stated number is not strict. Expand ±1 year (example: 2 years → 1–3). Set experience.duration to every year in that inclusive range, e.g. "1 year", "1 yr", "2 years", "2 yrs", "3 years", "3 yrs". If the query already gives a range (4–7 years), keep that range. Never return only the exact year.',
    '- Fill every dimension mentioned in the query: position, city, country_code, about, current_company.name, experience.company, education.title, education.degree, education.field, certifications.title, honors_and_awards.title, experience.duration. Do not return only one or two fields.',
    '- Ignore posts, activity, similar profiles, avatars, and URLs unless the query clearly asks.',
    `Recruiter query:\n${userText.slice(0, 4000)}`,
  ].join('\n');
}

export function relaxedExperienceYearRange(years: number): { min: number; max: number } {
  const n = Math.max(0, Math.min(30, Math.round(years)));
  return {
    min: Math.max(0, n - 1),
    max: Math.min(30, n + 1),
  };
}

export function durationValuesForYearRange(min: number, max: number): string[] {
  const values: string[] = [];
  const start = Math.max(0, Math.min(min, max));
  const end = Math.min(30, Math.max(min, max));
  for (let year = start; year <= end; year += 1) {
    if (year === 0) {
      values.push('less than a year', '<1 year');
      continue;
    }
    values.push(`${year} year${year === 1 ? '' : 's'}`, `${year} yr${year === 1 ? '' : 's'}`);
  }
  return [...new Set(values)];
}

function allowedNames(fields: BrightDataFilterField[]): Set<string> {
  const names = new Set(fields.map((field) => field.name));
  names.add('experience.duration');
  return names;
}

function setIfAllowed(
  out: BrightDataDatasetFilters,
  names: Set<string>,
  name: string,
  value: string[] | boolean | number
): void {
  if (!names.has(name)) return;
  if (Array.isArray(value) && value.length === 0) return;
  out[name] = value;
}

export function heuristicBrightDataFilters(
  userText: string,
  fields: BrightDataFilterField[]
): BrightDataDatasetFilters {
  const names = allowedNames(fields);
  const out: BrightDataDatasetFilters = {};
  let rest = userText.trim();
  if (!rest) return out;

  const rangeMatch = rest.match(
    /\b(\d+)\s*(?:-|–|to)\s*(\d+)\s*\+?\s*(?:yrs?|years?)(?:\s+of\s+(?:exp(?:erience)?))?/i
  );
  const yearsMatch = rest.match(
    /\b(?:having|with)?\s*(\d+)\s*\+?\s*(?:yrs?|years?)(?:\s+of\s+(?:exp(?:erience)?))?/i
  );
  if (rangeMatch?.[1] && rangeMatch[2]) {
    rest = rest.replace(rangeMatch[0], ' ');
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    setIfAllowed(out, names, 'experience.duration', durationValuesForYearRange(min, max));
  } else if (yearsMatch?.[1]) {
    rest = rest.replace(yearsMatch[0], ' ');
    const { min, max } = relaxedExperienceYearRange(Number(yearsMatch[1]));
    setIfAllowed(out, names, 'experience.duration', durationValuesForYearRange(min, max));
  }

  const educationMatch = rest.match(
    /\b((?:b\.?\s*tech|b\.?\s*e\.?|m\.?\s*tech|mba|ph\.?d|bachelor'?s|master'?s)(?:\s+in\s+(?!from\b)[a-z]+(?:\s+(?!from\b)[a-z]+){0,4})?)(?=\s+from\b|\s*,|\s+currently|\s+having|\s+and\b|$)/i
  );
    if (educationMatch?.[1]) {
    const education = educationMatch[1].replace(/\s+/g, ' ').trim();
    rest = rest.replace(educationMatch[0], ' ');
    if (names.has('education.degree')) {
      setIfAllowed(out, names, 'education.degree', [education]);
    } else if (names.has('education.title')) {
      setIfAllowed(out, names, 'education.title', [education]);
    } else if (names.has('educations_details')) {
      setIfAllowed(out, names, 'educations_details', [education]);
    }
  }

  const schoolMatch = rest.match(
    /\bfrom\s+((?:nit|iit|iiit|bits)\s+[a-z]+|[a-z][a-z .']{2,40}?(?:university|college|institute))\b/i
  );
  if (schoolMatch?.[1]) {
    const school = schoolMatch[1].replace(/\s+/g, ' ').trim();
    rest = rest.replace(schoolMatch[0], ' ');
    setIfAllowed(out, names, 'education.title', [school]);
  }

  const currentCompany = rest.match(
    /\bcurrently\s+(?:at|with)\s+([a-z0-9&.\- ]{2,40}?)(?=\s+or\b|\s*,|\s+previously|\s+having|$)/i
  );
  if (currentCompany?.[1]) {
    rest = rest.replace(currentCompany[0], ' ');
    setIfAllowed(out, names, 'current_company.name', [currentCompany[1].replace(/\s+/g, ' ').trim()]);
  }

  const pastCompany = rest.match(
    /\bpreviously\s+(?:at|with)\s+([a-z0-9&.\- ]{2,40}?)(?=\s*,|\s+and\b|\s+btech|$)/i
  );
  if (pastCompany?.[1]) {
    rest = rest.replace(pastCompany[0], ' ');
    setIfAllowed(out, names, 'experience.company', [pastCompany[1].replace(/\s+/g, ' ').trim()]);
  }

  const certMatch = rest.match(
    /\b((?:aws|google|azure|gcp)\s+certified(?:\s+[a-z]+){0,6})\b/i
  );
  if (certMatch?.[1]) {
    rest = rest.replace(certMatch[0], ' ');
    setIfAllowed(out, names, 'certifications.title', [certMatch[1].replace(/\s+/g, ' ').trim()]);
  }

  const honorMatch = rest.match(/\b(dean'?s\s+list|summa cum laude|magna cum laude)\b/i);
  if (honorMatch?.[1]) {
    rest = rest.replace(honorMatch[0], ' ');
    setIfAllowed(out, names, 'honors_and_awards.title', [honorMatch[1].replace(/\s+/g, ' ').trim()]);
  }

  const fromMatch = rest.match(
    /\b(?:from|in|based in|located in)\s+([a-z][a-z .'-]{1,40}?)(?=\s+(?:having|with|and)\b|[.,]|$)/i
  );
  if (fromMatch?.[1]) {
    const place = fromMatch[1].trim().replace(/[.]+$/, '');
    rest = rest.replace(fromMatch[0], ' ');
    const mapped = CITY_TO_COUNTRY[place.toLowerCase()];
    const countryCode = COUNTRY_TO_CODE[place.toLowerCase()];
    if (mapped) {
      setIfAllowed(out, names, 'city', expandNearbyCities([mapped.city]));
      setIfAllowed(out, names, 'country_code', [mapped.code]);
    } else if (countryCode) {
      setIfAllowed(out, names, 'country_code', [countryCode]);
    } else {
      const city = place.replace(/\b\w/g, (char) => char.toUpperCase());
      setIfAllowed(out, names, 'city', expandNearbyCities([city]));
    }
  }

  const expandedSkills = skillsFromPrompt(userText);
  if (expandedSkills.length) {
    setIfAllowed(out, names, 'about', expandedSkills);
  }

  const position = extractJobTitle(userText);
  if (position) {
    setIfAllowed(out, names, 'position', [position]);
  }

  return cleanTitleFields(withExpandedPositionTitles(out, userText));
}

function normalizeTitle(raw: string): string {
  return raw
    .replace(/\bnode\s*js\b/gi, 'Node.js')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/Node\.Js/g, 'Node.js')
    .replace(/Developers\b/i, 'Developer')
    .replace(/Engineers\b/i, 'Engineer');
}

function extractJobTitle(text: string): string | null {
  const match = text.match(
    /\b((?:intern|junior|associate|mid-level|senior|staff|lead|principal|head(?:\s+of)?)\s+)?(?:java|javascript|python|react|angular|vue|node\.?\s*js|golang|go|ruby|php|c\+\+|c#|\.net|android|ios|data|ml|ai|backend|frontend|full[\s-]?stack|devops|sre|qa)?\s*(?:developers?|engineers?|architects?|designers?|managers?|analysts?|scientists?|consultants?|accountants?|recruiters?|specialists?|executives?)\b/i
  );
  if (match?.[0]) {
    const title = normalizeTitle(match[0]);
    if (isPlausibleTitle(title)) return title;
  }
  const firstClause = (text.split(/[,.]/)[0] ?? '')
    .replace(/\b(?:looking for|find|hire|hiring|candidates?)\b/gi, ' ')
    .replace(/\b(?:from|in|based in|located in)\s+.+$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = firstClause ? normalizeTitle(firstClause) : '';
  return isPlausibleTitle(title) ? title : null;
}

function looksLikeBrightDataFilterSyntax(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const rec = value as Record<string, unknown>;
  if (typeof rec.operator === 'string') return true;
  if (Array.isArray(rec.filters) && rec.filters.every((item) => looksLikeBrightDataFilterSyntax(item))) {
    return rec.filters.length > 0;
  }
  return false;
}

/** Keep Gemini output as field → values. Drop any Dataset API filter syntax. */
export function extractDatasetFilterValues(
  raw: unknown,
  fields: BrightDataFilterField[]
): BrightDataDatasetFilters {
  const names = allowedNames(fields);
  const types = new Map(fields.map((field) => [field.name, field.type]));
  if (looksLikeBrightDataFilterSyntax(raw)) return {};
  const record = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const nested =
    (record.extracted && typeof record.extracted === 'object' && !Array.isArray(record.extracted)
      ? record.extracted
      : record.filters && typeof record.filters === 'object' && !Array.isArray(record.filters)
        ? record.filters
        : record) as Record<string, unknown>;
  if (looksLikeBrightDataFilterSyntax(nested)) return {};
  const out: BrightDataDatasetFilters = {};
  for (const [name, value] of Object.entries(nested)) {
    if (!names.has(name)) continue;
    if (looksLikeBrightDataFilterSyntax(value)) continue;
    const type = types.get(name);
    if (type === 'boolean') {
      if (typeof value === 'boolean') out[name] = value;
      else if (value === 'true' || value === 'false') out[name] = value === 'true';
      continue;
    }
    if (type === 'number') {
      const num = typeof value === 'number' ? value : Number(value);
      if (Number.isFinite(num)) out[name] = num;
      continue;
    }
    const values = Array.isArray(value)
      ? value.map((item) => String(item).trim()).filter(Boolean)
      : typeof value === 'string' && value.trim()
        ? [value.trim()]
        : [];
    if (name === 'country_code') {
      const codes = values.map((item) => item.toUpperCase().slice(0, 2)).filter((item) => /^[A-Z]{2}$/.test(item));
      if (codes.length) out[name] = codes;
      continue;
    }
    if (values.length) out[name] = TITLE_FIELD_NAMES.has(name) ? keepTitles(values) : values;
  }
  return cleanTitleFields(out);
}

async function callGeminiJson(prompt: string): Promise<string | null> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_BRIGHTDATA_ANNOTATE_MODEL}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error(
      '[gemini.brightdata-annotate] generateContent failed',
      res.status,
      errBody.slice(0, 400)
    );
    return null;
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

export async function annotateBrightDataPrompt(
  userText: string,
  fields: BrightDataFilterField[]
): Promise<{ filters: BrightDataDatasetFilters; source: 'gemini' | 'heuristic' }> {
  const prompt = userText.trim();
  const fallback = heuristicBrightDataFilters(prompt, fields);
  if (!prompt || fields.length === 0) {
    return { filters: fallback, source: 'heuristic' };
  }

  try {
    if (getEnv().APP_ENV === 'test') {
      return { filters: fallback, source: 'heuristic' };
    }
  } catch {
    return { filters: fallback, source: 'heuristic' };
  }

  const text = await callGeminiJson(buildBrightDataAnnotatePrompt(prompt, fields));
  if (!text) return { filters: fallback, source: 'heuristic' };

  try {
    const parsed = JSON.parse(text) as unknown;
    const filters = cleanTitleFields(
      withExpandedPositionTitles(
        withExpandedCities(
          withExpandedAboutSkills(
            mergeDatasetFilters(extractDatasetFilterValues(parsed, fields), fallback),
            prompt
          )
        ),
        prompt
      )
    );
    if (Object.keys(filters).length === 0) {
      return { filters: fallback, source: 'heuristic' };
    }
    return { filters, source: 'gemini' };
  } catch {
    return { filters: fallback, source: 'heuristic' };
  }
}
