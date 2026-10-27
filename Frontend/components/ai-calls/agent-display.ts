export function agentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AI";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function languageFlag(language: string): string {
  const value = language.toLowerCase();
  if (!value) return "";
  if (value.includes("hindi") || value.includes("indian")) return "🇮🇳";
  if (value.includes("english")) return "🇺🇸";
  if (value.includes("spanish")) return "🇪🇸";
  if (value.includes("french")) return "🇫🇷";
  if (value.includes("arabic")) return "🇸🇦";
  return "🌐";
}

export function languageLabel(language: string): string {
  const value = language.trim();
  if (!value) return "Language unset";
  return `Language: ${value.replace(/[()]/g, " ").replace(/\s+/g, " ").trim()}`;
}

export function formatAgentDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export function shortAgentId(id: string): string {
  const value = id.trim();
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)} …`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function agentAvatarUrl(record: Record<string, unknown>): string {
  const voice = asRecord(record.voice);
  return String(voice.image || voice.avatar || record.image || record.avatar || "").trim();
}

export function agentVoiceLabel(record: Record<string, unknown>): string {
  const voice = asRecord(record.voice);
  return String(voice.alias || voice.name || "").trim();
}

export function inputKeysFromRecord(record: Record<string, unknown>): string[] {
  const inputs = asRecord(record.inputs_needed);
  return Object.keys(inputs).filter((key) => key && key !== "contact_id");
}
