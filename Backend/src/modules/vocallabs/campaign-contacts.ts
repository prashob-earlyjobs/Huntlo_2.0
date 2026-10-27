import { AppError } from '../../shared/errors/app-error.js';
import { VocallabsCampaignContactModel } from './vocallabs-campaign-contact.model.js';
import { VocallabsCampaignModel } from './vocallabs-campaign.model.js';

export type CampaignContact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  data: Record<string, string>;
};

export type ParsedCampaignContact = {
  name: string;
  phone: string;
  email: string;
  data: Record<string, string>;
};

const CONTACT_LIMIT = 500;

function hexId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toHexString' in value) {
    const hex = (value as { toHexString?: () => string }).toHexString;
    if (typeof hex === 'function') return hex.call(value);
  }
  return String(value ?? '');
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith('+')) return null;
  const digits = phoneDigits(trimmed);
  if (digits.length < 8 || digits.length > 15) return null;
  return `+${digits}`;
}

const ISSUE_LIMIT = 12;

function columnKey(value: string): string {
  return value.trim().toLowerCase();
}

export function parseCampaignContactsCsv(
  csv: string,
  requiredColumns: string[] = ['name', 'phone']
): ParsedCampaignContact[] {
  const issues: string[] = [];
  const addIssue = (message: string) => {
    if (issues.length < ISSUE_LIMIT) issues.push(message);
  };
  const finish = (): ParsedCampaignContact[] => {
    if (!issues.length) return [];
    throw AppError.validation(
      issues.length === 1 ? issues[0] : 'This CSV needs changes before it can be imported.',
      issues.map((message) => ({ message }))
    );
  };

  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    addIssue('The file is empty.');
    return finish();
  }

  const headers = splitCsvLine(lines[0]);
  const normalized = headers.map(columnKey);
  const required = requiredColumns.map((column) => column.trim()).filter(Boolean);
  const requiredKeys = new Set(required.map(columnKey));
  const seenHeaders = new Set<string>();

  for (const header of normalized) {
    if (!header) {
      addIssue('The header row has an empty column name.');
      continue;
    }
    if (seenHeaders.has(header)) addIssue(`Column "${header}" is listed more than once.`);
    seenHeaders.add(header);
  }

  const missing = required.filter((column) => !seenHeaders.has(columnKey(column)));
  if (missing.length) addIssue(`Missing columns: ${missing.join(', ')}.`);

  const extra = [...new Set(headers.map((header) => header.trim()).filter(Boolean))].filter(
    (header) => !requiredKeys.has(columnKey(header))
  );
  if (extra.length) addIssue(`Remove extra columns: ${extra.join(', ')}.`);

  const dataLines = lines.slice(1);
  const filledRows = dataLines.filter((line) => splitCsvLine(line).some((cell) => cell.trim()));
  if (!filledRows.length) addIssue('The file needs at least one contact.');
  if (filledRows.length > CONTACT_LIMIT) {
    addIssue(`A file can include up to ${CONTACT_LIMIT} contacts.`);
  }

  const phoneColumn = normalized.indexOf('phone');
  const seenPhones = new Map<string, number>();
  const contacts: ParsedCampaignContact[] = [];

  dataLines.forEach((line, index) => {
    const cells = splitCsvLine(line);
    if (cells.every((cell) => !cell.trim())) return;
    const rowNumber = index + 2;
    if (headers.length && cells.length > headers.length) {
      addIssue(`Row ${rowNumber} has more values than columns.`);
    }

    const missingData = required.filter((column) => {
      const columnIndex = normalized.indexOf(columnKey(column));
      if (columnIndex < 0) return false;
      return !String(cells[columnIndex] ?? '').trim();
    });
    if (missingData.length) addIssue(`Row ${rowNumber} is missing ${missingData.join(', ')}.`);

    const phoneRaw = phoneColumn >= 0 ? String(cells[phoneColumn] ?? '').trim() : '';
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
    if (phoneRaw && !phone) {
      addIssue(`Row ${rowNumber} phone must start with + and include the country code.`);
    } else if (phone && seenPhones.has(phone)) {
      addIssue(`Row ${rowNumber} repeats the phone number from row ${seenPhones.get(phone)}.`);
    } else if (phone) {
      seenPhones.set(phone, rowNumber);
    }

    if (issues.length || !phone) return;
    const nameIndex = normalized.indexOf('name');
    const emailIndex = normalized.indexOf('email');
    const data: Record<string, string> = {};
    for (const column of required) {
      const key = columnKey(column);
      if (key === 'name' || key === 'phone' || key === 'email') continue;
      const columnIndex = normalized.indexOf(key);
      data[column] = String(cells[columnIndex] ?? '').trim().slice(0, 500);
    }
    contacts.push({
      name: (nameIndex >= 0 ? cells[nameIndex] : '').trim().slice(0, 120),
      phone: phone.slice(0, 20),
      email: (emailIndex >= 0 ? cells[emailIndex] : '').trim().slice(0, 200),
      data,
    });
  });

  finish();
  return contacts;
}

