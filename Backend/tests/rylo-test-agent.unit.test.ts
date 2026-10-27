import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearStoredVocallabsAuthToken } from '../src/providers/rylo/rylo.agents.js';
import {
  clearStoredTestContactGroup,
  testRyloAiAgent,
} from '../src/providers/rylo/rylo.calls.js';
import {
  RYLO_CREATE_CONTACT_GROUP_URL,
  RYLO_CREATE_CONTACT_URL,
  RYLO_INITIATE_CALL_URL,
  RYLO_UPDATE_CONTACT_DATA_URL,
  ryloCallTimelineUrl,
  ryloGetAiAgentUrl,
  ryloListContactGroupsUrl,
} from '../src/providers/rylo/rylo.config.js';

function agentResponse(
  agentId: string,
  inputs: Record<string, unknown> | null,
  agentPrompt = ''
) {
  return jsonResponse(200, {
    data: {
      vocallabs_agent: [
        {
          id: agentId,
          name: 'test123',
          welcome_message: 'Hello',
          call_token_id: 'call-token-1',
          ...(agentPrompt ? { agent_prompt: agentPrompt } : {}),
          ...(inputs ? { inputs_needed: inputs } : {}),
        },
      ],
    },
  });
}

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('testRyloAiAgent', () => {
  afterEach(() => {
    clearStoredVocallabsAuthToken();
    clearStoredTestContactGroup();
    vi.unstubAllGlobals();
    delete process.env.VOCALLABS_AUTH_TOKEN;
  });

  it('creates a test contact and starts a call for the agent', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        agentResponse('agent-1', {
          doctor_name: { key: 'doctor_name', about: 'Doctor' },
          clinic_name: { key: 'clinic_name', about: 'Clinic' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { data: { vocallabs_prospect_groups: [] } }))
      .mockResolvedValueOnce(jsonResponse(200, { data: { id: 'group-1', name: 'Huntlo tests' } }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'prospect-9', phone: '+919800000000', prospect_group_id: 'group-1' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            vocallabs_calls: [
              { call_status: 'queued', created_at: new Date().toISOString() },
            ],
          },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await testRyloAiAgent({ agentId: 'agent-1', phone: '+91 98000 00000' });

    expect(result).toEqual({
      agentId: 'agent-1',
      prospectId: 'prospect-9',
      call: { status: 'success' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(1, ryloGetAiAgentUrl('agent-1'), expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, ryloListContactGroupsUrl(50, 0), expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      RYLO_CREATE_CONTACT_GROUP_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Huntlo tests' }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      RYLO_CREATE_CONTACT_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Test',
          phone: '+919800000000',
          prospect_group_id: 'group-1',
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      5,
      RYLO_UPDATE_CONTACT_DATA_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prospect_id: 'prospect-9',
          data: { doctor_name: 'Test', clinic_name: 'Test' },
        }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      6,
      RYLO_INITIATE_CALL_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ agentId: 'agent-1', prospect_id: 'prospect-9' }),
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(7, ryloCallTimelineUrl('+919800000000'), expect.any(Object));
  });

  it('reports when Vocallabs starts a call that fails immediately', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(agentResponse('agent-5', null))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { vocallabs_prospect_groups: [{ id: 'group-existing', name: 'Huntlo tests' }] },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'prospect-5', phone: '9800000000', prospect_group_id: 'group-existing' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            vocallabs_calls: [
              { call_status: 'fail', duration: 0, created_at: new Date().toISOString() },
            ],
          },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(testRyloAiAgent({ agentId: 'agent-5', phone: '9800000000' })).rejects.toThrow(
      /could not connect this call/
    );
  });

  it('ignores older failed calls for the same number', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(agentResponse('agent-6', null))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { vocallabs_prospect_groups: [{ id: 'group-existing', name: 'Huntlo tests' }] },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'prospect-6', phone: '9800000000', prospect_group_id: 'group-existing' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            vocallabs_calls: [
              { call_status: 'fail', created_at: '2026-10-24T04:51:27.855012+00:00' },
            ],
          },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(testRyloAiAgent({ agentId: 'agent-6', phone: '9800000000' })).resolves.toMatchObject({
      agentId: 'agent-6',
      prospectId: 'prospect-6',
    });
  });

  it('reuses an existing Huntlo tests group', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(agentResponse('agent-2', null))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { vocallabs_prospect_groups: [{ id: 'group-existing', name: 'Huntlo tests' }] },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'prospect-2', phone: '9800000000', prospect_group_id: 'group-existing' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            vocallabs_calls: [
              { call_status: 'queued', created_at: new Date().toISOString() },
            ],
          },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await testRyloAiAgent({ agentId: 'agent-2', phone: '9800000000' });

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock.mock.calls[4][0]).toBe(ryloCallTimelineUrl('+919800000000'));
    expect(fetchMock.mock.calls[2][0]).toBe(RYLO_CREATE_CONTACT_URL);
    expect(fetchMock.mock.calls.map((call) => call[0])).not.toContain(RYLO_UPDATE_CONTACT_DATA_URL);
  });

  it('refuses to dial when the agent has no call token', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse(200, {
        data: {
          vocallabs_agent: [
            {
              id: 'agent-4',
              name: 'test123',
              welcome_message: 'Hello',
              call_token_id: null,
            },
          ],
        },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(testRyloAiAgent({ agentId: 'agent-4', phone: '9800000000' })).rejects.toThrow(
      /no phone line/
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('fills prompt placeholders missing from the capped inputs map', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        agentResponse(
          'agent-3',
          { name: { key: 'name', about: 'Name' } },
          'Offer {{slot_1}}, {{slot_2}}, and {{slot_3}}. Use {{variables}}.'
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { vocallabs_prospect_groups: [{ id: 'group-existing', name: 'Huntlo tests' }] },
        })
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: { id: 'prospect-3', phone: '9800000000', prospect_group_id: 'group-existing' },
        })
      )
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(jsonResponse(200, { status: 'success' }))
      .mockResolvedValueOnce(
        jsonResponse(200, {
          data: {
            vocallabs_calls: [
              { call_status: 'queued', created_at: new Date().toISOString() },
            ],
          },
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    await testRyloAiAgent({ agentId: 'agent-3', phone: '9800000000' });

    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      RYLO_UPDATE_CONTACT_DATA_URL,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          prospect_id: 'prospect-3',
          data: {
            name: 'Test',
            slot_1: '10:00 AM',
            slot_2: '10:00 AM',
            slot_3: '10:00 AM',
            variables: 'Test',
          },
        }),
      })
    );
  });
});
