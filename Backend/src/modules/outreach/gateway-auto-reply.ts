/** When the communication gateway should own conversational Q&A (`?autoReply=true`). */

type CampaignReplyFlags = {
  schedulingConfig?: { enabled?: boolean | null } | null;
  qualificationConfig?: {
    autoScreening?: boolean | null;
    autoWhatsAppAfterQualification?: boolean | null;
  } | null;
};

export type GatewayOutreachPromptKind = 'calendly' | 'auto_screening' | 'close';

export function campaignHasAutoCalendly(campaign: CampaignReplyFlags): boolean {
  return Boolean(campaign.schedulingConfig?.enabled);
}

export function campaignHasAutoScreening(campaign: CampaignReplyFlags): boolean {
  return Boolean(campaign.qualificationConfig?.autoScreening);
}

export function campaignHasAutoWhatsAppAfterQualification(
  campaign: CampaignReplyFlags
): boolean {
  return Boolean(campaign.qualificationConfig?.autoWhatsAppAfterQualification);
}

/**
 * Opening Gmail/Zoho/WhatsApp gateway send should include a prompt and autoReply
 * so the gateway keeps asking qualification questions. Auto-screening is included:
 * chat must stay conversational, then Huntlo starts the screening call on qualify.
 *
 * Auto-send WhatsApp after a voice qualify is excluded — that first sequence
 * message is not the qualification thread.
 */
export function campaignUsesGatewayConversationalReply(
  campaign: CampaignReplyFlags
): boolean {
  return (
    campaignHasAutoCalendly(campaign) ||
    campaignHasAutoScreening(campaign) ||
    (!campaignHasAutoCalendly(campaign) &&
      !campaignHasAutoScreening(campaign) &&
      !campaignHasAutoWhatsAppAfterQualification(campaign))
  );
}

export function resolveGatewayOutreachPromptKind(
  campaign: CampaignReplyFlags
): GatewayOutreachPromptKind {
  if (campaignHasAutoCalendly(campaign)) return 'calendly';
  if (campaignHasAutoScreening(campaign)) return 'auto_screening';
  return 'close';
}

export function shouldAutoStartOutreachScreeningFromHcg(input: {
  sourceModule?: string | null;
  autoScreening?: boolean | null;
  autoCalendly?: boolean | null;
  overallAiStatus: string;
}): boolean {
  if (input.sourceModule === 'huntlo360') return false;
  if (input.autoCalendly) return false;
  if (!input.autoScreening) return false;
  const status = String(input.overallAiStatus || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  return status === 'qualified' || status === 'shortlisted';
}

export function isGatewayWhatsAppProvider(provider: string | undefined): boolean {
  return provider === 'huntlo-whatsapp' || provider === 'meta-whatsapp';
}
