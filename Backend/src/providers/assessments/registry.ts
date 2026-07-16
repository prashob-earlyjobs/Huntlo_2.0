import { externalAssessmentProvider } from './external.provider.js';
import { mockAssessmentProvider } from './mock.provider.js';
import type { AssessmentProvider } from './types.js';

export type AssessmentProviderId = 'mock' | 'external';

let override: AssessmentProvider | null = null;

export function getAssessmentProvider(): AssessmentProvider {
  if (override) return override;
  const id = String(process.env.ASSESSMENT_PROVIDER || 'mock')
    .trim()
    .toLowerCase() as AssessmentProviderId;
  if (id === 'external') return externalAssessmentProvider;
  return mockAssessmentProvider;
}

/** Test/dev helper to force a provider instance. */
export function setAssessmentProviderOverride(provider: AssessmentProvider | null): void {
  override = provider;
}

export type { AssessmentProvider };
