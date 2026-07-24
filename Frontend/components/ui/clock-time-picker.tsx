"use client";

import { useMemo, useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type AmPm = "AM" | "PM";

type ClockMode = "hour" | "minute";

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;
const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

type ClockTimePickerProps = {
  id?: string;
  hour12: number;
  minute: number;
  ampm: AmPm;
  onChange: (next: { hour12: number; minute: number; ampm: AmPm }) => void;
  className?: string;
};

function dialPoint(index: number, radius: number, size: number) {
  const angle = ((index % 12) * 30 - 90) * (Math.PI / 180);
  const center = size / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function formatClockLabel(hour12: number, minute: number, ampm: AmPm) {
  return `${hour12}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export function ClockTimePicker({
  id,
  hour12,
  minute,
  ampm,
  onChange,
  className,
}: ClockTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClockMode>("hour");

  const size = 220;
  const radius = 78;
  const handRadius = 58;
  const selectedIndex =
    mode === "hour"
      ? hour12 % 12
      : Math.round(minute / 5) % 12;
  const hand = dialPoint(selectedIndex, handRadius, size);

  const ticks = useMemo(() => {
    if (mode === "hour") {
    return HOURS.map((hour, index) => ({
      value: hour,
      label: String(hour),
      index,
      selected: hour === hour12,
    }));
    }
    return MINUTE_OPTIONS.map((value, index) => ({
      value,
      label: String(value).padStart(2, "0"),
      index,
      selected: value === minute,
    }));
  }, [hour12, minute, mode]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setMode("hour");
      }}
    >
      <PopoverTrigger
        id={id}
        type="button"
        aria-label="Time"
        className={cn(
          "flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          className
        )}
      >
        <span className="tabular-nums">{formatClockLabel(hour12, minute, ampm)}</span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="z-[100] w-[272px] gap-3 p-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1 font-medium tabular-nums">
            <button
              type="button"
              onClick={() => setMode("hour")}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-2xl outline-none transition-colors",
                mode === "hour"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {hour12}
            </button>
            <span className="text-2xl text-muted-foreground">:</span>
            <button
              type="button"
              onClick={() => setMode("minute")}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-2xl outline-none transition-colors",
                mode === "minute"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {String(minute).padStart(2, "0")}
            </button>
          </div>
          <div
            role="group"
            aria-label="AM or PM"
            className="grid grid-cols-2 overflow-hidden rounded-md border border-border"
          >
            {(["AM", "PM"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={ampm === option}
                onClick={() => onChange({ hour12, minute, ampm: option })}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-medium outline-none transition-colors",
                  ampm === option
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          className="relative mx-auto rounded-full bg-muted/70"
          style={{ width: size, height: size }}
          role="group"
          aria-label={mode === "hour" ? "Hour clock" : "Minute clock"}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0"
            aria-hidden
          >
            <line
              x1={size / 2}
              y1={size / 2}
              x2={hand.x}
              y2={hand.y}
              stroke="var(--primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r="4.5"
              fill="var(--primary)"
            />
          </svg>

          {ticks.map((tick) => {
            const point = dialPoint(tick.index, radius, size);
            return (
              <button
                key={`${mode}-${tick.value}`}
                type="button"
                aria-label={
                  mode === "hour"
                    ? `${tick.value} o'clock`
                    : `${tick.label} minutes`
                }
                aria-pressed={tick.selected}
                onClick={() => {
                  if (mode === "hour") {
                    onChange({ hour12: tick.value, minute, ampm });
                    setMode("minute");
                    return;
                  }
                  onChange({ hour12, minute: tick.value, ampm });
                }}
                className={cn(
                  "absolute flex size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
                  tick.selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-background/80"
                )}
                style={{ left: point.x, top: point.y }}
              >
                {tick.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {mode === "hour" ? "Select hour" : "Select minutes"}
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground outline-none hover:opacity-90"
          >
            Done
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
