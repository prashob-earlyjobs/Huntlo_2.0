/** Rylo (Vocallabs) B2B calling API. */

export const RYLO_API_BASE_URL = 'https://api.rylo.club';
export const RYLO_CREATE_AUTH_TOKEN_URL = `${RYLO_API_BASE_URL}/b2b/createAuthToken/`;
export const RYLO_CREATE_AI_AGENT_URL = `${RYLO_API_BASE_URL}/b2b/v1/createAIAgent?0=`;
export const RYLO_LIST_VOICES_URL = `${RYLO_API_BASE_URL}/b2b/v1/getVoices?0=`;
export const RYLO_LIST_CALL_TOKENS_URL = `${RYLO_API_BASE_URL}/b2b/v1/getCallAPITokens?0=`;
export const RYLO_CREATE_CONTACT_GROUP_URL = `${RYLO_API_BASE_URL}/b2b/v1/createContactGroup?0=`;
export const RYLO_ADD_CONTACTS_URL = `${RYLO_API_BASE_URL}/b2b/v1/addMultipleContactsToGroup`;
export const RYLO_ADD_CONTACTS_TO_CAMPAIGN_URL = `${RYLO_API_BASE_URL}/b2b/v1/addContactsToCampaign`;
export const RYLO_UPDATE_CAMPAIGN_STATUS_URL = `${RYLO_API_BASE_URL}/b2b/v1/updateCampaignStatus`;
export const RYLO_CREATE_CONTACT_URL = `${RYLO_API_BASE_URL}/b2b/v1/createContactInGroup?0=`;
export const RYLO_DELETE_CONTACT_URL = `${RYLO_API_BASE_URL}/b2b/v1/deleteContact?0=`;
export const RYLO_UPDATE_CONTACT_DATA_URL = `${RYLO_API_BASE_URL}/b2b/v1/updateContactData?0=`;
export const RYLO_INITIATE_CALL_URL = `${RYLO_API_BASE_URL}/b2b/v1/initiateVocallabsCall?0=`;
export const RYLO_LIST_CAMPAIGNS_URL = `${RYLO_API_BASE_URL}/b2b/v1/getCampaigns`;
export const RYLO_CREATE_CAMPAIGN_URL = `${RYLO_API_BASE_URL}/b2b/v1/createCampaign`;

export function ryloGetAiAgentUrl(agentId: string): string {
  const params = new URLSearchParams({ agent_id: agentId });
  return `${RYLO_API_BASE_URL}/b2b/v1/getAIAgentByID?${params.toString()}`;
}

export function ryloUpdateAiAgentUrl(agentId: string): string {
  const params = new URLSearchParams({ agent_id: agentId });
  return `${RYLO_API_BASE_URL}/b2b/v1/updateAIAgent?${params.toString()}`;
}

export function ryloListContactGroupsUrl(limit: number, offset: number): string {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return `${RYLO_API_BASE_URL}/b2b/v1/getContactGroups?${params.toString()}`;
}

export function ryloCallTimelineUrl(phone: string, limit = 5, offset = 0): string {
  const params = new URLSearchParams({
    phone_to: phone.replace(/\D/g, ''),
    limit: String(limit),
    offset: String(offset),
  });
  return `${RYLO_API_BASE_URL}/b2b/v1/getCallTimeline?${params.toString()}`;
}

export function ryloListAiAgentsUrl(limit: number, offset: number): string {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return `${RYLO_API_BASE_URL}/b2b/v1/getAIAgents?${params.toString()}`;
}

function readEnv(names: string[]): string {
  for (const name of names) {
    const value = String(process.env[name] || '').trim();
    if (value) return value;
  }
  return '';
}

export function getRyloClientId(): string {
  return readEnv(['RYLO_CLIENT_ID', 'VOCALLABS_CLIENT_ID']);
}

export function getRyloClientSecret(): string {
  return readEnv(['RYLO_CLIENT_SECRET', 'VOCALLABS_CLIENT_SECRET']);
}

export function isRyloConfigured(): boolean {
  return Boolean(getRyloClientId() && getRyloClientSecret());
}

/** Saved bearer token. A 401 refresh must not write a replacement back here. */
export function getVocallabsAuthToken(): string {
  return String(process.env.VOCALLABS_AUTH_TOKEN || '').trim();
}
