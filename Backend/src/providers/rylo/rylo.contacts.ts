import { randomInt } from 'node:crypto';

import { getVocallabsClientId, RyloRequestError, withVocallabsAuth } from './rylo.agents.js';
import {
  getRyloClientId,
  RYLO_ADD_CONTACTS_TO_CAMPAIGN_URL,
  RYLO_ADD_CONTACTS_URL,
  RYLO_UPDATE_CAMPAIGN_STATUS_URL,
  RYLO_CREATE_CONTACT_GROUP_URL,
  RYLO_CREATE_CONTACT_URL,
  RYLO_DELETE_CONTACT_URL,
  RYLO_UPDATE_CONTACT_DATA_URL,
} from './rylo.config.js';

const CONTACT_BATCH = 100;

export type RyloGroupProspect = {
  name: string;
  phone: string;
  data: Record<string, string>;
  prospect_group_id: string;
  client_id: string;
};

type LaunchContact = {
  name: string;
  phone: string;
  email: string;
  data: Record<string, string>;
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

function readMessage(body: unknown): string {
  const message = readText(asRecord(body), ['message', 'error']);
  if (!message || /bearer|authorization|auth_token/i.test(message)) return '';
  return message.slice(0, 300);
}

function embeddedError(body: unknown): string {
  const errors = asRecord(body).errors;
  if (!Array.isArray(errors)) return '';
  const message = errors
    .map((item) => readText(asRecord(item), ['message']))
    .filter(Boolean)
    .join('; ');
  return message.slice(0, 300);
}

async function ryloJson(response: Response, action: string): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  const detail = readMessage(body) || embeddedError(body);
  if (!response.ok || embeddedError(body)) {
    throw new RyloRequestError(
      detail ? `Vocallabs could not ${action}: ${detail}` : `Vocallabs could not ${action} (${response.status})`,
      response.status === 401
        ? 401
        : response.status === 400 || response.status === 404
          ? 400
          : embeddedError(body)
            ? 400
            : 502,
      response.status === 401 ? 'RYLO_UNAUTHORIZED' : response.status === 400 || embeddedError(body) ? 'VALIDATION_ERROR' : 'RYLO_ERROR'
    );
  }
  return body;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function campaignContactGroupName(campaignName: string, code = ''): string {
  const name = campaignName.trim().replace(/\s+/g, ' ').slice(0, 80);
  const digits = (code.replace(/\D/g, '') || String(randomInt(0, 10000))).padStart(4, '0').slice(-4);
  return `${name}${digits}`;
}

export function campaignGroupAssignment(input: {
  userId: string;
  campaignId: string;
  groupId: string;
}): { user_id: string; campaign_id: string; prospect_group_id: string } {
  return {
    user_id: input.userId.trim(),
    campaign_id: input.campaignId.trim(),
    prospect_group_id: input.groupId.trim(),
  };
}

export function campaignStatusUpdate(input: {
  campaignId: string;
  active: boolean;
}): { campaign_id: string; active: boolean } {
  return {
    campaign_id: input.campaignId.trim(),
    active: input.active,
  };
}

export function prospectsForContactGroup(input: {
  contacts: LaunchContact[];
  groupId: string;
  clientId: string;
}): RyloGroupProspect[] {
  return input.contacts.map((contact) => {
    const data = { ...contact.data };
    if (contact.name.trim()) data.name = contact.name.trim();
    if (contact.email.trim()) data.email = contact.email.trim();
    return {
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      data,
      prospect_group_id: input.groupId,
      client_id: input.clientId,
    };
  });
}

function readGroupId(body: unknown, groupName: string): string {
  const records = collectRecords(body);
  const named = records.find(
    (record) => readText(record, ['name']) === groupName && readText(record, ['id', 'prospect_group_id'])
  );
  const id = readText(named ?? {}, ['id', 'prospect_group_id']);
  if (id) return id;
  if (records.some((record) => readText(record, ['name']))) return '';
  for (const record of records) {
    const fallback = readText(record, ['id', 'prospect_group_id']);
    if (fallback) return fallback;
  }
  return '';
}

/** Rows the bulk insert confirmed. Null when the response does not say. */
export function prospectInsertCount(body: unknown): number | null {
  const records = collectRecords(body);
  const counts = records
    .map((record) => record.affected_rows)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (counts.length) return Math.max(...counts);
  const inserted = records.filter(
    (record) => readText(record, ['id', 'prospect_id']) && ('phone' in record || 'prospect_group_id' in record)
  );
  return inserted.length ? inserted.length : null;
}

function readProspectId(body: unknown, groupId: string): string {
  const ranked = collectRecords(body)
    .map((record) => ({
      id: readText(record, ['id', 'prospect_id', 'contact_id']),
      hasPhone: 'phone' in record,
    }))
    .filter((row) => row.id && row.id !== groupId);
  return ranked.find((row) => row.hasPhone)?.id || ranked[0]?.id || '';
}

/** Where a create/bulk response says the candidate landed. */
export function placedProspectFromBody(
  body: unknown,
  groupId: string
): { prospectId: string; groupId: string } {
  let prospectId = '';
  let placedGroupId = '';
  for (const record of collectRecords(body)) {
    const id = readText(record, ['id', 'prospect_id', 'contact_id']);
    const directGroup = readText(record, ['prospect_group_id']);
    const nestedGroup = readText(asRecord(record.prospect_group), ['id']);
    const group = directGroup || nestedGroup;
    if (!('phone' in record) || !group) continue;
    placedGroupId = group;
    if (id && id !== group) prospectId = id;
  }
  return {
    prospectId: prospectId || readProspectId(body, groupId),
    groupId: placedGroupId,
  };
}

function prospectData(contact: LaunchContact): Record<string, string> {
  const data = { ...contact.data };
  if (contact.name.trim()) data.name = contact.name.trim();
  if (contact.email.trim()) data.email = contact.email.trim();
  return data;
}

async function insertProspect(contact: LaunchContact, groupId: string): Promise<{ prospectId: string; groupId: string }> {
  const created = await withVocallabsAuth((token) =>
    fetch(RYLO_CREATE_CONTACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        prospect_group_id: groupId,
      }),
    })
  );
  const createdBody = await ryloJson(created, 'add the candidates');
  return placedProspectFromBody(createdBody, groupId);
}

