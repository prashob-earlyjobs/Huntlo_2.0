import type { IntegrationProviderId } from '../user-integration.model.js';

export type ProviderTokenBundle = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  email?: string | null;
  displayName?: string | null;
  phone?: string | null;
  providerAccountId?: string | null;
  scopes?: string[];
  config?: Record<string, unknown>;
  credentials?: Record<string, unknown> | null;
};

export type ProviderConnectResult = {
  mode: 'oauth_redirect' | 'connected' | 'credentials_required';
  authorizeUrl?: string;
  state?: string;
  integrationId?: string;
  message?: string;
  /** Present when mode === 'connected' — persisted encrypted by the service. */
  tokens?: ProviderTokenBundle;
};

export type ProviderTestResult = {
  ok: boolean;
  message: string;
  details?: Record<string, unknown>;
};

export type ProviderContext = {
  organizationId: string;
  userId: string;
  integrationId?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  credentials?: Record<string, unknown> | null;
  config?: Record<string, unknown>;
  email?: string | null;
  displayName?: string | null;
};

export type EmailSendInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

export type EmailProvider = {
  readonly id: IntegrationProviderId;
  connect(ctx: ProviderContext, body: Record<string, unknown>): Promise<ProviderConnectResult>;
  refresh?(ctx: ProviderContext): Promise<{ accessToken: string; expiresAt?: Date | null }>;
  test(ctx: ProviderContext): Promise<ProviderTestResult>;
  send?(ctx: ProviderContext, input: EmailSendInput): Promise<{ messageId?: string }>;
  fetchReplies?(ctx: ProviderContext, options?: { since?: Date }): Promise<unknown[]>;
  disconnect?(ctx: ProviderContext): Promise<void>;
  buildAuthorizeUrl?(input: {
    state: string;
    codeChallenge?: string;
    redirectUri: string;
  }): string | null;
  exchangeCode?(input: {
    code: string;
    redirectUri: string;
    codeVerifier?: string;
    extras?: Record<string, unknown>;
  }): Promise<{
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: Date | null;
    email?: string | null;
    displayName?: string | null;
    providerAccountId?: string | null;
    scopes?: string[];
    config?: Record<string, unknown>;
  }>;
};

export type WhatsAppProvider = {
  readonly id: IntegrationProviderId;
  connect?(ctx: ProviderContext, body: Record<string, unknown>): Promise<ProviderConnectResult>;
  test(ctx: ProviderContext): Promise<ProviderTestResult>;
  sendTemplate?(
    ctx: ProviderContext,
    input: { to: string; templateName: string; language?: string; components?: unknown[] }
  ): Promise<{ messageId?: string }>;
  sendMessage?(
    ctx: ProviderContext,
    input: { to: string; text: string }
  ): Promise<{ messageId?: string }>;
  parseWebhook?(payload: unknown, headers?: Record<string, string>): Promise<unknown>;
  verifyWebhook?(query: Record<string, string>): { challenge?: string; ok: boolean };
  disconnect?(ctx: ProviderContext): Promise<void>;
};

export type VoiceProvider = {
  readonly id: IntegrationProviderId;
  connect?(ctx: ProviderContext, body: Record<string, unknown>): Promise<ProviderConnectResult>;
  test(ctx: ProviderContext): Promise<ProviderTestResult>;
  createAgent?(ctx: ProviderContext, payload: Record<string, unknown>): Promise<unknown>;
  updateAgent?(
    ctx: ProviderContext,
    agentId: string,
    payload: Record<string, unknown>
  ): Promise<unknown>;
  launchCalls?(ctx: ProviderContext, payload: Record<string, unknown>): Promise<unknown>;
  getCall?(ctx: ProviderContext, callId: string): Promise<unknown>;
  parseWebhook?(payload: unknown): Promise<unknown>;
  disconnect?(ctx: ProviderContext): Promise<void>;
};

export type SchedulingProvider = {
  readonly id: IntegrationProviderId;
  connect?(ctx: ProviderContext, body: Record<string, unknown>): Promise<ProviderConnectResult>;
  test(ctx: ProviderContext): Promise<ProviderTestResult>;
  listEventTypes?(ctx: ProviderContext): Promise<unknown[]>;
  createLink?(ctx: ProviderContext, input: Record<string, unknown>): Promise<unknown>;
  syncBookings?(ctx: ProviderContext): Promise<unknown[]>;
  parseWebhook?(payload: unknown): Promise<unknown>;
  disconnect?(ctx: ProviderContext): Promise<void>;
};

export type CandidateDataProvider = {
  readonly id: IntegrationProviderId;
  connect?(ctx: ProviderContext, body: Record<string, unknown>): Promise<ProviderConnectResult>;
  test(ctx: ProviderContext): Promise<ProviderTestResult>;
  disconnect?(ctx: ProviderContext): Promise<void>;
};

export type AnyIntegrationProvider =
  | EmailProvider
  | WhatsAppProvider
  | VoiceProvider
  | SchedulingProvider
  | CandidateDataProvider;
