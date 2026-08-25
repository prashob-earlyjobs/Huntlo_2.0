import { looksValidContact } from '../future-jobs/futureJobs.reveal.js';
import type { FutureJobsProfileDoc } from '../future-jobs/index.js';
import { labelListFromUnknown } from '../../shared/strings/label-list.js';
import type {
  BrightDataContactLookup,
  BrightDataLinkedInProfile,
} from './brightData.types.js';

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function companyNameFromProfile(profile: BrightDataLinkedInProfile): string {
  const current = profile.current_company;
  if (typeof current === 'string' && current.trim()) return current.trim();
  if (current && typeof current === 'object') {
    const name = (current as { name?: string; title?: string }).name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  if (typeof profile.company_name === 'string' && profile.company_name.trim()) {
    return profile.company_name.trim();
  }
  if (typeof profile.current_company_name === 'string' && profile.current_company_name.trim()) {
    return profile.current_company_name.trim();
  }
  return '';
}

function nameFromProfile(profile: BrightDataLinkedInProfile): string {
  if (typeof profile.name === 'string' && profile.name.trim()) return profile.name.trim();
  const first = typeof profile.first_name === 'string' ? profile.first_name.trim() : '';
  const last = typeof profile.last_name === 'string' ? profile.last_name.trim() : '';
  const combined = [first, last].filter(Boolean).join(' ');
  return combined || 'Unknown';
}

function linkedinUrlFromProfile(profile: BrightDataLinkedInProfile): string {
  return (
    (typeof profile.url === 'string' && profile.url.trim()) ||
    (typeof profile.linkedin_url === 'string' && profile.linkedin_url.trim()) ||
    (typeof profile.input_url === 'string' && profile.input_url.trim()) ||
    ''
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function isPresentDate(raw: unknown): boolean {
  if (raw == null || raw === '') return true;
  if (typeof raw !== 'string') return false;
  return /^(present|current|now|ongoing|till\s*date|to\s*date)$/i.test(raw.trim());
}

function monthFromUnknown(raw: unknown): number | null {
  if (typeof raw === 'number' && raw >= 1 && raw <= 12) return raw - 1;
  if (typeof raw === 'number' && raw >= 0 && raw <= 11) return raw;
  if (typeof raw !== 'string') return null;
  const key = raw.trim().toLowerCase();
  return key in MONTHS ? MONTHS[key]! : null;
}

function parseLinkedInDate(raw: unknown): Date | null {
  if (raw == null || raw === '') return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;
  if (isPresentDate(raw)) return new Date();

  const rec = asRecord(raw);
  if (rec) {
    const year = Number(rec.year ?? rec.Year);
    if (Number.isFinite(year) && year >= 1950 && year <= 2100) {
      const month = monthFromUnknown(rec.month ?? rec.Month ?? rec.month_name) ?? 0;
      return new Date(year, month, 1);
    }
  }

  if (typeof raw === 'number' && raw >= 1950 && raw <= 2100) {
    return new Date(raw, 0, 1);
  }

  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;

  const monthYear = s.match(
    /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{4})$/i
  );
  if (monthYear) {
    const month = monthFromUnknown(monthYear[1]);
    const year = Number(monthYear[2]);
    if (month != null && Number.isFinite(year)) return new Date(year, month, 1);
  }

  const yearMonth = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/);
  if (yearMonth) {
    const year = Number(yearMonth[1]);
    const month = Number(yearMonth[2]);
    if (year >= 1950 && month >= 1 && month <= 12) return new Date(year, month - 1, 1);
  }

  const yearOnly = s.match(/^(\d{4})$/);
  if (yearOnly) {
    const year = Number(yearOnly[1]);
    if (year >= 1950 && year <= 2100) return new Date(year, 0, 1);
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  return null;
}

function parseDurationToYears(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && raw <= 80) {
    return raw;
  }

  const rec = asRecord(raw);
  if (rec) {
    const years = Number(rec.years ?? rec.year ?? 0);
    const months = Number(rec.months ?? rec.month ?? 0);
    if ((Number.isFinite(years) && years) || (Number.isFinite(months) && months)) {
      return Math.max(0, (Number.isFinite(years) ? years : 0) + (Number.isFinite(months) ? months : 0) / 12);
    }
  }

  if (typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  const yearsMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)\b/);
  const monthsMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:months?|mos?|m)\b/);
  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;
  if (years || months) return years + months / 12;

  const n = Number(s);
  return Number.isFinite(n) && n >= 0 && n <= 80 ? n : null;
}

