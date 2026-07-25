/**
 * Shared placeholder rendering for interview invites and reminders.
 */

/** Plain-text email/WhatsApp: strip markdown emphasis so **bold** does not leak. */
export function stripMarkdownEmphasis(text: string): string {
  return String(text || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1');
}

export function renderInterviewMessage(
  template: string | null | undefined,
  values: {
    firstName: string;
    jobTitle: string;
    schedulingDetails: string;
  }
): string {
  const source =
    template ||
    'Hi {{first_name}}, we would like to schedule your next interview for {{job_title}}. {{scheduling_details}}';
  const rendered = source
    .replace(/\{\{\s*first_name\s*\}\}/gi, values.firstName)
    .replace(/\{\{\s*job_title\s*\}\}/gi, values.jobTitle)
    .replace(/\{\{\s*scheduling_details\s*\}\}/gi, values.schedulingDetails);
  return stripMarkdownEmphasis(rendered);
}

export function defaultInterviewReminderMessage(hours?: number | null): string {
  if (hours == null) {
    return 'Hi {{first_name}}, reminder that your interview for {{job_title}} is coming up. {{scheduling_details}}';
  }
  const when =
    hours === 1
      ? 'in about 1 hour'
      : hours < 24
        ? `in about ${hours} hours`
        : hours === 24
          ? 'in 24 hours'
          : `in ${hours} hours`;
  return `Hi {{first_name}}, reminder that your interview for {{job_title}} is ${when}. {{scheduling_details}}`;
}
