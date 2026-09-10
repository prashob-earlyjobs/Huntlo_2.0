import { describe, expect, it } from 'vitest';

import {
  changeZohoRecruitCandidateStatus,
  createZohoRecruitCandidateNote,
} from '../src/providers/zoho/zoho.recruit.js';

describe('zoho recruit write-back (mocked fetch)', () => {
  it('PUTs job-association status then PUTs the candidate record', async () => {
    const original = globalThis.fetch;
    const calls: Array<{ method: string; url: string; body: unknown }> = [];
    globalThis.fetch = (async (input, init) => {
      calls.push({
        method: String(init?.method || 'GET'),
        url: String(input),
        body: JSON.parse(String(init?.body || '{}')),
      });
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
      expect(calls[0]?.method).toBe('PUT');
      expect(calls[0]?.url).toContain('recruit.zoho.in/recruit/v2/Candidates/status');
      expect(calls[0]?.body).toMatchObject({
        data: [
          {
            ids: ['c1'],
            jobids: ['j1'],
            Candidate_Status: 'Qualified',
          },
        ],
      });
      expect(calls[1]?.url).toContain('recruit.zoho.in/recruit/v2/Candidates');
      expect(calls[1]?.url).not.toContain('/status');
      expect(calls[1]?.body).toMatchObject({
        data: [{ id: 'c1', Candidate_Status: 'Qualified' }],
      });
    } finally {
      globalThis.fetch = original;
    }
  });

  it('still PUTs the candidate when job-status API fails', async () => {
    const original = globalThis.fetch;
    const calls: string[] = [];
    globalThis.fetch = (async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method}:${url}`);
      if (url.includes('/Candidates/status')) {
        return new Response(
          JSON.stringify({
            code: 'INVALID_REQUEST_METHOD',
            message: 'The http request method type is not a valid one',
            status: 'error',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          data: [{ code: 'SUCCESS', status: 'success', message: 'record updated' }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    try {
      await changeZohoRecruitCandidateStatus('tok', 'in', {
        candidateId: 'c1',
        status: 'Qualified',
        jobId: 'j1',
      });
      expect(calls[0]).toContain('PUT:');
      expect(calls[0]).toContain('/Candidates/status');
      expect(calls[1]).toContain('PUT:');
      expect(calls[1]).toContain('/recruit/v2/Candidates');
      expect(calls[1]).not.toContain('/status');
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
