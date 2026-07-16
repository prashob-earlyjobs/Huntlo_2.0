import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .regex(objectIdRegex, 'Invalid ObjectId format');

export function isValidObjectId(value: string): boolean {
  return objectIdRegex.test(value) && mongoose.Types.ObjectId.isValid(value);
}

export function parseObjectId(value: string, fieldName = 'id'): mongoose.Types.ObjectId {
  const parsed = objectIdSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`Invalid ${fieldName}: expected a 24-character hex ObjectId`);
  }
  return new mongoose.Types.ObjectId(parsed.data);
}

export function toObjectIdString(value: mongoose.Types.ObjectId | string): string {
  return typeof value === 'string' ? value : value.toHexString();
}