function flattenExperienceItems(items: Record<string, unknown>[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const item of items) {
    const nested = Array.isArray(item.positions)
      ? item.positions.map(asRecord).filter((row): row is Record<string, unknown> => Boolean(row))
      : [];
    if (nested.length === 0) {
      out.push(item);
      continue;
    }
    for (const pos of nested) {
      out.push({
        ...item,
        ...pos,
        start_date: pos.start_date ?? pos.startDate ?? item.start_date,
        end_date: pos.end_date ?? pos.endDate ?? item.end_date,
        duration: pos.duration ?? item.duration,
        duration_short: pos.duration_short ?? item.duration_short,
      });
    }
  }
  return out;
}

function pickExperienceItems(profile: Record<string, unknown>): Record<string, unknown>[] {
  const raw = profile.experience ?? profile.experiences ?? profile.work_experience;
  if (!Array.isArray(raw)) return [];
  const items = raw.map(asRecord).filter((item): item is Record<string, unknown> => Boolean(item));
  return flattenExperienceItems(items);
}

/** Bright Data often stores tenure as `"2015 - 2019"` instead of `"4 years"`. */
function parseYearRangeToInterval(raw: unknown): [number, number] | null {
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(/^(\d{4})\s*[-–—]\s*(\d{4}|present|current|now)$/i);
  if (!match) return null;
  const startYear = Number(match[1]);
  if (startYear < 1950 || startYear > 2100) return null;
  const start = new Date(startYear, 0, 1).getTime();
  const endToken = match[2]!;
  // Year-only ranges are inclusive of the start year only — "2015 - 2019"
  // is 4 years (Jan 2015 → Jan 2019), not 5.
  const end = /present|current|now/i.test(endToken)
    ? Date.now()
    : new Date(Number(endToken), 0, 1).getTime();
  if (!Number.isFinite(end) || end < start) return null;
  return [start, end];
}

function yearsFromExperienceItems(items: Record<string, unknown>[]): number | null {
  const intervals: Array<[number, number]> = [];
  let durationSum = 0;
  let usedDuration = false;
  const now = Date.now();

  for (const item of items) {
    const start = parseLinkedInDate(
      item.start_date ?? item.startDate ?? item.started_on ?? item.from ?? item.start
    );
    const rawEnd = item.end_date ?? item.endDate ?? item.ended_on ?? item.to ?? item.end;
    const end = isPresentDate(rawEnd) || rawEnd == null || rawEnd === ''
      ? new Date(now)
      : parseLinkedInDate(rawEnd);

    if (start && end && end.getTime() >= start.getTime()) {
      intervals.push([start.getTime(), end.getTime()]);
      continue;
    }

    const durationRaw =
      item.duration ?? item.duration_short ?? item.tenure ?? item.caption ?? item.subtitle;
    const yearRange = parseYearRangeToInterval(durationRaw);
    if (yearRange) {
      intervals.push(yearRange);
      continue;
    }

    const duration = parseDurationToYears(durationRaw);
    if (duration != null && duration > 0) {
      durationSum += duration;
      usedDuration = true;
    }
  }

  if (intervals.length > 0) {
    intervals.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [];
    for (const interval of intervals) {
      const last = merged[merged.length - 1];
      if (!last || interval[0] > last[1]) {
        merged.push([interval[0], interval[1]]);
      } else {
        last[1] = Math.max(last[1], interval[1]);
      }
    }
    const ms = merged.reduce((sum, [from, to]) => sum + (to - from), 0);
    return ms / (365.25 * 24 * 60 * 60 * 1000);
  }

  return usedDuration ? durationSum : null;
}

function scalarYears(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && raw <= 80) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const direct = Number(raw);
    if (Number.isFinite(direct) && direct >= 0 && direct <= 80) return direct;
    return parseDurationToYears(raw);
  }
  return null;
}

/**
 * Bright Data's people-search / marketplace snapshot usually has no
 * `years_experience` scalar. Derive years from aliases first, then from the
 * `experience[]` history (dates, then duration strings).
 */
