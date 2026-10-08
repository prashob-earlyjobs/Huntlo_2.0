/** Dial codes used on signup. Longer codes are matched first. +1 defaults to US. */
const DIAL_COUNTRIES: { iso: string; dialCode: string }[] = [
  { iso: 'IN', dialCode: '91' },
  { iso: 'US', dialCode: '1' },
  { iso: 'CA', dialCode: '1' },
  { iso: 'GB', dialCode: '44' },
  { iso: 'AE', dialCode: '971' },
  { iso: 'SG', dialCode: '65' },
  { iso: 'AU', dialCode: '61' },
  { iso: 'DE', dialCode: '49' },
  { iso: 'NL', dialCode: '31' },
  { iso: 'IE', dialCode: '353' },
  { iso: 'PH', dialCode: '63' },
  { iso: 'MY', dialCode: '60' },
  { iso: 'ID', dialCode: '62' },
  { iso: 'PK', dialCode: '92' },
  { iso: 'BD', dialCode: '880' },
  { iso: 'LK', dialCode: '94' },
  { iso: 'NP', dialCode: '977' },
  { iso: 'SA', dialCode: '966' },
  { iso: 'QA', dialCode: '974' },
  { iso: 'KW', dialCode: '965' },
  { iso: 'BH', dialCode: '973' },
  { iso: 'OM', dialCode: '968' },
  { iso: 'ZA', dialCode: '27' },
  { iso: 'NG', dialCode: '234' },
  { iso: 'KE', dialCode: '254' },
  { iso: 'FR', dialCode: '33' },
  { iso: 'ES', dialCode: '34' },
  { iso: 'IT', dialCode: '39' },
  { iso: 'PL', dialCode: '48' },
  { iso: 'SE', dialCode: '46' },
  { iso: 'CH', dialCode: '41' },
  { iso: 'JP', dialCode: '81' },
  { iso: 'KR', dialCode: '82' },
  { iso: 'CN', dialCode: '86' },
  { iso: 'HK', dialCode: '852' },
  { iso: 'NZ', dialCode: '64' },
  { iso: 'BR', dialCode: '55' },
  { iso: 'MX', dialCode: '52' },
];

const KNOWN_ISO = new Set(DIAL_COUNTRIES.map((country) => country.iso));
const BY_LONGEST_DIAL = [...DIAL_COUNTRIES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

/**
 * Organization country from the signup dial selection, else the phone's dial code.
 * Returns an ISO code (e.g. "US"). Falls back to India when the number is unknown.
 */
export function countryIsoFromDial(input: {
  countryIso?: string | null;
  phone?: string | null;
}): string {
  const explicit = String(input.countryIso || '')
    .trim()
    .toUpperCase();
  if (KNOWN_ISO.has(explicit)) return explicit;

  const digits = String(input.phone || '').replace(/\D/g, '');
  if (digits) {
    for (const country of BY_LONGEST_DIAL) {
      if (digits.startsWith(country.dialCode) && digits.length > country.dialCode.length) {
        return country.iso;
      }
    }
  }

  return 'IN';
}
