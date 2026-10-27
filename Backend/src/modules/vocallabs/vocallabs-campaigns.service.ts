import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { VocallabsCampaignModel } from './vocallabs-campaign.model.js';

export type StoredVocallabsCampaign = {
  id: string;
  campaignId: string;
  name: string;
  agentId: string;
  contactGroupId: string;
  contactGroupName: string;
  active: boolean;
  createdAt: string | null;
};

function hexId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toHexString' in value) {
    const hex = (value as { toHexString?: () => string }).toHexString;
    if (typeof hex === 'function') return hex.call(value);
  }
  return String(value ?? '');
}

export async function saveVocallabsCampaign(input: {
  organizationId: string;
  userId: string;
  campaignId: string;
  name: string;
  agentId: string;
}): Promise<StoredVocallabsCampaign> {
  const organizationId = input.organizationId.trim();
  const userId = input.userId.trim();
  const campaignId = input.campaignId.trim();
  const name = input.name.trim();
  const agentId = input.agentId.trim();
  if (!organizationId) throw AppError.validation('Organization is required');
  if (!mongoose.isValidObjectId(userId)) throw AppError.validation('User id is required');
  if (!campaignId) throw AppError.validation('Campaign id is required');
  if (!name) throw AppError.validation('Campaign name is required');
  if (!agentId) throw AppError.validation('Agent id is required');

  const doc = await VocallabsCampaignModel.findOneAndUpdate(
    { campaignId },
    {
      $setOnInsert: {
        organizationId,
        userId,
        campaignId,
        name,
        agentId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  return {
    id: hexId(doc?._id),
    campaignId: doc?.campaignId || campaignId,
    name: doc?.name || name,
    agentId: doc?.agentId || agentId,
    contactGroupId: doc?.contactGroupId || '',
    contactGroupName: doc?.contactGroupName || '',
    active: doc?.active === true,
    createdAt: doc?.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

export async function getStoredVocallabsCampaign(
  organizationId: string,
  campaignId: string
): Promise<StoredVocallabsCampaign | null> {
  const orgId = organizationId.trim();
  const id = campaignId.trim();
  if (!orgId || !id) return null;
  const doc = await VocallabsCampaignModel.findOne({ organizationId: orgId, campaignId: id }).lean();
  if (!doc) return null;
  return {
    id: hexId(doc._id),
    campaignId: doc.campaignId,
    name: doc.name,
    agentId: doc.agentId,
    contactGroupId: doc.contactGroupId || '',
    contactGroupName: doc.contactGroupName || '',
    active: doc.active === true,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

export async function markCampaignActive(organizationId: string, campaignId: string): Promise<void> {
  await VocallabsCampaignModel.updateOne(
    { organizationId: organizationId.trim(), campaignId: campaignId.trim() },
    { $set: { active: true } }
  );
}

export async function saveCampaignContactGroup(input: {
  organizationId: string;
  campaignId: string;
  groupId: string;
  groupName: string;
}): Promise<void> {
  await VocallabsCampaignModel.updateOne(
    { organizationId: input.organizationId.trim(), campaignId: input.campaignId.trim() },
    { $set: { contactGroupId: input.groupId.trim(), contactGroupName: input.groupName.trim() } }
  );
}

export async function listStoredVocallabsCampaigns(
  organizationId: string
): Promise<StoredVocallabsCampaign[]> {
  const id = organizationId.trim();
  if (!id) return [];
  const docs = await VocallabsCampaignModel.find({ organizationId: id })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) => ({
    id: hexId(doc._id),
    campaignId: doc.campaignId,
    name: doc.name,
    agentId: doc.agentId,
    contactGroupId: doc.contactGroupId || '',
    contactGroupName: doc.contactGroupName || '',
    active: doc.active === true,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  }));
}
