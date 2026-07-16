import fs from 'node:fs';
import path from 'node:path';

import mongoose from 'mongoose';

import { createChildLogger } from '../../config/logger.js';
import { assertSameOrganization } from '../../middleware/auth.js';
import { AppError } from '../../shared/errors/app-error.js';
import { isValidEmail, normalizeEmail } from '../../shared/validation/email.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import { isValidPhone, normalizePhone } from '../../shared/validation/phone.js';
import {
  CandidateImportJobModel,
  IMPORT_ERROR_CAP,
  IMPORT_PREVIEW_ROW_CAP,
  type CandidateImportJobDocument,
} from './candidate-import-job.model.js';
import { CandidateListModel } from './candidate-list.model.js';
import {
  mapRowToFields,
  parseSpreadsheetFile,
  sanitizeSpreadsheetValue,
  suggestColumnMapping,
} from './import.parser.js';
import { listService } from './list.service.js';
import type { ImportCommitInput } from './pool.validation.js';
import { SavedCandidateModel } from './saved-candidate.model.js';
import type { ActorContext } from './list.service.js';

const log = () => createChildLogger({ module: 'candidate-import' });

const IMPORT_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000;

type ImportRowError = {
  row: number;
  field?: string | null;
  code: string;
  message: string;
};

function emptyTotals() {
  return {
    rows: 0,
    valid: 0,
    invalid: 0,
    duplicatesInFile: 0,
    duplicatesExisting: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  };
}

function toPublicImportJob(job: CandidateImportJobDocument) {
  const jobErrors = (job.get('errors') as ImportRowError[] | undefined) ?? [];
  return {
    id: job._id.toHexString(),
    organizationId: job.organizationId.toHexString(),
    createdBy: job.createdBy.toHexString(),
    filename: job.filename,
    originalFilename: job.originalFilename,
    mimeType: job.mimeType,
    status: job.status,
    columnMapping: (() => {
      const mapping = { ...((job.columnMapping as Record<string, string>) ?? {}) };
      delete mapping.__listId;
      delete mapping.__skipDuplicates;
      return mapping;
    })(),
    headers: job.headers ?? [],
    previewRows: job.previewRows ?? [],
    totals: {
      rows: job.totals?.rows ?? 0,
      valid: job.totals?.valid ?? 0,
      invalid: job.totals?.invalid ?? 0,
      duplicatesInFile: job.totals?.duplicatesInFile ?? 0,
      duplicatesExisting: job.totals?.duplicatesExisting ?? 0,
      imported: job.totals?.imported ?? 0,
      skipped: job.totals?.skipped ?? 0,
      failed: job.totals?.failed ?? 0,
    },
    errorCount: jobErrors.length,
    startedAt: job.startedAt?.toISOString?.() ?? null,
    completedAt: job.completedAt?.toISOString?.() ?? null,
    errorMessage: job.errorMessage ?? null,
    expiresAt: job.expiresAt?.toISOString?.() ?? null,
    createdAt: job.createdAt?.toISOString?.() ?? null,
    updatedAt: job.updatedAt?.toISOString?.() ?? null,
  };
}

async function safeUnlink(filePath: string | null | undefined) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    log().warn({ err: error, filePath }, 'Failed to delete import temp file');
  }
}

function normalizeLinkedin(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = sanitizeSpreadsheetValue(value).trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase().replace(/\/$/, '');
}

function displayValue(value: string): string {
  return sanitizeSpreadsheetValue(value).trim();
}

function tryNormalizeEmail(value: string): string | null {
  const cleaned = sanitizeSpreadsheetValue(value).trim();
  if (!cleaned) return null;
  if (!isValidEmail(cleaned)) return null;
  return normalizeEmail(cleaned);
}

function tryNormalizePhone(value: string): string | null {
  const cleaned = sanitizeSpreadsheetValue(value).trim();
  if (!cleaned) return null;
  if (!isValidPhone(cleaned)) return null;
  return normalizePhone(cleaned);
}

async function countExistingMatches(
  organizationId: string,
  rows: Record<string, string>[],
  mapping: Record<string, string>
): Promise<number> {
  const emails = new Set<string>();
  const phones = new Set<string>();
  const linkedins = new Set<string>();

  for (const row of rows) {
    const mapped = mapRowToFields(row, mapping);
    const email = mapped.email ? tryNormalizeEmail(mapped.email) : null;
    const phone = mapped.phone ? tryNormalizePhone(mapped.phone) : null;
    const linkedin = mapped.linkedinUrl ? normalizeLinkedin(mapped.linkedinUrl) : null;
    if (email) emails.add(email);
    if (phone) phones.add(phone);
    if (linkedin) linkedins.add(linkedin);
  }

  if (!emails.size && !phones.size && !linkedins.size) return 0;

  const or: Record<string, unknown>[] = [];
  if (emails.size) or.push({ email: { $in: [...emails] } });
  if (phones.size) or.push({ phone: { $in: [...phones] } });
  if (linkedins.size) or.push({ linkedinUrl: { $in: [...linkedins] } });

  return SavedCandidateModel.countDocuments({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    deletedAt: null,
    $or: or,
  });
}

