import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createHyrefastApplication,
  createHyrefastJob,
  toHyrefastJobPayload,
} from '../src/providers/hyrefast/hyrefast.client.js';
import { HYREFAST_DEFAULT_BASE_URL } from '../src/providers/hyrefast/hyrefast.config.js';

describe('hyrefast client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.HYREFAST_API_KEY = 'test-hyrefast-key';
    delete process.env.HYREFAST_API_BASE_URL;
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    delete process.env.HYREFAST_API_KEY;
    delete process.env.HYREFAST_API_BASE_URL;
  });

  it('posts jobs to staging with the documented curl payload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        status: 'SUCCESS',
        message: 'Your request is successfully executed',
        data: { id: 'job_abc123', title: 'Senior Python Developer', status: 'active' },
      }),
    });

    const job = await createHyrefastJob({
      title: 'Senior Python Developer',
      description: 'We are looking for an experienced Python developer with strong backend skills.',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience_range: { min_years: 3, max_years: 7 },
      location: 'Bangalore, India',
      job_type: 'full_time',
      interview_config: { conversational: true, duration_minutes: 30 },
    });

    expect(job.job.id).toBe('job_abc123');
    expect(job.trace.method).toBe('POST');
    expect(job.trace.url).toBe('https://staging-api.hyrefast.ai/external/api/v1/jobs');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${HYREFAST_DEFAULT_BASE_URL}/jobs`);
    expect(url).toBe('https://staging-api.hyrefast.ai/external/api/v1/jobs');
    expect((init.headers as Record<string, string>)['X-API-Key']).toBe('test-hyrefast-key');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    expect(JSON.parse(String(init.body))).toEqual({
      title: 'Senior Python Developer',
      description: 'We are looking for an experienced Python developer with strong backend skills.',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience_range: { min_years: 3, max_years: 7 },
      location: 'Bangalore, India',
      job_type: 'full_time',
      interview_config: { conversational: true, duration_minutes: 30 },
    });
  });

  it('normalizes job payloads to the Hyrefast curl shape', () => {
    expect(
      toHyrefastJobPayload({
        title: '  Backend Engineer  ',
        description: 'Build APIs',
        skills: ['Node.js'],
        job_type: 'full_time',
      })
    ).toEqual({
      title: 'Backend Engineer',
      description: 'Build APIs',
      skills: ['Node.js'],
      experience_range: { min_years: 0, max_years: 0 },
      location: '',
      job_type: 'full_time',
      interview_config: { conversational: true, duration_minutes: 30 },
    });
  });

  it('creates an application with sendInterviewLink', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        status: 'SUCCESS',
        message: 'Your request is successfully executed',
        data: { id: 'app_xyz789', jobId: 'job_abc123', status: 'created' },
      }),
    });

    const application = await createHyrefastApplication({
      jobId: 'job_abc123',
      candidateEmail: 'jane@example.com',
      candidateName: 'Jane Doe',
      sendInterviewLink: true,
    });

    expect(application.application.id).toBe('app_xyz789');
    expect(application.trace.method).toBe('POST');
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://staging-api.hyrefast.ai/external/api/v1/applications');
    expect(JSON.parse(String(init.body))).toMatchObject({
      jobId: 'job_abc123',
      candidateEmail: 'jane@example.com',
      sendInterviewLink: true,
    });
  });

  it('treats SUCCESS with a null application payload as an invite that was sent', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        status: 'SUCCESS',
        message: 'Application created and private interview link sent successfully',
        data: null,
      }),
    });

    const application = await createHyrefastApplication({
      jobId: 'job_abc123',
      candidateEmail: 'mike@mailinator.com',
      candidateName: 'mike',
      sendInterviewLink: true,
    });

    expect(application.application.id).toBeNull();
    expect(application.application.status).toBe('sent');
  });

  it('treats RECORD_NOT_FOUND on HTTP 200 as an error', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        status: 'RECORD_NOT_FOUND',
        message: 'Job not found',
        data: null,
      }),
    });

    await expect(
      createHyrefastApplication({
        jobId: 'missing',
        candidateEmail: 'jane@example.com',
      })
    ).rejects.toMatchObject({
      code: 'HYREFAST_NOT_FOUND',
      message: 'Job not found',
    });
  });
});
