import { z } from 'zod';

/** Strong password: length + upper + lower + digit. */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine((value) => /[a-z]/.test(value), {
    message: 'Password must include a lowercase letter',
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: 'Password must include an uppercase letter',
  })
  .refine((value) => /\d/.test(value), {
    message: 'Password must include a number',
  });

export function isStrongPassword(value: string): boolean {
  return passwordSchema.safeParse(value).success;
}
