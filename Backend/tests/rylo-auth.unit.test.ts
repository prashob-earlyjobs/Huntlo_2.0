import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRyloAuthToken } from '../src/providers/rylo/rylo.auth.js';
import { RYLO_CREATE_AUTH_TOKEN_URL } from '../src/providers/rylo/rylo.config.js';

describe('createRyloAuthToken', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RYLO_CLIENT_ID;
    delete process.env.RYLO_CLIENT_SECRET;
    delete process.env.VOCALLABS_CLIENT_ID;
    delete process.env.VOCALLABS_CLIENT_SECRET;
  });

  it('posts the env client id and secret and returns the token', async () => {
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        status: 'success',
        auth_token: 'token-abc',
        id: 'account-9',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const token = await createRyloAuthToken();

    expect(token).toEqual({
      authToken: 'token-abc',
      id: 'account-9',
      status: 'success',
    });
    expect(fetchMock).toHaveBeenCalledWith(RYLO_CREATE_AUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ clientId: 'client-1', clientSecret: 'secret-1' }),
    });
  });

  it('reads the camelCase authToken field Vocallabs returns', async () => {
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        affectedRows: 1,
        authToken: 'token-live',
        expiresIn: 3600,
        id: 'account-9',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const token = await createRyloAuthToken();

    expect(token.authToken).toBe('token-live');
    expect(token.id).toBe('account-9');
  });

  it('accepts Vocallabs client credentials when the Rylo names are unset', async () => {
    process.env.VOCALLABS_CLIENT_ID = 'vocallabs-client';
    process.env.VOCALLABS_CLIENT_SECRET = 'vocallabs-secret';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', auth_token: 'token-abc', id: 'account-9' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await createRyloAuthToken();

    expect(fetchMock).toHaveBeenCalledWith(
      RYLO_CREATE_AUTH_TOKEN_URL,
      expect.objectContaining({
        body: JSON.stringify({ clientId: 'vocallabs-client', clientSecret: 'vocallabs-secret' }),
      })
    );
  });

  it('refuses to call Rylo when credentials are missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(createRyloAuthToken()).rejects.toThrow(
      'RYLO_CLIENT_ID and RYLO_CLIENT_SECRET are not configured'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
