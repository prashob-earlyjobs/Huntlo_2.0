/**
 * Coerce provider skill/tag values (string or { name|skill|label|... }) into clean strings.
 * Avoids String(object) → "[object Object]" which breaks React list keys and UI chips.
 */
export function labelFromUnknown(value: unknown): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '[object Object]' ? '' : trimmed;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (!value || typeof value !== 'object') return '';

  const record = value as Record<string, unknown>;
  for (const key of [
    'name',
    'skill',
    'label',
    'title',
    'value',
    'text',
    'skill_name',
    'skillName',
  ]) {
    const entry = record[key];
    if (typeof entry === 'string' && entry.trim()) return entry.trim();
  }
  return '';
}

export function labelListFromUnknown(value: unknown, cap = 40): string[] {
  if (!Array.isArray(value)) {
    const single = labelFromUnknown(value);
    return single ? [single] : [];
  }

  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    const label = labelFromUnknown(item);
    if (!label) continue;
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= cap) break;
  }
  return out;
}
