/**
 * Local catalogue of pre-approved WhatsApp Business message templates.
 * These are static constants only — no Meta/WhatsApp Business API calls happen here.
 * Any real submission/approval workflow with Meta is out of scope for this module.
 */

export const WHATSAPP_TEMPLATE_CATEGORIES = [
  'opening',
  'follow_up',
  'no_reply_fallback',
  'reply_follow_up',
  'scheduling',
] as const;
export type ApprovedWhatsAppTemplateCategory = (typeof WHATSAPP_TEMPLATE_CATEGORIES)[number];

export type ApprovedWhatsAppTemplateVariable = {
  key: string;
  description: string;
  sample: string;
};

export type ApprovedWhatsAppTemplate = {
  id: string;
  name: string;
  category: ApprovedWhatsAppTemplateCategory;
  language: string;
  body: string;
  variables: ApprovedWhatsAppTemplateVariable[];
};

export const APPROVED_WHATSAPP_TEMPLATES: ApprovedWhatsAppTemplate[] = [
  {
    id: 'recruiter_opening_v1',
    name: 'Recruiter opening — role introduction',
    category: 'opening',
    language: 'en',
    body:
      'Hi {{1}}, this is {{2}} from {{3}}. We have an opening for a {{4}} role that matches ' +
      'your background — would you be open to a quick chat?',
    variables: [
      { key: '1', description: 'Candidate first name', sample: 'Alex' },
      { key: '2', description: 'Recruiter name', sample: 'Priya' },
      { key: '3', description: 'Company name', sample: 'Huntlo' },
      { key: '4', description: 'Job title', sample: 'Senior Backend Engineer' },
    ],
  },
  {
    id: 'recruiter_opening_short_v1',
    name: 'Recruiter opening — short intro',
    category: 'opening',
    language: 'en',
    body:
      'Hi {{1}}, {{2}} here from {{3}}. Reaching out about a {{4}} opportunity — interested in ' +
      'learning more?',
    variables: [
      { key: '1', description: 'Candidate first name', sample: 'Alex' },
      { key: '2', description: 'Recruiter name', sample: 'Priya' },
      { key: '3', description: 'Company name', sample: 'Huntlo' },
      { key: '4', description: 'Job title', sample: 'Senior Backend Engineer' },
    ],
  },
  {
    id: 'follow_up_gentle_v1',
    name: 'Gentle follow-up',
    category: 'follow_up',
    language: 'en',
    body:
      'Hi {{1}}, just following up on my earlier message about the {{2}} role at {{3}}. Let me ' +
      'know if you would like to know more!',
    variables: [
      { key: '1', description: 'Candidate first name', sample: 'Alex' },
      { key: '2', description: 'Job title', sample: 'Senior Backend Engineer' },
      { key: '3', description: 'Company name', sample: 'Huntlo' },
    ],
  },
  {
    id: 'no_reply_fallback_v1',
    name: 'No-reply fallback nudge',
    category: 'no_reply_fallback',
    language: 'en',
    body:
      'Hi {{1}}, no worries if you have been busy. If you are open to exploring the {{2}} ' +
      'opportunity at {{3}} down the line, feel free to reach out anytime.',
    variables: [
      { key: '1', description: 'Candidate first name', sample: 'Alex' },
      { key: '2', description: 'Job title', sample: 'Senior Backend Engineer' },
      { key: '3', description: 'Company name', sample: 'Huntlo' },
    ],
  },
  {
    id: 'reply_thank_you_v1',
    name: 'Thanks for replying',
    category: 'reply_follow_up',
    language: 'en',
    body:
      'Thanks for getting back to me, {{candidate_name}}! Could you share a good time for a ' +
      'quick call this week?',
    variables: [{ key: 'candidate_name', description: 'Candidate first name', sample: 'Alex' }],
  },
  {
    id: 'scheduling_link_v1',
    name: 'Scheduling link share',
    category: 'scheduling',
    language: 'en',
    body: 'Hi {{1}}, great! You can pick a time that works best for you here: {{2}}',
    variables: [
      { key: '1', description: 'Candidate first name', sample: 'Alex' },
      { key: '2', description: 'Scheduling link', sample: 'https://calendly.com/huntlo/intro' },
    ],
  },
];

export function listApprovedTemplates(): ApprovedWhatsAppTemplate[] {
  return APPROVED_WHATSAPP_TEMPLATES;
}

export function getApprovedTemplate(id: string): ApprovedWhatsAppTemplate | null {
  return APPROVED_WHATSAPP_TEMPLATES.find((template) => template.id === id) ?? null;
}

export type TemplateVariableValidationResult = {
  valid: boolean;
  missing: string[];
  unknown: string[];
};

export function validateTemplateVariables(
  templateId: string,
  vars: Record<string, string> | null | undefined
): TemplateVariableValidationResult {
  const template = getApprovedTemplate(templateId);
  if (!template) {
    return { valid: false, missing: [], unknown: [] };
  }

  const provided = vars ?? {};
  const requiredKeys = template.variables.map((variable) => variable.key);
  const providedKeys = Object.keys(provided);

  const missing = requiredKeys.filter((key) => !provided[key]);
  const unknown = providedKeys.filter((key) => !requiredKeys.includes(key));

  return { valid: missing.length === 0 && unknown.length === 0, missing, unknown };
}
