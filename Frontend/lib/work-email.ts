/** Common personal / consumer mailbox providers blocked at signup. */
const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "hotmail.co.uk",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "zoho.com",
  "zohomail.com",
  "gmx.com",
  "gmx.net",
  "mail.com",
  "inbox.com",
  "fastmail.com",
  "tutanota.com",
  "tutamail.com",
  "yandex.com",
  "yandex.ru",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "rediffmail.com",
]);

const PERSONAL_ROOTS = new Set([
  "gmail",
  "googlemail",
  "yahoo",
  "ymail",
  "hotmail",
  "outlook",
  "live",
  "msn",
  "icloud",
  "aol",
  "proton",
  "protonmail",
  "yandex",
  "rediffmail",
]);

export function isPersonalEmailDomain(domain: string): boolean {
  const normalized = domain.trim().toLowerCase();
  if (PERSONAL_EMAIL_DOMAINS.has(normalized)) return true;
  const root = normalized.split(".")[0];
  if (root && PERSONAL_ROOTS.has(root) && normalized.startsWith(`${root}.`)) {
    return true;
  }
  return false;
}

export function isWorkEmail(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return false;
  const domain = trimmed.slice(at + 1);
  if (!domain.includes(".")) return false;
  return !isPersonalEmailDomain(domain);
}

export const WORK_EMAIL_ERROR =
  "Use a work email address. Personal email providers (Gmail, Outlook, Yahoo, etc.) are not allowed.";

const MULTI_PART_TLDS = new Set([
  "co.in",
  "co.uk",
  "com.au",
  "com.br",
  "co.za",
  "com.sg",
  "co.jp",
  "org.uk",
  "ac.uk",
  "gov.in",
]);

/** Strip common public suffixes so `acme.co.in` → `acme`. */
function registrableLabel(domain: string): string {
  const parts = domain.toLowerCase().split(".").filter(Boolean);
  if (parts.length < 2) return parts[0] || "";
  const lastTwo = parts.slice(-2).join(".");
  if (MULTI_PART_TLDS.has(lastTwo) && parts.length >= 3) {
    return parts[parts.length - 3] || "";
  }
  return parts[0] || "";
}

function titleCaseLabel(label: string): string {
  return label
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function workEmailDomain(email: string): string | null {
  if (!isWorkEmail(email)) return null;
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain || null;
}

/**
 * Derive a company display name from a work email domain.
 * `jane@earlyjobs.ai` → `Earlyjobs`, `ops@acme-corp.com` → `Acme Corp`.
 */
export function companyNameFromWorkEmail(email: string): string | null {
  const domain = workEmailDomain(email);
  if (!domain) return null;
  const label = registrableLabel(domain);
  if (!label || label.length < 2) return null;
  return titleCaseLabel(label).slice(0, 120);
}

/** Public logo lookup for a company domain (Clearbit; caller should handle load errors). */
export function companyLogoUrlFromDomain(domain: string): string {
  return `https://logo.clearbit.com/${encodeURIComponent(domain.trim().toLowerCase())}`;
}

export function companyFaviconUrlFromDomain(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain.trim().toLowerCase())}&sz=64`;
}

/** Extract a hostname from a website URL or bare domain. */
export function domainFromWebsiteOrHost(value: string): string | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const host = new URL(withProtocol).hostname.replace(/^www\./, "");
    if (!host.includes(".")) return null;
    return host;
  } catch {
    const host = raw.replace(/^www\./, "").split("/")[0] || "";
    if (!host.includes(".")) return null;
    return host;
  }
}