async function deleteProspect(prospectId: string): Promise<void> {
  const removed = await withVocallabsAuth((token) =>
    fetch(RYLO_DELETE_CONTACT_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ contact_id: prospectId }),
    })
  );
  await ryloJson(removed, 'move the candidate into this group');
}

async function saveProspectData(prospectId: string, contact: LaunchContact): Promise<void> {
  const data = prospectData(contact);
  if (!prospectId || !Object.keys(data).length) return;
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
  await ryloJson(updated, 'save the candidate details');
}

/**
 * Puts the candidate in this group. A number already stored on another group
 * is removed and created again so the campaign can see it.
 */
async function createProspectInGroup(contact: LaunchContact, groupId: string): Promise<void> {
  let placed = await insertProspect(contact, groupId);
  if (placed.groupId && placed.groupId !== groupId && placed.prospectId) {
    await deleteProspect(placed.prospectId);
    placed = await insertProspect(contact, groupId);
  }
  if (!placed.prospectId || (placed.groupId && placed.groupId !== groupId)) {
    throw new RyloRequestError('Vocallabs could not add the candidate to the contact group', 400, 'VALIDATION_ERROR');
  }
  await saveProspectData(placed.prospectId, contact);
}

function readyContacts(contacts: LaunchContact[]): LaunchContact[] {
  return contacts.filter((contact) => contact.phone.trim());
}

