/** Mirrors Frontend/lib/enrollment-pipeline-status.ts for API responses. */

export type CandidatePipelineStatus =
  | 'Awaiting reply'
  | 'Interested'
  | 'Not interested'
  | 'In qualification'
  | 'Qualified'
  | 'Not qualified'
  | 'In screening';

type EnrollmentSlice = {
  status?: string;
  qualificationState?: {
    status?: 'pending' | 'in_progress' | 'qualified' | 'rejected' | 'skipped';
    answers?: Record<string, unknown>;
  } | null;
  replyState?: {
    hasReply?: boolean;
    disposition?: string | null;
    repliedAt?: Date | string | null;
  } | null;
  screeningState?: {
    status?: 'not_started' | 'scheduled' | 'completed' | 'skipped';
    screeningId?: string | null;
  } | null;
};

export function deriveEnrollmentPipelineStatus(
  enrollment: EnrollmentSlice | null | undefined,
  options?: { autoScreening?: boolean; threadQualificationStatus?: string | null }
): CandidatePipelineStatus {
  const qual =
    enrollment?.qualificationState?.status ??
    mapThreadQualification(options?.threadQualificationStatus);
  const screening = enrollment?.screeningState?.status ?? 'not_started';
  const screeningId = enrollment?.screeningState?.screeningId ?? null;
  const disposition = enrollment?.replyState?.disposition?.toLowerCase() ?? null;
  const hasReply = Boolean(
    enrollment?.replyState?.hasReply || enrollment?.status === 'replied'
  );

  if (
    enrollment?.status === 'opted_out' ||
    disposition === 'opt_out' ||
    disposition === 'not_interested'
  ) {
    return 'Not interested';
  }

  if (qual === 'rejected') {
    return 'Not qualified';
  }

  if (qual === 'qualified') {
    const inScreening =
      screening === 'scheduled' && (options?.autoScreening || Boolean(screeningId));
    if (inScreening) {
      return 'In screening';
    }
    if (screening === 'completed') {
      return 'Qualified';
    }
    return 'Qualified';
  }

  if (qual === 'in_progress') {
    return 'In qualification';
  }

  if (options?.threadQualificationStatus === 'handed_off') {
    return 'In qualification';
  }

  if (hasReply) {
    if (disposition === 'interested') {
      return qual === 'pending' ? 'Interested' : 'In qualification';
    }
    if (disposition === 'not_interested') {
      return 'Not interested';
    }
    return 'Interested';
  }

  return 'Awaiting reply';
}

function mapThreadQualification(
  status: string | null | undefined
): 'pending' | 'in_progress' | 'qualified' | 'rejected' {
  switch (status) {
    case 'in_progress':
    case 'handed_off':
      return 'in_progress';
    case 'qualified':
      return 'qualified';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}
