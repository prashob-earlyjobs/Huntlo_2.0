import { describe, expect, it } from 'vitest';

import { hcgOutlookMessagesToEvents } from '../src/modules/conversations/hcg-outlook-overlay.js';

describe('hcgOutlookMessagesToEvents', () => {
  it('keeps real HTML from the first outreach email', () => {
    const [event] = hcgOutlookMessagesToEvents(
      {
        messages: [
          {
            messageId: 'm1',
            direction: 'outbound',
            from: 'recruiter@huntlo.online',
            subject: 'Node.js Developer',
            html: '<p>Hi Gokul,<br><br>Open to a quick chat?</p>',
            internalDate: '1760000000000',
          },
        ],
      },
      'Gokul'
    );

    expect(event?.html).toContain('<br>');
    expect(event?.html).toContain('Open to a quick chat?');
  });

  it('turns plain-text Outlook replies into paragraphs and lists', () => {
    const [event] = hcgOutlookMessagesToEvents(
      {
        messages: [
          {
            messageId: 'm2',
            direction: 'outbound',
            from: 'recruiter@huntlo.online',
            subject: 'Re: Node.js Developer',
            html: [
              'Subject: Re: Node.js Developer · abc',
              '',
              'Hi Priya,',
              '',
              'Thanks for letting me know you are interested.',
              '',
              '*   What is your notice period?',
              '*   What is your expected compensation?',
              '',
              'Best regards,',
            ].join('\n'),
            body: '',
            internalDate: '1760000001000',
          },
        ],
      },
      'Priya'
    );

    expect(event?.html).toContain('<p>Hi Priya,</p>');
    expect(event?.html).toContain('<p>Thanks for letting me know you are interested.</p>');
    expect(event?.html).toContain('<ul>');
    expect(event?.html).toContain('<li>What is your notice period?</li>');
    expect(event?.html).not.toContain('Subject:');
    expect(event?.text).toContain('What is your notice period?');
    expect(event?.text).not.toMatch(/<li>/);
  });

  it('does not treat an angle-bracket email address as HTML', () => {
    const [event] = hcgOutlookMessagesToEvents(
      {
        messages: [
          {
            messageId: 'm3',
            direction: 'inbound',
            from: 'priya@example.com',
            body: 'Sounds good.\n\nPriya <priya@example.com>',
            internalDate: '1760000002000',
          },
        ],
      },
      'Priya'
    );

    expect(event?.html).toContain('<p>Sounds good.</p>');
    expect(event?.html).toContain('&lt;priya@example.com&gt;');
    expect(event?.text).toContain('priya@example.com');
  });
});
