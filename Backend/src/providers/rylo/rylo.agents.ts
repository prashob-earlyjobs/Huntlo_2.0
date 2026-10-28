import { createRyloAuthToken } from './rylo.auth.js';
import {
  getRyloClientId,
  getVocallabsAuthToken,
  RYLO_CREATE_AI_AGENT_URL,
  RYLO_LIST_CALL_TOKENS_URL,
  RYLO_LIST_VOICES_URL,
  ryloGetAiAgentUrl,
  ryloListAiAgentsUrl,
  ryloUpdateAiAgentUrl,
} from './rylo.config.js';

export type RyloCreatedAgent = {
  id: string | null;
  name: string;
};

export class RyloRequestError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string
  ) {
    super(message);
    this.name = 'RyloRequestError';
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readAgentId(record: Record<string, unknown>): string | null {
  const nested = asRecord(record.data);
  const raw = record.id ?? record.agent_id ?? record.agentId ?? nested.id ?? nested.agent_id;
  const id = String(raw || '').trim();
  return id || null;
}

async function postCreateAgent(name: string, token: string): Promise<Response> {
  return fetch(RYLO_CREATE_AI_AGENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
}

/** Minted after a 401. Not written back to VOCALLABS_AUTH_TOKEN. */
let storedAuthToken = '';
let storedAuthUserId = '';
let refreshInFlight: Promise<string> | null = null;
/** The env bearer was rejected, so later calls mint instead of sending it again. */
let envTokenRejected = false;

export function clearStoredVocallabsAuthToken(): void {
  storedAuthToken = '';
  storedAuthUserId = '';
  refreshInFlight = null;
  envTokenRejected = false;
}

async function mintAuthToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = createRyloAuthToken()
      .then((result) => {
        const token = result.authToken.trim();
        if (!token) {
          throw new Error('Rylo auth response did not include auth_token');
        }
        storedAuthToken = token;
        if (result.id.trim()) storedAuthUserId = result.id.trim();
        return token;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/** Account id sent as client_id when contacts are added to a group. */
export async function getVocallabsClientId(): Promise<string> {
  if (storedAuthUserId) return storedAuthUserId;
  try {
    const auth = await createRyloAuthToken();
    if (auth.id.trim()) storedAuthUserId = auth.id.trim();
    if (!storedAuthToken && !getVocallabsAuthToken() && auth.authToken.trim()) {
      storedAuthToken = auth.authToken.trim();
    }
  } catch (error) {
    if (!getRyloClientId()) {
      const message = error instanceof Error ? error.message : 'Could not read the account id';
      throw new RyloRequestError(message, 502, 'RYLO_AUTH_FAILED');
    }
  }
  storedAuthUserId = storedAuthUserId || getRyloClientId();
  if (!storedAuthUserId) {
    throw new RyloRequestError('Could not read the account id', 502, 'RYLO_AUTH_FAILED');
  }
  return storedAuthUserId;
}

/**
 * Uses a previously minted token when one is stored, otherwise VOCALLABS_AUTH_TOKEN.
 * A 401 mints a replacement, stores it for later requests, and does not update env.
 */
function authFailure(error: unknown): RyloRequestError {
  if (error instanceof RyloRequestError) return error;
  const message = error instanceof Error ? error.message : 'Could not create a Vocallabs token';
  return new RyloRequestError(message, 502, 'RYLO_AUTH_FAILED');
}

export async function withVocallabsAuth(run: (token: string) => Promise<Response>): Promise<Response> {
  const envToken = getVocallabsAuthToken();
  const starting = storedAuthToken || (envTokenRejected ? '' : envToken);
  if (!starting) {
    if (!envToken && !envTokenRejected) {
      throw new RyloRequestError(
        'VOCALLABS_AUTH_TOKEN is not configured',
        503,
        'RYLO_NOT_CONFIGURED'
      );
    }
    let minted = '';
    try {
      minted = await mintAuthToken();
    } catch (error) {
      throw authFailure(error);
    }
    return run(minted);
  }

  const first = await run(starting);
  if (first.status !== 401) return first;
  if (starting === envToken) envTokenRejected = true;
  if (starting === storedAuthToken) storedAuthToken = '';

  if (storedAuthToken && storedAuthToken !== starting) {
    const retryStored = await run(storedAuthToken);
    if (retryStored.status !== 401) return retryStored;
    storedAuthToken = '';
  }

  let freshToken = '';
  try {
    freshToken = await mintAuthToken();
  } catch (error) {
    throw authFailure(error);
  }
  return run(freshToken);
}

function readAgentRows(body: unknown): unknown[] {
  const record = asRecord(body);
  const data = asRecord(record.data);
  if (Array.isArray(data.vocallabs_agent)) return data.vocallabs_agent;
  if (Array.isArray(record.vocallabs_agent)) return record.vocallabs_agent;
  if (Array.isArray(record.data)) return record.data;
  return [];
}

function readAgentTotal(body: unknown, fallback: number): number {
  const data = asRecord(asRecord(body).data);
  const aggregate = asRecord(asRecord(data.vocallabs_agent_aggregate).aggregate);
  const count = Number(aggregate.count);
  return Number.isFinite(count) ? count : fallback;
}

export type RyloAiAgent = {
  id: string;
  name: string;
  createdAt: string | null;
};

export type RyloAiAgentPage = {
  items: RyloAiAgent[];
  total: number;
  limit: number;
  offset: number;
};

export async function listRyloAiAgents(input?: {
  limit?: number;
  offset?: number;
}): Promise<RyloAiAgentPage> {
  const limit = Math.min(100, Math.max(1, Math.trunc(input?.limit ?? 50)));
  const offset = Math.max(0, Math.trunc(input?.offset ?? 0));
  const response = await withVocallabsAuth((token) =>
    fetch(ryloListAiAgentsUrl(limit, offset), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  );

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not list agents (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  const items = readAgentRows(body).map((row) => {
    const record = asRecord(row);
    return {
      id: readAgentId(record) ?? '',
      name: String(record.name || '').trim() || 'Untitled agent',
      createdAt: String(record.created_at || record.createdAt || '').trim() || null,
    };
  }).filter((agent) => agent.id || agent.name);

  return {
    items,
    total: readAgentTotal(body, items.length),
    limit,
    offset,
  };
}

export type RyloAiAgentDetails = {
  id: string;
  name: string;
  contactId: string;
  welcomeMessage: string;
  agentPrompt: string;
  analyticsPrompt: string;
  language: string;
  callTokenId: string;
  voiceId: string;
  record: Record<string, unknown>;
};

function findText(value: unknown, keys: string[], depth = 0): string {
  if (!value || depth > 5) return '';
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findText(item, keys, depth + 1);
      if (found) return found;
    }
    return '';
  }
  if (typeof value !== 'object') return '';
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  for (const nested of Object.values(record)) {
    if (nested && typeof nested === 'object') {
      const found = findText(nested, keys, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

function readOwnText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const raw = record[key];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }
  return '';
}

function isSecretKey(key: string): boolean {
  return (
    key.toLowerCase() === 'token' ||
    /secret|password|authorization|api[_-]?key|auth[_-]?token|access[_-]?token|refresh[_-]?token/i.test(
      key
    )
  );
}

function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (!value || typeof value !== 'object') return value;
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (isSecretKey(key)) continue;
    output[key] = redactSecrets(child);
  }
  return output;
}

/** The agent row itself, so a nested voice language cannot replace the agent's language. */
function findAgentRecord(body: unknown, agentId = ''): Record<string, unknown> | null {
  const detailed: Record<string, unknown>[] = [];
  const identified: Record<string, unknown>[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const item of value) walk(item);
      return;
    }
    const record = asRecord(value);
    if (!Object.keys(record).length) return;
    const id = readOwnText(record, ['id', 'agent_id', 'agentId']);
    if (
      'welcome_message' in record ||
      'agent_prompt' in record ||
      'voice_id' in record ||
      'call_token_id' in record
    ) {
      detailed.push(record);
    } else if (id && (!agentId || id === agentId) && ('name' in record || 'created_at' in record)) {
      identified.push(record);
    }
    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') walk(child);
    }
  };
  walk(body);
  const matched = agentId
    ? detailed.find((record) => readOwnText(record, ['id', 'agent_id', 'agentId']) === agentId)
    : undefined;
  return matched ?? detailed[0] ?? identified[0] ?? null;
}

function readAgentDetails(body: unknown, agentId: string): RyloAiAgentDetails {
  const record = findAgentRecord(body, agentId);
  const safeRecord = (record ? redactSecrets(record) : {}) as Record<string, unknown>;
  if (!record) {
    return {
      id: findText(body, ['id', 'agent_id', 'agentId']) || agentId,
      name: findText(body, ['name']),
      contactId: findText(body, ['contact_id', 'contactId']),
      welcomeMessage: findText(body, ['welcome_message', 'welcomeMessage']),
      agentPrompt: findText(body, ['agent_prompt', 'agentPrompt']),
      analyticsPrompt: findText(body, ['analytics_prompt', 'analyticsPrompt']),
      language: findText(body, ['language']),
      callTokenId: findText(body, ['call_token_id', 'callTokenId']),
      voiceId: findText(body, ['voice_id', 'voiceId']),
      record: safeRecord,
    };
  }

  const inputs = asRecord(record.inputs_needed);
  return {
    id: readOwnText(record, ['id', 'agent_id', 'agentId']) || agentId,
    name: readOwnText(record, ['name']),
    contactId: readOwnText(inputs, ['contact_id']) || readOwnText(record, ['contact_id', 'contactId']),
    welcomeMessage: readOwnText(record, ['welcome_message', 'welcomeMessage']),
    agentPrompt: readOwnText(record, ['agent_prompt', 'agentPrompt']),
    analyticsPrompt: readOwnText(record, ['analytics_prompt', 'analyticsPrompt']),
    language: readOwnText(record, ['language']),
    callTokenId: readOwnText(record, ['call_token_id', 'callTokenId']),
    voiceId: readOwnText(record, ['voice_id', 'voiceId']),
    record: safeRecord,
  };
}

export async function getRyloAiAgent(agentId: string): Promise<RyloAiAgentDetails> {
  const id = agentId.trim();
  if (!id) {
    throw new RyloRequestError('Agent id is required', 400, 'VALIDATION_ERROR');
  }

  const response = await withVocallabsAuth((token) =>
    fetch(ryloGetAiAgentUrl(id), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  );

  const body: unknown = await response.json().catch(() => null);
  if (response.status === 404) {
    return readAgentDetails(null, id);
  }
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not load the agent (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  return readAgentDetails(body, id);
}

/**
 * Creates a Vocallabs agent.
 * A 401 mints a token, stores it for later requests, and does not update env.
 */
export async function createRyloAiAgent(name: string): Promise<RyloCreatedAgent> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new RyloRequestError('Agent name is required', 400, 'VALIDATION_ERROR');
  }

  const response = await withVocallabsAuth((token) => postCreateAgent(trimmed, token));

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not create the agent (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  return readCreatedAgent(body, trimmed);
}

export type RyloAiAgentUpdate = {
  agentId: string;
  name: string;
  contactId: string;
  welcomeMessage: string;
  agentPrompt: string;
  analyticsPrompt: string;
  language: string;
  callTokenId: string;
  voiceId: string;
  inputsNeeded?: Record<string, unknown>;
};

function readCreatedAgent(body: unknown, fallbackName: string): RyloCreatedAgent {
  const record = asRecord(body);
  const candidates: Record<string, unknown>[] = [record, asRecord(record.data)];
  const data = asRecord(record.data);
  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      for (const row of value) candidates.push(asRecord(row));
      continue;
    }
    const nested = asRecord(value);
    candidates.push(nested);
    if (Array.isArray(nested.returning)) {
      for (const row of nested.returning) candidates.push(asRecord(row));
    }
  }

  for (const candidate of candidates) {
    const id = String(candidate.id ?? candidate.agent_id ?? candidate.agentId ?? '').trim();
    if (!id) continue;
    const name = String(candidate.name || '').trim();
    return { id, name: name || fallbackName };
  }

  const name = String(record.name || asRecord(record.data).name || '').trim();
  return { id: null, name: name || fallbackName };
}

