/**
 * Clamp a candidate send time into an outreach send window (allowed hours + days of week)
 * in a given timezone. Reuses the DST-safe zone helpers from the scheduling module.
 */
import { normalizeTimezone, zonedLocalToUtc, zonedParts } from '../scheduling/timezone.js';

export type SendWindow = {
  startHour: number;
  endHour: number;
  daysOfWeek?: number[] | null;
  timezone?: string | null;
} | null | undefined;

/** Sunday = 0 … Saturday = 6, matching Date.prototype.getDay() / the campaign schema convention. */
const WEEKDAY_NUMBER: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Move `fromDate` forward (never backward) to the next moment that falls inside
 * `sendWindow` (start/end hour + allowed days) when evaluated in `timezone`.
 * Returns `fromDate` unchanged when no window is configured.
 */
export function nextSendAtWithinWindow(
  fromDate: Date,
  sendWindow: SendWindow,
  timezone?: string | null
): Date {
  if (!sendWindow) return fromDate;

  const startHour = Number.isFinite(sendWindow.startHour) ? sendWindow.startHour : 0;
  const endHour = Number.isFinite(sendWindow.endHour) ? sendWindow.endHour : 24;
  const daysOfWeek =
    sendWindow.daysOfWeek && sendWindow.daysOfWeek.length ? sendWindow.daysOfWeek : null;

  // No real constraint — avoid the timezone round-trip entirely.
  if (startHour <= 0 && endHour >= 24 && !daysOfWeek) return fromDate;

  const tz = normalizeTimezone(sendWindow.timezone || timezone);
  let candidate = fromDate;

  // Bounded loop — at most ~2 weeks of day-skipping before we give up and return as-is.
  for (let i = 0; i < 15; i += 1) {
    const parts = zonedParts(candidate, tz);
    const dayNumber = WEEKDAY_NUMBER[parts.weekday] ?? candidate.getUTCDay();

    if (daysOfWeek && !daysOfWeek.includes(dayNumber)) {
      candidate = zonedLocalToUtc(parts.year, parts.month, parts.day + 1, startHour, 0, tz);
      continue;
    }
    if (parts.hour < startHour) {
      return zonedLocalToUtc(parts.year, parts.month, parts.day, startHour, 0, tz);
    }
    if (parts.hour >= endHour) {
      candidate = zonedLocalToUtc(parts.year, parts.month, parts.day + 1, startHour, 0, tz);
      continue;
    }
    return candidate;
  }
  return candidate;
}
