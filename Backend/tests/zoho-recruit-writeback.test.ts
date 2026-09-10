import { describe, expect, it } from 'vitest';

import {
  changeZohoRecruitCandidateStatus,
  createZohoRecruitCandidateNote,
} from '../src/providers/zoho/zoho.recruit.js';

describe('zoho recruit write-back (mocked fetch)', () => {
  it('POSTs candidate status change', async () => {
    const original = globalThis.fetch;
    let calledUrl = '';
    let calledBody: unknown;
    globalThis.fetch = (async (input, init) => {
      calledUrl = String(input);
      calledBody = JSON.parse(String(init?.body || '{}'));
      return new Response(
        JSON.stringify({
          data: [[{ code: 'SUCCESS', status: 'success', message: 'status changed' }]],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    try {
      await changeZohoRecruitCandidateStatus('tok', 'in', {
        candidateId: 'c1',
        status: 'Qualified',
        comments: 'Huntlo qualified',
        jobId: 'j1',
      });
      expect(calledUrl).toContain('recruit.zoho.in/recruit/v2/Candidates/status');
      expect(calledBody).toMatchObject({
        data: [
          {
            ids: ['c1'],
            jobids: ['j1'],
            Candidate_Status: 'Qualified',
          },
        ],
      });
    } finally {
      globalThis.fetch = original;
    }
  });

  it('POSTs candidate note', async () => {
    const original = globalThis.fetch;
    let calledUrl = '';
    globalThis.fetch = (async (input) => {
      calledUrl = String(input);
      return new Response(
        JSON.stringify({
          data: [{ code: 'SUCCESS', status: 'success', message: 'record added' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    try {
      await createZohoRecruitCandidateNote('tok', 'in', {
        candidateId: 'c1',
        title: 'Huntlo',
        content: 'Outreach completed',
      });
      expect(calledUrl).toContain('recruit.zoho.in/recruit/v2/Notes');
    } finally {
      globalThis.fetch = original;
    }
  });
});
