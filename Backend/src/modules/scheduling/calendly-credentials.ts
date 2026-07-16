import { decryptSecret } from '../integrations/credentials.js';
import { UserIntegrationModel } from '../integrations/user-integration.model.js';

export type CalendlyCredentials = {
  personalAccessToken: string;
  userUri: string | null;
  schedulingUrl: string | null;
  userId: string;
  integrationId: string;
};

/** Resolve org Calendly PAT (stored as refreshToken per calendly.provider). */
export async function getOrgCalendlyCredentials(
  organizationId: string,
  preferredUserId?: string | null
): Promise<CalendlyCredentials | null> {
  const base = {
    organizationId,
    provider: 'calendly' as const,
    status: { $in: ['connected', 'needs_attention', 'testing'] },
  };

  let doc = preferredUserId
    ? await UserIntegrationModel.findOne({ ...base, userId: preferredUserId }).sort({
        isDefault: -1,
        updatedAt: -1,
      })
    : null;

  if (!doc) {
    doc = await UserIntegrationModel.findOne(base).sort({ isDefault: -1, updatedAt: -1 });
  }
  if (!doc?.encryptedRefreshToken) return null;

  const pat = decryptSecret(doc.encryptedRefreshToken);
  if (!pat) return null;

  return {
    personalAccessToken: pat,
    userUri:
      typeof doc.config?.userUri === 'string' ? doc.config.userUri : doc.providerAccountId,
    schedulingUrl:
      typeof doc.config?.schedulingUrl === 'string'
        ? doc.config.schedulingUrl
        : decryptSecret(doc.encryptedAccessToken),
    userId: String(doc.userId),
    integrationId: String(doc._id),
  };
}
