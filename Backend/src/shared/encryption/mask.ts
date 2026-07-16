export function maskSensitiveValue(
  value: string,
  options?: {
    visibleStart?: number;
    visibleEnd?: number;
    maskChar?: string;
  }
): string {
  const visibleStart = options?.visibleStart ?? 0;
  const visibleEnd = options?.visibleEnd ?? 4;
  const maskChar = options?.maskChar ?? '•';

  if (!value) return '';
  if (value.length <= visibleStart + visibleEnd) {
    return maskChar.repeat(Math.max(4, value.length));
  }

  const start = value.slice(0, visibleStart);
  const end = value.slice(-visibleEnd);
  const maskedLength = Math.max(4, value.length - visibleStart - visibleEnd);
  return `${start}${maskChar.repeat(maskedLength)}${end}`;
}

export function maskToken(value: string): string {
  return maskSensitiveValue(value, { visibleStart: 0, visibleEnd: 4 });
}

export function maskSecretKey(value: string): string {
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(12, value.length - 8))}${value.slice(-4)}`;
}
