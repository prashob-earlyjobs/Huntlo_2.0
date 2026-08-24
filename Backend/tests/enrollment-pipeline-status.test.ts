import { describe, expect, it } from 'vitest';

import { deriveEnrollmentPipelineStatus } from '../src/modules/outreach/enrollment-pipeline-status.js';
import { resolveVoiceReplyDisposition } from '../src/modules/voice/voice-qualification-sync.js';

describe('deriveEnrollmentPipelineStatus', () => {
  it('shows Qualified when screening answers passed even if voice tagged not interested', () => {
    expect(
      deriveEnrollmentPipelineStatus({
        status: 'interested',
        qualificationState: { status: 'qualified' },
        replyState: { hasReply: true, disposition: 'not_interested' },
      })
    ).toBe('Qualified');
  });

  it('shows Not interested when a recruiter stops after marking not interested', () => {
    expect(
      deriveEnrollmentPipelineStatus({
        status: 'stopped',
        qualificationState: { status: 'qualified' },
        replyState: { hasReply: true, disposition: 'not_interested' },
      })
    ).toBe('Not interested');
  });

  it('shows Not interested for an unqualified not-interested reply', () => {
    expect(
      deriveEnrollmentPipelineStatus({
        status: 'replied',
        qualificationState: { status: 'pending' },
        replyState: { hasReply: true, disposition: 'not_interested' },
      })
    ).toBe('Not interested');
  });
});

describe('resolveVoiceReplyDisposition', () => {
  it('treats not interested before the substring interested', () => {
    expect(resolveVoiceReplyDisposition('Not interested', 'Completed')).toBe('not_interested');
    expect(resolveVoiceReplyDisposition('not_interested', '')).toBe('not_interested');
  });

  it('does not treat none / not mentioned as not interested', () => {
    expect(resolveVoiceReplyDisposition('none', '')).toBeNull();
    expect(resolveVoiceReplyDisposition('not mentioned', 'screening completed')).toBeNull();
  });

  it('maps positive interest', () => {
    expect(resolveVoiceReplyDisposition('Interested', 'Interested')).toBe('interested');
    expect(resolveVoiceReplyDisposition('high', '')).toBe('interested');
  });
});
