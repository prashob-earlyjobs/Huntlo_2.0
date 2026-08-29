/** Flatten a stored job into text Gemini (or the fallback) can turn into a search prompt. */

export type JobSearchPromptSource = {
  title?: string | null;
  department?: string | null;
  locations?: string[] | null;
  employmentType?: string | null;
  workplaceType?: string | null;
  seniority?: string | null;
  minimumExperience?: number | null;
  maximumExperience?: number | null;
  requiredSkills?: string[] | null;
  preferredSkills?: string[] | null;
  preferredIndustries?: string[] | null;
  educationRequirements?: string | null;
  descriptionHtml?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  benefits?: string[] | null;
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
  temporary: 'Temporary',
};

const WORKPLACE_LABELS: Record<string, string> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
};

export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function csv(items: string[] | null | undefined, maxItems = 12): string {
  if (!items?.length) return '';
  return items
    .map((item) => String(item).trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .join(', ');
}

function bullets(items: string[] | null | undefined): string {
  if (!items?.length) return '';
  return items
    .map((item) => String(item).trim())
    .filter(Boolean)
    .map((item) => (item.startsWith('-') ? item : `- ${item}`))
    .join('\n');
}

function labelMap(value: string | null | undefined, map: Record<string, string>): string {
  if (!value) return '';
  return map[value] ?? value.replace(/_/g, ' ');
}

function experienceLine(job: JobSearchPromptSource): string {
  const min = job.minimumExperience;
  const max = job.maximumExperience;
  if (min != null && max != null) return `${min}–${max} years`;
  if (min != null) return `${min}+ years`;
  if (max != null) return `up to ${max} years`;
  return '';
}

function locationLine(job: JobSearchPromptSource): string {
  return csv(job.locations ?? []);
}

/** Structured dump of every JD field — input to Gemini. */
export function assembleJobJdText(job: JobSearchPromptSource): string {
  const lines: string[] = [];
  const title = String(job.title ?? '').trim();
  if (title) lines.push(`Title: ${title}`);
  if (job.department) lines.push(`Department: ${job.department}`);
  const location = locationLine(job);
  if (location) lines.push(`Location: ${location}`);
  const experience = experienceLine(job);
  if (experience) lines.push(`Experience: ${experience}`);
  if (job.seniority) {
    lines.push(`Seniority: ${job.seniority.charAt(0).toUpperCase()}${job.seniority.slice(1)}`);
  }
  const workplace = labelMap(job.workplaceType, WORKPLACE_LABELS);
  if (workplace) lines.push(`Workplace: ${workplace}`);
  const employment = labelMap(job.employmentType, EMPLOYMENT_LABELS);
  if (employment) lines.push(`Employment: ${employment}`);
  const required = csv(job.requiredSkills);
  if (required) lines.push(`Required skills: ${required}`);
  const preferred = csv(job.preferredSkills);
  if (preferred) lines.push(`Preferred skills: ${preferred}`);
  const industries = csv(job.preferredIndustries);
  if (industries) lines.push(`Industries: ${industries}`);
  if (job.educationRequirements) lines.push(`Education: ${job.educationRequirements}`);

  const description = stripHtml(String(job.descriptionHtml ?? ''));
  if (description) {
    lines.push('');
    lines.push('Description:');
    lines.push(description);
  }
  const responsibilities = bullets(job.responsibilities);
  if (responsibilities) {
    lines.push('');
    lines.push('Responsibilities:');
    lines.push(responsibilities);
  }
  const requirements = bullets(job.requirements);
  if (requirements) {
    lines.push('');
    lines.push('Requirements:');
    lines.push(requirements);
  }
  const benefits = bullets(job.benefits);
  if (benefits) {
    lines.push('');
    lines.push('Benefits:');
    lines.push(benefits);
  }

  return lines.join('\n').trim();
}

/**
 * Deterministic searchable brief when Gemini is unset or fails.
 * One short paragraph: title, location, years, skills, and a slice of the JD.
 */
export function fallbackSearchPromptFromJob(job: JobSearchPromptSource): string {
  const title = String(job.title ?? '').trim() || 'this role';
  const location = locationLine(job);
  const experience = experienceLine(job);
  const sentences: string[] = [];

  let opening = `Find ${title} candidates`;
  if (location) opening += ` in ${location}`;
  if (experience) opening += ` with ${experience} of experience`;
  opening += '.';
  sentences.push(opening);

  const required = csv(job.requiredSkills, 8);
  const preferred = csv(job.preferredSkills, 3);
  if (required && preferred) {
    sentences.push(`Must-have: ${required}. Nice-to-have: ${preferred}.`);
  } else if (required) {
    sentences.push(`Must-have: ${required}.`);
  } else if (preferred) {
    sentences.push(`Skills: ${preferred}.`);
  }

  const meta: string[] = [];
  if (job.seniority) {
    meta.push(`${job.seniority.charAt(0).toUpperCase()}${job.seniority.slice(1)}`);
  }
  const workplace = labelMap(job.workplaceType, WORKPLACE_LABELS);
  if (workplace) meta.push(workplace);
  const industries = csv(job.preferredIndustries, 2);
  if (industries) meta.push(industries);
  if (meta.length) sentences.push(`${meta.join(', ')}.`);

  const description = stripHtml(String(job.descriptionHtml ?? ''));
  if (description) {
    const snippet = description.replace(/\s+/g, ' ').slice(0, 180).trim();
    if (snippet) sentences.push(snippet.endsWith('.') ? snippet : `${snippet}.`);
  }

  return sentences.join(' ').trim();
}
