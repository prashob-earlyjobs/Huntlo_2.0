import { afterEach, describe, expect, it, vi } from 'vitest';

import { clearStoredVocallabsAuthToken } from '../src/providers/rylo/rylo.agents.js';
import { RYLO_CREATE_CAMPAIGN_URL } from '../src/providers/rylo/rylo.config.js';
import {
  createRyloCampaign,
  readCreatedRyloCampaign,
  readRyloCampaigns,
} from '../src/providers/rylo/rylo.campaigns.js';

describe('readRyloCampaigns', () => {
  it('reads Vocallabs campaign rows and ignores other payloads', () => {
    const campaigns = readRyloCampaigns({
      data: {
        vocallabs_campaigns: [
          {
            id: 'older',
            name: 'Older',
            agent_id: 'agent-1',
            agent: { id: 'agent-1', name: 'Hiring agent' },
            is_active: true,
            concurrency: 4,
            pending_count: 1,
            created_at: '2026-10-01T00:00:00.000Z',
            call_queues_aggregate: { aggregate: { count: 3 } },
          },
          {
            id: 'newer',
            name: 'Newer',
            agent_id: 'agent-2',
            agent: null,
            is_active: false,
            created_at: '2026-10-27T00:00:00.000Z',
            call_queues_aggregate: { aggregate: { count: 0 } },
          },
        ],
        vocallabs_campaigns_aggregate: { aggregate: { count: 2 } },
      },
    });

    expect(campaigns.map((campaign) => campaign.id)).toEqual(['newer', 'older']);
    expect(campaigns[1]).toMatchObject({
      name: 'Older',
      agentName: 'Hiring agent',
      active: true,
      concurrency: 4,
      pendingCount: 1,
      contactCount: 3,
    });
    expect(campaigns[0]?.agentName).toBe('');
  });

  it('reads the created campaign id', () => {
    expect(
      readCreatedRyloCampaign(
        { data: { insert_vocallabs_campaigns_one: { id: 'camp-1', name: 'Hiring' } } },
        'Hiring',
        'agent-1'
      )
    ).toEqual({ id: 'camp-1', name: 'Hiring', agentId: 'agent-1' });
  });
});

describe('createRyloCampaign', () => {
  afterEach(() => {
    clearStoredVocallabsAuthToken();
    vi.unstubAllGlobals();
    delete process.env.VOCALLABS_AUTH_TOKEN;
  });

  it('posts the name and agent id to Vocallabs', async () => {
    process.env.VOCALLABS_AUTH_TOKEN = 'env-token';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { id: 'camp-1', name: 'Hiring', agent_id: 'agent-1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(createRyloCampaign({ name: ' Hiring ', agentId: 'agent-1' })).resolves.toEqual({
      id: 'camp-1',
      name: 'Hiring',
      agentId: 'agent-1',
    });
    expect(fetchMock).toHaveBeenCalledWith(RYLO_CREATE_CAMPAIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer env-token',
      },
      body: JSON.stringify({ name: 'Hiring', agent_id: 'agent-1' }),
    });
  });
});