import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { SourcedCandidateModel } from '../sourcing/sourced-candidate.model.js';

function firstFilled(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const text = String(value || '').trim();
    if (text) return text;
  }
  return null;
}

async function lookupSourcedProfile(
  organizationId: string,
  candidate: { externalCandidateId?: string | null }
) {
  const external = String(candidate.externalCandidateId || '').trim();
  if (!external) return null;

  return SourcedCandidateModel.findOne({
    organizationId,
    $or: [{ externalCandidateId: external }, { candidateId: external }],
  })
    .select('currentCompany currentEmployment currentRole location')
    .sort({ updatedAt: -1 })
    .lean();
}

/**
 * Prefer the pool record; if company / role / location are empty, copy them from
 * the sourced Future Jobs profile and persist so later sends stay filled.
 */
export async function hydrateCandidateMergeFields<
  T extends {
    _id?: unknown;
    currentCompany?: string | null;
    currentTitle?: string | null;
    location?: string | null;
    externalCandidateId?: string | null;
  },
>(organizationId: string, candidate: T | null): Promise<T | null> {
  if (!candidate) return null;

  const existingCompany = firstFilled(candidate.currentCompany);
  const existingTitle = firstFilled(candidate.currentTitle);
  const existingLocation = firstFilled(candidate.location);
  if (existingCompany && existingTitle && existingLocation) {
    return {
      ...candidate,
      currentCompany: existingCompany,
      currentTitle: existingTitle,
      location: existingLocation,
    };
  }

  const sourced = await lookupSourcedProfile(organizationId, candidate);
  const currentCompany =
    existingCompany ||
    firstFilled(sourced?.currentCompany, sourced?.currentEmployment?.company);
  const currentTitle =
    existingTitle || firstFilled(sourced?.currentRole, sourced?.currentEmployment?.title);
  const location = existingLocation || firstFilled(sourced?.location);

  const patch: Record<string, string> = {};
  if (!existingCompany && currentCompany) patch.currentCompany = currentCompany;
  if (!existingTitle && currentTitle) patch.currentTitle = currentTitle;
  if (!existingLocation && location) patch.location = location;

  if (candidate._id && Object.keys(patch).length > 0) {
    await SavedCandidateModel.updateOne(
      { _id: candidate._id, organizationId },
      { $set: patch }
    ).catch(() => undefined);
  }

  return {
    ...candidate,
    currentCompany: currentCompany || candidate.currentCompany,
    currentTitle: currentTitle || candidate.currentTitle,
    location: location || candidate.location,
  };
}
