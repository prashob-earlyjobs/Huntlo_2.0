import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import {
  createOutlookMailSubscription,
  isOutlookPushConfigured,
  renewOutlookMailSubscription,
} from '../src/providers/outlook/outlook.subscription.js';

describe('Outlook Graph subscription', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OUTLOOK_NOTIFICATION_URL;
  });

  it('requires a public https notification URL', () => {
    process.env.OUTLOOK_NOTIFICATION_URL = 'http://localhost:4000/api/v1/public/webhooks/outlook';
    expect(isOutlookPushConfigured()).toBe(false);
    process.env.OUTLOOK_NOTIFICATION_URL =
      'https://api.example.com/api/v1/public/webhooks/outlook';
    expect(isOutlookPushConfigured()).toBe(true);
  });

  it('creates an inbox subscription with clientState', async () => {
    process.env.OUTLOOK_NOTIFICATION_URL =
      'https://api.example.com/api/v1/public/webhooks/outlook';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'sub-1', expirationDateTime: '2026-10-21T00:00:00.000Z' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const created = await createOutlookMailSubscription({
      accessToken: 'ya29.token',
      clientState: 'client-secret',
    });

    expect(created).toEqual({
      id: 'sub-1',
      expirationDateTime: '2026-10-21T00:00:00.000Z',
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
    expect(url).toBe('https://graph.microsoft.com/v1.0/subscriptions');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body) as Record<string, string>;
    expect(body.changeType).toBe('created');
    expect(body.notificationUrl).toBe(
      'https://api.example.com/api/v1/public/webhooks/outlook'
    );
    expect(body.resource).toBe("me/mailFolders('inbox')/messages");
    expect(body.clientState).toBe('client-secret');
    expect(body.expirationDateTime).toBeTruthy();
  });

  it('renews with PATCH and treats 404 as a missing subscription', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'sub-1', expirationDateTime: '2026-10-22T00:00:00.000Z' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      });
    vi.stubGlobal('fetch', fetchMock);

    const renewed = await renewOutlookMailSubscription({
      accessToken: 'token',
      subscriptionId: 'sub-1',
    });
    expect(renewed).toEqual({
      id: 'sub-1',
      expirationDateTime: '2026-10-22T00:00:00.000Z',
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, { method: string; body: string }];
    expect(url).toBe('https://graph.microsoft.com/v1.0/subscriptions/sub-1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body)).toEqual({
      expirationDateTime: expect.any(String),
    });

    await expect(
      renewOutlookMailSubscription({ accessToken: 'token', subscriptionId: 'gone' })
    ).resolves.toBe('missing');
  });
});

describe('Outlook webhook handshake', () => {
  const app = createApp();

  it('echoes the Graph validationToken as text/plain', async () => {
    const response = await request(app)
      .post('/api/v1/public/webhooks/outlook')
      .query({ validationToken: 'graph-validation-token' })
      .expect(200);

    expect(response.headers['content-type']).toMatch(/text\/plain/);
    expect(response.text).toBe('graph-validation-token');
  });
});
