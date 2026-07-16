/**
 * Compatibility reader for legacy EJHunterLanding OutreachModuleCampaign documents.
 * Only reads when the collection exists in the same MongoDB — does not mutate or invent fields.
 */

import mongoose from 'mongoose';

export type LegacyCampaignSummary = {
  legacyId: string;
  name: string;
  status: string;
  sourceModule: string | null;
  candidateCount: number;
  updatedAt: string | null;
};

export async function listLegacyOutreachModuleCampaigns(
  userId: string,
  limit = 50
): Promise<LegacyCampaignSummary[]> {
  if (!mongoose.connection.db) return [];
  const collections = await mongoose.connection.db.listCollections({ name: 'outreachmodulecampaigns' }).toArray();
  if (!collections.length) return [];

  const col = mongoose.connection.db.collection('outreachmodulecampaigns');
  const docs = await col
    .find({ userId: new mongoose.Types.ObjectId(userId) })
    .project({
      name: 1,
      status: 1,
      sourceModule: 1,
      candidates: 1,
      updatedAt: 1,
    })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();

  return docs.map((doc) => ({
    legacyId: String(doc._id),
    name: String(doc.name || 'Untitled'),
    status: String(doc.status || 'unknown'),
    sourceModule: doc.sourceModule ? String(doc.sourceModule) : null,
    candidateCount: Array.isArray(doc.candidates) ? doc.candidates.length : 0,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt as Date).toISOString() : null,
  }));
}
