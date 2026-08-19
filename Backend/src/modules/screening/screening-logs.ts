import {
  type ScreeningDocument,
  type ScreeningLogEntry,
} from './screening.model.js';

export function initialVideoScreeningLog(name: string): ScreeningLogEntry {
  return {
    at: new Date(),
    event: 'screening_created',
    message: `Video screening "${String(name || '').trim() || 'Untitled'}" created.`,
  };
}

export function hyrefastCreateJobLogEntry(input: {
  request: {
    method: string;
    url: string;
    body: Record<string, unknown>;
  };
  response?: {
    httpStatus: number;
    body: unknown;
  };
  error?: string | null;
}): ScreeningLogEntry {
  return {
    at: new Date(),
    event: 'hyrefast_create_job',
    message: input.error
      ? 'Hyrefast job creation failed.'
      : 'Hyrefast job created.',
    request: input.request,
    response: input.response ?? null,
    error: input.error ?? null,
  };
}

export function hyrefastCreateApplicationLogEntry(input: {
  candidateId: string;
  request: {
    method: string;
    url: string;
    body: Record<string, unknown>;
  };
  response?: {
    httpStatus: number;
    body: unknown;
  };
  error?: string | null;
}): ScreeningLogEntry {
  return {
    at: new Date(),
    event: 'hyrefast_create_application',
    message: input.error
      ? `Hyrefast application failed for candidate ${input.candidateId}.`
      : `Hyrefast application created for candidate ${input.candidateId}.`,
    request: input.request,
    response: input.response ?? null,
    error: input.error ?? null,
  };
}

export function hyrefastSendInterviewLogEntry(input: {
  candidateId: string;
  request: {
    method: string;
    url: string;
    body: Record<string, unknown>;
  };
  response?: {
    httpStatus: number;
    body: unknown;
  };
  error?: string | null;
}): ScreeningLogEntry {
  return {
    at: new Date(),
    event: 'hyrefast_send_interview',
    message: input.error
      ? `Hyrefast interview resend failed for candidate ${input.candidateId}.`
      : `Hyrefast interview resent for candidate ${input.candidateId}.`,
    request: input.request,
    response: input.response ?? null,
    error: input.error ?? null,
  };
}

export function hyrefastInterviewLinkLogEntry(input: {
  candidateId: string;
  request: {
    method: string;
    url: string;
    body: Record<string, unknown>;
  };
  response?: {
    httpStatus: number;
    body: unknown;
  };
  error?: string | null;
}): ScreeningLogEntry {
  return {
    at: new Date(),
    event: 'hyrefast_interview_link',
    message: input.error
      ? `Hyrefast interview link fetch failed for candidate ${input.candidateId}.`
      : `Hyrefast interview link fetched for candidate ${input.candidateId}.`,
    request: input.request,
    response: input.response ?? null,
    error: input.error ?? null,
  };
}

export function appendVideoScreeningLog(
  doc: ScreeningDocument,
  entry: ScreeningLogEntry
): void {
  if (!Array.isArray(doc.logs)) {
    doc.logs = [];
  }
  doc.logs.push(entry);
}

export function appendScreeningCandidateLog(
  doc: { logs?: ScreeningLogEntry[] | null },
  entry: ScreeningLogEntry
): void {
  if (!Array.isArray(doc.logs)) {
    doc.logs = [];
  }
  doc.logs.push(entry);
}

export function appendScreeningCandidateVideoLog(
  doc: {
    video?: { logs?: ScreeningLogEntry[] | null } | null;
  },
  entry: ScreeningLogEntry
): void {
  if (!doc.video) {
    doc.video = { logs: [] };
  }
  if (!Array.isArray(doc.video.logs)) {
    doc.video.logs = [];
  }
  doc.video.logs.push(entry);
}