const PROMPT_PLACEHOLDER = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

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

export function requiredSampleColumns(input: {
  inputsNeeded?: unknown;
  texts: Array<string | undefined>;
}): string[] {
  const columns = ['name', 'phone'];
  const seen = new Set(['name', 'phone', 'contact_id']);
  for (const key of [...readPromptKeys(input.texts), ...readInputKeys(input.inputsNeeded)]) {
    const trimmed = key.trim();
    const normalized = trimmed.toLowerCase();
    if (!trimmed || seen.has(normalized)) continue;
    seen.add(normalized);
    columns.push(trimmed);
  }
  return columns;
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildSampleContactsCsv(columns: string[] = ['name', 'phone']): string {
  const headers = columns.length ? columns : ['name', 'phone'];
  const example = headers.map((column) => {
    const key = column.toLowerCase();
    if (key === 'name') return 'Ada Lovelace';
    if (key === 'phone') return '+919876543210';
    return '';
  });
  return `${headers.map(csvCell).join(',')}\n${example.map(csvCell).join(',')}\n`;
}

export function contactsFromCsvFile(
  buffer: Buffer,
  filename: string,
  requiredColumns: string[]
): ParsedCampaignContact[] {
  const extension = filename.toLowerCase().split('.').pop() || '';
  if (extension !== 'csv') {
    throw AppError.validation('Upload a CSV file.');
  }
  return parseCampaignContactsCsv(buffer.toString('utf8'), requiredColumns);
}

function readStoredData(value: unknown): Record<string, string> {
  if (!value) return {};
  const entries =
    value instanceof Map
      ? [...value.entries()]
      : Object.entries(asRecord(value));
  return Object.fromEntries(entries.map(([key, entry]) => [String(key), String(entry ?? '')]));
}

async function requireCampaign(organizationId: string, campaignId: string): Promise<void> {
  const campaign = await VocallabsCampaignModel.exists({
    organizationId: organizationId.trim(),
    campaignId: campaignId.trim(),
  });
  if (!campaign) throw AppError.notFound('Campaign not found');
}

export async function listCampaignContacts(
  organizationId: string,
  campaignId: string
): Promise<CampaignContact[]> {
  await requireCampaign(organizationId, campaignId);
  const docs = await VocallabsCampaignContactModel.find({
    organizationId: organizationId.trim(),
    campaignId: campaignId.trim(),
  })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((doc) => ({
    id: hexId(doc._id),
    name: doc.name || '',
    phone: doc.phone,
    email: doc.email || '',
    data: readStoredData(doc.data),
  }));
}

async function saveCampaignContacts(
  organizationId: string,
  campaignId: string,
  contacts: ParsedCampaignContact[]
): Promise<CampaignContact[]> {
  if (!contacts.length) {
    throw AppError.validation('The file needs at least one phone number.');
  }
  await VocallabsCampaignContactModel.bulkWrite(
    contacts.map((contact) => ({
      updateOne: {
        filter: { organizationId, campaignId, phone: contact.phone },
        update: {
          $set: { name: contact.name, email: contact.email, data: contact.data },
          $setOnInsert: { organizationId, campaignId, phone: contact.phone },
        },
        upsert: true,
      },
    }))
  );
  return listCampaignContacts(organizationId, campaignId);
}

export async function addCampaignContactsFromCsv(input: {
  organizationId: string;
  campaignId: string;
  csv: string;
  columns: string[];
}): Promise<CampaignContact[]> {
  const organizationId = input.organizationId.trim();
  const campaignId = input.campaignId.trim();
  await requireCampaign(organizationId, campaignId);
  return saveCampaignContacts(
    organizationId,
    campaignId,
    parseCampaignContactsCsv(input.csv, input.columns)
  );
}

export async function addCampaignContactsFromFile(input: {
  organizationId: string;
  campaignId: string;
  filename: string;
  buffer: Buffer;
  columns: string[];
}): Promise<CampaignContact[]> {
  const organizationId = input.organizationId.trim();
  const campaignId = input.campaignId.trim();
  await requireCampaign(organizationId, campaignId);
  const contacts = contactsFromCsvFile(input.buffer, input.filename, input.columns);
  return saveCampaignContacts(organizationId, campaignId, contacts);
}
