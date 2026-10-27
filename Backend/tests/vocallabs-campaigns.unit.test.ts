import mongoose from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findOneAndUpdate, findCampaigns } = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
  findCampaigns: vi.fn(),
}));

vi.mock('../src/modules/vocallabs/vocallabs-campaign.model.js', () => ({
  VocallabsCampaignModel: {
    findOneAndUpdate,
    find: findCampaigns,
  },
}));

import {
  listStoredVocallabsCampaigns,
  saveVocallabsCampaign,
} from '../src/modules/vocallabs/vocallabs-campaigns.service.js';

function queryResult<T>(value: T) {
  const query = {
    sort: () => query,
    lean: async () => value,
  };
  return query;
}

describe('saveVocallabsCampaign', () => {
  const userId = new mongoose.Types.ObjectId();
  const recordId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    findOneAndUpdate.mockReset();
    findCampaigns.mockReset();
  });

  it('upserts the Vocallabs campaign id for the organization', async () => {
    findOneAndUpdate.mockReturnValue({
      lean: async () => ({
        _id: recordId,
        campaignId: 'camp-1',
        name: 'Hiring',
        agentId: 'agent-1',
        createdAt: new Date('2026-10-27T00:00:00.000Z'),
      }),
    });

    await expect(
      saveVocallabsCampaign({
        organizationId: ' org-1 ',
        userId: userId.toHexString(),
        campaignId: ' camp-1 ',
        name: ' Hiring ',
        agentId: ' agent-1 ',
      })
    ).resolves.toEqual({
      id: recordId.toHexString(),
      campaignId: 'camp-1',
      name: 'Hiring',
      agentId: 'agent-1',
      contactGroupId: '',
      contactGroupName: '',
      createdAt: '2026-10-27T00:00:00.000Z',
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { campaignId: 'camp-1' },
      {
        $setOnInsert: {
          organizationId: 'org-1',
          userId: userId.toHexString(),
          campaignId: 'camp-1',
          name: 'Hiring',
          agentId: 'agent-1',
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  });
});

describe('listStoredVocallabsCampaigns', () => {
  it('returns campaigns stored for the organization', async () => {
    const recordId = new mongoose.Types.ObjectId();
    findCampaigns.mockReturnValue(
      queryResult([
        {
          _id: recordId,
          campaignId: 'camp-1',
          name: 'Hiring',
          agentId: 'agent-1',
          createdAt: new Date('2026-10-27T00:00:00.000Z'),
        },
      ])
    );

    await expect(listStoredVocallabsCampaigns('org-1')).resolves.toEqual([
      {
        id: recordId.toHexString(),
        campaignId: 'camp-1',
        name: 'Hiring',
        agentId: 'agent-1',
        contactGroupId: '',
        contactGroupName: '',
        createdAt: '2026-10-27T00:00:00.000Z',
      },
    ]);
    expect(findCampaigns).toHaveBeenCalledWith({ organizationId: 'org-1' });
  });
});
