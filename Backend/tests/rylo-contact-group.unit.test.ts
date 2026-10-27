import { describe, expect, it } from 'vitest';

import {
  campaignContactGroupName,
  campaignGroupAssignment,
  campaignStatusUpdate,
  placedProspectFromBody,
  prospectInsertCount,
  prospectsForContactGroup,
} from '../src/providers/rylo/rylo.contacts.js';

describe('campaign contact group', () => {
  it('appends a 4 digit code to the campaign name', () => {
    expect(campaignContactGroupName('sample1', '4823')).toBe('sample14823');
    expect(campaignContactGroupName('  sample1  ', '7')).toBe('sample10007');
  });

  it('turns the campaign on after the group is attached', () => {
    expect(campaignStatusUpdate({ campaignId: 'campaign-1', active: true })).toEqual({
      campaign_id: 'campaign-1',
      active: true,
    });
  });

  it('links the contact group to the campaign', () => {
    expect(
      campaignGroupAssignment({
        userId: 'user-1',
        campaignId: 'campaign-1',
        groupId: 'group-1',
      })
    ).toEqual({
      user_id: 'user-1',
      campaign_id: 'campaign-1',
      prospect_group_id: 'group-1',
    });
  });

  it('maps uploaded candidates into group prospects', () => {
    expect(
      prospectsForContactGroup({
        groupId: 'group-1',
        clientId: 'user-1',
        contacts: [
          {
            name: 'Rahul Sharma',
            phone: '+918592929642',
            email: '',
            data: { brand_name: 'HealthCare Plus', clinic_name: 'City Care Clinic' },
          },
        ],
      })
    ).toEqual([
      {
        name: 'Rahul Sharma',
        phone: '+918592929642',
        data: {
          brand_name: 'HealthCare Plus',
          clinic_name: 'City Care Clinic',
          name: 'Rahul Sharma',
        },
        prospect_group_id: 'group-1',
        client_id: 'user-1',
      },
    ]);
  });

  it('reads the group a candidate was stored in', () => {
    expect(
      placedProspectFromBody(
        {
          data: {
            insert_vocallabs_prospects_one: {
              id: 'prospect-1',
              phone: '+911234567890',
              prospect_group: { id: 'group-1', name: 'sample14823' },
            },
          },
        },
        'group-1'
      )
    ).toEqual({ prospectId: 'prospect-1', groupId: 'group-1' });
    expect(
      placedProspectFromBody(
        {
          id: 'prospect-9',
          phone: '+911234567890',
          prospect_group_id: 'other-group',
        },
        'group-1'
      )
    ).toEqual({ prospectId: 'prospect-9', groupId: 'other-group' });
  });

  it('counts inserted prospects from the bulk response', () => {
    expect(prospectInsertCount({ data: { insert_prospects: { affected_rows: 2 } } })).toBe(2);
    expect(
      prospectInsertCount({
        data: { id: 'prospect-1', phone: '+911234567890', prospect_group_id: 'group-1' },
      })
    ).toBe(1);
    expect(prospectInsertCount({ status: 'success' })).toBeNull();
  });
});
