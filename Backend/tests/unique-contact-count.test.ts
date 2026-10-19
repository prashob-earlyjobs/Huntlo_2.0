import { describe, expect, it } from 'vitest';

import { uniqueIdCount } from '../src/modules/outreach/campaigns.service.js';

describe('uniqueIdCount', () => {
  it('counts one person when the same enrollment is sent and then followed up', () => {
    const enrollment = '6ad1b860040757ade902b17d';
    expect(uniqueIdCount([enrollment, enrollment])).toBe(1);
  });

  it('counts separate enrollments and ignores empty ids', () => {
    expect(uniqueIdCount(['a', 'b', null, '', 'a', undefined])).toBe(2);
  });
});
