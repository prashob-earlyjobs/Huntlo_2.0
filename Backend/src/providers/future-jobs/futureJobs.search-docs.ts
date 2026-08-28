import type { FutureJobsProfileDoc, FutureJobsProfileEmployer } from './futureJobs.types.js';

function asObj(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(record: Record<string, unknown> | null, keys: string[]): string {
  if (!record) return '';
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(record: Record<string, unknown> | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value);
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

const EXPERIENCE_YEAR_KEYS = [
  'years_of_experience_raw',
  'yearsOfExperience',
  'years_of_experience',
  'experienceYears',
  'totalExperience',
  'total_experience',
  'totalExperienceYears',
  'total_experience_years',
  'yearsExperience',
  'yoe',
];

function parseExperienceYears(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value < 0 || value > 60) return null;
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const match = value.trim().match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;
    const n = Number(match[1]);
    if (!Number.isFinite(n) || n < 0 || n > 60) return null;
    return n;
  }
  const obj = asObj(value);
  if (obj) {
    return parseExperienceYears(obj.years ?? obj.value ?? obj.total ?? obj.raw);
  }
  return null;
}

function pickExperienceYears(record: Record<string, unknown> | null): number | null {
  if (!record) return null;
  for (const key of EXPERIENCE_YEAR_KEYS) {
    const parsed = parseExperienceYears(record[key]);
    if (parsed != null) return parsed;
  }
  return null;
}

function timestampFromUnknown(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e12) return value;
    if (value > 1e9) return value * 1000;
    return null;
  }
  if (typeof value === 'string' && value.trim()) {
    const t = Date.parse(value);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}

function yearsFromEmployerHistory(profile: Record<string, unknown> | null): number | null {
  if (!profile) return null;
  const experience = asObj(profile.experience);
  const details = asObj(experience?.employment_details);
  const buckets = [
    details?.current,
    details?.past,
    profile.current_employers_object,
    profile.current_employers,
    profile.past_employers,
    profile.all_employers,
    profile.experience,
    profile.experiences,
    profile.positions,
  ];
  let earliest: number | null = null;
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    for (const item of bucket) {
      const job = asObj(item);
      if (!job) continue;
      const start = timestampFromUnknown(job.start_date ?? job.startDate ?? job.start);
      if (start == null) continue;
      if (earliest == null || start < earliest) earliest = start;
    }
  }
  if (earliest == null) return null;
  const years = (Date.now() - earliest) / (365.25 * 24 * 60 * 60 * 1000);
  if (!Number.isFinite(years) || years < 0 || years > 60) return null;
  return Math.round(years);
}

/** Numeric years of experience from a `/wl/search` item or sourcing profile doc. */
export function experienceYearsFromFjDoc(raw: unknown): number | null {
  const wrapper = asObj(raw);
  if (!wrapper) return null;
  const nested = asObj(wrapper.profile);
  const profile = nested ?? (looksLikeProfile(wrapper) ? wrapper : null);
  return (
    pickExperienceYears(wrapper) ??
    pickExperienceYears(profile) ??
    yearsFromEmployerHistory(profile) ??
    yearsFromEmployerHistory(wrapper)
  );
}

function nameFromProfile(profile: Record<string, unknown>): string {
  const full = pickString(profile, ['name', 'fullName', 'full_name', 'displayName']);
  if (full) return full;
  const first = pickString(profile, ['firstName', 'first_name']);
  const last = pickString(profile, ['lastName', 'last_name']);
  return `${first} ${last}`.trim();
}

function locationFromProfile(profile: Record<string, unknown>): string {
  const direct = pickString(profile, [
    'region',
    'location',
    'locationName',
    'geoLocation',
    'city',
  ]);
  if (direct) return direct;

  for (const key of ['location', 'geoLocation', 'geo', 'geo_location']) {
    const loc = asObj(profile[key]);
    if (!loc) continue;
    const parts = ['city', 'state', 'region', 'country', 'default']
      .map((part) => pickString(loc, [part]))
      .filter(Boolean);
    if (parts.length) return [...new Set(parts)].join(', ');
  }
  return '';
}

function pictureFromProfile(profile: Record<string, unknown>): string {
  return pickString(profile, [
    'profile_picture_permalink',
    'profile_picture_url',
    'profilePictureUrl',
    'profilePicture',
    'photoUrl',
    'photo_url',
    'pictureUrl',
    'avatarUrl',
    'avatar',
  ]);
}

