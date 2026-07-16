import type { IntegrationProviderId } from '../user-integration.model.js';
import type { AnyIntegrationProvider } from './types.js';
import { gmailProvider } from './gmail.provider.js';
import { outlookProvider } from './outlook.provider.js';
import { zohoMailProvider } from './zoho-mail.provider.js';
import { smtpProvider } from './smtp.provider.js';
import { metaWhatsAppProvider } from './meta-whatsapp.provider.js';
import { gupshupProvider } from './gupshup.provider.js';
import { huntloWhatsAppProvider } from './huntlo-whatsapp.provider.js';
import { hunarProvider } from './hunar.provider.js';
import { calendlyProvider } from './calendly.provider.js';
import { futureJobsProvider } from './future-jobs.provider.js';

const PROVIDERS: Record<IntegrationProviderId, AnyIntegrationProvider> = {
  gmail: gmailProvider,
  outlook: outlookProvider,
  'zoho-mail': zohoMailProvider,
  smtp: smtpProvider,
  'meta-whatsapp': metaWhatsAppProvider,
  gupshup: gupshupProvider,
  'huntlo-whatsapp': huntloWhatsAppProvider,
  hunar: hunarProvider,
  calendly: calendlyProvider,
  'future-jobs': futureJobsProvider,
};

export function getProviderAdapter(provider: IntegrationProviderId): AnyIntegrationProvider {
  return PROVIDERS[provider];
}

export function listProviderAdapters(): AnyIntegrationProvider[] {
  return Object.values(PROVIDERS);
}

export type ProviderCatalogItem = {
  id: IntegrationProviderId;
  name: string;
  category: string;
  description: string;
  authModes: Array<'oauth' | 'credentials' | 'platform'>;
  configured: boolean;
};

export const PROVIDER_CATALOG: ProviderCatalogItem[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'email',
    description: 'Send outreach from Google Workspace and sync replies.',
    authModes: ['oauth'],
    configured: false,
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    category: 'email',
    description: 'Connect Microsoft 365 mailboxes for outreach.',
    authModes: ['oauth'],
    configured: false,
  },
  {
    id: 'zoho-mail',
    name: 'Zoho Mail',
    category: 'email',
    description: 'Use Zoho Mail via OAuth or SMTP app password.',
    authModes: ['oauth', 'credentials'],
    configured: false,
  },
  {
    id: 'smtp',
    name: 'Custom SMTP/IMAP',
    category: 'email',
    description: 'Connect any mail server with SMTP credentials.',
    authModes: ['credentials'],
    configured: true,
  },
  {
    id: 'meta-whatsapp',
    name: 'Meta WhatsApp Cloud API',
    category: 'whatsapp',
    description: 'Official WhatsApp Business Platform credentials.',
    authModes: ['credentials'],
    configured: false,
  },
  {
    id: 'gupshup',
    name: 'Gupshup',
    category: 'whatsapp',
    description: 'Huntlo-managed Gupshup WhatsApp gateway.',
    authModes: ['platform'],
    configured: false,
  },
  {
    id: 'huntlo-whatsapp',
    name: 'Huntlo WhatsApp',
    category: 'whatsapp',
    description: 'Platform-managed Meta WhatsApp number.',
    authModes: ['platform'],
    configured: false,
  },
  {
    id: 'hunar',
    name: 'Hunar AI Voice',
    category: 'voice',
    description: 'AI voice screening and outreach calls.',
    authModes: ['platform'],
    configured: false,
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'scheduling',
    description: 'Share booking links after qualification.',
    authModes: ['credentials'],
    configured: true,
  },
  {
    id: 'future-jobs',
    name: 'Future Jobs',
    category: 'candidate_data',
    description: 'Candidate sourcing and contact enrichment.',
    authModes: ['platform'],
    configured: false,
  },
];
