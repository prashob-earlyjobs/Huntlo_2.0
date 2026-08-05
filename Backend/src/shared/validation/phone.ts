const NON_DIGIT = /\D/g;

/** Strip to digits only. */
function digitsOnly(value: string): string {
  return value.replace(NON_DIGIT, '');
}

/**
 * Repair US/Canada numbers that were wrongly stored as +91 + NANP
 * (e.g. +9114066922124 → +14066922124).
 * Indian mobiles after country code are 10 digits; 91 + 11 digits starting
 * with 1 is the classic mis-prefix of a full NANP number.
 */
function repairMangledNanpAsIndia(digits: string): string | null {
  const match = /^91(1\d{10})$/.exec(digits);
  return match ? `+${match[1]}` : null;
}

/**
 * Normalize phone numbers to E.164-style `+<country><number>`.
 * Handles common Indian inputs (10-digit, 0-prefix, +91, 91-prefix)
 * and NANP (+1) when entered as 11 digits starting with 1 (e.g. 14065551212).
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
    const repaired = repairMangledNanpAsIndia(digits);
    if (repaired) return repaired;
    return `+${digits}`;
  }

  let digits = digitsOnly(trimmed);

  if (digits.startsWith('00')) {
    digits = digits.slice(2);
    if (digits.length < 8 || digits.length > 15) {
      throw new Error('Invalid international phone number');
    }
    const repaired = repairMangledNanpAsIndia(digits);
    if (repaired) return repaired;
    return `+${digits}`;
  }

  // US/Canada NANP: 11 digits starting with country code 1 (e.g. 14066922124).
  // Must run before defaulting to +91, or we produce invalid +9114….
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Already-mangled form without '+': 9114066922124
  {
    const repaired = repairMangledNanpAsIndia(digits);
    if (repaired) return repaired;
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
