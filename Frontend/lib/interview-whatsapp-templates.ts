/**
 * Constant WhatsApp copy for interview invites / reminders.
 * Bodies mirror Meta-approved templates (numbered params {{1}} {{2}} {{3}}).
 * Mapping: {{1}} first name, {{2}} job title, {{3}} scheduling details.
 */

/** Meta template name for interview invitations. */
export const WHATSAPP_INTERVIEW_INVITE_TEMPLATE_NAME =
  "interview_invitation_tem_5";

export const WHATSAPP_INTERVIEW_INVITE_TEMPLATE = `Hi {{1}},

You are invited to attend the next interview round for the {{2}} role.

Interview Details:
{{3}}

Kindly confirm your availability at your earliest convenience.

Regards,
Hiring Team`;

export const WHATSAPP_INTERVIEW_REMINDER_TEMPLATES = {
  48: `Hi {{1}},

This is a reminder that your interview for the {{2}} role is scheduled in 48 hours.

Interview Details:
{{3}}

Kindly ensure you are available as scheduled. If you require any assistance, please let us know.

Regards,
Hiring Team`,
  24: `Hi {{1}},

This is a reminder that your interview for the {{2}} role is scheduled for tomorrow.

Interview Details:
{{3}}

Please be prepared to join at the scheduled time. We look forward to speaking with you.

Regards,
Hiring Team`,
  2: `Hi {{1}},

This is a reminder that your interview for the {{2}} role will begin in 2 hours.

Interview Details:
{{3}}

Please ensure you are ready to join on time.

Regards,
Hiring Team`,
  1: `Hi {{1}},

Your interview for the {{2}} role is scheduled to begin in 1 hour.

Interview Details:
{{3}}

We look forward to speaking with you. Wishing you all the best.

Regards,
Hiring Team`,
} as const;

export type WhatsAppReminderHours = keyof typeof WHATSAPP_INTERVIEW_REMINDER_TEMPLATES;

/** Meta template names for hour-offset reminders (when approved). */
export const WHATSAPP_INTERVIEW_REMINDER_TEMPLATE_NAMES = {
  1: "interview_invitation_tem_4",
  2: "interview_invitation_tem_3",
  24: "interview_invitation_tem_2",
  48: "interview_invitation_tem_1",
} as const satisfies Partial<Record<WhatsAppReminderHours, string>>;

export function whatsappReminderTemplate(hours: number): string {
  if (hours === 48 || hours === 24 || hours === 2 || hours === 1) {
    return WHATSAPP_INTERVIEW_REMINDER_TEMPLATES[hours];
  }
  return `Hi {{1}},

This is a reminder that your interview for the {{2}} role is scheduled in ${hours} hours.

Interview Details:
{{3}}

Kindly ensure you are available as scheduled.

Regards,
Hiring Team`;
}

export function whatsappReminderTemplateName(
  hours: number
): string | undefined {
  if (hours === 1 || hours === 2 || hours === 24 || hours === 48) {
    return WHATSAPP_INTERVIEW_REMINDER_TEMPLATE_NAMES[hours];
  }
  return undefined;
}
