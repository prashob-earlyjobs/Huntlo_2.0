"use client";

import { Input } from "@/components/ui/input";

const MAX_SPAN_DAYS = 365;

function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDefaultUtmDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  from.setUTCDate(from.getUTCDate() - 29);
  return { from: toYmd(from), to: toYmd(to) };
}

export function normalizeUtmDateRange(
  from: string,
  to: string
): { from: string; to: string } {
  if (!from || !to) return getDefaultUtmDateRange();

  let nextFrom = from;
  let nextTo = to;
  if (nextFrom > nextTo) {
    nextFrom = to;
    nextTo = from;
  }

  const start = new Date(`${nextFrom}T00:00:00.000Z`);
  const end = new Date(`${nextTo}T00:00:00.000Z`);
  const span =
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (span > MAX_SPAN_DAYS) {
    const clamped = new Date(end);
    clamped.setUTCDate(clamped.getUTCDate() - (MAX_SPAN_DAYS - 1));
    nextFrom = toYmd(clamped);
  }

  return { from: nextFrom, to: nextTo };
}

export function UtmDateRangeControls({
  from,
  to,
  onChange,
  disabled,
}: {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0">From</span>
        <Input
          type="date"
          value={from}
          disabled={disabled}
          aria-label="From date"
          className="h-8 w-[140px] text-sm text-foreground"
          onChange={(event) =>
            onChange(normalizeUtmDateRange(event.target.value, to))
          }
        />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0">To</span>
        <Input
          type="date"
          value={to}
          disabled={disabled}
          aria-label="To date"
          className="h-8 w-[140px] text-sm text-foreground"
          onChange={(event) =>
            onChange(normalizeUtmDateRange(from, event.target.value))
          }
        />
      </label>
    </div>
  );
}
