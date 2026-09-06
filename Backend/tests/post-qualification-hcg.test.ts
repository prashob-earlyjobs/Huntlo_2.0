import { describe, expect, it } from 'vitest';

import { hcgVoiceStatusShouldStartPostQualWhatsApp } from '../src/modules/outreach/post-qualification-hcg.js';

describe('hcgVoiceStatusShouldStartPostQualWhatsApp', () => {
  it('starts after a qualified or interested voice result', () => {
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('qualified')).toBe(true);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('Qualified')).toBe(true);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('interested')).toBe(true);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('shortlisted')).toBe(true);
  });

  it('does not start for in-progress or rejected calls', () => {
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('in_screening')).toBe(false);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('awaiting_reply')).toBe(false);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('not_qualified')).toBe(false);
    expect(hcgVoiceStatusShouldStartPostQualWhatsApp('not_interested')).toBe(false);
  });
});
