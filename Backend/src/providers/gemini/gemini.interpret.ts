import { getEnv } from '../../config/env.js';
import type { InterpretedCriterion } from '../../modules/sourcing/sourcing.validation.js';

/**
 * Optional Gemini enhancement for interpreted criteria.
 * No-ops when GEMINI_API_KEY is unset — Future Jobs annotation remains the primary path.
 */
export async function enhanceInterpretedCriteria(
  query: string,
  criteria: InterpretedCriterion[]
): Promise<InterpretedCriterion[]> {
  const apiKey = getEnv().GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return criteria;
  }

  // Stub: wire Gemini when product wants secondary enrichment.
  // Keep FJ annotation as source of truth; do not invent criteria here.
  void query;
  return criteria;
}
