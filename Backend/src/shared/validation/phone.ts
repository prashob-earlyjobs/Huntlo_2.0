const NON_DIGIT = /\D/g;

/** Strip to digits only. */
function digitsOnly(value: string): string {
  return value.replace(NON_DIGIT, '');
}

/**
 * Normalize phone numbers to E.164-style `+<country><number>`.
 * Handles common Indian inputs (10-digit, 0-prefix, +91, 91-prefix).
 */
export function normalizePhone(value: string, defaultCountryCode = '91'): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Phone number is required');
  }

  if (trimmed.startsWith('+')) {
    const digits = digitsOnly(trimmed);
    if (digits.length < 8 || digits.length > 15) {
      throw new Error('Invalid international phone number');
    }
    return `+${digits}`;
  }

  let digits = digitsOnly(trimmed);

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
    if (digits.length < 8 || digits.length > 15) {
      throw new Error('Invalid international phone number');
    }
    return `+${digits}`;
  }

  if (defaultCountryCode === '91') {
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.slice(2);
    }
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return `+91${digits}`;
    }
  }

  if (digits.startsWith(defaultCountryCode) && digits.length > defaultCountryCode.length + 6) {
    return `+${digits}`;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return `+${defaultCountryCode}${digits}`;
  }

  throw new Error('Invalid phone number');
}

export function isValidPhone(value: string, defaultCountryCode = '91'): boolean {
  try {
    normalizePhone(value, defaultCountryCode);
    return true;
  } catch {
    return false;
  }
}

export function maskPhone(value: string): string {
  try {
    const normalized = normalizePhone(value);
    const visible = normalized.slice(-4);
    return `••••••${visible}`;
  } catch {
    return '••••••••••';
  }
}