function countDuplicatesInFile(
  rows: Record<string, string>[],
  mapping: Record<string, string>
): number {
  const seen = new Set<string>();
  let duplicates = 0;

  for (const row of rows) {
    const mapped = mapRowToFields(row, mapping);
    const email = mapped.email ? tryNormalizeEmail(mapped.email) : null;
    const phone = mapped.phone ? tryNormalizePhone(mapped.phone) : null;
    const linkedin = mapped.linkedinUrl ? normalizeLinkedin(mapped.linkedinUrl) : null;
    const key = email ?? phone ?? linkedin;
    if (!key) continue;
    if (seen.has(key)) {
      duplicates += 1;
    } else {
      seen.add(key);
    }
  }

  return duplicates;
}

export class ImportService {
  async preview(
    actor: ActorContext,
    file: Express.Multer.File
  ) {
    if (!file?.path) {
      throw AppError.badRequest('File upload is required');
    }

    let parsed;
    try {
      parsed = await parseSpreadsheetFile(file.path);
    } catch (error) {
      await safeUnlink(file.path);
      throw AppError.badRequest(
        error instanceof Error ? error.message : 'Failed to parse spreadsheet'
      );
    }

    if (!parsed.headers.length) {
      await safeUnlink(file.path);
      throw AppError.badRequest('Spreadsheet has no headers');
    }

    const suggestedMapping = suggestColumnMapping(parsed.headers);
    const previewRows = parsed.rows.slice(0, IMPORT_PREVIEW_ROW_CAP);
    const duplicatesInFile = countDuplicatesInFile(parsed.rows, suggestedMapping);
    const duplicatesExisting = await countExistingMatches(
      actor.organizationId,
      parsed.rows,
      suggestedMapping
    );

    // Validate preview rows for summary
    let valid = 0;
    let invalid = 0;
    for (const row of parsed.rows) {
      const mapped = mapRowToFields(row, suggestedMapping);
      const name = displayValue(mapped.name ?? '');
      const email = mapped.email ? tryNormalizeEmail(mapped.email) : null;
      const phone = mapped.phone ? tryNormalizePhone(mapped.phone) : null;
      if (!name) {
        invalid += 1;
        continue;
      }
      if (mapped.email && !email) {
        invalid += 1;
        continue;
      }
      if (mapped.phone && !phone) {
        invalid += 1;
        continue;
      }
      valid += 1;
    }

    const job = await CandidateImportJobModel.create({
      organizationId: new mongoose.Types.ObjectId(actor.organizationId),
      createdBy: new mongoose.Types.ObjectId(actor.userId),
      filename: path.basename(file.path),
      originalFilename: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      storagePath: file.path,
      status: 'previewed',
      columnMapping: suggestedMapping,
      headers: parsed.headers,
      previewRows,
      totals: {
        ...emptyTotals(),
        rows: parsed.rows.length,
        valid,
        invalid,
        duplicatesInFile,
        duplicatesExisting,
      },
      expiresAt: new Date(Date.now() + IMPORT_EXPIRES_MS),
    });

    return {
      ...toPublicImportJob(job),
      jobId: job._id.toHexString(),
      suggestedColumnMapping: suggestedMapping,
      sampleRows: previewRows,
    };
  }

