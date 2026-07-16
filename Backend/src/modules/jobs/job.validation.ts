import { z } from 'zod';

import { objectIdSchema } from '../../shared/validation/object-id.js';
import { JOB_PRIORITIES, JOB_STATUSES } from './job.model.js';

const stringList = z.array(z.string().trim().min(1).max(120)).max(50).optional();

export const jobFieldsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  department: z.string().trim().max(120).nullable().optional(),
  employmentType: z.string().trim().max(40).optional(),
  workplaceType: z.string().trim().max(40).optional(),
  locations: stringList,
  location: z.string().trim().max(120).optional(),
  minimumExperience: z.number().min(0).max(50).nullable().optional(),
  maximumExperience: z.number().min(0).max(50).nullable().optional(),
  experienceMin: z.coerce.number().min(0).max(50).optional(),
  experienceMax: z.coerce.number().min(0).max(50).optional(),
  requiredSkills: stringList,
  preferredSkills: stringList,
  seniority: z.string().trim().max(40).nullable().optional(),
  preferredIndustries: stringList,
  industryPreference: z.string().trim().max(200).optional(),
  educationRequirements: z.string().trim().max(500).nullable().optional(),
  education: z.string().trim().max(500).optional(),
  responsibilities: z.union([z.array(z.string()), z.string()]).optional(),
  requirements: z.union([z.array(z.string()), z.string()]).optional(),
  benefits: z.union([z.array(z.string()), z.string()]).optional(),
  descriptionHtml: z.string().max(50_000).nullable().optional(),
  description: z.string().max(50_000).optional(),
  salaryMin: z.number().min(0).nullable().optional(),
  salaryMax: z.number().min(0).nullable().optional(),
  minSalary: z.coerce.number().min(0).optional(),
  maxSalary: z.coerce.number().min(0).optional(),
  salaryCurrency: z.string().trim().max(10).optional(),
  currency: z.string().trim().max(10).optional(),
  salaryVisibility: z.string().trim().max(40).optional(),
  openings: z.coerce.number().int().min(1).max(500).optional(),
  recruiterIds: z.array(objectIdSchema).optional(),
  hiringManagerId: objectIdSchema.nullable().optional(),
  interviewerIds: z.array(objectIdSchema).optional(),
  screeningEnabled: z.boolean().optional(),
  assessmentEnabled: z.boolean().optional(),
  aiScreeningEnabled: z.boolean().optional(),
  priority: z.string().trim().max(20).optional(),
  targetClosingDate: z
    .union([z.string().datetime(), z.string().date(), z.literal('')])
    .nullable()
    .optional(),
  tags: stringList,
  internalNotes: z.string().max(10_000).nullable().optional(),
  status: z.enum(['draft', 'active']).optional(),
  publish: z.boolean().optional(),
});

export const createJobSchema = jobFieldsSchema
  .refine(
    (data) => {
      const min = data.minimumExperience ?? data.experienceMin;
      const max = data.maximumExperience ?? data.experienceMax;
      if (min == null || max == null) return true;
      return min <= max;
    },
    { message: 'minimumExperience must be <= maximumExperience', path: ['maximumExperience'] }
  )
  .refine(
    (data) => {
      const min = data.salaryMin ?? data.minSalary;
      const max = data.salaryMax ?? data.maxSalary;
      if (min == null || max == null) return true;
      return min <= max;
    },
    { message: 'salaryMin must be <= salaryMax', path: ['salaryMax'] }
  );

export const updateJobSchema = jobFieldsSchema.partial().omit({ publish: true, status: true });

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  search: z.string().trim().max(200).optional(),
  status: z
    .union([z.enum(JOB_STATUSES), z.string()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      return value
        .split(',')
        .map((part) => part.trim().toLowerCase().replace(/\s+/g, '_'))
        .filter(Boolean);
    }),
  department: z.string().trim().optional(),
  location: z.string().trim().optional(),
  recruiterId: objectIdSchema.optional(),
  hiringManagerId: objectIdSchema.optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  savedView: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;
