import { describe, expect, it } from 'vitest';

import {
  defaultInterviewReminderMessage,
  renderInterviewMessage,
} from '../src/modules/scheduling/interview-message.js';

describe('interview message rendering', () => {
  it('replaces invite placeholders', () => {
    const rendered = renderInterviewMessage(
      'Hi {{first_name}}, interview for {{job_title}}. {{scheduling_details}}',
      {
        firstName: 'Priya',
        jobTitle: 'Backend Engineer',
        schedulingDetails: 'Mon 10:00 AM IST · Zoom',
      }
    );
    expect(rendered).toBe(
      'Hi Priya, interview for Backend Engineer. Mon 10:00 AM IST · Zoom'
    );
  });

  it('builds default reminder copy by hours', () => {
    expect(defaultInterviewReminderMessage(24)).toContain('in 24 hours');
    expect(defaultInterviewReminderMessage(2)).toContain('in about 2 hours');
    expect(defaultInterviewReminderMessage(1)).toContain('in about 1 hour');
  });
});
