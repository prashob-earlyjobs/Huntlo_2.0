export const CANDIDATE_SEARCH_VENDORS = ['future-jobs', 'brightdata'] as const;
export type CandidateSearchVendor = (typeof CANDIDATE_SEARCH_VENDORS)[number];

export const DEFAULT_CANDIDATE_SEARCH_VENDOR: CandidateSearchVendor = 'future-jobs';

export function isCandidateSearchVendor(value: unknown): value is CandidateSearchVendor {
  return value === 'future-jobs' || value === 'brightdata';
}

export function normalizeCandidateSearchVendor(value: unknown): CandidateSearchVendor {
  return isCandidateSearchVendor(value) ? value : DEFAULT_CANDIDATE_SEARCH_VENDOR;
}
