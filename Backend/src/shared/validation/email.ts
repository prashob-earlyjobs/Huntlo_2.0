const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Common personal / consumer mailbox providers blocked at signup. */
const PERSONAL_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'hotmail.co.uk',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'zoho.com',
  'zohomail.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'inbox.com',
  'fastmail.com',
  'tutanota.com',
  'tutamail.com',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'qq.com',
  '163.com',
  '126.com',
  'rediffmail.com',
]);

const PERSONAL_ROOTS = new Set([
  'gmail',
  'googlemail',
  'yahoo',
  'ymail',
  'hotmail',
  'outlook',
  'live',
  'msn',
  'icloud',
  'aol',
  'proton',
  'protonmail',
  'yandex',
  'rediffmail',
]);

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

export function emailDomain(value: string): string | null {
  try {
    const normalized = normalizeEmail(value);
    const domain = normalized.split('@')[1];
    return domain || null;
  } catch {
    return null;
  }
}

export function isPersonalEmailDomain(domain: string): boolean {
  const normalized = domain.trim().toLowerCase();
  if (PERSONAL_EMAIL_DOMAINS.has(normalized)) return true;
  const root = normalized.split('.')[0];
  if (root && PERSONAL_ROOTS.has(root) && normalized.startsWith(`${root}.`)) {
    return true;
  }
  return false;
}

export function isWorkEmail(value: string): boolean {
  const domain = emailDomain(value);
  if (!domain) return false;
  return !isPersonalEmailDomain(domain);
}

export function assertWorkEmail(value: string): string {
  const normalized = normalizeEmail(value);
  if (!isWorkEmail(normalized)) {
    throw new Error('Use a work email address. Personal email providers are not allowed.');
  }
  return normalized;
}

export function maskEmail(value: string): string {
  const normalized = normalizeEmail(value);
  const [local, domain] = normalized.split('@');
  if (!local || !domain) return '••••@••••';
  const visible = local.length <= 2 ? local[0] ?? '*' : local.slice(0, 2);
  return `${visible}•••@${domain}`;
}
