import { UserIntegrationModel } from '../integrations/user-integration.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';

export type CampaignEmailVendor = 'gmail' | 'zoho-mail' | 'outlook' | 'smtp' | null;

/**
 * Resolve which email mailbox vendor a campaign sends from
 * (`channelConfig.email.integrationId` → userintegrations.provider).
 */
export async function resolveCampaignEmailVendor(
  campaignId: string | null | undefined
): Promise<CampaignEmailVendor> {
  const cid = String(campaignId || '').trim();
  if (!cid) return null;

  const campaign = await OutreachCampaignModel.findById(cid)
    .select({ 'channelConfig.email': 1 })
    .lean();
  const integrationId = String(
    (campaign as { channelConfig?: { email?: { integrationId?: string | null } } } | null)
      ?.channelConfig?.email?.integrationId || ''
  ).trim();
  if (!integrationId) return null;

  const row = await UserIntegrationModel.findById(integrationId)
    .select({ provider: 1 })
    .lean();
  const provider = String(row?.provider || '').trim();
  if (
    provider === 'gmail' ||
    provider === 'zoho-mail' ||
    provider === 'outlook' ||
    provider === 'smtp'
  ) {
    return provider;
  }
  return null;
}