  async commit(actor: ActorContext, input: ImportCommitInput, file?: Express.Multer.File) {
    let job: CandidateImportJobDocument | null = null;

    if (input.jobId) {
      if (!isValidObjectId(input.jobId)) {
        throw AppError.notFound('Import job not found');
      }
      job = await CandidateImportJobModel.findById(input.jobId);
      if (!job) {
        throw AppError.notFound('Import job not found');
      }
      assertSameOrganization(job.organizationId, actor.organizationId);
    } else if (file?.path) {
      // Fresh upload without preview
      const parsed = await parseSpreadsheetFile(file.path);
      const mapping = input.columnMapping ?? suggestColumnMapping(parsed.headers);
      job = await CandidateImportJobModel.create({
        organizationId: new mongoose.Types.ObjectId(actor.organizationId),
        createdBy: new mongoose.Types.ObjectId(actor.userId),
        filename: path.basename(file.path),
        originalFilename: file.originalname,
        mimeType: file.mimetype || 'application/octet-stream',
        storagePath: file.path,
        status: 'uploaded',
        columnMapping: mapping,
        headers: parsed.headers,
        previewRows: parsed.rows.slice(0, IMPORT_PREVIEW_ROW_CAP),
        totals: {
          ...emptyTotals(),
          rows: parsed.rows.length,
        },
        expiresAt: new Date(Date.now() + IMPORT_EXPIRES_MS),
      });
    } else {
      throw AppError.badRequest('Provide jobId from preview or upload a file');
    }

    if (input.columnMapping && Object.keys(input.columnMapping).length) {
      job.columnMapping = input.columnMapping;
    }

    if (!job.columnMapping || !Object.keys(job.columnMapping as object).length) {
      throw AppError.badRequest('columnMapping is required');
    }

    if (input.listId) {
      const list = await CandidateListModel.findById(input.listId);
      if (!list || list.deletedAt) {
        throw AppError.notFound('List not found');
      }
      assertSameOrganization(list.organizationId, actor.organizationId);
    }

    // Stash processing options on columnMapping with reserved keys
    job.columnMapping = {
      ...(job.columnMapping as Record<string, string>),
      ...(input.listId ? { __listId: input.listId } : {}),
      __skipDuplicates: input.skipDuplicates === false ? 'false' : 'true',
    };

    if (!job.storagePath || !fs.existsSync(job.storagePath)) {
      throw AppError.badRequest('Import file is no longer available; please re-upload');
    }

    job.status = 'queued';
    await job.save();

    return toPublicImportJob(job);
  }

  async getById(actor: ActorContext, jobId: string) {
    if (!isValidObjectId(jobId)) {
      throw AppError.notFound('Import job not found');
    }
    const job = await CandidateImportJobModel.findById(jobId);
    if (!job) {
      throw AppError.notFound('Import job not found');
    }
    assertSameOrganization(job.organizationId, actor.organizationId);
    return toPublicImportJob(job);
  }

  async getErrors(actor: ActorContext, jobId: string) {
    if (!isValidObjectId(jobId)) {
      throw AppError.notFound('Import job not found');
    }
    const job = await CandidateImportJobModel.findById(jobId);
    if (!job) {
      throw AppError.notFound('Import job not found');
    }
    assertSameOrganization(job.organizationId, actor.organizationId);
    return {
      jobId: job._id.toHexString(),
      errors: (job.get('errors') as ImportRowError[] | undefined) ?? [],
      totals: toPublicImportJob(job).totals,
    };
  }

