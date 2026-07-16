/**
 * Map Future Jobs scout-people lookup profile → safe snapshot.
 * Field names match EJHunterLanding / live FJ shapes — do not invent keys.
 */

import type { PeopleScoutCandidateSnapshot } from './lookup.model.js';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringList(value: unknown, cap = 40): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item ?? '').trim())
    .filter(Boolean)
    .slice(0, cap);
}

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    const year = String(iso).slice(0, 4);
    return /^\d{4}$/.test(year) ? year : '';
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDuration(startIso: string, endIso: string | null, current: boolean): string {
  const start = formatMonthYear(startIso);
  const end = current || !endIso ? 'Present' : formatMonthYear(endIso);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  if (current) return 'Current';
  return end || '';
}

function formatEducationYears(startIso: string, endIso: string): string {
  const startYear = startIso ? String(new Date(startIso).getFullYear() || startIso.slice(0, 4)) : '';
  const endYear = endIso ? String(new Date(endIso).getFullYear() || endIso.slice(0, 4)) : '';
  if (startYear && endYear) return `${startYear} – ${endYear}`;
  return startYear || endYear || '';
}

function mapEmployerEntry(
  entry: Record<string, unknown>,
  current: boolean
): NonNullable<PeopleScoutCandidateSnapshot['experience']>[number] {
  const start = asString(entry.start_date);
  const end = entry.end_date == null ? null : asString(entry.end_date) || null;
  return {
    company: asString(entry.employer_name),
    role: asString(entry.employee_title) || '—',
    duration: formatDuration(start, end, current || !end),
    description: asString(entry.employee_description),
    location: asString(entry.employee_location),
    current: current || !end,
    startDate: start || null,
    endDate: end,
  };
}

function mapEducationEntry(
  entry: Record<string, unknown>
): NonNullable<PeopleScoutCandidateSnapshot['education']>[number] {
  const start = asString(entry.start_date);
  const end = asString(entry.end_date);
  return {
    school: asString(entry.institute_name),
    degree: asString(entry.degree_name),
    field: asString(entry.field_of_study),
    years: formatEducationYears(start, end),
  };
}

function companyMetaFromFjProfile(profile: Record<string, unknown> | null): {
  companyWebsiteDomain: string;
  companyWebsite: string;
} {
  if (!profile) return { companyWebsiteDomain: '', companyWebsite: '' };
  const current =
    Array.isArray(profile.current_employers) && profile.current_employers.length > 0
      ? (profile.current_employers[0] as Record<string, unknown>)
      : null;
  if (!current) return { companyWebsiteDomain: '', companyWebsite: '' };

  const fromListed = current.employer_company_website_domain;
  let domain = '';
  if (Array.isArray(fromListed) && fromListed[0]) domain = String(fromListed[0]).trim();
  else if (typeof fromListed === 'string' && fromListed.trim()) domain = fromListed.trim();
  else if (Array.isArray(current.domains) && current.domains[0]) {
    domain = String(current.domains[0]).trim();
  }

  const site =
    typeof current.employer_company_website === 'string'
      ? current.employer_company_website.trim()
      : '';
  return {
    companyWebsiteDomain: domain,
    companyWebsite: site || (domain ? `https://${domain}` : ''),
  };
}

function isMemberUrnLinkedinUrl(url: string): boolean {
  return /\/in\/ACoAA/i.test(url);
}

