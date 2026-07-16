const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function normalizeEmail(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new Error('Invalid email address');
  }
  return trimmed;
}

export function isValidEmail(value: string): boolean {
  try {
    normalizeEmail(value);
    return true;
  } catch {
    return false;
  }
}

export function maskEmail(value: string): string {
  const normalized = normalizeEmail(value);
  const [local, domain] = normalized.split('@');
  if (!local || !domain) return '••••@••••';
  const visible = local.length <= 2 ? local[0] ?? '*' : local.slice(0, 2);
  return `${visible}•••@${domain}`;
}
