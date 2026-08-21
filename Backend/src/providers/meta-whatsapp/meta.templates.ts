import { AppError } from '../../shared/errors/app-error.js';
import {
  getHuntloWhatsAppCredentials,
  getMetaGraphBaseUrl,
} from './meta.config.js';

export type MetaWhatsAppTemplate = {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  body: string;
  variableCount: number;
};

type GraphComponent = {
  type?: string;
  text?: string;
};

type GraphTemplate = {
  id?: string;
  name?: string;
  language?: string;
  status?: string;
  category?: string;
  components?: GraphComponent[];
};

type GraphListResponse = {
  data?: GraphTemplate[];
  paging?: { cursors?: { after?: string }; next?: string };
  error?: { message?: string; error_user_msg?: string };
};

const CACHE_TTL_MS = 60_000;
const LANGUAGE_PREFERENCE = ['en', 'en_US', 'en_GB'];

let cache: { wabaId: string; expiresAt: number; items: MetaWhatsAppTemplate[] } | null =
  null;

function bodyFromComponents(components: GraphComponent[] | undefined): string {
  const body = (components || []).find(
    (component) => String(component.type || '').toUpperCase() === 'BODY'
  );
  return String(body?.text || '').trim();
}

function variableCountFromBody(body: string): number {
  let max = 0;
  for (const match of body.matchAll(/\{\{\s*(\d+)\s*\}\}/g)) {
    const index = Number(match[1]);
    if (Number.isFinite(index) && index > max) max = index;
  }
  return max;
}

function languageRank(language: string): number {
  const index = LANGUAGE_PREFERENCE.indexOf(language);
  return index === -1 ? LANGUAGE_PREFERENCE.length : index;
}

function toPublic(template: GraphTemplate): MetaWhatsAppTemplate | null {
  const name = String(template.name || '').trim();
  if (!name) return null;
  const status = String(template.status || '').toUpperCase();
  if (status && status !== 'APPROVED') return null;
  const body = bodyFromComponents(template.components);
  return {
    id: name,
    name,
    language: String(template.language || 'en').trim() || 'en',
    status: status || 'APPROVED',
    category: String(template.category || '').trim() || 'UTILITY',
    body,
    variableCount: variableCountFromBody(body),
  };
}

function dedupeByName(items: MetaWhatsAppTemplate[]): MetaWhatsAppTemplate[] {
  const best = new Map<string, MetaWhatsAppTemplate>();
  for (const item of items) {
    const existing = best.get(item.name);
    if (!existing || languageRank(item.language) < languageRank(existing.language)) {
      best.set(item.name, item);
    }
  }
  return [...best.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchPage(
  wabaId: string,
  accessToken: string,
  after?: string
): Promise<GraphListResponse> {
  const url = new URL(
    `${getMetaGraphBaseUrl()}/${encodeURIComponent(wabaId)}/message_templates`
  );
  url.searchParams.set('fields', 'name,language,status,category,components');
  url.searchParams.set('limit', '100');
  if (after) url.searchParams.set('after', after);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = (await res.json().catch(() => ({}))) as GraphListResponse;
  if (!res.ok) {
    throw new AppError(
      502,
      'BAD_GATEWAY',
      payload.error?.error_user_msg ||
        payload.error?.message ||
        `Meta template list failed (${res.status})`
    );
  }
  return payload;
}

export async function listApprovedMetaWhatsAppTemplates(options?: {
  force?: boolean;
}): Promise<MetaWhatsAppTemplate[]> {
  const creds = getHuntloWhatsAppCredentials();
  if (!creds) {
    throw new AppError(503, 'SERVICE_UNAVAILABLE', 'Huntlo WhatsApp is not configured on the server.');
  }
  if (!creds.wabaId) {
    throw AppError.badRequest(
      'HUNTLO_WHATSAPP_WABA_ID is required to load templates from Meta.'
    );
  }

  if (
    !options?.force &&
    cache &&
    cache.wabaId === creds.wabaId &&
    cache.expiresAt > Date.now()
  ) {
    return cache.items;
  }

  const collected: MetaWhatsAppTemplate[] = [];
  let after: string | undefined;
  for (let page = 0; page < 10; page += 1) {
    const payload = await fetchPage(creds.wabaId, creds.accessToken, after);
    for (const row of payload.data || []) {
      const mapped = toPublic(row);
      if (mapped) collected.push(mapped);
    }
    after = payload.paging?.cursors?.after;
    if (!after || !payload.paging?.next) break;
  }

  const items = dedupeByName(collected);
  cache = { wabaId: creds.wabaId, expiresAt: Date.now() + CACHE_TTL_MS, items };
  return items;
}

export async function findApprovedMetaTemplate(
  name: string
): Promise<MetaWhatsAppTemplate | null> {
  const needle = String(name || '').trim();
  if (!needle) return null;
  try {
    const items = await listApprovedMetaWhatsAppTemplates();
    return items.find((item) => item.name === needle || item.id === needle) ?? null;
  } catch {
    return null;
  }
}

export function buildMetaTemplateBodyParameters(
  variableCount: number,
  mergeContext: Record<string, string>
): string[] {
  const firstName =
    String(
      mergeContext.first_name || mergeContext.FirstName || mergeContext['1'] || ''
    ).trim() || 'there';
  const jobTitle =
    String(
      mergeContext.job_title || mergeContext.JobTitle || mergeContext['2'] || ''
    ).trim() || 'this role';
  const params: string[] = [];
  for (let index = 1; index <= variableCount; index += 1) {
    if (index === 1) {
      params.push(firstName);
      continue;
    }
    if (index === 2) {
      params.push(jobTitle);
      continue;
    }
    params.push(
      String(mergeContext[String(index)] || mergeContext[`var${index}`] || '-').trim() ||
        '-'
    );
  }
  return params;
}
