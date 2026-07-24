/**
 * Timezone helpers for interview scheduling — DST-safe using Intl.
 */

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function isValidIanaTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Normalize FE labels like "Asia/Kolkata (IST)" → "Asia/Kolkata". */
export function normalizeTimezone(input: string | null | undefined, fallback = 'Asia/Kolkata'): string {
  const raw = String(input || '').trim();
  if (!raw) return fallback;
  const iana = raw.split(/\s+/)[0] || raw;
  if (iana.toLowerCase().includes('candidate')) return fallback;
  return isValidIanaTimezone(iana) ? iana : fallback;
}

export function zonedParts(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number; hour: number; minute: number; weekday: string } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'long',
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    weekday: get('weekday'),
  };
}

/**
 * Convert a local wall-clock time in `timeZone` to a UTC Date.
 * Uses iterative offset resolution so DST transitions are handled correctly.
 */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  // Initial guess: treat components as UTC
  let utc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  for (let i = 0; i < 3; i += 1) {
    const parts = zonedParts(new Date(utc), timeZone);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      0,
      0
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
    utc += desired - asUtc;
  }
  return new Date(utc);
}

export function formatInTimezone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    ...options,
  }).format(date);
}

export function dateKeyInTimezone(date: Date, timeZone: string): string {
  const p = zonedParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function timeLabelInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function weekdayName(date: Date, timeZone: string): string {
  return zonedParts(date, timeZone).weekday || DAY_NAMES[date.getUTCDay()]!;
}

/** Offset minutes east of UTC at the given instant in the zone (DST-aware). */
export function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = zonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    0,
    0
  );
  return Math.round((asUtc - date.getTime()) / 60_000);
}