export async function updateRyloAiAgent(input: RyloAiAgentUpdate): Promise<RyloCreatedAgent> {
  const agentId = input.agentId.trim();
  const name = input.name.trim();
  if (!agentId) {
    throw new RyloRequestError('Agent id is required', 400, 'VALIDATION_ERROR');
  }
  if (!name) {
    throw new RyloRequestError('Agent name is required', 400, 'VALIDATION_ERROR');
  }

  const contactId = input.contactId.trim();
  const inputsNeeded: Record<string, unknown> = { ...(input.inputsNeeded ?? {}) };
  if (contactId) inputsNeeded.contact_id = contactId;

  const payload = {
    agent_id: agentId,
    name,
    inputs_needed: inputsNeeded,
    welcome_message: input.welcomeMessage.trim(),
    agent_prompt: input.agentPrompt.trim(),
    analytics_prompt: input.analyticsPrompt.trim(),
    language: input.language.trim(),
    call_token_id: input.callTokenId.trim(),
    voice_id: input.voiceId.trim(),
  };

  const response = await withVocallabsAuth((token) =>
    fetch(ryloUpdateAiAgentUrl(agentId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  );

  const body: unknown = await response.json().catch(() => null);
  console.info(
    JSON.stringify(
      {
        msg: 'vocallabs update response',
        status: response.status,
        body,
      },
      null,
      2
    )
  );
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not update the agent (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  const updated = readCreatedAgent(body, name);
  return { id: updated.id || agentId, name: updated.name || name };
}

export type RyloVoice = {
  id: string;
  alias: string;
};

export async function listRyloVoices(): Promise<RyloVoice[]> {
  const response = await withVocallabsAuth((token) =>
    fetch(RYLO_LIST_VOICES_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  );

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not list voices (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  const entries = Array.isArray(body) ? body : [body];
  const voices: RyloVoice[] = [];
  for (const entry of entries) {
    const rows = asRecord(asRecord(entry).data).vocallabs_tts_voices;
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      const record = asRecord(row);
      const id = String(record.id || '').trim();
      const alias = String(record.alias || '').trim();
      if (!id || !alias) continue;
      voices.push({ id, alias });
    }
  }

  voices.sort((a, b) => a.alias.localeCompare(b.alias));
  return voices;
}

export type RyloCallToken = {
  id: string;
  label: string;
};

const CALL_TOKEN_LABEL_KEYS = ['name', 'alias', 'label', 'title', 'token_name', 'display_name'];

function readCallTokenRows(body: unknown): Record<string, unknown>[] {
  const groups: { key: string; rows: Record<string, unknown>[] }[] = [];
  const walk = (value: unknown, key: string) => {
    if (Array.isArray(value)) {
      const rows = value
        .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
        .map((item) => asRecord(item));
      if (rows.some((row) => row.id || row.call_token_id || row.token_id)) {
        groups.push({ key, rows });
      }
      for (const item of value) walk(item, key);
      return;
    }
    const record = asRecord(value);
    for (const [childKey, child] of Object.entries(record)) walk(child, childKey);
  };
  walk(body, '');
  return (groups.find((group) => /token/i.test(group.key)) ?? groups[0])?.rows ?? [];
}

export async function listRyloCallTokens(): Promise<RyloCallToken[]> {
  const response = await withVocallabsAuth((token) =>
    fetch(RYLO_LIST_CALL_TOKENS_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
  );

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not list call tokens (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }

  const tokens: RyloCallToken[] = [];
  for (const record of readCallTokenRows(body)) {
    const id = String(record.id || record.call_token_id || record.token_id || '').trim();
    if (!id) continue;
    const label =
      CALL_TOKEN_LABEL_KEYS.map((key) => String(record[key] || '').trim()).find(Boolean) || id;
    tokens.push({ id, label });
  }

  tokens.sort((a, b) => a.label.localeCompare(b.label));
  return tokens;
}
