export const HCG_OVERALL_AI_STATUSES = [
  'awaiting_reply',
  'interested',
  'not_interested',
  'in_qualification',
  'qualified',
  'not_qualified',
  'in_screening',
  'shortlisted',
  'rejected',
] as const;
export type HcgOverallAiStatus = (typeof HCG_OVERALL_AI_STATUSES)[number];

export const HCG_QUESTION_STATUSES = ['unanswered', 'passed', 'failed'] as const;
export type HcgQuestionStatus = (typeof HCG_QUESTION_STATUSES)[number];

export const HCG_MESSAGE_DIRECTIONS = ['inbound', 'outbound'] as const;
export type HcgMessageDirection = (typeof HCG_MESSAGE_DIRECTIONS)[number];

export const HCG_COMMUNICATION_TYPES = ['email', 'whatsapp', 'call'] as const;
export type HcgCommunicationType = (typeof HCG_COMMUNICATION_TYPES)[number];

export const HCG_COMMUNICATION_STATUSES = [
  'queued',
  'processing',
  'sent',
  'failed',
] as const;
export type HcgCommunicationStatus = (typeof HCG_COMMUNICATION_STATUSES)[number];

export type HcgScreeningQuestion = {
  id?: string;
  question?: string;
  asked: boolean;
  answer?: string;
  status: HcgQuestionStatus;
  description?: string;
};