/** Prefer vanity LinkedIn URL over opaque member-URN profile URLs. */
export function pickPreferredLinkedinUrl(options: {
  flagshipUrl?: string;
  profileUrl?: string;
  username?: string;
}): string {
  const flagship = asString(options.flagshipUrl);
  const profile = asString(options.profileUrl);
  const username = asString(options.username);

  if (flagship && !isMemberUrnLinkedinUrl(flagship)) return flagship;
  if (profile && !isMemberUrnLinkedinUrl(profile)) return profile;
  if (username) {
    const slug = username.replace(/^\/+/, '').replace(/^in\//i, '');
    if (slug && !slug.startsWith('ACoAA')) {
      return `https://www.linkedin.com/in/${encodeURIComponent(slug)}`;
    }
  }
  return flagship || profile;
}

/**
 * Future Jobs reveal-contacts resolves by opaque member URL (`/in/ACoAA…`).
 * Vanity/flagship URLs often 404 on that endpoint — prefer profile URL for reveals.
 */
export function pickRevealLinkedinUrl(options: {
  flagshipUrl?: string;
  profileUrl?: string;
  username?: string;
}): string {
  const profile = asString(options.profileUrl);
  const flagship = asString(options.flagshipUrl);
  if (profile) return profile;
  if (flagship) return flagship;
  return pickPreferredLinkedinUrl(options);
}

/** Strip contact PII from a raw FJ profile before storing a safe snapshot. */
export function extractSafeSnapshotFromFjProfile(
  profile: unknown,
  scoutId = ''
): PeopleScoutCandidateSnapshot | null {
  if (!profile || typeof profile !== 'object') return null;
  const p = profile as Record<string, unknown>;

  const currentEmployers = Array.isArray(p.current_employers)
    ? (p.current_employers as Record<string, unknown>[])
    : [];
  const pastEmployers = Array.isArray(p.past_employers)
    ? (p.past_employers as Record<string, unknown>[])
    : [];
  const educationBackground = Array.isArray(p.education_background)
    ? (p.education_background as Record<string, unknown>[])
    : [];

  const current = currentEmployers[0] ?? null;
  const fjProfileId = p._id != null ? String(p._id) : '';
  const name = asString(p.name);
  const title = asString(p.title);
  const headline = asString(p.headline);
  const location = asString(p.location);
  const company =
    current && typeof current.employer_name === 'string' ? current.employer_name.trim() : '';
  const role =
    current && typeof current.employee_title === 'string'
      ? current.employee_title.trim()
      : title;
  const linkedinFlagshipUrl = asString(p.linkedin_flagship_url);
  const linkedinProfileUrl = asString(p.linkedin_profile_url);
  const linkedinUsername =
    Array.isArray(p.query_linkedin_profile_urn_or_slug) &&
    p.query_linkedin_profile_urn_or_slug[0]
      ? String(p.query_linkedin_profile_urn_or_slug[0]).trim()
      : '';
  const profilePictureUrl =
    asString(p.profile_picture_url) || asString(p.profile_picture_permalink);
  const numConnections =
    typeof p.num_of_connections === 'number' ? p.num_of_connections : null;
  const skills = asStringList(p.skills, 60);
  const languages = asStringList(p.languages, 20);
  const summary = asString(p.summary);

  const experience = [
    ...currentEmployers.map((entry) => mapEmployerEntry(entry, true)),
    ...pastEmployers.map((entry) => mapEmployerEntry(entry, false)),
  ].filter((entry) => entry.company || entry.role !== '—');

  // Past roles may appear out of chronological order from FJ — sort by start date desc.
  experience.sort((a, b) => {
    const aTime = a.startDate ? Date.parse(a.startDate) : 0;
    const bTime = b.startDate ? Date.parse(b.startDate) : 0;
    return bTime - aTime;
  });

  const education = educationBackground
    .map(mapEducationEntry)
    .filter((entry) => entry.school || entry.degree);

  // Touch company meta for parity with EJ (domain not stored in snapshot for privacy).
  companyMetaFromFjProfile(p);

  if (!name && !linkedinProfileUrl && !linkedinFlagshipUrl && !fjProfileId) {
    return null;
  }

  return {
    name,
    title,
    headline,
    location,
    company,
    role,
    linkedinFlagshipUrl,
    linkedinProfileUrl,
    linkedinUsername,
    profilePictureUrl,
    numConnections,
    skills,
    languages,
    summary,
    experience,
    education,
    allTitles: asStringList(p.all_titles, 40),
    allEmployers: asStringList(p.all_employers, 40),
    allSchools: asStringList(p.all_schools, 40),
    allDegrees: asStringList(p.all_degrees, 40),
    scoutId: scoutId || '',
    fjProfileId,
  };
}

export function snapshotHasValidProfile(
  snapshot: PeopleScoutCandidateSnapshot | null | undefined
): boolean {
  if (!snapshot) return false;
  if (String(snapshot.name || '').trim()) return true;
  if (String(snapshot.linkedinProfileUrl || '').trim()) return true;
  if (String(snapshot.linkedinFlagshipUrl || '').trim()) return true;
  if (String(snapshot.fjProfileId || '').trim()) return true;
  return false;
}

export function extractMatchOptionsFromFjData(data: unknown): NonNullable<
  PeopleScoutCandidateSnapshot['matches']
> {
  if (!data || typeof data !== 'object') return [];
  const root = data as Record<string, unknown>;
  const profiles = Array.isArray(root.profiles) ? root.profiles : null;
  if (!profiles || profiles.length < 2) return [];

  return profiles.slice(0, 10).map((entry) => {
    const profile =
      entry && typeof entry === 'object' && 'profile' in entry
        ? ((entry as { profile: unknown }).profile as Record<string, unknown>)
        : entry && typeof entry === 'object'
          ? (entry as Record<string, unknown>)
          : {};
    const current =
      Array.isArray(profile.current_employers) && profile.current_employers.length > 0
        ? (profile.current_employers[0] as Record<string, unknown>)
        : null;
    return {
      name: asString(profile.name),
      headline: asString(profile.headline) || asString(profile.title),
      company:
        current && typeof current.employer_name === 'string'
          ? current.employer_name.trim()
          : '',
      location: asString(profile.location),
      linkedinProfileUrl:
        asString(profile.linkedin_flagship_url) ||
        asString(profile.linkedin_profile_url),
    };
  });
}
