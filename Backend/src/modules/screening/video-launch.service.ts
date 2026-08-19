import mongoose from 'mongoose';

import { getLogger } from '../../config/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import { isValidEmail } from '../../shared/validation/email.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import {
  createHyrefastApplication,
  createHyrefastJob,
  type HyrefastJobType,
  type HyrefastRequestTrace,
} from '../../providers/hyrefast/index.js';
import { type ScreeningDocument } from './screening.model.js';
import { ScreeningCandidateModel } from './screening-candidate.model.js';
import {
  appendScreeningCandidateLog,
  appendScreeningCandidateVideoLog,
  appendVideoScreeningLog,
  hyrefastCreateApplicationLogEntry,
  hyrefastCreateJobLogEntry,
} from './screening-logs.js';

const log = () => getLogger().child({ component: 'video-launch-service' });

function htmlToText(value: string | null | undefined): string {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function maskEmail(value: string): string {
  const email = String(value || '').trim().toLowerCase();
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const safeLocal =
    local.length <= 2 ? `${local[0] || '*'}*` : `${local.slice(0, 2)}***${local.slice(-1)}`;
  return `${safeLocal}@${domain}`;
}

function maskPhone(value: string): string {
  const phone = String(value || '').trim();
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return phone;
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Delay between consecutive /applications calls to stay under Hyrefast rate limit (60 req / 10 min). */
const APPLICATION_DELAY_MS = 1200;

const VIDEO_UNUSED_VOICE_FIELDS = [
  'audio',
  'transcript',
  'recordingReference',
  'summary',
  'durationSeconds',
  'quotaReservationKey',
  'quotaCommittedMinutes',
  'providerStatus',
  'lifecycleStatus',
] as const;

async function unsetVoiceOnlyFields(id: mongoose.Types.ObjectId) {
  await ScreeningCandidateModel.updateOne(
    { _id: id },
    {
      $unset: Object.fromEntries(VIDEO_UNUSED_VOICE_FIELDS.map((field) => [field, 1])),
    }
  );
}

function mapJobType(employmentType: string | null | undefined): HyrefastJobType {
  const raw = String(employmentType || '').toLowerCase();
  if (raw === 'part_time') return 'part_time';
  if (raw === 'internship') return 'internship';
  if (raw === 'contract' || raw === 'temporary') return 'contract';
  return 'full_time';
}

function wrapHyrefastError(err: unknown): never {
  if (err instanceof AppError) throw err;
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code?: string }).code || 'HYREFAST_API_ERROR')
      : 'HYREFAST_API_ERROR';
  const statusCode =
    err && typeof err === 'object' && 'statusCode' in err
      ? Number((err as { statusCode?: number }).statusCode)
      : 502;
  const message =
    code === 'HYREFAST_UNAUTHORIZED'
      ? 'Hyrefast rejected the API key. Create a new key in Hyrefast (Settings → API Keys), set HYREFAST_API_KEY in Backend/.env, and restart the API.'
      : err instanceof Error
        ? err.message
        : 'Hyrefast request failed';
  throw new AppError(
    Number.isFinite(statusCode) && statusCode >= 400 && statusCode < 600 ? statusCode : 502,
    code,
    message
  );
}

function traceFromError(err: unknown): HyrefastRequestTrace | null {
  if (err && typeof err === 'object' && 'trace' in err) {
    const trace = (err as { trace?: HyrefastRequestTrace }).trace;
    return trace ?? null;
  }
  return null;
}

