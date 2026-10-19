import { afterEach, describe, expect, it, vi } from 'vitest';

import { sendOutlookViaGateway } from '../src/providers/outlook/outlook.send.js';

describe('sendOutlookViaGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.COMMUNICATION_GATEWAY_URL;
  });

  it('posts the Gmail-style prompt to the outlook gateway', async () => {
    process.env.COMMUNICATION_GATEWAY_URL = 'http://localhost:5055/api/v1';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'queued-1', threadId: 'thread-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendOutlookViaGateway({
      to: 'candidate@example.com',
      from: 'recruiter@huntlo.online',
      subject: 'Backend Engineer role',
      html: '<p>Hi Ada</p>',
      campaignId: 'camp-1',
      prompt: 'You are an AI assistant responsible for drafting a professional email reply.',
    });

    expect(result).toEqual({ messageId: 'queued-1', threadId: 'thread-1' });
    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }];
    expect(url).toBe('http://localhost:5055/api/v1/messages/send?autoReply=true');
    expect(JSON.parse(init.body)).toEqual({
      type: 'email',
      vendor: 'outlook',
      to: 'candidate@example.com',
      from: 'recruiter@huntlo.online',
      subject: 'Backend Engineer role',
      html: '<p>Hi Ada</p>',
      campaignId: 'camp-1',
      prompt: 'You are an AI assistant responsible for drafting a professional email reply.',
    });
  });
});
