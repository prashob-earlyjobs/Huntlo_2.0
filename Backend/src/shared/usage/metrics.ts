/** Canonical usage metrics for Huntlo workspace quotas. */
export const USAGE_METRICS = [
  'candidate_search',
  'email_reveal',
  'mobile_reveal',
  'people_scout',
  'email_outreach',
  'whatsapp_outreach',
  'ai_voice_minutes',
  'assessment_invites',
  'team_seats',
] as const;

export type UsageMetric = (typeof USAGE_METRICS)[number];

export const USAGE_LEDGER_ACTIONS = [
  'reserve',
  'commit',
  'release',
  'increment',
  'refund',
] as const;
export type UsageLedgerAction = (typeof USAGE_LEDGER_ACTIONS)[number];

export const USAGE_LEDGER_STATUSES = [
  'pending',
  'committed',
  'released',
  'refunded',
  'failed',
] as const;
export type UsageLedgerStatus = (typeof USAGE_LEDGER_STATUSES)[number];

export const USAGE_RESERVATION_STATUSES = [
  'reserved',
  'committed',
  'released',
  'expired',
  'refunded',
] as const;
export type UsageReservationStatus = (typeof USAGE_RESERVATION_STATUSES)[number];

/** Default credit cost charged per action for each metric. */
export const METRIC_DEFAULT_COST: Record<UsageMetric, number> = {
  candidate_search: 1,
  email_reveal: 2,
  mobile_reveal: 5,
  people_scout: 1,
  email_outreach: 1,
  whatsapp_outreach: 2,
  ai_voice_minutes: 1,
  assessment_invites: 1,
  team_seats: 1,
};

export const METRIC_LABELS: Record<UsageMetric, string> = {
  candidate_search: 'Candidate searches',
  email_reveal: 'Email reveals',
  mobile_reveal: 'Mobile reveals',
  people_scout: 'People Scout lookups',
  email_outreach: 'Email outreach',
  whatsapp_outreach: 'WhatsApp outreach',
  ai_voice_minutes: 'AI voice minutes',
  assessment_invites: 'Assessment invites',
  team_seats: 'Team seats',
};

export function isUsageMetric(value: string): value is UsageMetric {
  return (USAGE_METRICS as readonly string[]).includes(value);
}

export function currentPeriodKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/** First day of next UTC month — used as resetAt for monthly counters. */
export function periodResetAt(periodKey: string): Date {
  const [yearRaw, monthRaw] = periodKey.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}
