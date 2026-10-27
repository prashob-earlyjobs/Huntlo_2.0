import { getRyloAiAgent, RyloRequestError, withVocallabsAuth } from './rylo.agents.js';
import {
  RYLO_CREATE_CONTACT_GROUP_URL,
  RYLO_CREATE_CONTACT_URL,
  RYLO_INITIATE_CALL_URL,
  RYLO_UPDATE_CONTACT_DATA_URL,
  ryloCallTimelineUrl,
  ryloListContactGroupsUrl,
} from './rylo.config.js';

const TEST_GROUP_NAME = 'Huntlo tests';

let testGroupId: string | null = null;

export function clearStoredTestContactGroup(): void {
  testGroupId = null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function collectRecords(body: unknown): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    const record = asRecord(value);
    if (!Object.keys(record).length) return;
    records.push(record);
    for (const child of Object.values(record)) {
      if (child && typeof child === 'object') walk(child);
    }
  };
  walk(body);
  return records;
}

function readContactId(body: unknown, groupId: string): string | null {
  const ranked = collectRecords(body)
    .map((record) => ({
      id: readText(record, ['id', 'prospect_id', 'contact_id']),
      hasPhone: 'phone' in record,
    }))
    .filter((row) => row.id && row.id !== groupId);
  return ranked.find((row) => row.hasPhone)?.id || ranked[0]?.id || null;
}

function readCreatedId(body: unknown, hintKeys: string[]): string | null {
  const records = collectRecords(body);
  const hinted = records.find((record) => hintKeys.some((key) => key in record));
  const id = readText(hinted ?? {}, ['id', 'prospect_id', 'contact_id', 'prospect_group_id']);
  if (id) return id;
  for (const record of records) {
    const fallback = readText(record, ['id', 'prospect_id', 'contact_id', 'prospect_group_id']);
    if (fallback) return fallback;
  }
  return null;
}

export function normalizeTestPhone(value: string): string {
  const digits = value.trim().replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) {
    throw new RyloRequestError('Enter a phone number with 8 to 15 digits', 400, 'VALIDATION_ERROR');
  }
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

function readVocallabsMessage(body: unknown): string {
  const message = readText(asRecord(body), ['message', 'error']);
  if (!message || /bearer|authorization|auth_token/i.test(message)) return '';
  return message.slice(0, 300);
}

const PROMPT_PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

function readInputKeys(value: unknown): string[] {
  let parsed = value;
  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    if (!trimmed) return [];
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      return [];
    }
  }
  return Object.keys(asRecord(parsed)).filter((key) => key && key !== 'contact_id');
}

function readPromptKeys(texts: Array<string | undefined>): string[] {
  const keys: string[] = [];
  for (const text of texts) {
    if (!text) continue;
    for (const match of text.matchAll(PROMPT_PLACEHOLDER)) {
      const key = match[1];
      if (key && key !== 'contact_id') keys.push(key);
    }
  }
  return keys;
}

/**
 * Vocallabs keeps a capped, alphabetically sorted inputs_needed map, so prompt
 * placeholders past that cap are absent there and still required on the contact.
 */
function requiredContactKeys(
  inputsNeeded: unknown,
  texts: Array<string | undefined>
): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const key of [...readInputKeys(inputsNeeded), ...readPromptKeys(texts)]) {
    if (seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  return keys;
}

function sampleInputValue(key: string, phone: string, agentName: string): string {
  const normalized = key.toLowerCase();
  if (normalized.includes('mobile') || normalized.includes('phone')) return phone;
  if (normalized === 'name') return 'Test';
  if (normalized.includes('date')) return '23 Oct 2026';
  if (normalized.includes('time') || normalized.startsWith('slot')) return '10:00 AM';
  if (normalized.includes('fee') || normalized.includes('amount')) return '500';
  if (normalized.includes('hour')) return '24';
  if (normalized.includes('agent')) return agentName || 'Test agent';
  if (normalized.includes('reference')) return 'TEST-1';
  return 'Test';
}

function logTestCallResponse(action: string, status: number, body: unknown): void {
  console.info(
    JSON.stringify(
      {
        msg: 'vocallabs test call response',
        action,
        status,
        body,
      },
      null,
      2
    )
  );
}

async function ryloJson(response: Response, action: string): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (action === 'start the test call') {
    logTestCallResponse(action, response.status, body);
  }
  if (!response.ok) {
    const detail = readVocallabsMessage(body);
    throw new RyloRequestError(
      detail ? `Vocallabs could not ${action}: ${detail}` : `Vocallabs could not ${action} (${response.status})`,
      response.status === 400 || response.status === 404 ? 400 : 502,
      response.status === 401
        ? 'RYLO_UNAUTHORIZED'
        : response.status === 400
          ? 'VALIDATION_ERROR'
          : 'RYLO_ERROR'
    );
  }
  return body;
}

