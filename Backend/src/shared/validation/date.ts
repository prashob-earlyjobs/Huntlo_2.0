import { z } from 'zod';

export const isoDateStringSchema = z
  .string()
  .datetime({ offset: true, message: 'Expected ISO 8601 date string' });

export function parseIsoDate(value: string): Date {
  const parsed = isoDateStringSchema.parse(value);
  const date = new Date(parsed);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return date;
}

export function toIsoString(date: Date): string {
  return date.toISOString();
}

export function parseOptionalDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value.trim()) {
    return parseIsoDate(value);
  }
  return undefined;
}

export const dateRangeQuerySchema = z
  .object({
    dateFrom: isoDateStringSchema.optional(),
    dateTo: isoDateStringSchema.optional(),
  })
  .refine(
    (value) => {
      if (value.dateFrom && value.dateTo) {
        return new Date(value.dateFrom) <= new Date(value.dateTo);
      }
      return true;
    },
    { message: 'dateFrom must be before or equal to dateTo' }
  );