  async processImportJob(jobId: string): Promise<void> {
    const job = await CandidateImportJobModel.findById(jobId);
    if (!job) return;
    if (job.status !== 'queued' && job.status !== 'processing') return;

    job.status = 'processing';
    job.startedAt = new Date();
    job.errorMessage = null;
    await job.save();

    const mappingRaw = { ...(job.columnMapping as Record<string, string>) };
    const listId = mappingRaw.__listId || null;
    const skipDuplicates = mappingRaw.__skipDuplicates !== 'false';
    delete mappingRaw.__listId;
    delete mappingRaw.__skipDuplicates;
    const mapping = mappingRaw;

    const errors: ImportRowError[] = [];
    const totals = emptyTotals();

    try {
      if (!job.storagePath || !fs.existsSync(job.storagePath)) {
        throw new Error('Import file missing');
      }

      const parsed = await parseSpreadsheetFile(job.storagePath);
      totals.rows = parsed.rows.length;

      const seenInFile = new Set<string>();

      for (let i = 0; i < parsed.rows.length; i++) {
        const rowNumber = i + 2; // 1-indexed + header
        const row = parsed.rows[i]!;
        const mapped = mapRowToFields(row, mapping);

        const name = displayValue(mapped.name ?? '');
        const emailRaw = mapped.email ?? '';
        const phoneRaw = mapped.phone ?? '';
        const email = emailRaw ? tryNormalizeEmail(emailRaw) : null;
        const phone = phoneRaw ? tryNormalizePhone(phoneRaw) : null;
        const linkedinUrl = mapped.linkedinUrl
          ? normalizeLinkedin(mapped.linkedinUrl)
          : null;

        if (!name) {
          totals.invalid += 1;
          totals.failed += 1;
          if (errors.length < IMPORT_ERROR_CAP) {
            errors.push({
              row: rowNumber,
              field: 'name',
              code: 'MISSING_NAME',
              message: 'Name is required',
            });
          }
          continue;
        }

        if (emailRaw && !email) {
          totals.invalid += 1;
          totals.failed += 1;
          if (errors.length < IMPORT_ERROR_CAP) {
            errors.push({
              row: rowNumber,
              field: 'email',
              code: 'INVALID_EMAIL',
              message: 'Invalid email address',
            });
          }
          continue;
        }

        if (phoneRaw && !phone) {
          totals.invalid += 1;
          totals.failed += 1;
          if (errors.length < IMPORT_ERROR_CAP) {
            errors.push({
              row: rowNumber,
              field: 'phone',
              code: 'INVALID_PHONE',
              message: 'Invalid phone number',
            });
          }
          continue;
        }

        const dupKey = email ?? phone ?? linkedinUrl;
        if (dupKey && seenInFile.has(dupKey)) {
          totals.duplicatesInFile += 1;
          totals.skipped += 1;
          if (errors.length < IMPORT_ERROR_CAP) {
            errors.push({
              row: rowNumber,
              code: 'DUPLICATE_IN_FILE',
              message: 'Duplicate row within file',
            });
          }
          continue;
        }
        if (dupKey) seenInFile.add(dupKey);

        if (skipDuplicates && dupKey) {
          const or: Record<string, unknown>[] = [];
          if (email) or.push({ email });
          if (phone) or.push({ phone });
          if (linkedinUrl) or.push({ linkedinUrl });
          if (or.length) {
            const existing = await SavedCandidateModel.findOne({
              organizationId: job.organizationId,
              deletedAt: null,
              $or: or,
            }).select('_id');
            if (existing) {
              totals.duplicatesExisting += 1;
              totals.skipped += 1;
              if (errors.length < IMPORT_ERROR_CAP) {
                errors.push({
                  row: rowNumber,
                  code: 'DUPLICATE_EXISTING',
                  message: 'Candidate already exists in workspace',
                });
              }
              continue;
            }
          }
        }

        totals.valid += 1;

        const experienceRaw = displayValue(mapped.experienceYears ?? '');
        let experienceYears: number | null = null;
        if (experienceRaw) {
          const parsedExp = Number.parseFloat(experienceRaw);
          if (!Number.isNaN(parsedExp)) experienceYears = parsedExp;
        }

        const skills = displayValue(mapped.skills ?? '')
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
        const tags = displayValue(mapped.tags ?? '')
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);

        const listIds: mongoose.Types.ObjectId[] = [];
        if (listId && isValidObjectId(listId)) {
          listIds.push(new mongoose.Types.ObjectId(listId));
        }

        try {
          await SavedCandidateModel.create({
            organizationId: job.organizationId,
            name,
            email,
            phone,
            linkedinUrl: mapped.linkedinUrl
              ? displayValue(mapped.linkedinUrl) || null
              : null,
            headline: displayValue(mapped.headline ?? '') || null,
            currentTitle: displayValue(mapped.currentTitle ?? '') || null,
            currentCompany: displayValue(mapped.currentCompany ?? '') || null,
            location: displayValue(mapped.location ?? '') || null,
            experienceYears,
            skills,
            tags,
            status: 'new',
            sourceType: 'import',
            sourceId: job._id.toHexString(),
            ownerUserId: job.createdBy,
            listIds,
            lastActivityAt: new Date(),
          });

          if (listIds.length) {
            await listService.incrementCount(listIds[0]!.toHexString(), 1);
          }

          totals.imported += 1;
        } catch (createError) {
          totals.failed += 1;
          if (errors.length < IMPORT_ERROR_CAP) {
            errors.push({
              row: rowNumber,
              code: 'CREATE_FAILED',
              message:
                createError instanceof Error
                  ? createError.message
                  : 'Failed to create candidate',
            });
          }
        }
      }

      job.totals = totals;
      job.set('errors', errors);
      job.status = 'completed';
      job.completedAt = new Date();
      await job.save();
    } catch (error) {
      job.status = 'failed';
      job.errorMessage = error instanceof Error ? error.message : 'Import failed';
      job.totals = totals;
      job.set('errors', errors);
      job.completedAt = new Date();
      await job.save();
      log().error({ err: error, jobId }, 'Import job failed');
    } finally {
      await safeUnlink(job.storagePath);
      job.storagePath = null;
      await job.save();
    }
  }

  async processQueuedImportJobs(limit = 5): Promise<number> {
    const jobs = await CandidateImportJobModel.find({ status: 'queued' })
      .sort({ createdAt: 1 })
      .limit(limit);

    for (const job of jobs) {
      try {
        await this.processImportJob(job._id.toHexString());
      } catch (error) {
        log().error({ err: error, jobId: job._id.toHexString() }, 'Queued import failed');
      }
    }

    return jobs.length;
  }
}

export const importService = new ImportService();

export async function processImportJob(jobId: string): Promise<void> {
  return importService.processImportJob(jobId);
}

export async function processQueuedImportJobs(limit = 5): Promise<number> {
  return importService.processQueuedImportJobs(limit);
}
