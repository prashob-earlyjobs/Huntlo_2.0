import { z } from 'zod';

export const CONTACT_ENQUIRY_TYPES = [
  'General Enquiry',
  'Product Enquiry',
  'Demo Request',
  'Partnership',
  'Support',
] as const;

export type ContactEnquiryType = (typeof CONTACT_ENQUIRY_TYPES)[number];

export const submitContactEnquirySchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').max(120),
  workEmail: z.string().trim().email('Enter a valid work email').max(200),
  companyName: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  enquiryType: z.enum(CONTACT_ENQUIRY_TYPES),
  message: z
    .string()
    .trim()
    .min(1, 'Please tell us how we can help')
    .max(4000),
  /** Honeypot — must be empty for humans. */
  website: z.string().max(200).optional().default(''),
});

export type SubmitContactEnquiryInput = z.infer<typeof submitContactEnquirySchema>;