export function yearsOfExperienceFromBrightDataProfile(
  profile: Record<string, unknown>
): number | null {
  const aliases = [
    profile.years_of_experience_raw,
    profile.years_experience,
    profile.years_of_experience,
    profile.experience_years,
    profile.total_experience_years,
    profile.total_experience,
    profile.years_of_exp,
  ];
  for (const alias of aliases) {
    const n = scalarYears(alias);
    if (n != null) return Math.round(n);
  }

  const current = asRecord(profile.current_company);
  const currentDuration = current
    ? parseDurationToYears(current.duration ?? current.tenure)
    : null;

  const fromHistory = yearsFromExperienceItems(pickExperienceItems(profile));
  const years = fromHistory ?? currentDuration;
  if (years == null || !Number.isFinite(years) || years < 0) return null;
  return Math.round(years);
}

function skillsFromAbout(about: unknown): string[] {
  if (typeof about !== 'string' || !about.trim()) return [];
  const match = about.match(/(?:^|\n)\s*(?:key\s*)?skills?\s*[:\-–]\s*(.+)$/im);
  if (!match?.[1]) return [];
  return match[1]
    .split(/[,;|•·\n]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && part.length <= 48)
    .slice(0, 24);
}

/**
 * Live snapshots often omit a top-level `skills` array. Read every field
 * Bright Data actually sends (object-shaped skills, top_skills, certs,
 * courses, about "Skills:" lines).
 */
export function skillsFromBrightDataProfile(profile: Record<string, unknown>): string[] {
  const primary = [
    ...labelListFromUnknown(profile.skills, 24),
    ...labelListFromUnknown(profile.top_skills, 24),
    ...labelListFromUnknown(profile.highlighted_skills, 24),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const label of primary) {
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= 24) return out;
  }

  if (out.length > 0) return out;

  for (const label of [
    ...labelListFromUnknown(profile.certifications, 24),
    ...labelListFromUnknown(profile.courses, 24),
    ...skillsFromAbout(aboutFromBrightDataProfile(profile)),
  ]) {
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= 24) break;
  }
  return out;
}

/**
 * Marketplace `/datasets/filter` often returns discovery-lite rows (name,
 * title, city, url) with no `experience[]` and no skills. Those need a
 * follow-up collect-by-URL scrape before we persist them.
 */
export function profileNeedsBrightDataEnrichment(profile: Record<string, unknown>): boolean {
  const hasHistory = pickExperienceItems(profile).length > 0;
  const hasSkills = skillsFromBrightDataProfile(profile).length > 0;
  const hasYears = yearsOfExperienceFromBrightDataProfile(profile) != null;
  const about = aboutFromBrightDataProfile(profile);
  const aboutThin = !about || looksTruncatedSnippet(about);
  return !hasHistory || !hasSkills || !hasYears || aboutThin;
}

function profileFromStoredRawDoc(rawDoc: unknown): Record<string, unknown> {
  if (!rawDoc || typeof rawDoc !== 'object') return {};
  const nested = (rawDoc as { profile?: unknown }).profile;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return rawDoc as Record<string, unknown>;
}

const CONTACT_EMAIL_KEYS = new Set([
  'email',
  'emails',
  'email_address',
  'email_addresses',
  'professional_email',
  'professional_emails',
  'business_email',
  'business_emails',
  'work_email',
  'work_emails',
  'personal_email',
  'personal_emails',
  'contact_email',
  'recommended_email',
  'recommended_business_email',
  'recommended_personal_email',
  'email_1',
  'email_2',
  'email_3',
]);

const CONTACT_PHONE_KEYS = new Set([
  'phone',
  'phones',
  'phone_number',
  'phone_numbers',
  'mobile',
  'mobile_phone',
  'mobile_phones',
  'work_phone',
  'business_phone',
  'cell',
  'telephone',
  'phone_1',
  'phone_2',
]);

const CONTACT_NEST_KEYS = new Set([
  'contacts',
  'contact',
  'contact_details',
  'contact_info',
  'enrichment',
]);

function collectTypedContactValues(
  value: unknown,
  out: Set<string>,
  kind: 'EMAIL' | 'PHONE'
): void {
  if (value == null) return;
  if (typeof value === 'string' || typeof value === 'number') {
    const raw = String(value).trim();
    if (looksValidContact(raw, kind)) out.add(raw);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTypedContactValues(item, out, kind);
    return;
  }
  if (typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectTypedContactValues(nested, out, kind);
    }
  }
}

