import { describe, expect, it } from 'vitest';

import { classifyContactReveal } from '../src/modules/outreach/campaign-reveal-status.js';

const launched = new Date('2026-09-26T05:00:00.000Z');

describe('classifyContactReveal', () => {
  it('marks a contact unlocked before this campaign as already revealed', () => {
    expect(
      classifyContactReveal({
        hasValue: true,
        earliestRevealedAt: new Date('2026-09-01T00:00:00.000Z'),
        launchedAt: launched,
        missingContact: false,
        queueActive: true,
        isCurrent: false,
      })
    ).toBe('already_revealed');
  });

  it('marks a contact first unlocked during this campaign as succeeded', () => {
    expect(
      classifyContactReveal({
        hasValue: true,
        earliestRevealedAt: new Date('2026-09-26T05:01:00.000Z'),
        launchedAt: launched,
        missingContact: false,
        queueActive: false,
        isCurrent: false,
      })
    ).toBe('succeeded');
  });

  it('marks an on-file contact with no reveal ledger as already revealed', () => {
    expect(
      classifyContactReveal({
        hasValue: true,
        earliestRevealedAt: null,
        launchedAt: launched,
        missingContact: false,
        queueActive: false,
        isCurrent: false,
      })
    ).toBe('already_revealed');
  });

  it('marks the running queue candidate as in process', () => {
    expect(
      classifyContactReveal({
        hasValue: false,
        earliestRevealedAt: null,
        launchedAt: launched,
        missingContact: false,
        queueActive: true,
        isCurrent: true,
      })
    ).toBe('in_process');
  });

  it('marks other missing contacts as queued after launch', () => {
    expect(
      classifyContactReveal({
        hasValue: false,
        earliestRevealedAt: null,
        launchedAt: launched,
        missingContact: false,
        queueActive: true,
        isCurrent: false,
      })
    ).toBe('queued');
  });

  it('marks a finished empty reveal as not found', () => {
    expect(
      classifyContactReveal({
        hasValue: false,
        earliestRevealedAt: null,
        launchedAt: launched,
        missingContact: true,
        queueActive: false,
        isCurrent: false,
      })
    ).toBe('not_found');
  });

  it('marks a contact that has not been launched yet as waiting', () => {
    expect(
      classifyContactReveal({
        hasValue: false,
        earliestRevealedAt: null,
        launchedAt: null,
        missingContact: false,
        queueActive: false,
        isCurrent: false,
      })
    ).toBe('waiting');
  });
});
