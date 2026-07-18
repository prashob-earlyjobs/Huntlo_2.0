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
    linkedExisting: 0,
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
      linkedExisting: job.totals?.linkedExisting ?? 0,
      imported: job.totals?.imported ?? 0,
      skipped: job.totals?.skipped ?? 0,
      failed: job.totals?.failed ?? 0,
    },
    errors: jobErrors.slice(0, 25),
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

type ExistingPoolMatch = {
  _id: mongoose.Types.ObjectId;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
};

/**
 * Resolve an existing pool candidate for dedupe.
 * Priority: email → LinkedIn → phone.
 * Same phone with a *different* email is NOT treated as a duplicate (creates a new row).
 */
async function findExistingPoolMatch(input: {
  organizationId: mongoose.Types.ObjectId | string;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
}): Promise<ExistingPoolMatch | null> {
  const orgFilter = {
    organizationId: input.organizationId,
    deletedAt: null,
  };

  if (input.email) {
    const byEmail = await SavedCandidateModel.findOne({
      ...orgFilter,
      email: input.email,
    })
      .select('_id email phone linkedinUrl')
      .lean();
    if (byEmail) {
      return {
        _id: byEmail._id as mongoose.Types.ObjectId,
        email: byEmail.email ? String(byEmail.email) : null,
        phone: byEmail.phone ? String(byEmail.phone) : null,
        linkedinUrl: byEmail.linkedinUrl ? String(byEmail.linkedinUrl) : null,
      };
    }
  }

  if (input.linkedinUrl) {
    const bare = input.linkedinUrl.replace(/^https?:\/\//, '');
    const byLi = await SavedCandidateModel.findOne({
      ...orgFilter,
      linkedinUrl: {
        $in: [input.linkedinUrl, bare, `https://${bare}`],
      },
    })
      .select('_id email phone linkedinUrl')
      .lean();
    if (byLi) {
      return {
        _id: byLi._id as mongoose.Types.ObjectId,
        email: byLi.email ? String(byLi.email) : null,
        phone: byLi.phone ? String(byLi.phone) : null,
        linkedinUrl: byLi.linkedinUrl ? String(byLi.linkedinUrl) : null,
      };
    }
  }

  if (input.phone) {
    const byPhone = await SavedCandidateModel.findOne({
      ...orgFilter,
      phone: input.phone,
    })
      .select('_id email phone linkedinUrl')
      .lean();
    if (byPhone) {
      const existingEmail = byPhone.email ? String(byPhone.email) : null;
      if (input.email && existingEmail && existingEmail !== input.email) {
        return null;
      }
      return {
        _id: byPhone._id as mongoose.Types.ObjectId,
        email: existingEmail,
        phone: byPhone.phone ? String(byPhone.phone) : null,
        linkedinUrl: byPhone.linkedinUrl ? String(byPhone.linkedinUrl) : null,
      };
    }
  }

  return null;
}

/**
 * Preview row classification — mirrors processImportJob skip rules so
 * "Ready to import N" matches the eventual imported count when mapping is unchanged.
 */
async function classifyPreviewRows(
  organizationId: string,
  rows: Record<string, string>[],
  mapping: Record<string, string>
): Promise<{
  valid: number;
  invalid: number;
  duplicatesInFile: number;
  duplicatesExisting: number;
  importable: number;
}> {
  let valid = 0;
  let invalid = 0;
  let duplicatesInFile = 0;
  let duplicatesExisting = 0;
  const seenInFile = new Set<string>();

  const candidateKeys: Array<{
    email: string | null;
    phone: string | null;
    linkedin: string | null;
  }> = [];

  for (const row of rows) {
    const mapped = mapRowToFields(row, mapping);
    const name = displayValue(mapped.name ?? '');
    const emailRaw = mapped.email ?? '';
    const phoneRaw = mapped.phone ?? '';
    const email = emailRaw ? tryNormalizeEmail(emailRaw) : null;
    const phone = phoneRaw ? tryNormalizePhone(phoneRaw) : null;
    const linkedin = mapped.linkedinUrl ? normalizeLinkedin(mapped.linkedinUrl) : null;

    if (!name) {
      invalid += 1;
      continue;
    }
    if (emailRaw && !email) {
      invalid += 1;
      continue;
    }
    if (phoneRaw && !phone) {
      invalid += 1;
      continue;
    }

    const dupKey = email ?? phone ?? linkedin;
    if (dupKey && seenInFile.has(dupKey)) {
      duplicatesInFile += 1;
      continue;
    }
    if (dupKey) seenInFile.add(dupKey);

    valid += 1;
    candidateKeys.push({ email, phone, linkedin });
  }

  // Batch-check existing pool matches for importable rows only.
  const emails = new Set(
    candidateKeys.map((k) => k.email).filter((v): v is string => Boolean(v))
  );
  const phones = new Set(
    candidateKeys.map((k) => k.phone).filter((v): v is string => Boolean(v))
  );
  const linkedins = new Set(
    candidateKeys.map((k) => k.linkedin).filter((v): v is string => Boolean(v))
  );

  const existingByEmail = new Map<string, { email: string | null; phone: string | null }>();
  const existingByPhone = new Map<string, { email: string | null; phone: string | null }>();
  const existingByLinkedin = new Set<string>();

  if (emails.size || phones.size || linkedins.size) {
    const or: Record<string, unknown>[] = [];
    if (emails.size) or.push({ email: { $in: [...emails] } });
    if (phones.size) or.push({ phone: { $in: [...phones] } });
    if (linkedins.size) {
      const linkedinVariants = new Set<string>();
      for (const value of linkedins) {
        linkedinVariants.add(value);
        linkedinVariants.add(value.replace(/^https?:\/\//, ''));
        linkedinVariants.add(`https://${value.replace(/^https?:\/\//, '')}`);
      }
      or.push({ linkedinUrl: { $in: [...linkedinVariants] } });
    }

    const existing = await SavedCandidateModel.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      deletedAt: null,
      $or: or,
    })
      .select('email phone linkedinUrl')
      .lean();

    for (const doc of existing) {
      const emailKey = doc.email ? String(doc.email).toLowerCase() : null;
      const phoneKey = doc.phone ? String(doc.phone) : null;
      const row = {
        email: emailKey,
        phone: phoneKey,
      };
      if (emailKey) existingByEmail.set(emailKey, row);
      if (phoneKey) existingByPhone.set(phoneKey, row);
      const li = normalizeLinkedin(doc.linkedinUrl ? String(doc.linkedinUrl) : null);
      if (li) existingByLinkedin.add(li);
    }
  }

  let importable = 0;
  for (const key of candidateKeys) {
    let hits = false;
    if (key.email && existingByEmail.has(key.email)) {
      hits = true;
    } else if (key.linkedin && existingByLinkedin.has(key.linkedin)) {
      hits = true;
    } else if (key.phone && existingByPhone.has(key.phone)) {
      const matched = existingByPhone.get(key.phone)!;
      // Same phone + different email → not a duplicate (mirrors processImportJob).
      if (!(key.email && matched.email && matched.email !== key.email)) {
        hits = true;
      }
    }
    if (hits) {
      duplicatesExisting += 1;
    } else {
      importable += 1;
    }
  }

  return { valid, invalid, duplicatesInFile, duplicatesExisting, importable };
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
    const classification = await classifyPreviewRows(
      actor.organizationId,
      parsed.rows,
      suggestedMapping
    );

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
        valid: classification.importable,
        invalid: classification.invalid,
        duplicatesInFile: classification.duplicatesInFile,
        duplicatesExisting: classification.duplicatesExisting,
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

    const jobId = job._id.toHexString();
    // Process immediately in the API process so imports work without a separate worker.
    // The worker poll remains as a backup for crashed/restarted jobs.
    try {
      await this.processImportJob(jobId);
    } catch (error) {
      log().error({ err: error, jobId }, 'Inline import processing failed');
    }

    const refreshed = await CandidateImportJobModel.findById(jobId);
    return toPublicImportJob(refreshed ?? job);
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

    // Recover jobs that were queued while no worker was running.
    if (job.status === 'queued') {
      void this.processImportJob(jobId).catch((error) => {
        log().error({ err: error, jobId }, 'Recovered import processing failed');
      });
    }

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
    const job = await CandidateImportJobModel.findOneAndUpdate(
      { _id: jobId, status: 'queued' },
      { $set: { status: 'processing', startedAt: new Date(), errorMessage: null } },
      { new: true }
    );
    if (!job) return;

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
        const mappedHeaders = new Set(Object.values(mapping));
        const customFields: Record<string, string> = {};
        for (const [header, rawValue] of Object.entries(row).slice(0, 100)) {
          if (
            mappedHeaders.has(header) ||
            ['__proto__', 'constructor', 'prototype'].includes(header)
          ) {
            continue;
          }
          const value = displayValue(rawValue);
          if (value) customFields[header] = value;
        }

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
          const existing = await findExistingPoolMatch({
            organizationId: job.organizationId,
            email,
            phone,
            linkedinUrl,
          });
          if (existing) {
              totals.duplicatesExisting += 1;

              // Refresh contact fields from this row when provided (e.g. new email
              // on an existing phone match), then attach to the campaign list.
              const contactPatch: Record<string, unknown> = {
                lastActivityAt: new Date(),
              };
              if (email && (!existing.email || existing.email === email)) {
                contactPatch.email = email;
              }
              if (phone) contactPatch.phone = phone;
              if (linkedinUrl) contactPatch.linkedinUrl = linkedinUrl;
              if (name) contactPatch.name = name;

              if (listId && isValidObjectId(listId)) {
                const listOid = new mongoose.Types.ObjectId(listId);
                const alreadyOnList = await SavedCandidateModel.exists({
                  _id: existing._id,
                  listIds: listOid,
                });
                await SavedCandidateModel.updateOne(
                  { _id: existing._id },
                  {
                    $addToSet: { listIds: listOid },
                    $set: contactPatch,
                  }
                );
                if (!alreadyOnList) {
                  await listService.incrementCount(listId, 1);
                  totals.linkedExisting += 1;
                } else {
                  totals.skipped += 1;
                  if (errors.length < IMPORT_ERROR_CAP) {
                    errors.push({
                      row: rowNumber,
                      code: 'ALREADY_ON_LIST',
                      message:
                        'Candidate already in pool and already on this list — contact details refreshed',
                    });
                  }
                }
                continue;
              }

              await SavedCandidateModel.updateOne(
                { _id: existing._id },
                { $set: contactPatch }
              );

              totals.skipped += 1;
              if (errors.length < IMPORT_ERROR_CAP) {
                errors.push({
                  row: rowNumber,
                  code: 'DUPLICATE_EXISTING',
                  message:
                    'Candidate already exists in workspace (matched email, phone, or LinkedIn) — contact details refreshed',
                });
              }
              continue;
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
            linkedinUrl,
            headline: displayValue(mapped.headline ?? '') || null,
            currentTitle: displayValue(mapped.currentTitle ?? '') || null,
            currentCompany: displayValue(mapped.currentCompany ?? '') || null,
            location: displayValue(mapped.location ?? '') || null,
            experienceYears,
            skills,
            tags,
            customFields,
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