function walkContactFields(
  input: unknown,
  emails: Set<string>,
  phones: Set<string>,
  depth: number
): void {
  if (input == null || depth > 4) return;
  if (Array.isArray(input)) {
    for (const item of input) walkContactFields(item, emails, phones, depth + 1);
    return;
  }
  if (typeof input !== 'object') return;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const normalized = key.toLowerCase();
    if (CONTACT_EMAIL_KEYS.has(normalized)) {
      collectTypedContactValues(value, emails, 'EMAIL');
    } else if (CONTACT_PHONE_KEYS.has(normalized)) {
      collectTypedContactValues(value, phones, 'PHONE');
    } else if (CONTACT_NEST_KEYS.has(normalized)) {
      walkContactFields(value, emails, phones, depth + 1);
    }
  }
}

/**
 * Pull business email/phone off a contact-enriched Bright Data people record
 * (or a stored rawDoc that still carries those fields).
 */
export function contactsFromBrightDataProfile(input: unknown): BrightDataContactLookup {
  const emails = new Set<string>();
  const phones = new Set<string>();
  walkContactFields(profileFromStoredRawDoc(input), emails, phones, 0);
  walkContactFields(input, emails, phones, 0);
  return { emails: [...emails], phones: [...phones] };
}

/**
 * Re-derive years/skills for already-stored Bright Data rows whose persist
 * pass ran before the mapper understood `experience[]` / year-range durations.
 */
export function resolveBrightDataDisplayFields(options: {
  source?: string | null;
  experienceYears?: number | null;
  skills?: unknown;
  rawDoc?: unknown;
}): { experienceYears: number | null; skills: string[] } {
  const storedSkills = labelListFromUnknown(options.skills, 24);
  if (options.source !== 'bright_data') {
    return {
      experienceYears: options.experienceYears ?? null,
      skills: storedSkills,
    };
  }
  const profile = profileFromStoredRawDoc(options.rawDoc);
  const derivedYears = yearsOfExperienceFromBrightDataProfile(profile);
  const experienceYears =
    options.experienceYears != null && options.experienceYears > 0
      ? options.experienceYears
      : derivedYears ?? null;
  const skills =
    storedSkills.length > 0 ? storedSkills : skillsFromBrightDataProfile(profile);
  return { experienceYears, skills };
}

export type BrightDataExperienceEntry = {
  company: string;
  role: string;
  duration: string;
  description: string;
  current: boolean;
};

export type BrightDataEducationEntry = {
  school: string;
  degree: string;
  field: string;
  years: string;
};

