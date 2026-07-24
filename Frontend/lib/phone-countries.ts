export type PhoneCountry = {
  iso: string;
  name: string;
  dialCode: string;
};

/** Common recruiting markets — India first as product default. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "IN", name: "India", dialCode: "91" },
  { iso: "US", name: "United States", dialCode: "1" },
  { iso: "GB", name: "United Kingdom", dialCode: "44" },
  { iso: "AE", name: "United Arab Emirates", dialCode: "971" },
  { iso: "SG", name: "Singapore", dialCode: "65" },
  { iso: "AU", name: "Australia", dialCode: "61" },
  { iso: "CA", name: "Canada", dialCode: "1" },
  { iso: "DE", name: "Germany", dialCode: "49" },
  { iso: "NL", name: "Netherlands", dialCode: "31" },
  { iso: "IE", name: "Ireland", dialCode: "353" },
  { iso: "PH", name: "Philippines", dialCode: "63" },
  { iso: "MY", name: "Malaysia", dialCode: "60" },
  { iso: "ID", name: "Indonesia", dialCode: "62" },
  { iso: "PK", name: "Pakistan", dialCode: "92" },
  { iso: "BD", name: "Bangladesh", dialCode: "880" },
  { iso: "LK", name: "Sri Lanka", dialCode: "94" },
  { iso: "NP", name: "Nepal", dialCode: "977" },
  { iso: "SA", name: "Saudi Arabia", dialCode: "966" },
  { iso: "QA", name: "Qatar", dialCode: "974" },
  { iso: "KW", name: "Kuwait", dialCode: "965" },
  { iso: "BH", name: "Bahrain", dialCode: "973" },
  { iso: "OM", name: "Oman", dialCode: "968" },
  { iso: "ZA", name: "South Africa", dialCode: "27" },
  { iso: "NG", name: "Nigeria", dialCode: "234" },
  { iso: "KE", name: "Kenya", dialCode: "254" },
  { iso: "FR", name: "France", dialCode: "33" },
  { iso: "ES", name: "Spain", dialCode: "34" },
  { iso: "IT", name: "Italy", dialCode: "39" },
  { iso: "PL", name: "Poland", dialCode: "48" },
  { iso: "SE", name: "Sweden", dialCode: "46" },
  { iso: "CH", name: "Switzerland", dialCode: "41" },
  { iso: "JP", name: "Japan", dialCode: "81" },
  { iso: "KR", name: "South Korea", dialCode: "82" },
  { iso: "CN", name: "China", dialCode: "86" },
  { iso: "HK", name: "Hong Kong", dialCode: "852" },
  { iso: "NZ", name: "New Zealand", dialCode: "64" },
  { iso: "BR", name: "Brazil", dialCode: "55" },
  { iso: "MX", name: "Mexico", dialCode: "52" },
];

export const DEFAULT_PHONE_COUNTRY_ISO = "IN";

export function getPhoneCountry(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.iso === iso) ?? PHONE_COUNTRIES[0]!;
}

/**
 * Build an E.164 mobile from dial code + national number.
 * If the user pasted a full international number (+...), keep it as-is.
 */
export function composeE164Mobile(dialCode: string, nationalNumber: string): string {
  const trimmed = nationalNumber.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }
  const digits = trimmed.replace(/\D/g, "").replace(/^0+/, "");
  if (!digits) return "";
  return `+${dialCode}${digits}`;
}

export function nationalNumberPlaceholder(iso: string): string {
  switch (iso) {
    case "IN":
      return "98765 43210";
    case "US":
    case "CA":
      return "555 123 4567";
    case "GB":
      return "7400 123456";
    case "AE":
      return "50 123 4567";
    default:
      return "Phone number";
  }
}

/**
 * Split a stored phone into country + national digits for the profile/signup inputs.
 * Prefers the longest matching dial code; falls back to India.
 */
export function splitPhoneNumber(phone: string | null | undefined): {
  countryIso: string;
  nationalNumber: string;
} {
  const raw = String(phone || "").trim();
  if (!raw) {
    return { countryIso: DEFAULT_PHONE_COUNTRY_ISO, nationalNumber: "" };
  }

  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return { countryIso: DEFAULT_PHONE_COUNTRY_ISO, nationalNumber: "" };
  }

  const sorted = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );
  for (const country of sorted) {
    if (digits.startsWith(country.dialCode) && digits.length > country.dialCode.length) {
      return {
        countryIso: country.iso,
        nationalNumber: digits.slice(country.dialCode.length),
      };
    }
  }

  return { countryIso: DEFAULT_PHONE_COUNTRY_ISO, nationalNumber: digits };
}