export async function createRyloCampaignContactGroup(input: {
  campaignName: string;
  contacts: LaunchContact[];
}): Promise<{ groupId: string; groupName: string; contactCount: number }> {
  const contacts = readyContacts(input.contacts);
  if (!contacts.length) {
    throw new RyloRequestError('Add candidates before launching.', 400, 'VALIDATION_ERROR');
  }
  const clientId = await getVocallabsClientId();
  const groupName = campaignContactGroupName(input.campaignName);
  const created = await withVocallabsAuth((token) =>
    fetch(RYLO_CREATE_CONTACT_GROUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: groupName }),
    })
  );
  const createdBody = await ryloJson(created, 'create the contact group');
  const groupId = readGroupId(createdBody, groupName);
  if (!groupId) {
    throw new RyloRequestError('Vocallabs did not return a contact group id', 502, 'RYLO_ERROR');
  }

  const prospects = prospectsForContactGroup({ contacts, groupId, clientId });
  for (let index = 0; index < prospects.length; index += CONTACT_BATCH) {
    const batch = prospects.slice(index, index + CONTACT_BATCH);
    const added = await withVocallabsAuth((token) =>
      fetch(RYLO_ADD_CONTACTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prospects: batch }),
      })
    );
    const addedBody = await ryloJson(added, 'add the candidates');
    const confirmed = collectRecords(addedBody).filter((record) => {
      if (!('phone' in record)) return false;
      const placed = placedProspectFromBody(record, groupId);
      return placed.prospectId && placed.groupId === groupId;
    }).length;
    if (confirmed >= batch.length) continue;
    const batchContacts = contacts.slice(index, index + CONTACT_BATCH);
    for (const contact of batchContacts) {
      await createProspectInGroup(contact, groupId);
    }
  }

  return { groupId, groupName, contactCount: prospects.length };
}

export async function attachRyloCampaignContactGroup(input: {
  campaignId: string;
  groupId: string;
  contacts: LaunchContact[];
}): Promise<void> {
  const contacts = readyContacts(input.contacts);
  const groupId = input.groupId.trim();
  if (!input.campaignId.trim()) {
    throw new RyloRequestError('Campaign id is required', 400, 'VALIDATION_ERROR');
  }
  if (!groupId) {
    throw new RyloRequestError('Create the contact group before attaching it.', 400, 'VALIDATION_ERROR');
  }
  if (!contacts.length) {
    throw new RyloRequestError('Add candidates before launching.', 400, 'VALIDATION_ERROR');
  }
  const clientId = await getVocallabsClientId();
  const userIds = [...new Set([getRyloClientId(), clientId].map((id) => id.trim()).filter(Boolean))];
  let attached = false;
  let lastError: unknown;
  for (let round = 0; round < 2 && !attached; round += 1) {
    if (round === 1) {
      for (const contact of contacts) await createProspectInGroup(contact, groupId);
    }
    await wait(round === 0 ? 1500 : 2000);
    for (const userId of userIds) {
      try {
        const response = await withVocallabsAuth((token) =>
          fetch(RYLO_ADD_CONTACTS_TO_CAMPAIGN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(
              campaignGroupAssignment({
                userId,
                campaignId: input.campaignId,
                groupId,
              })
            ),
          })
        );
        await ryloJson(response, 'add the contact group to the campaign');
        attached = true;
        break;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : '';
        if (!/no prospects found/i.test(message)) throw error;
      }
    }
  }
  if (!attached) {
    throw lastError instanceof Error
      ? lastError
      : new RyloRequestError('Vocallabs could not add the contact group to the campaign', 502, 'RYLO_ERROR');
  }
}

export async function activateRyloCampaign(campaignId: string): Promise<void> {
  if (!campaignId.trim()) {
    throw new RyloRequestError('Campaign id is required', 400, 'VALIDATION_ERROR');
  }
  const activated = await withVocallabsAuth((token) =>
    fetch(RYLO_UPDATE_CAMPAIGN_STATUS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(campaignStatusUpdate({ campaignId, active: true })),
    })
  );
  await ryloJson(activated, 'launch the campaign');
}

export async function launchRyloContactGroup(input: {
  campaignId: string;
  campaignName: string;
  contacts: LaunchContact[];
}): Promise<{ groupId: string; groupName: string; contactCount: number }> {
  if (!input.campaignId.trim()) {
    throw new RyloRequestError('Campaign id is required', 400, 'VALIDATION_ERROR');
  }
  const created = await createRyloCampaignContactGroup({
    campaignName: input.campaignName,
    contacts: input.contacts,
  });
  await attachRyloCampaignContactGroup({
    campaignId: input.campaignId,
    groupId: created.groupId,
    contacts: input.contacts,
  });
  await activateRyloCampaign(input.campaignId);
  return created;
}
