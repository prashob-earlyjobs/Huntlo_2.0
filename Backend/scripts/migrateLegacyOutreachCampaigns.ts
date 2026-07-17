/**
 * Dry-run / apply migration from legacy outreachmodulecampaigns into OutreachCampaign.
 *
 * Usage:
 *   npx tsx scripts/migrateLegacyOutreachCampaigns.ts --dry-run
 *   npx tsx scripts/migrateLegacyOutreachCampaigns.ts --apply
 *
 * Does NOT automatically merge separate legacy email + WhatsApp campaigns.
 */

import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { OutreachCampaignModel } from '../src/modules/outreach/campaign.model.js';

type LegacyDoc = {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | string;
  userId?: mongoose.Types.ObjectId | string;
  ownerUserId?: mongoose.Types.ObjectId | string;
  name?: string;
  status?: string;
  channel?: string;
  touchpoints?: unknown[];
  sequence?: unknown[];
  contacts?: unknown[];
};

function parseArgs(argv: string[]) {
  return {
    dryRun: !argv.includes('--apply'),
    limit: Number(argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 200),
  };
}

function mapStatus(raw?: string): string {
  const value = String(raw || 'draft').toLowerCase();
  if (value === 'active' || value === 'running') return 'completed'; // historical — do not re-activate
  if (['draft', 'scheduled', 'paused', 'completed', 'cancelled', 'failed'].includes(value)) {
    return value === 'running' ? 'completed' : value;
  }
  return 'completed';
}

function mapChannel(raw?: string): 'single_channel' | 'multi_channel' {
  return 'single_channel';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await connectDatabase();

  const db = mongoose.connection.db;
  if (!db) throw new Error('Mongo connection unavailable');

  const collections = await db.listCollections({ name: 'outreachmodulecampaigns' }).toArray();
  if (!collections.length) {
    console.log('No outreachmodulecampaigns collection found — nothing to migrate.');
    await disconnectDatabase();
    return;
  }

  const legacy = db.collection('outreachmodulecampaigns');
  const docs = (await legacy.find({}).limit(args.limit).toArray()) as LegacyDoc[];

  const report = {
    scanned: docs.length,
    migratable: 0,
    skippedExisting: 0,
    skippedInvalid: 0,
    wouldCreate: 0,
    created: 0,
    errors: [] as string[],
  };

  for (const doc of docs) {
    const orgId = doc.organizationId ? String(doc.organizationId) : '';
    const ownerId = String(doc.ownerUserId || doc.userId || '');
    if (!orgId || !ownerId || !mongoose.Types.ObjectId.isValid(orgId) || !mongoose.Types.ObjectId.isValid(ownerId)) {
      report.skippedInvalid += 1;
      continue;
    }

    const existing = await OutreachCampaignModel.findOne({
      'lastValidation.issues.code': 'LEGACY_MIGRATION',
      name: doc.name || `Legacy campaign ${String(doc._id)}`,
      organizationId: orgId,
    }).lean();

    // Prefer migration metadata marker on name+org; also check by embedded legacy id.
    const already = await OutreachCampaignModel.findOne({
      organizationId: orgId,
      'builderMeta.mode': 'legacy-import',
      description: { $regex: String(doc._id) },
    }).lean();

    if (existing || already) {
      report.skippedExisting += 1;
      continue;
    }

    report.migratable += 1;
    report.wouldCreate += 1;

    if (args.dryRun) continue;

    try {
      await OutreachCampaignModel.create({
        organizationId: orgId,
        ownerUserId: ownerId,
        name: (doc.name || `Legacy campaign ${String(doc._id)}`).slice(0, 200),
        description: `Migrated from legacy outreachmodulecampaigns:${String(doc._id)}`,
        sourceModule: 'outreach',
        campaignType: mapChannel(doc.channel),
        status: mapStatus(doc.status),
        sequenceSteps: [],
        builderState: {
          legacy: {
            originalId: String(doc._id),
            touchpoints: doc.touchpoints || [],
            sequence: doc.sequence || [],
            contacts: doc.contacts || [],
          },
        },
        builderMeta: {
          lastSavedStep: 'review',
          mode: 'legacy-import',
          singleChannel: doc.channel || null,
        },
        lastValidation: {
          ok: true,
          checkedAt: new Date(),
          issues: [
            {
              id: 'legacy-migration',
              severity: 'warning',
              code: 'LEGACY_MIGRATION',
              message: `Imported from legacy campaign ${String(doc._id)}. Historical interactions are preserved in the legacy collection.`,
            },
          ],
        },
        version: 1,
      });
      report.created += 1;
    } catch (error) {
      report.errors.push(
        `${String(doc._id)}: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  }

  console.log(JSON.stringify({ dryRun: args.dryRun, ...report }, null, 2));
  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await disconnectDatabase();
  } catch {
    // ignore
  }
  process.exit(1);
});
