export type BrightDataFilterFieldType = 'text' | 'number' | 'boolean' | 'url' | 'date';

export type BrightDataFilterField = {
  name: string;
  type: BrightDataFilterFieldType;
  label: string;
  description: string;
  quickFilter: boolean;
  pii: boolean;
};

type MetadataField = {
  type?: string;
  active?: boolean;
  description?: string;
  quick_filter?: boolean;
  pii?: boolean;
  unsupported?: unknown;
  fields?: Record<string, MetadataField>;
  items?: { type?: string; fields?: Record<string, MetadataField> };
};

const SCALAR = new Set(['text', 'number', 'boolean', 'url', 'date', 'image']);
const SKIP_LEAFS = new Set([
  'description_html',
  'img',
  'company_logo_url',
  'institute_logo_url',
  'banner_image',
  'avatar',
]);

function asFieldMap(value: unknown): Record<string, MetadataField> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, MetadataField>;
}

function humanize(path: string): string {
  return path
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function asType(raw: string | undefined): BrightDataFilterFieldType {
  if (raw === 'number' || raw === 'boolean' || raw === 'url' || raw === 'date') return raw;
  return 'text';
}

function walk(
  fields: Record<string, MetadataField>,
  prefix: string,
  out: BrightDataFilterField[]
): void {
  for (const [key, def] of Object.entries(fields)) {
    if (!def || def.active === false) continue;
    if (def.unsupported) continue;
    if (SKIP_LEAFS.has(key)) continue;
    const name = prefix ? `${prefix}.${key}` : key;
    const nested = asFieldMap(def.fields);
    const itemFields = asFieldMap(def.items?.fields);

    if (Object.keys(nested).length) {
      walk(nested, name, out);
      continue;
    }
    if (def.type === 'array' && Object.keys(itemFields).length) {
      walk(itemFields, name, out);
      continue;
    }
    if (def.type === 'object') continue;
    if (def.type && !SCALAR.has(def.type) && def.type !== 'array') continue;
    if (def.type === 'array') continue;

    out.push({
      name,
      type: asType(def.type),
      label: humanize(name),
      description: typeof def.description === 'string' ? def.description : '',
      quickFilter: def.quick_filter === true,
      pii: def.pii === true,
    });
  }
}

export function catalogFromMetadataFields(fields: unknown): BrightDataFilterField[] {
  const catalog: BrightDataFilterField[] = [];
  walk(asFieldMap(fields), '', catalog);
  catalog.sort((a, b) => {
    if (a.quickFilter !== b.quickFilter) return a.quickFilter ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
  return catalog;
}

export const MOCK_BRIGHTDATA_METADATA_FIELDS: Record<string, MetadataField> = {
  name: { type: 'text', active: true, description: 'Profile name', pii: true },
  city: { type: 'text', active: true, description: 'Geographical location of the user' },
  country_code: {
    type: 'text',
    active: true,
    description: 'Two-letter country code',
    quick_filter: true,
  },
  position: { type: 'text', active: true, description: 'Current job title' },
  about: { type: 'text', active: true, description: 'Profile summary', pii: true },
  current_company: {
    type: 'object',
    active: true,
    fields: {
      name: { type: 'text', active: true, description: 'The name of the company' },
      title: { type: 'text', active: true, description: 'The position' },
      location: { type: 'text', active: true, description: 'Location' },
    },
  },
  current_company_name: {
    type: 'text',
    active: true,
    description: 'The name of the latest/current company',
  },
  location: { type: 'text', active: true, description: 'Geographical location of the user' },
  languages: {
    type: 'array',
    active: true,
    items: {
      type: 'object',
      fields: {
        title: { type: 'text', active: true, description: 'Language' },
      },
    },
  },
  url: { type: 'url', active: true, description: 'LinkedIn profile URL', pii: true },
  educations_details: {
    type: 'text',
    active: true,
    description: "Provides information about the user's educational background",
  },
  education: {
    type: 'array',
    active: true,
    items: {
      type: 'object',
      fields: {
        title: { type: 'text', active: true, description: 'School name' },
        degree: { type: 'text', active: true, description: 'Education degree' },
        field: { type: 'text', active: true, description: 'Field of study' },
      },
    },
  },
  experience: {
    type: 'array',
    active: true,
    items: {
      type: 'object',
      fields: {
        title: { type: 'text', active: true, description: 'Job title in a role' },
        company: { type: 'text', active: true, description: 'Employer name' },
        location: { type: 'text', active: true, description: 'Role location' },
        description: { type: 'text', active: true, description: 'Role description' },
        duration: { type: 'text', active: true, description: 'Time in role' },
        start_date: { type: 'text', active: true, description: 'Start date' },
        end_date: { type: 'text', active: true, description: 'End date' },
      },
    },
  },
};
