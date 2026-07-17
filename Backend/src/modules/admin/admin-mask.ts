import { maskEmail } from '../../shared/validation/email.js';
import { maskPhone } from '../../shared/validation/phone.js';
import { maskSensitiveValue } from '../../shared/encryption/mask.js';

export function maskAdminEmail(email: string | null | undefined): string {
  if (!email) return '';
  return maskEmail(email);
}

export function maskAdminPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  return maskPhone(phone);
}

export function maskAdminName(name: string | null | undefined): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return maskSensitiveValue(parts[0]!, { visibleStart: 1, visibleEnd: 0 });
  return `${parts[0]} ${maskSensitiveValue(parts.slice(1).join(' '), { visibleStart: 1, visibleEnd: 0 })}`;
}

export function formatCount(n: number): string {
  return n.toLocaleString('en-IN');
}
