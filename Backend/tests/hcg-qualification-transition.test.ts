import { describe, expect, it } from 'vitest';

import {
  hcgStatusToQualificationEvent,
  hcgStatusToScreeningEvent,
} from '../src/modules/huntlo-360/hcg-qualification-transition.js';

describe('hcgStatusToQualificationEvent', () => {
  it('maps pass statuses to qualification_pass', () => {
    expect(hcgStatusToQualificationEvent('qualified')).toBe('qualification_pass');
    expect(hcgStatusToQualificationEvent('Qualified')).toBe('qualification_pass');
    expect(hcgStatusToQualificationEvent('shortlisted')).toBe('qualification_pass');
  });

  it('maps fail statuses to qualification_fail', () => {
    expect(hcgStatusToQualificationEvent('not_qualified')).toBe('qualification_fail');
    expect(hcgStatusToQualificationEvent('rejected')).toBe('qualification_fail');
  });

  it('ignores in-progress statuses', () => {
    expect(hcgStatusToQualificationEvent('awaiting_reply')).toBeNull();
    expect(hcgStatusToQualificationEvent('interested')).toBeNull();
    expect(hcgStatusToQualificationEvent('in_qualification')).toBeNull();
    expect(hcgStatusToQualificationEvent('in_screening')).toBeNull();
    expect(hcgStatusToQualificationEvent('')).toBeNull();
  });
});

describe('hcgStatusToScreeningEvent', () => {
  it('maps pass statuses to screening_pass', () => {
    expect(hcgStatusToScreeningEvent('qualified')).toBe('screening_pass');
    expect(hcgStatusToScreeningEvent('shortlisted')).toBe('screening_pass');
  });

  it('maps fail statuses to screening_fail', () => {
    expect(hcgStatusToScreeningEvent('not_qualified')).toBe('screening_fail');
    expect(hcgStatusToScreeningEvent('rejected')).toBe('screening_fail');
  });

  it('ignores in-progress statuses', () => {
    expect(hcgStatusToScreeningEvent('in_screening')).toBeNull();
    expect(hcgStatusToScreeningEvent('in_qualification')).toBeNull();
  });
});