function stringField(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function stripHtml(value: string): string {
  return value
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function looksTruncatedSnippet(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length >= 400) return false;
  return /(\.\.\.|…|\u2026)\s*$/u.test(trimmed);
}

function stripTrailingEllipsis(text: string): string {
  return text.replace(/(\.\.\.|…|\u2026)\s*$/u, '').trim();
}

function experienceDescriptionsFromProfile(profile: Record<string, unknown>): string {
  const chunks: string[] = [];
  const seen = new Set<string>();
  const push = (raw: string) => {
    const htmlStripped = /<\/?[a-z][\s\S]*>/i.test(raw) ? stripHtml(raw) : raw.trim();
    const normalized = htmlStripped.replace(/\s+/g, ' ').trim();
    if (normalized.length < 40) return;
    const key = normalized.toLocaleLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    chunks.push(htmlStripped);
  };

  for (const item of pickExperienceItems(profile)) {
    const direct = stringField(item, 'description', 'summary', 'about', 'description_html');
    if (direct) push(direct);
    const positions = item.positions;
    if (!Array.isArray(positions)) continue;
    for (const position of positions) {
      const rec = asRecord(position);
      if (!rec) continue;
      const nested = stringField(rec, 'description', 'summary', 'about', 'description_html');
      if (nested) push(nested);
    }
  }
  return chunks.join('\n\n');
}

/**
 * Full LinkedIn about text. Never use `headline`/`position` — those are
 * truncated job-title lines and were leaking into the drawer Summary.
 */
export function aboutFromBrightDataProfile(profile: Record<string, unknown>): string {
  const html = stringField(profile, 'about_html', 'description_html', 'aboutHtml');
  const fromHtml = html ? stripHtml(html) : '';
  const plain = [
    stringField(profile, 'about'),
    stringField(profile, 'summary'),
    stringField(profile, 'bio'),
    stringField(profile, 'about_me'),
    stringField(profile, 'linkedin_about'),
    stringField(profile, 'about_preview'),
  ].filter(Boolean);
  const candidates = [fromHtml, ...plain].filter(Boolean);
  const complete = candidates.filter((text) => !looksTruncatedSnippet(text));
  const pool = complete.length > 0 ? complete : candidates;
  return pool.sort((a, b) => b.length - a.length)[0] ?? '';
}

/** Drawer/persist summary: full about, or job descriptions when about is a snippet. */
export function summaryFromBrightDataProfile(profile: Record<string, unknown>): string {
  const about = aboutFromBrightDataProfile(profile);
  const extra = experienceDescriptionsFromProfile(profile);
  if (!looksTruncatedSnippet(about)) return about || extra;
  if (!extra) return about;
  const snippet = stripTrailingEllipsis(about).toLocaleLowerCase();
  if (snippet && extra.toLocaleLowerCase().includes(snippet)) return extra;
  return [stripTrailingEllipsis(about), extra].filter(Boolean).join('\n\n');
}

function durationFromExperienceItem(item: Record<string, unknown>): string {
  const duration = stringField(item, 'duration', 'duration_short');
  if (duration) return duration;
  const start = stringField(item, 'start_date', 'startDate');
  const rawEnd = item.end_date ?? item.endDate;
  const end =
    rawEnd == null || rawEnd === '' || isPresentDate(rawEnd)
      ? ''
      : stringField(item, 'end_date', 'endDate');
  if (start && (end || isPresentDate(rawEnd) || rawEnd == null || rawEnd === '')) {
    return `${start} – ${end || 'Present'}`;
  }
  return start || '—';
}

function experienceEntriesFromProfile(
  profile: Record<string, unknown>
): BrightDataExperienceEntry[] {
  const items = pickExperienceItems(profile);
  const out: BrightDataExperienceEntry[] = [];
  for (const [index, item] of items.entries()) {
    const company =
      stringField(item, 'company', 'company_name', 'name') ||
      (index === 0 ? companyNameFromProfile(profile as BrightDataLinkedInProfile) : '');
    const role = stringField(item, 'title', 'position', 'job_title');
    if (!company && !role) continue;
    out.push({
      company: company || '—',
      role: role || '—',
      duration: durationFromExperienceItem(item),
      description: stringField(item, 'description'),
      current: index === 0,
    });
  }
  return out;
}

function educationEntriesFromProfile(
  profile: Record<string, unknown>
): BrightDataEducationEntry[] {
  const raw = profile.education ?? profile.educations;
  if (!Array.isArray(raw)) return [];
  const out: BrightDataEducationEntry[] = [];
  for (const entry of raw) {
    const rec = asRecord(entry);
    if (!rec) continue;
    const school = stringField(rec, 'title', 'school', 'institute_name', 'name', 'university');
    const degree = stringField(rec, 'degree', 'degree_name', 'subtitle');
    const field = stringField(rec, 'field', 'field_of_study', 'description');
    if (!school && !degree) continue;
    const years =
      stringField(rec, 'date_range') ||
      durationFromExperienceItem({
        start_date: rec.start_year ?? rec.start_date,
        end_date: rec.end_year ?? rec.end_date,
      });
    out.push({
      school: school || '—',
      degree: degree || '—',
      field: field || '—',
      years: years === '—' ? '—' : years,
    });
  }
  return out;
}

/**
 * Drawer/details payload for Bright Data rows — Future Jobs details API
 * does not know these ids, so we project from the stored snapshot instead.
 */
export function detailsFromBrightDataRawDoc(rawDoc: unknown): {
  summary: string | null;
  experience: BrightDataExperienceEntry[];
  education: BrightDataEducationEntry[];
  skills: string[];
} {
  const profile = profileFromStoredRawDoc(rawDoc);
  const experience = experienceEntriesFromProfile(profile);
  const skills = skillsFromBrightDataProfile(profile);
  const about = summaryFromBrightDataProfile(profile);
  const current = experience[0];
  const years = yearsOfExperienceFromBrightDataProfile(profile);
  const fallback =
    current
      ? [current.role !== '—' ? current.role : null, current.company !== '—' ? `at ${current.company}` : null]
          .filter(Boolean)
          .join(' ') + (years != null ? ` · ${years} yrs experience` : '')
      : '';
  const summary = about || fallback;

  return {
    summary: summary?.trim() ? summary.trim() : null,
    experience,
    education: educationEntriesFromProfile(profile),
    skills,
  };
}

/** Stable id fallback when Bright Data doesn't return one — hash of URL/name. */
function fallbackId(profile: BrightDataLinkedInProfile): string {
  const key = `${linkedinUrlFromProfile(profile)}|${nameFromProfile(profile)}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return `bd-${hash.toString(16)}`;
}

/**
 * Map one Bright Data LinkedIn people-search record → the same
 * `FutureJobsProfileDoc` shape Future Jobs profiles use, so it can reuse
 * `mapFjDocToCandidate` / `upsertCandidatesFromDocs` unchanged.
 */
export function mapBrightDataProfileToFjDoc(
  profile: BrightDataLinkedInProfile,
  sourcingSessionId?: string
): FutureJobsProfileDoc | null {
  if (!profile || typeof profile !== 'object') return null;
  // Bright Data returns `{ error }` entries for URLs/rows it couldn't resolve.
  if (profile.error || profile.warning) return null;

  const id =
    (profile.linkedin_id && String(profile.linkedin_id)) ||
    (profile.id && String(profile.id)) ||
    fallbackId(profile);

  const currentCompany = asRecord(profile.current_company);
  const currentCompanyTitle =
    typeof currentCompany?.title === 'string' ? currentCompany.title.trim() : '';
  const jobTitle =
    (typeof profile.position === 'string' && profile.position.trim()) ||
    (typeof profile.current_title === 'string' && profile.current_title.trim()) ||
    currentCompanyTitle ||
    '';

  const yearsOfExperience = yearsOfExperienceFromBrightDataProfile(profile);
  const skills = skillsFromBrightDataProfile(profile);

  return {
    _id: `bright-data:${id}`,
    sourcingSessionId,
    profile: {
      name: nameFromProfile(profile),
      current_employers_object: [
        {
          job_title: jobTitle,
          company_name: companyNameFromProfile(profile),
          name: companyNameFromProfile(profile),
        },
      ],
      ...(yearsOfExperience != null ? { years_of_experience_raw: yearsOfExperience } : {}),
      skills,
      experience: Array.isArray(profile.experience) ? profile.experience : undefined,
      education: Array.isArray(profile.education) ? profile.education : undefined,
      certifications: Array.isArray(profile.certifications) ? profile.certifications : undefined,
      courses: Array.isArray(profile.courses) ? profile.courses : undefined,
      about: summaryFromBrightDataProfile(profile) || aboutFromBrightDataProfile(profile) || undefined,
      about_html:
        (typeof profile.about_html === 'string' && profile.about_html.trim()) ||
        (typeof profile.description_html === 'string' && profile.description_html.trim()) ||
        undefined,
      bio: typeof profile.bio === 'string' && profile.bio.trim() ? profile.bio.trim() : undefined,
      summary:
        typeof profile.summary === 'string' && profile.summary.trim()
          ? profile.summary.trim()
          : undefined,
      region:
        (typeof profile.location === 'string' && profile.location.trim()) ||
        (typeof profile.city === 'string' && profile.city.trim()) ||
        '',
      linkedin_profile_url: linkedinUrlFromProfile(profile),
      linkedin_id:
        (typeof profile.linkedin_id === 'string' && profile.linkedin_id.trim()) ||
        (typeof profile.id === 'string' && profile.id.trim()) ||
        undefined,
      profile_picture_permalink:
        (typeof profile.avatar === 'string' && profile.avatar.trim()) ||
        (typeof profile.profile_pic_url === 'string' && profile.profile_pic_url.trim()) ||
        '',
    },
    revealStatus: {
      email: { revealed: false, values: [] },
      phone: { revealed: false, values: [] },
    },
    // Marks provenance for anything downstream that inspects the raw doc.
    __source: 'bright_data',
  } as FutureJobsProfileDoc;
}

export function mapBrightDataProfilesToFjDocs(
  profiles: BrightDataLinkedInProfile[],
  sourcingSessionId?: string
): FutureJobsProfileDoc[] {
  const out: FutureJobsProfileDoc[] = [];
  for (const profile of profiles) {
    const mapped = mapBrightDataProfileToFjDoc(profile, sourcingSessionId);
    if (mapped) out.push(mapped);
  }
  return out;
}
