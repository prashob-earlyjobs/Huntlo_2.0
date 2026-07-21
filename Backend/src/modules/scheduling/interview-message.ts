/**
 * Shared placeholder rendering for interview invites and reminders.
 */

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
  return source
    .replace(/\{\{\s*first_name\s*\}\}/gi, values.firstName)
    .replace(/\{\{\s*job_title\s*\}\}/gi, values.jobTitle)
    .replace(/\{\{\s*scheduling_details\s*\}\}/gi, values.schedulingDetails);
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
