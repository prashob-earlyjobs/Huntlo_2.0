"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Field, ToggleRow } from "@/components/outreach/builder-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage, schedulingApi } from "@/lib/api";
import {
  AVAILABILITY_DEFAULTS,
  DATE_OVERRIDES,
  DEFAULT_WEEKLY_HOURS,
  TIMEZONE_OPTIONS,
  UNAVAILABLE_DATES,
  type WeeklyHourSlot,
} from "@/lib/mock-schedule";
import { cn } from "@/lib/utils";

export function AvailabilityWorkspace() {
  const [weekly, setWeekly] = useState<WeeklyHourSlot[]>(DEFAULT_WEEKLY_HOURS);
  const [overrides, setOverrides] = useState(DATE_OVERRIDES);
  const [unavailable, setUnavailable] = useState(UNAVAILABLE_DATES);
  const [bufferBefore, setBufferBefore] = useState(
    AVAILABILITY_DEFAULTS.bufferBefore
  );
  const [bufferAfter, setBufferAfter] = useState(
    AVAILABILITY_DEFAULTS.bufferAfter
  );
  const [minNotice, setMinNotice] = useState(AVAILABILITY_DEFAULTS.minNotice);
  const [maxWindow, setMaxWindow] = useState(AVAILABILITY_DEFAULTS.maxWindow);
  const [dailyLimit, setDailyLimit] = useState(AVAILABILITY_DEFAULTS.dailyLimit);
  const [timezone, setTimezone] = useState(AVAILABILITY_DEFAULTS.timezone);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rule = await schedulingApi.getAvailability();
        if (cancelled) return;
        setWeekly((rule.weeklyHours as WeeklyHourSlot[]) || DEFAULT_WEEKLY_HOURS);
        setOverrides(
          (rule.dateOverrides || []).map((row, index) => ({
            id: `o-${row.date}-${index}`,
            date: row.date,
            label:
              row.label ||
              new Date(`${row.date}T12:00:00`).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
            available: row.enabled !== false,
            hours:
              row.start && row.end ? `${row.start} – ${row.end}` : undefined,
          }))
        );
        setUnavailable(
          (rule.unavailableDates || []).map((date, index) => ({
            id: `u-${date}-${index}`,
            date,
            label: new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
          }))
        );        setBufferBefore(rule.bufferBefore);
        setBufferAfter(rule.bufferAfter);
        setMinNotice(rule.minimumNotice);
        setMaxWindow(rule.maximumBookingWindow);
        setDailyLimit(rule.dailyLimit);
        const match = TIMEZONE_OPTIONS.find((option) =>
          option.startsWith(rule.timezone)
        );
        setTimezone(match || rule.timezone);
      } catch {
        // Keep mock defaults when API unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateDay(day: string, patch: Partial<WeeklyHourSlot>) {
    setWeekly((previous) =>
      previous.map((slot) =>
        slot.day === day ? { ...slot, ...patch } : slot
      )
    );
  }

  function flashSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  async function handleSave() {
    setError(null);
    try {
      const parseMinutes = (value: string | number, fallback: number) => {
        if (typeof value === "number") return value;
        const match = String(value).match(/\d+/);
        return match ? Number(match[0]) : fallback;
      };
      await schedulingApi.putAvailability({
        timezone: timezone.split(" ")[0] || timezone,
        weeklyHours: weekly,
        dateOverrides: overrides.map((row) => ({
          date: row.date,
          enabled: row.available !== false,
          start: null,
          end: null,
          label: row.label ?? null,
        })),
        unavailableDates: unavailable.map((row) =>
          typeof row === "string" ? row : row.date
        ),
        bufferBefore: parseMinutes(bufferBefore, 15),
        bufferAfter: parseMinutes(bufferAfter, 15),
        minimumNotice: parseMinutes(minNotice, 24),
        maximumBookingWindow: parseMinutes(maxWindow, 14),
        dailyLimit: parseMinutes(dailyLimit, 6),
      });
      flashSave();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      {saved ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          Availability saved.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {/* Weekly hours */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Weekly hours</h2>
          <p className="text-xs text-muted-foreground">
            Default bookable windows for interview scheduling links.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {weekly.map((slot) => (
            <li
              key={slot.day}
              className="flex flex-wrap items-center gap-3 px-4 py-2.5"
            >
              <label className="flex w-28 items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={(event) =>
                    updateDay(slot.day, { enabled: event.target.checked })
                  }
                  className="size-3.5 accent-primary"
                />
                {slot.day}
              </label>
              <Input
                type="time"
                value={slot.start}
                disabled={!slot.enabled}
                onChange={(event) =>
                  updateDay(slot.day, { start: event.target.value })
                }
                aria-label={`${slot.day} start`}
                className="w-32"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="time"
                value={slot.end}
                disabled={!slot.enabled}
                onChange={(event) =>
                  updateDay(slot.day, { end: event.target.value })
                }
                aria-label={`${slot.day} end`}
                className="w-32"
              />
              {!slot.enabled ? (
                <span className="text-xs text-muted-foreground">Unavailable</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Date overrides */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Date overrides
              </h2>
              <p className="text-xs text-muted-foreground">
                One-off changes to a specific day&apos;s hours.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                setOverrides((previous) => [
                  ...previous,
                  {
                    id: `o-${Date.now()}`,
                    date: "2026-07-24",
                    label: "Fri, Jul 24",
                    available: true,
                    hours: "09:00 – 12:00 only",
                  },
                ])
              }
            >
              <Plus aria-hidden />
              Add
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {overrides.map((override) => (
              <li
                key={override.id}
                className="flex flex-wrap items-center gap-2 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {override.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {override.available
                      ? override.hours ?? "Custom hours"
                      : "Unavailable"}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[11px] font-medium",
                    override.available
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {override.available ? "Open" : "Closed"}
                </span>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remove override ${override.label}`}
                  onClick={() =>
                    setOverrides((previous) =>
                      previous.filter((item) => item.id !== override.id)
                    )
                  }
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        </section>

        {/* Unavailable dates */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Unavailable dates
              </h2>
              <p className="text-xs text-muted-foreground">
                Block entire days from booking links.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                setUnavailable((previous) => [
                  ...previous,
                  {
                    id: `u-${Date.now()}`,
                    date: "2026-07-31",
                    label: "Fri, Jul 31 · Blocked",
                  },
                ])
              }
            >
              <Plus aria-hidden />
              Add
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {unavailable.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 px-4 py-2.5"
              >
                <p className="min-w-0 flex-1 text-sm text-foreground">
                  {item.label}
                </p>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Remove ${item.label}`}
                  onClick={() =>
                    setUnavailable((previous) =>
                      previous.filter((entry) => entry.id !== item.id)
                    )
                  }
                >
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Buffers & limits */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Buffers and limits
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Protect interviewer focus time and control how far ahead candidates
          can book.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Buffer before" htmlFor="av-before">
            <Select
              value={bufferBefore}
              onValueChange={(value) => value && setBufferBefore(value)}
            >
              <SelectTrigger id="av-before" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0 min", "5 min", "10 min", "15 min", "30 min"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Buffer after" htmlFor="av-after">
            <Select
              value={bufferAfter}
              onValueChange={(value) => value && setBufferAfter(value)}
            >
              <SelectTrigger id="av-after" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0 min", "5 min", "10 min", "15 min", "30 min"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Minimum scheduling notice" htmlFor="av-notice">
            <Select
              value={minNotice}
              onValueChange={(value) => value && setMinNotice(value)}
            >
              <SelectTrigger id="av-notice" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2 hours", "4 hours", "12 hours", "24 hours", "48 hours"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Maximum booking window" htmlFor="av-window">
            <Select
              value={maxWindow}
              onValueChange={(value) => value && setMaxWindow(value)}
            >
              <SelectTrigger id="av-window" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["7 days", "14 days", "21 days", "30 days", "60 days"].map(
                  (value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Interview limits per day" htmlFor="av-limit">
            <Select
              value={dailyLimit}
              onValueChange={(value) => value && setDailyLimit(value)}
            >
              <SelectTrigger id="av-limit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["2", "3", "4", "5", "6", "8", "10"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value} interviews
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Timezone" htmlFor="av-tz">
            <Select
              value={timezone}
              onValueChange={(value) => value && setTimezone(value)}
            >
              <SelectTrigger id="av-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONE_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <ToggleRow
            id="av-sync"
            label="Apply to all interviewers on my team"
            description="UI preview only — no calendar sync is performed."
            checked={false}
            onChange={() => undefined}
            disabled
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => void handleSave()}>
            Save availability
          </Button>
        </div>
      </section>
    </div>
  );
}