async function ensureTestGroup(): Promise<string> {
  if (testGroupId) return testGroupId;

  const listed = await withVocallabsAuth((token) =>
    fetch(ryloListContactGroupsUrl(50, 0), {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    })
  );
  const listedBody = await ryloJson(listed, 'list contact groups');
  const existing = collectRecords(listedBody).find(
    (record) => readText(record, ['name']).toLowerCase() === TEST_GROUP_NAME.toLowerCase()
  );
  const existingId = readText(existing ?? {}, ['id', 'prospect_group_id']);
  if (existingId) {
    testGroupId = existingId;
    return existingId;
  }

  const created = await withVocallabsAuth((token) =>
    fetch(RYLO_CREATE_CONTACT_GROUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: TEST_GROUP_NAME }),
    })
  );
  const createdBody = await ryloJson(created, 'create the test contact group');
  const createdId = readCreatedId(createdBody, ['name']);
  if (!createdId) {
    throw new RyloRequestError('Vocallabs did not return a contact group id', 502, 'RYLO_ERROR');
  }
  testGroupId = createdId;
  return createdId;
}

export async function testRyloAiAgent(input: { agentId: string; phone: string }): Promise<{
  agentId: string;
  prospectId: string;
  call: unknown;
}> {
  const agentId = input.agentId.trim();
  if (!agentId) {
    throw new RyloRequestError('Agent id is required', 400, 'VALIDATION_ERROR');
  }
  const phone = normalizeTestPhone(input.phone);
  const agent = await getRyloAiAgent(agentId);
  if (!agent.callTokenId) {
    throw new RyloRequestError(
      'Vocallabs has no phone line on this agent. Add a call API token in Vocallabs, set Call token on the agent, then start the test call again.',
      400,
      'VALIDATION_ERROR'
    );
  }
  const inputKeys = requiredContactKeys(agent.record?.inputs_needed, [
    agent.welcomeMessage,
    agent.agentPrompt,
    agent.analyticsPrompt,
  ]);
  const groupId = await ensureTestGroup();

  const contact = await withVocallabsAuth((token) =>
    fetch(RYLO_CREATE_CONTACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Test',
        phone,
        prospect_group_id: groupId,
      }),
    })
  );
  const contactBody = await ryloJson(contact, 'create the test contact');
  const prospectId = readContactId(contactBody, groupId);
  if (!prospectId || prospectId === groupId) {
    throw new RyloRequestError('Vocallabs did not return a contact id', 502, 'RYLO_ERROR');
  }

  if (inputKeys.length) {
    const data = Object.fromEntries(
      inputKeys.map((key) => [key, sampleInputValue(key, phone, agent.name)])
    );
    const updated = await withVocallabsAuth((token) =>
      fetch(RYLO_UPDATE_CONTACT_DATA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prospect_id: prospectId, data }),
      })
    );
    await ryloJson(updated, 'save the test contact details');
  }

  const call = await withVocallabsAuth((token) =>
    fetch(RYLO_INITIATE_CALL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agentId, prospect_id: prospectId }),
    })
  );
  const startedAt = Date.now();
  const callBody = await ryloJson(call, 'start the test call');
  const callStatus = await readLatestCallStatus(phone, startedAt);
  if (callStatus === 'fail') {
    throw new RyloRequestError(
      'Vocallabs could not connect this call. Set Call token to the owned number (+912269850574), save, turn DND off, then try again.',
      400,
      'VALIDATION_ERROR'
    );
  }
  return { agentId, prospectId, call: callBody };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readLatestCallStatus(phone: string, startedAt: number): Promise<string> {
  const waitMs = process.env.VITEST ? 0 : 2500;
  if (waitMs) await delay(waitMs);
  try {
    const timeline = await withVocallabsAuth((token) =>
      fetch(ryloCallTimelineUrl(phone), {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      })
    );
    if (!timeline.ok) return '';
    const body: unknown = await timeline.json().catch(() => null);
    const cutoff = startedAt - 5_000;
    const statuses = collectRecords(body)
      .map((record) => ({
        status: readText(record, ['call_status', 'status']).toLowerCase(),
        at: Date.parse(readText(record, ['created_at', 'createdAt'])),
      }))
      .filter((row) => row.status && Number.isFinite(row.at) && row.at >= cutoff);
    return statuses[0]?.status || '';
  } catch {
    return '';
  }
}