async function ensureHyrefastJob(doc: ScreeningDocument): Promise<string> {
  const existing = String(doc.providerJobId || '').trim();
  if (existing) {
    log().info(
      { screeningId: String(doc._id), hyrefastJobId: existing },
      'Reusing existing Hyrefast job'
    );
    return existing;
  }

  if (!doc.jobId) {
    throw new AppError(400, 'JOB_REQUIRED', 'Video screening requires a linked job.');
  }

  const job = await JobModel.findById(doc.jobId).lean();
  if (!job) {
    throw new AppError(400, 'JOB_NOT_FOUND', 'Linked job not found.');
  }

  const description =
    htmlToText(job.descriptionHtml) ||
    (job.requirements || []).map((row) => String(row).trim()).filter(Boolean).join('\n') ||
    String(job.title);

  const minYears =
    typeof job.minimumExperience === 'number' ? job.minimumExperience : undefined;
  const maxYears =
    typeof job.maximumExperience === 'number' ? job.maximumExperience : undefined;

  try {
    const payload = {
      title: String(job.title || doc.name).trim() || doc.name,
      description,
      skills: (job.requiredSkills || []).map((skill) => String(skill).trim()).filter(Boolean),
      experience_range: {
        min_years: typeof minYears === 'number' ? minYears : 0,
        max_years: typeof maxYears === 'number' ? maxYears : typeof minYears === 'number' ? minYears : 0,
      },
      location:
        (job.locations || []).map((row) => String(row).trim()).filter(Boolean)[0] || '',
      job_type: mapJobType(job.employmentType),
      interview_config: {
        conversational: true,
        duration_minutes: 30,
      },
    };
    log().info(
      {
        screeningId: String(doc._id),
        huntloJobId: String(doc.jobId),
        payload,
      },
      'Creating Hyrefast job'
    );
    const { job: hyrefastJob, trace } = await createHyrefastJob(payload);
    appendVideoScreeningLog(
      doc,
      hyrefastCreateJobLogEntry({
        request: {
          method: trace.method,
          url: trace.url,
          body: trace.requestBody,
        },
        response: {
          httpStatus: trace.httpStatus,
          body: trace.responseBody,
        },
      })
    );
    doc.providerJobId = hyrefastJob.id;
    await doc.save();
    return hyrefastJob.id;
  } catch (err) {
    const trace = traceFromError(err);
    if (trace) {
      appendVideoScreeningLog(
        doc,
        hyrefastCreateJobLogEntry({
          request: {
            method: trace.method,
            url: trace.url,
            body: trace.requestBody,
          },
          response: {
            httpStatus: trace.httpStatus,
            body: trace.responseBody,
          },
          error: err instanceof Error ? err.message : 'Hyrefast job creation failed.',
        })
      );
      await doc.save();
    }
    wrapHyrefastError(err);
  }
}

