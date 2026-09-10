import { describe, expect, it } from 'vitest';

import {
  listZohoRecruitCandidatesForJob,
  listZohoRecruitJobOpenings,
} from '../src/providers/zoho/zoho.recruit.js';

describe('zoho recruit list mappers (mocked fetch)', () => {
  it('maps Job_Openings list response', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'jo-1',
              Job_Opening_Name: 'Backend Engineer',
              Job_Opening_Status: 'In-progress',
              Client_Name: { name: 'Acme', id: 'c1' },
              City: 'Bengaluru',
              Country: 'India',
            },
          ],
          info: { page: 1, per_page: 50, count: 1, more_records: false },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    try {
      const result = await listZohoRecruitJobOpenings('token', 'in', { page: 1, pageSize: 50 });
      expect(result.jobs).toEqual([
        {
          id: 'jo-1',
          title: 'Backend Engineer',
          status: 'In-progress',
          clientName: 'Acme',
          location: 'Bengaluru, India',
        },
      ]);
      expect(result.total).toBe(1);
    } finally {
      globalThis.fetch = original;
    }
  });

  it('maps associate candidates for a job', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: 'cand-9',
              First_Name: 'Priya',
              Last_Name: 'Shah',
              Email: 'priya@example.com',
              Mobile: '+919876543210',
              Current_Job_Title: 'SDE-2',
              Current_Employer: 'TechCo',
              Candidate_Status: 'Associated',
              Experience_in_Years: 4,
            },
          ],
          info: { page: 1, per_page: 50, count: 1, more_records: false },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    try {
      const result = await listZohoRecruitCandidatesForJob('token', 'in', 'jo-1', {
        page: 1,
        pageSize: 50,
      });
      expect(result.candidates[0]).toMatchObject({
        id: 'cand-9',
        jobId: 'jo-1',
        name: 'Priya Shah',
        email: 'priya@example.com',
        phone: '+919876543210',
        currentTitle: 'SDE-2',
        currentCompany: 'TechCo',
        stage: 'Associated',
        experienceYears: 4,
      });
    } finally {
      globalThis.fetch = original;
    }
  });

  it('treats NO_CONTENT as empty list', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          code: 'NO_CONTENT',
          message: 'There is no content available for the request.',
          status: 'error',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;

    try {
      const result = await listZohoRecruitJobOpenings('token', 'com');
      expect(result.jobs).toEqual([]);
      expect(result.total).toBe(0);
    } finally {
      globalThis.fetch = original;
    }
  });
});
