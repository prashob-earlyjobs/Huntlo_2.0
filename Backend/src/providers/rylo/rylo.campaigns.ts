import { RyloRequestError, withVocallabsAuth } from './rylo.agents.js';
import { RYLO_CREATE_CAMPAIGN_URL, RYLO_LIST_CAMPAIGNS_URL } from './rylo.config.js';

export type RyloCampaign = {
  id: string;
  name: string;
  agentId: string;
  agentName: string;
  active: boolean;
  concurrency: number | null;
  pendingCount: number;
  contactCount: number;
  createdAt: string | null;
};

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

function readCount(value: unknown): number {
  const count = Number(asRecord(asRecord(value).aggregate).count);
  return Number.isFinite(count) ? count : 0;
}

function readOptionalNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function readPendingCount(record: Record<string, unknown>): number {
  const direct = readOptionalNumber(record.pending_count ?? record.pending);
  if (direct != null) return direct;
  return readCount(record.pending_calls_aggregate);
}

export function readRyloCampaigns(body: unknown): RyloCampaign[] {
  const rows = asRecord(asRecord(body).data).vocallabs_campaigns;
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => {
      const record = asRecord(row);
      const agent = asRecord(record.agent);
      const id = readText(record, ['id']);
      if (!id) return null;
      return {
        id,
        name: readText(record, ['name']) || 'Untitled campaign',
        agentId: readText(record, ['agent_id', 'agentId']) || readText(agent, ['id']),
        agentName: readText(agent, ['name']),
        active: record.is_active === true || record.active === true,
        concurrency: readOptionalNumber(record.concurrency),
        pendingCount: readPendingCount(record),
        contactCount: readCount(record.call_queues_aggregate),
        createdAt: readText(record, ['created_at', 'createdAt']) || null,
      } satisfies RyloCampaign;
    })
    .filter((campaign): campaign is RyloCampaign => campaign !== null)
    .sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
}

function collectRecords(value: unknown, records: Record<string, unknown>[] = []): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRecords(item, records));
    return records;
  }
  const record = asRecord(value);
  if (!Object.keys(record).length) return records;
  records.push(record);
  for (const child of Object.values(record)) {
    if (child && typeof child === 'object') collectRecords(child, records);
  }
  return records;
}

export function readCreatedRyloCampaign(
  body: unknown,
  fallbackName: string,
  agentId: string
): { id: string; name: string; agentId: string } {
  const records = collectRecords(body);
  const created = records.find((record) => readText(record, ['id']) && ('name' in record || 'agent_id' in record));
  const id = readText(created ?? {}, ['id']);
  if (!id) {
    throw new RyloRequestError('Vocallabs did not return a campaign id', 502, 'RYLO_ERROR');
  }
  return {
    id,
    name: readText(created ?? {}, ['name']) || fallbackName,
    agentId: readText(created ?? {}, ['agent_id', 'agentId']) || agentId,
  };
}

export async function createRyloCampaign(input: {
  name: string;
  agentId: string;
}): Promise<{ id: string; name: string; agentId: string }> {
  const name = input.name.trim();
  const agentId = input.agentId.trim();
  if (!name) throw new RyloRequestError('Campaign name is required', 400, 'VALIDATION_ERROR');
  if (!agentId) throw new RyloRequestError('Agent id is required', 400, 'VALIDATION_ERROR');

  const response = await withVocallabsAuth((token) =>
    fetch(RYLO_CREATE_CAMPAIGN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, agent_id: agentId }),
    })
  );
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new RyloRequestError(
      `Vocallabs could not create the campaign (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }
  return readCreatedRyloCampaign(body, name, agentId);
}

export async function listRyloCampaigns(): Promise<RyloCampaign[]> {
  const response = await withVocallabsAuth((token) =>
    fetch(RYLO_LIST_CAMPAIGNS_URL, {
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
      `Vocallabs could not list campaigns (${response.status})`,
      502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : 'RYLO_ERROR'
    );
  }
  return readRyloCampaigns(body);
}
