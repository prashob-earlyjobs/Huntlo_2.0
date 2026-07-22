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
    const currency = job.salaryCurrency || 'INR';
    salaryRange = `${currency} ${job.salaryMin ?? '?'}-${job.salaryMax ?? '?'}`;
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
    ctx.salaryRange ? `Compensation (from JD): ${ctx.salaryRange}` : '',
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