export async function launchVideoScreening(input: {
  organizationId: string;
  screeningId: string;
  doc: ScreeningDocument;
  candidateIds?: string[];
}) {
  const { organizationId, screeningId, doc, candidateIds } = input;
  const hyrefastJobId = await ensureHyrefastJob(doc);

  const scopedIds = (candidateIds || []).filter((id) =>
    mongoose.Types.ObjectId.isValid(id)
  );
  const rows = await ScreeningCandidateModel.find({
    screeningId,
    // Only queued rows. Failed invites stay failed until the user retries.
    callStatus: 'queued',
    ...(scopedIds.length > 0
      ? {
          candidateId: {
            $in: scopedIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        }
      : {}),
  });

  const pending = rows.filter((row) => !row.providerCallId);
  const candidates = await SavedCandidateModel.find({
    _id: { $in: pending.map((row) => row.candidateId) },
    organizationId,
  }).lean();
  const byId = new Map(candidates.map((candidate) => [String(candidate._id), candidate]));

  log().info(
    {
      screeningId,
      hyrefastJobId,
      pendingCandidates: pending.length,
      selectedCandidateIds: pending.map((row) => String(row.candidateId)),
    },
    'Launching video screening invitations'
  );

  let invited = 0;

  for (const row of pending) {
    const candidate = byId.get(String(row.candidateId));
    const email = String(candidate?.email || '').trim().toLowerCase();
    const phone = String(candidate?.phone || '').trim();
    const candidateLog = {
      screeningId,
      candidateId: String(row.candidateId),
      candidateName: String(candidate?.name || 'Candidate').trim() || 'Candidate',
      candidateEmailMasked: maskEmail(email),
      candidatePhoneMasked: maskPhone(phone),
      hasEmail: Boolean(email),
      hasPhone: Boolean(phone),
    };

    log().info(candidateLog, 'Preparing Hyrefast video invite');

    if (!candidate || !isValidEmail(email)) {
      row.mode = 'video';
      row.video = {
        ...(row.video || {}),
        jobId: hyrefastJobId,
        applicationId: null,
        invitationStatus: 'failed',
        invitationError: 'No valid email address for video screening.',
        logs: row.video?.logs || [],
      };
      row.callStatus = 'failed';
      row.error = 'No valid email address for video screening.';
      const invalidEmailLog = hyrefastCreateApplicationLogEntry({
        candidateId: String(row.candidateId),
        request: {
          method: 'POST',
          url: 'validation://candidate-email',
          body: {
            candidateEmail: email,
            candidateName: candidate?.name || 'Candidate',
            candidatePhone: phone || '',
          },
        },
        error: row.error,
      });
      appendScreeningCandidateLog(row, invalidEmailLog);
      appendScreeningCandidateVideoLog(row, invalidEmailLog);
      await row.save();
      await unsetVoiceOnlyFields(row._id);
      log().warn(
        {
          ...candidateLog,
          rowError: row.error,
        },
        'Skipping video invite because email is invalid'
      );
      continue;
    }
    try {
      row.attempts += 1;
      const { application, trace } = await createHyrefastApplication({
        jobId: hyrefastJobId,
        candidateEmail: email,
        candidateName: candidate.name || 'Candidate',
        ...(phone ? { candidatePhone: phone } : {}),
        sendInterviewLink: true,
      });
      appendVideoScreeningLog(
        doc,
        hyrefastCreateApplicationLogEntry({
          candidateId: String(row.candidateId),
          request: {
            method: trace.method,
            url: trace.url,
            body: trace.requestBody,
          },
          response: {
            httpStatus: trace.httpStatus,
            body: trace.responseBody,
          },
        })
      );
      const candidateApplicationLog = hyrefastCreateApplicationLogEntry({
        candidateId: String(row.candidateId),
        request: {
          method: trace.method,
          url: trace.url,
          body: trace.requestBody,
        },
        response: {
          httpStatus: trace.httpStatus,
          body: trace.responseBody,
        },
      });
      appendScreeningCandidateLog(row, candidateApplicationLog);
      appendScreeningCandidateVideoLog(row, candidateApplicationLog);
      row.mode = 'video';
      row.video = {
        ...(row.video || {}),
        jobId: hyrefastJobId,
        applicationId: application.id,
        invitationStatus: application.status || (application.id ? 'created' : 'sent'),
        invitationError: null,
        logs: row.video?.logs || [],
      };
      row.providerCallId = application.id;
      row.providerRequestId = hyrefastJobId;
      row.callStatus = 'invited';
      row.error = null;
      invited += 1;
      await row.save();
      await unsetVoiceOnlyFields(row._id);
      log().info(
        {
          ...candidateLog,
          applicationId: application.id,
          applicationStatus: application.status,
        },
        'Hyrefast video invite created'
      );
    } catch (err) {
      const trace = traceFromError(err);
      if (trace) {
        appendVideoScreeningLog(
          doc,
          hyrefastCreateApplicationLogEntry({
            candidateId: String(row.candidateId),
            request: {
              method: trace.method,
              url: trace.url,
              body: trace.requestBody,
            },
            response: {
              httpStatus: trace.httpStatus,
              body: trace.responseBody,
            },
            error: err instanceof Error ? err.message : 'Hyrefast application failed.',
          })
        );
        const candidateFailureLog = hyrefastCreateApplicationLogEntry({
          candidateId: String(row.candidateId),
          request: {
            method: trace.method,
            url: trace.url,
            body: trace.requestBody,
          },
          response: {
            httpStatus: trace.httpStatus,
            body: trace.responseBody,
          },
          error: err instanceof Error ? err.message : 'Hyrefast application failed.',
        });
        appendScreeningCandidateLog(row, candidateFailureLog);
        appendScreeningCandidateVideoLog(row, candidateFailureLog);
      }
      row.mode = 'video';
      row.video = {
        ...(row.video || {}),
        jobId: hyrefastJobId,
        applicationId: null,
        invitationStatus: 'failed',
        invitationError: err instanceof Error ? err.message : 'Hyrefast application failed.',
        logs: row.video?.logs || [],
      };
      row.callStatus = 'failed';
      row.error = err instanceof Error ? err.message : 'Failed to send video interview.';
      await row.save();
      await unsetVoiceOnlyFields(row._id);
      log().error(
        {
          ...candidateLog,
          rowError: row.error,
          hyrefastErrorCode:
            err && typeof err === 'object' && 'code' in err
              ? String((err as { code?: string }).code || '')
              : undefined,
          hyrefastStatusCode:
            err && typeof err === 'object' && 'statusCode' in err
              ? Number((err as { statusCode?: number }).statusCode)
              : undefined,
          hyrefastDetails:
            err && typeof err === 'object' && 'details' in err
              ? (err as { details?: unknown }).details
              : undefined,
        },
        'Hyrefast video invite failed'
      );
    }

    // Throttle between application calls to avoid Hyrefast 429
    await sleep(APPLICATION_DELAY_MS);
  }

  if (pending.length === 0) {
    return doc;
  }

  // Finish the launch even if every invite failed. Throwing here used to
  // re-queue the Bull job, which retried failed candidates and incremented
  // Invite attempts on its own.
  doc.status = invited > 0 ? 'running' : 'completed';
  doc.launchedAt = doc.launchedAt || new Date();
  doc.pausedAt = null;
  doc.version += 1;
  await doc.save();
  return doc;
}
