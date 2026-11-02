import { describe, expect, it } from 'vitest';

import { resolveOauthMailboxEmail } from '../src/modules/outreach/campaign-delivery.js';

describe('resolveOauthMailboxEmail', () => {
  it('returns the connected mailbox when sender matches or is omitted', () => {
    expect(
      resolveOauthMailboxEmail({ email: 'recruiter@huntlo.online' }, 'recruiter@huntlo.online')
    ).toBe('recruiter@huntlo.online');
    expect(resolveOauthMailboxEmail({ email: 'recruiter@huntlo.online' }, null)).toBe(
      'recruiter@huntlo.online'
    );
    expect(
      resolveOauthMailboxEmail({ email: 'Recruiter@Huntlo.Online' }, 'recruiter@huntlo.online')
    ).toBe('Recruiter@Huntlo.Online');
  });

  it('refuses to send when the connected mailbox has no address', () => {
    expect(() => resolveOauthMailboxEmail({ email: '' }, 'someone@example.com')).toThrow(
      /no address/i
    );
  });

  it('refuses to send when campaign sender does not match the mailbox', () => {
    expect(() =>
      resolveOauthMailboxEmail(
        { email: 'outlook@huntlo.online' },
        'gmail@other.example'
      )
    ).toThrow(/does not match/i);
  });
});
