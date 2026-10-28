import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearStoredVocallabsAuthToken,
  createRyloAiAgent,
  getRyloAiAgent,
  listRyloAiAgents,
  listRyloCallTokens,
  listRyloVoices,
  updateRyloAiAgent,
} from '../src/providers/rylo/rylo.agents.js';
import {
  RYLO_CREATE_AI_AGENT_URL,
  RYLO_CREATE_AUTH_TOKEN_URL,
  RYLO_LIST_CALL_TOKENS_URL,
  RYLO_LIST_VOICES_URL,
  ryloGetAiAgentUrl,
  ryloListAiAgentsUrl,
  ryloUpdateAiAgentUrl,
} from '../src/providers/rylo/rylo.config.js';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('createRyloAiAgent', () => {
  afterEach(() => {
    clearStoredVocallabsAuthToken();
    vi.unstubAllGlobals();
    delete process.env.VOCALLABS_AUTH_TOKEN;
    delete process.env.RYLO_CLIENT_ID;
    delete process.env.RYLO_CLIENT_SECRET;
  });

  it('creates an agent with the env token', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 'agent-1', name: 'Ava' }));
    vi.stubGlobal('fetch', fetchMock);

    const created = await createRyloAiAgent('Ava');

    expect(created).toEqual({ id: 'agent-1', name: 'Ava' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(RYLO_CREATE_AI_AGENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
      body: JSON.stringify({ name: 'Ava' }),
    });
  });

  it('mints a new token after 401 and does not replace the env token', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === RYLO_CREATE_AUTH_TOKEN_URL) {
        return jsonResponse(200, { auth_token: 'fresh-token', id: 'account-1', status: 'success' });
      }
      const headers = new Headers(init?.headers);
      if (headers.get('Authorization') === 'Bearer env-token') {
        return jsonResponse(401, { message: 'unauthorized' });
      }
      return jsonResponse(200, { id: 'agent-2', name: 'Ava' });
    });
    vi.stubGlobal('fetch', fetchMock);

    const created = await createRyloAiAgent('Ava');

    expect(created).toEqual({ id: 'agent-2', name: 'Ava' });
    expect(process.env.VOCALLABS_AUTH_TOKEN).toBe('env-token');
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const retried = fetchMock.mock.calls.find((call) => {
      const headers = new Headers(call[1]?.headers);
      return headers.get('Authorization') === 'Bearer fresh-token';
    });
    expect(retried?.[0]).toBe(RYLO_CREATE_AI_AGENT_URL);
  });

  it('does not call Vocallabs when the env token is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(createRyloAiAgent('Ava')).rejects.toThrow(
      'VOCALLABS_AUTH_TOKEN is not configured'
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lists agents from vocallabs_agent and keeps the env token after a 401', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === RYLO_CREATE_AUTH_TOKEN_URL) {
        return jsonResponse(200, { auth_token: 'fresh-token', id: 'account-1', status: 'success' });
      }
      const headers = new Headers(init?.headers);
      if (headers.get('Authorization') === 'Bearer env-token') {
        return jsonResponse(401, { message: 'unauthorized' });
      }
      return jsonResponse(200, {
        data: {
          vocallabs_agent: [
            { id: 'agent-1', name: 'sample1', created_at: '2026-10-22T10:51:32.753222+00:00' },
          ],
          vocallabs_agent_aggregate: { aggregate: { count: 1 } },
        },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    const page = await listRyloAiAgents({ limit: 20, offset: 0 });

    expect(page).toEqual({
      items: [
        {
          id: 'agent-1',
          name: 'sample1',
          createdAt: '2026-10-22T10:51:32.753222+00:00',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    });
    expect(process.env.VOCALLABS_AUTH_TOKEN).toBe('env-token');
    expect(fetchMock.mock.calls.some((call) => call[0] === ryloListAiAgentsUrl(20, 0))).toBe(true);
  });

  it('signs in again when the token service returns 502 once', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';
    let tokenCalls = 0;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === RYLO_CREATE_AUTH_TOKEN_URL) {
        tokenCalls += 1;
        if (tokenCalls === 1) return jsonResponse(502, { message: 'bad gateway' });
        return jsonResponse(200, { auth_token: 'fresh-token', id: 'account-1', status: 'success' });
      }
      const headers = new Headers(init?.headers);
      if (headers.get('Authorization') === 'Bearer env-token') {
        return jsonResponse(401, { message: 'unauthorized' });
      }
      return jsonResponse(200, { id: 'agent-2', name: 'Ava' });
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(createRyloAiAgent('Ava')).resolves.toEqual({ id: 'agent-2', name: 'Ava' });
    expect(tokenCalls).toBe(2);
  });

  it('reuses the minted token on the next request', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    process.env.RYLO_CLIENT_ID = 'client-1';
    process.env.RYLO_CLIENT_SECRET = 'secret-1';

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === RYLO_CREATE_AUTH_TOKEN_URL) {
        return jsonResponse(200, { auth_token: 'fresh-token', id: 'account-1', status: 'success' });
      }
      const headers = new Headers(init?.headers);
      if (headers.get('Authorization') === 'Bearer env-token') {
        return jsonResponse(401, { message: 'unauthorized' });
      }
      return jsonResponse(200, { id: 'agent-2', name: 'Ava' });
    });
    vi.stubGlobal('fetch', fetchMock);

    await createRyloAiAgent('Ava');
    fetchMock.mockClear();

    await listRyloAiAgents({ limit: 20, offset: 0 });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(ryloListAiAgentsUrl(20, 0));
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Authorization')).toBe('Bearer fresh-token');
    expect(process.env.VOCALLABS_AUTH_TOKEN).toBe('env-token');
  });

  it('updates an agent with the Vocallabs field names', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 'agent-1', name: 'Ava' }));
    vi.stubGlobal('fetch', fetchMock);

    const updated = await updateRyloAiAgent({
      agentId: 'agent-1',
      name: 'Ava',
      contactId: 'contact-9',
      welcomeMessage: 'Hello',
      agentPrompt: 'Hello , your ID is .',
      analyticsPrompt: 'Summarise the call',
      language: 'en',
      callTokenId: 'call-token-1',
      voiceId: 'voice-1',
    });

    expect(updated).toEqual({ id: 'agent-1', name: 'Ava' });
    expect(fetchMock).toHaveBeenCalledWith(ryloUpdateAiAgentUrl('agent-1'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
      body: JSON.stringify({
        agent_id: 'agent-1',
        name: 'Ava',
        inputs_needed: { contact_id: 'contact-9' },
        welcome_message: 'Hello',
        agent_prompt: 'Hello , your ID is .',
        analytics_prompt: 'Summarise the call',
        language: 'en',
        call_token_id: 'call-token-1',
        voice_id: 'voice-1',
      }),
    });
  });

  it('loads agent details from getAIAgentByID', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, {
        data: {
          vocallabs_agent: [
            {
              id: 'agent-1',
              name: 'Ava',
              inputs_needed: { contact_id: 'contact-9' },
              welcome_message: 'Hello',
              agent_prompt: 'Hello , your ID is .',
              analytics_prompt: 'Summarise',
              language: 'en',
              call_token_id: 'call-token-1',
              voice_id: 'voice-1',
              token: 'secret-value',
            },
          ],
        },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const agent = await getRyloAiAgent('agent-1');

    expect(agent).toEqual({
      id: 'agent-1',
      name: 'Ava',
      contactId: 'contact-9',
      welcomeMessage: 'Hello',
      agentPrompt: 'Hello , your ID is .',
      analyticsPrompt: 'Summarise',
      language: 'en',
      callTokenId: 'call-token-1',
      voiceId: 'voice-1',
      record: {
        id: 'agent-1',
        name: 'Ava',
        inputs_needed: { contact_id: 'contact-9' },
        welcome_message: 'Hello',
        agent_prompt: 'Hello , your ID is .',
        analytics_prompt: 'Summarise',
        language: 'en',
        call_token_id: 'call-token-1',
        voice_id: 'voice-1',
      },
    });
    expect(JSON.stringify(agent.record)).not.toContain('secret-value');
    expect(agent.language).toBe('en');
    expect(fetchMock).toHaveBeenCalledWith(ryloGetAiAgentUrl('agent-1'), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
    });
  });

  it('keeps the agent language when a nested record also has one', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(200, {
          data: {
            vocallabs_agent: {
              id: 'agent-1',
              name: 'Ava',
              language: 'ENGLISH (INDIAN)',
              welcome_message: 'Hello',
              voice: { language: 'hi', alias: 'Aadhirai' },
            },
          },
        })
      )
    );

    const agent = await getRyloAiAgent('agent-1');

    expect(agent.language).toBe('ENGLISH (INDIAN)');
    expect(agent.welcomeMessage).toBe('Hello');
  });

  it('lists call tokens without returning the secret', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, [
        {
          data: {
            vocallabs_call_tokens: [
              { id: 'tok-b', name: 'Main line', token: 'secret-value' },
              { id: 'tok-a', name: 'Backup', token: 'other-secret' },
              { name: 'Missing id', token: 'skip' },
            ],
          },
        },
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    const tokens = await listRyloCallTokens();

    expect(tokens).toEqual([
      { id: 'tok-a', label: 'Backup' },
      { id: 'tok-b', label: 'Main line' },
    ]);
    expect(JSON.stringify(tokens)).not.toContain('secret');
    expect(fetchMock).toHaveBeenCalledWith(RYLO_LIST_CALL_TOKENS_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
    });
  });

  it('lists voices from the wrapped Vocallabs payload', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, [
        {
          data: {
            vocallabs_tts_voices: [
              { alias: 'Lakshmi', id: 'voice-b' },
              { alias: 'Aliya', id: 'voice-a' },
              { alias: '', id: '' },
            ],
          },
        },
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    const voices = await listRyloVoices();

    expect(voices).toEqual([
      { alias: 'Aliya', id: 'voice-a' },
      { alias: 'Lakshmi', id: 'voice-b' },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(RYLO_LIST_VOICES_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
    });
  });
});
