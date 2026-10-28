import { describe, expect, it } from 'vitest';

import { TEST_PROSPECT_GROUP_ID, testContactCreateBody } from '../src/providers/rylo/rylo.calls.js';

describe('testContactCreateBody', () => {
  it('sends the contact name, phone, and the fixed test group', () => {
    expect(testContactCreateBody({ name: ' Ada ', phone: ' +918592929642 ' })).toEqual({
      name: 'Ada',
      phone: '+918592929642',
      prospect_group_id: TEST_PROSPECT_GROUP_ID,
    });
    expect(TEST_PROSPECT_GROUP_ID).toBe('791767d6-2047-4dad-9902-9a2e56d5ad1d');
  });
});
