/**
 * Coerce skill/signal values into display strings.
 * Filters the common "[object Object]" cast from provider skill objects.
 */
export function normalizeLabelList(values: unknown, cap = 40): string[] {
  if (!Array.isArray(values)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of values) {
    let label = "";
    if (typeof item === "string") {
      label = item.trim();
    } else if (typeof item === "number" && Number.isFinite(item)) {
      label = String(item);
    } else if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      for (const key of [
        "name",
        "skill",
        "label",
        "title",
        "value",
        "text",
        "skill_name",
        "skillName",
      ]) {
        if (typeof record[key] === "string" && record[key].trim()) {
          label = record[key].trim();
          break;
        }
      }
    }
    if (!label || label === "[object Object]") continue;
    const key = label.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
    if (out.length >= cap) break;
  }
  return out;
}
