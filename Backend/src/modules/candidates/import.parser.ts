import fs from 'node:fs';
import path from 'node:path';

import { parse as csvParse } from 'csv-parse/sync';
import ExcelJS from 'exceljs';

/**
 * Neutralize spreadsheet formula injection by stripping leading
 * `=`, `+`, `-`, `@` (CSV/Excel injection). Preserves phone-like `+digits`.
 */
export function sanitizeSpreadsheetValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (typeof value === 'string') {
    str = value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    str = String(value);
  } else if (value instanceof Date) {
    str = value.toISOString();
  } else {
    str = String(value);
  }

  // Strip BOM and normalize newlines
  str = str.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  str = str.trim();

  // Preserve E.164-style phone numbers
  if (/^\+\d{6,15}$/.test(str.replace(/[\s()-]/g, ''))) {
    return str;
  }

  // Strip leading formula injection characters
  while (/^[=+\-@]/.test(str)) {
    str = str.slice(1).trimStart();
  }

  return str;
}

export type ParsedSheet = {
  headers: string[];
  rows: Record<string, string>[];
};

const TARGET_FIELD_ALIASES: Record<string, string[]> = {
  name: ['name', 'full name', 'fullname', 'candidate name', 'candidate'],
  email: ['email', 'e-mail', 'email address', 'mail'],
  phone: ['phone', 'mobile', 'phone number', 'mobile number', 'contact', 'cell'],
  linkedinUrl: ['linkedin', 'linkedin url', 'linkedin profile', 'linkedinurl', 'profile url'],
  headline: ['headline', 'summary', 'about'],
  currentTitle: ['title', 'current title', 'job title', 'role', 'position'],
  currentCompany: ['company', 'current company', 'employer', 'organization'],
  location: ['location', 'city', 'based in', 'geo'],
  experienceYears: ['experience', 'experience years', 'years of experience', 'yoe', 'exp'],
  skills: ['skills', 'skill', 'technologies', 'tech stack'],
  tags: ['tags', 'tag', 'labels'],
};

function normalizeHeaderKey(header: string): string {
  return sanitizeSpreadsheetValue(header).toLowerCase().replace(/[_-]+/g, ' ').trim();
}

export function suggestColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();

  for (const [target, aliases] of Object.entries(TARGET_FIELD_ALIASES)) {
    for (const header of headers) {
      if (usedHeaders.has(header)) continue;
      const normalized = normalizeHeaderKey(header);
      if (aliases.includes(normalized)) {
        mapping[target] = header;
        usedHeaders.add(header);
        break;
      }
    }
  }

  return mapping;
}

function rowFromValues(headers: string[], values: unknown[]): Record<string, string> {
  const row: Record<string, string> = {};
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]!;
    row[header] = sanitizeSpreadsheetValue(values[i] ?? '');
  }
  return row;
}

export async function parseSpreadsheetFile(
  filePath: string,
  options?: { maxRows?: number }
): Promise<ParsedSheet> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.csv') {
    return parseCsvFile(filePath, options?.maxRows);
  }
  if (ext === '.xlsx' || ext === '.xls') {
    return parseExcelFile(filePath, options?.maxRows);
  }
  throw new Error(`Unsupported file extension: ${ext}`);
}

function parseCsvFile(filePath: string, maxRows?: number): ParsedSheet {
  const raw = fs.readFileSync(filePath);
  // BOM-aware: csv-parse handles BOM when bom: true
  const records = csvParse(raw, {
    bom: true,
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: false,
  }) as unknown[][];

  if (!records.length) {
    return { headers: [], rows: [] };
  }

  const headerCells = (records[0] ?? []).map((cell) => sanitizeSpreadsheetValue(cell));
  const headers = headerCells.map((h, i) => (h ? h : `Column ${i + 1}`));

  const dataRecords = records.slice(1);
  const limited = maxRows !== undefined ? dataRecords.slice(0, maxRows) : dataRecords;
  const rows = limited.map((cells) => rowFromValues(headers, cells));

  return { headers, rows };
}

async function parseExcelFile(filePath: string, maxRows?: number): Promise<ParsedSheet> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { headers: [], rows: [] };
  }

  const allRows: unknown[][] = [];
  sheet.eachRow({ includeEmpty: false }, (row) => {
    const values: unknown[] = [];
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      while (values.length < colNumber - 1) values.push('');
      let raw: unknown = cell.value;
      if (raw && typeof raw === 'object' && 'text' in (raw as object)) {
        raw = (raw as { text: string }).text;
      } else if (raw && typeof raw === 'object' && 'result' in (raw as object)) {
        raw = (raw as { result: unknown }).result;
      } else if (raw && typeof raw === 'object' && 'richText' in (raw as object)) {
        raw = ((raw as { richText: Array<{ text: string }> }).richText ?? [])
          .map((part) => part.text)
          .join('');
      }
      values.push(raw ?? '');
    });
    allRows.push(values);
  });

  if (!allRows.length) {
    return { headers: [], rows: [] };
  }

  const headerCells = (allRows[0] ?? []).map((cell) => sanitizeSpreadsheetValue(cell));
  const headers = headerCells.map((h, i) => (h ? h : `Column ${i + 1}`));

  const dataRecords = allRows.slice(1);
  const limited = maxRows !== undefined ? dataRecords.slice(0, maxRows) : dataRecords;
  const rows = limited.map((cells) => rowFromValues(headers, cells));

  return { headers, rows };
}

export function countAllDataRows(filePath: string): Promise<number> {
  return parseSpreadsheetFile(filePath).then((parsed) => parsed.rows.length);
}

export function mapRowToFields(
  row: Record<string, string>,
  columnMapping: Record<string, string>
): Record<string, string> {
  const mapped: Record<string, string> = {};
  for (const [target, sourceCol] of Object.entries(columnMapping)) {
    if (!sourceCol) continue;
    mapped[target] = sanitizeSpreadsheetValue(row[sourceCol] ?? '');
  }
  return mapped;
}