function linkedinFromProfile(profile: Record<string, unknown>): string {
  const url = pickString(profile, [
    'linkedin_flagship_url',
    'linkedin_profile_url',
    'linkedinUrl',
    'linkedin_url',
    'profileUrl',
    'publicProfileUrl',
    'url',
  ]);
  if (url) return url;

  const username = pickString(profile, [
    'publicIdentifier',
    'public_identifier',
    'vanityName',
    'linkedinUsername',
    'username',
  ]);
  if (username && !/^ACoAA/i.test(username)) {
    const slug = username.replace(/^\/+/, '').replace(/^in\//i, '');
    if (slug) return `https://www.linkedin.com/in/${encodeURIComponent(slug)}`;
  }

  const id = pickString(profile, ['id', '_id']);
  if (id && /^ACoAA/i.test(id)) {
    return `https://www.linkedin.com/in/${encodeURIComponent(id)}`;
  }
  return '';
}

function firstEmployerEntry(profile: Record<string, unknown>): Record<string, unknown> | null {
  const buckets = [
    profile.current_employers_object,
    profile.current_employers,
    profile.currentEmployers,
    profile.experience,
    profile.experiences,
    profile.positions,
    profile.currentPositions,
  ];
  for (const bucket of buckets) {
    if (!Array.isArray(bucket) || bucket.length === 0) continue;
    const first = asObj(bucket[0]);
    if (first) return first;
  }
  return asObj(profile.current_employer) || asObj(profile.currentEmployment) || null;
}

function employerFromProfile(profile: Record<string, unknown>): FutureJobsProfileEmployer | null {
  const job = firstEmployerEntry(profile);
  const nestedCompany = asObj(job?.company) || asObj(job?.employer);
  const title =
    pickString(job, ['job_title', 'title', 'employee_title', 'occupation', 'position']) ||
    pickString(profile, ['headline', 'title', 'occupation', 'currentTitle']);
  const company =
    pickString(job, ['company_name', 'name', 'employer_name', 'companyName', 'company']) ||
    pickString(nestedCompany, ['name', 'company_name']);
  if (!title && !company) return null;
  return {
    job_title: title || undefined,
    name: company || undefined,
    company_name: company || undefined,
  };
}

function looksLikeProfile(record: Record<string, unknown>): boolean {
  return Boolean(
    pickString(record, [
      'name',
      'fullName',
      'full_name',
      'firstName',
      'first_name',
      'linkedin_profile_url',
      'linkedinUrl',
      'headline',
      'id',
      '_id',
    ])
  );
}

function arrayBucketsFromResponse(res: unknown): unknown[][] {
  const root = asObj(res);
  if (!root) return [];

  const buckets: unknown[][] = [];
  const pushIfArray = (value: unknown) => {
    if (Array.isArray(value)) buckets.push(value);
  };

  pushIfArray(root.data);

  const dataObj = asObj(root.data);
  if (dataObj) {
    pushIfArray(dataObj.docs);
    pushIfArray(dataObj.profiles);
    pushIfArray(dataObj.candidates);
    pushIfArray(dataObj.results);
    pushIfArray(asObj(dataObj.session)?.docs);
  }

  pushIfArray(root.docs);
  pushIfArray(root.profiles);
  pushIfArray(root.candidates);
  pushIfArray(root.results);
  return buckets;
}

/**
 * Collapse live `/wl/search` and sourcing-session profile docs onto the
 * canonical `FutureJobsProfileDoc` shape used by persist + dashboard mapping.
 */
export function normalizeFjProfileDoc(raw: unknown): FutureJobsProfileDoc | null {
  const wrapper = asObj(raw);
  if (!wrapper) return null;

  const nested = asObj(wrapper.profile);
  const profile = nested ?? (looksLikeProfile(wrapper) ? wrapper : null);
  if (!profile) return null;

  const name = nameFromProfile(profile);
  const firstName = pickString(profile, ['firstName', 'first_name']);
  const lastName = pickString(profile, ['lastName', 'last_name']);
  const headline = pickString(profile, ['headline', 'title', 'occupation', 'currentTitle']);
  const linkedin = linkedinFromProfile(profile);
  const location = locationFromProfile(profile);
  const picture = pictureFromProfile(profile);
  const years = experienceYearsFromFjDoc(wrapper);
  const employer = employerFromProfile(profile);
  const id =
    pickString(wrapper, ['_id', 'id', 'candidateId']) || pickString(profile, ['_id', 'id']);
  const existingEmployers = Array.isArray(profile.current_employers_object)
    ? (profile.current_employers_object as FutureJobsProfileEmployer[])
    : [];

  return {
    ...wrapper,
    _id: id || undefined,
    sourcingSessionId:
      pickString(wrapper, ['sourcingSessionId']) ||
      pickString(profile, ['sourcingSessionId']) ||
      undefined,
    finalScore:
      pickNumber(wrapper, ['finalScore', 'score', 'matchScore']) ??
      pickNumber(profile, ['finalScore', 'score', 'matchScore']) ??
      undefined,
    fit:
      pickString(wrapper, ['fit', 'fitLabel', 'fit_label']) ||
      pickString(profile, ['fit', 'fitLabel', 'fit_label']) ||
      undefined,
    profile: {
      ...profile,
      name: name || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      headline: headline || undefined,
      linkedin_profile_url: linkedin || undefined,
      profile_picture_permalink: picture || undefined,
      region: location || undefined,
      years_of_experience_raw: years ?? undefined,
      current_employers_object:
        existingEmployers.length > 0 ? existingEmployers : employer ? [employer] : [],
    },
  };
}

/** Pull profile docs from POST /wl/search — live `data` is an array, not `{ docs }`. */
export function extractSearchProfileDocs(res: unknown): FutureJobsProfileDoc[] {
  const buckets = arrayBucketsFromResponse(res);
  for (const bucket of buckets) {
    if (bucket.length === 0) continue;
    const docs = bucket
      .map((item) => normalizeFjProfileDoc(item))
      .filter((doc): doc is FutureJobsProfileDoc => Boolean(doc));
    if (docs.length > 0) return docs;
  }
  return [];
}

export function extractSearchTotalDocs(res: unknown, docs: FutureJobsProfileDoc[]): number {
  const root = asObj(res);
  const dataObj = asObj(root?.data);
  const n =
    (dataObj && pickNumber(dataObj, ['totalDocs', 'total', 'count'])) ??
    (root && pickNumber(root, ['totalDocs', 'total', 'count']));
  return n != null && n >= 0 ? Math.floor(n) : docs.length;
}
