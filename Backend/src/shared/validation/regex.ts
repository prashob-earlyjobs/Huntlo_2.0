/** Escape user input before embedding in MongoDB `$regex` to avoid ReDoS / injection. */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function caseInsensitiveContains(value: string): RegExp {
  return new RegExp(escapeRegex(value.trim()), 'i');
}
