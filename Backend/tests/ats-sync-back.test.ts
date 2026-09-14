import { describe, expect, it } from 'vitest';

import {
  buildAtsSyncNote,
  mapEnrollmentToAtsStatus,
} from '../src/modules/integrations/ats-sync-back.service.js';

describe('ats sync-back mapping', () => {
  it('maps qualification outcomes to Zoho statuses', () => {
    expect(
      mapEnrollmentToAtsStatus({
        status: 'stopped',
        stopReason: 'qualification_rejected',
        qualificationStatus: 'rejected',
      })
    ).toBe('Rejected');
    expect(
      mapEnrollmentToAtsStatus({
        status: 'active',
        stopReason: null,
        qualificationStatus: 'qualified',
      })
    ).toBe('Qualified');
    expect(
      mapEnrollmentToAtsStatus({
        status: 'active',
        stopReason: null,
        qualificationStatus: 'interested',
      })
    ).toBe('Qualified');
  });

  it('maps completed outreach to Contacted', () => {
    expect(
      mapEnrollmentToAtsStatus({
        status: 'completed',
        stopReason: 'sequence_completed',
        qualificationStatus: 'pending',
      })
    ).toBe('Contacted');
  });

  it('maps opt-out to Junk Candidate', () => {
    expect(
      mapEnrollmentToAtsStatus({
        status: 'opted_out',
        stopReason: 'candidate_opted_out',
        qualificationStatus: null,
      })
    ).toBe('Junk Candidate');
  });

  it('builds a note with campaign context', () => {
    const note = buildAtsSyncNote({
      campaignName: 'SDE outreach',
      status: 'completed',
      stopReason: 'sequence_completed',
      qualificationStatus: 'qualified',
      qualificationReason: 'All answers matched',
    });
    expect(note.title).toContain('completed');
    expect(note.content).toContain('SDE outreach');
    expect(note.content).toContain('All answers matched');
  });
});
