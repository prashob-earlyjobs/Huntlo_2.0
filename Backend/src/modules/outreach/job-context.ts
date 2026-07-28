/**
 * Load job / JD context for AI qualification questions and candidate answers.
 */

import { JobModel } from '../jobs/job.model.js';

export type OutreachJobContext = {
  jobId: string | null;
  title: string | null;
  description: string;
  locations: string[];
  workplaceType: string | null;
  requirements: string[];
  requiredSkills: string[];
  experienceRange: string | null;
  salaryRange: string | null;
};

function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function loadOutreachJobContext(
  jobId: string | null | undefined
): Promise<OutreachJobContext> {
  if (!jobId) {
    return {
      jobId: null,
      title: null,
      description: '',
      locations: [],
      workplaceType: null,
      requirements: [],
      requiredSkills: [],
      experienceRange: null,
      salaryRange: null,
    };
  }

  const job = await JobModel.findById(jobId)
    .select(
      'title descriptionHtml locations workplaceType requirements requiredSkills minimumExperience maximumExperience salaryMin salaryMax salaryCurrency salaryVisibility'
    )
    .lean();

  if (!job) {
    return {
      jobId: String(jobId),
      title: null,
      description: '',
      locations: [],
      workplaceType: null,
      requirements: [],
      requiredSkills: [],
      experienceRange: null,
      salaryRange: null,
    };
  }

  const minExp = job.minimumExperience;
  const maxExp = job.maximumExperience;
  let experienceRange: string | null = null;
  if (minExp != null || maxExp != null) {
    experienceRange = `${minExp ?? '?'}-${maxExp ?? '?'} years`;
  }

  let salaryRange: string | null = null;
  if (job.salaryVisibility !== 'hidden' && (job.salaryMin != null || job.salaryMax != null)) {
    salaryRange = formatJdSalaryRange({
      currency: job.salaryCurrency || 'INR',
      min: job.salaryMin,
      max: job.salaryMax,
    });
  }

  return {
    jobId: String(job._id),
    title: job.title || null,
    description: stripHtml(job.descriptionHtml),
    locations: Array.isArray(job.locations) ? job.locations.map(String) : [],
    workplaceType: job.workplaceType ? String(job.workplaceType) : null,
    requirements: Array.isArray(job.requirements) ? job.requirements.map(String) : [],
    requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills.map(String) : [],
    experienceRange,
    salaryRange,
  };
}

/**
 * Format JD salary for AI prompts. Values like 30000–40000 are usually monthly
 * CTC in INR; label them clearly and add an approximate LPA so Gemini does not
 * compare "5 LPA" against "30000" as if they were the same unit.
 */
export function formatJdSalaryRange(input: {
  currency: string;
  min: number | null | undefined;
  max: number | null | undefined;
}): string {
  const currency = String(input.currency || 'INR').trim() || 'INR';
  const min = input.min == null ? null : Number(input.min);
  const max = input.max == null ? null : Number(input.max);
  const finiteMin = min != null && Number.isFinite(min) ? min : null;
  const finiteMax = max != null && Number.isFinite(max) ? max : null;
  if (finiteMin == null && finiteMax == null) return `${currency} ?-?`;

  const sample = finiteMax ?? finiteMin ?? 0;
  // Heuristic: typical monthly INR bands are under ~2L; annual LPA-style numbers
  // are often stored as lakhs (3–40) or full annual amounts (>= 1e5+).
  const looksMonthlyInr =
    currency.toUpperCase() === 'INR' && sample > 1000 && sample < 200_000;
  const looksLakhs =
    currency.toUpperCase() === 'INR' && sample > 0 && sample <= 100;

  const rangeLabel = `${currency} ${finiteMin ?? '?'}-${finiteMax ?? '?'}`;
  if (looksMonthlyInr) {
    const toLpa = (n: number) => (n * 12) / 100_000;
    const minLpa = finiteMin != null ? toLpa(finiteMin).toFixed(1) : '?';
    const maxLpa = finiteMax != null ? toLpa(finiteMax).toFixed(1) : '?';
    return `${rangeLabel} per month (~${minLpa}-${maxLpa} LPA). Treat screening LPA answers in LPA units, not raw monthly thousands.`;
  }
  if (looksLakhs) {
    return `${rangeLabel} LPA (lakhs per annum)`;
  }
  return `${rangeLabel} (confirm period from JD text if needed)`;
}

/** Plain-text block for Gemini qualification / screening prompts. */
export function formatOutreachJobContextForPrompt(
  ctx: OutreachJobContext,
  campaignName?: string | null
): string {
  const parts = [
    campaignName ? `Campaign: ${campaignName}` : '',
    ctx.title ? `Role title: ${ctx.title}` : '',
    ctx.workplaceType ? `Workplace: ${ctx.workplaceType}` : '',
    ctx.locations.length ? `Locations: ${ctx.locations.join(', ')}` : '',
    ctx.experienceRange ? `Experience range: ${ctx.experienceRange}` : '',
    ctx.salaryRange
      ? `Compensation (from JD): ${ctx.salaryRange}\nNote: If a screening question has its own compensation knockout (e.g. reject if > 5 LPA), that knockout is authoritative for qualification — do not reject solely because JD band units/period differ.`
      : '',
    ctx.requiredSkills.length
      ? `Required skills: ${ctx.requiredSkills.slice(0, 25).join(', ')}`
      : '',
    ctx.requirements.length
      ? `Requirements: ${ctx.requirements.slice(0, 20).join('; ')}`
      : '',
    ctx.description ? `Job description:\n${ctx.description.slice(0, 8000)}` : '',
  ].filter(Boolean);
  return parts.join('\n\n') || '(No job description linked — judge only from screening questions and answers.)';
}
