import { UserModel } from '../../auth/user.model.js';
import {
  assertBrightDataConfigured,
  getBrightDataSearchProvider,
} from '../../../providers/brightdata/index.js';
import { getFutureJobsProvider } from '../../../providers/future-jobs/index.js';
import type { FutureJobsProvider } from '../../../providers/future-jobs/futureJobs.types.js';
import {
  normalizeCandidateSearchVendor,
  type CandidateSearchVendor,
} from '../../../shared/candidate-search-vendors.js';

export async function resolveCandidateSearchVendor(
  userId: string | null | undefined
): Promise<CandidateSearchVendor> {
  if (!userId) return normalizeCandidateSearchVendor(undefined);
  const user = await UserModel.findById(userId).select('candidateSearchVendor');
  return normalizeCandidateSearchVendor(user?.candidateSearchVendor);
}

export function getCandidateSearchProviderByVendor(
  vendor: CandidateSearchVendor
): FutureJobsProvider {
  if (vendor === 'brightdata') {
    assertBrightDataConfigured();
    return getBrightDataSearchProvider();
  }
  return getFutureJobsProvider();
}

export async function getCandidateSearchProviderForUser(
  userId: string
): Promise<FutureJobsProvider> {
  const vendor = await resolveCandidateSearchVendor(userId);
  return getCandidateSearchProviderByVendor(vendor);
}

export function getCandidateSearchProviderForSession(session: {
  searchVendor?: string | null;
  futureJobsSessionId?: string | null;
  externalSessionId?: string | null;
}): FutureJobsProvider {
  const fromField = normalizeCandidateSearchVendor(session.searchVendor);
  // Safety net: Bright Data sessions use `bd_…` ids — never poll them via Future Jobs.
  const externalId = session.futureJobsSessionId || session.externalSessionId || '';
  const vendor =
    fromField === 'brightdata' || String(externalId).startsWith('bd_')
      ? 'brightdata'
      : fromField;
  return getCandidateSearchProviderByVendor(vendor);
}
