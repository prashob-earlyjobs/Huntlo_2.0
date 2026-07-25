"use client";

import { forwardRef, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  ClockTimePicker,
  type AmPm,
} from "@/components/ui/clock-time-picker";
import { cn } from "@/lib/utils";

type DateTimePickerProps = {
  id?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  className?: string;
  placeholder?: string;
};

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const;

const DatePickerInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(function DatePickerInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
});

function toParts(value: Date | null): {
  date: Date | null;
  hour12: number;
  minute: number;
  ampm: AmPm;
} {
  if (!value || Number.isNaN(value.getTime())) {
    return { date: null, hour12: 10, minute: 0, ampm: "AM" };
  }
  const hour24 = value.getHours();
  const minuteRaw = value.getMinutes();
  const minute = MINUTE_OPTIONS.reduce((best, option) =>
    Math.abs(option - minuteRaw) < Math.abs(best - minuteRaw) ? option : best
  );
  return {
    date: value,
    hour12: hour24 % 12 === 0 ? 12 : hour24 % 12,
    minute,
    ampm: hour24 >= 12 ? "PM" : "AM",
  };
}

function combineParts(
  date: Date | null,
  hour12: number,
  minute: number,
  ampm: AmPm,
  fallbackDate: Date
): Date {
  const base = date ? new Date(date) : new Date(fallbackDate);
  let hour24 = hour12 % 12;
  if (ampm === "PM") hour24 += 12;
  base.setHours(hour24, minute, 0, 0);
  return base;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function DateTimePicker({
  id,
  value,
  onChange,
  minDate,
  className,
  placeholder = "Select date",
}: DateTimePickerProps) {
  const parts = useMemo(() => toParts(value), [value]);
  const earliest = minDate ?? new Date();
  const minDay = useMemo(() => {
    const day = minDate ? new Date(minDate) : startOfToday();
    day.setHours(0, 0, 0, 0);
    return day;
  }, [minDate]);

  function emit(
    nextDate: Date | null,
    hour12: number,
    minute: number,
    ampm: AmPm
  ) {
    const next = combineParts(
      nextDate,
      hour12,
      minute,
      ampm,
      parts.date ?? earliest
    );
    onChange(next.getTime() < earliest.getTime() ? new Date(earliest) : next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <DatePicker
          id={id}
          selected={parts.date}
          onChange={(date) =>
            emit(date, parts.hour12, parts.minute, parts.ampm)
          }
          dateFormat="MMM d, yyyy"
          minDate={minDay}
          placeholderText={placeholder}
          customInput={<DatePickerInput aria-label="Date" />}
          wrapperClassName="block w-full min-w-0 flex-1"
          calendarClassName="huntlo-datepicker"
          popperClassName="huntlo-datepicker-popper !z-[100]"
          withPortal
          portalId="huntlo-datepicker-portal"
        />

        <ClockTimePicker
          id={id ? `${id}-time` : undefined}
          hour12={parts.hour12}
          minute={parts.minute}
          ampm={parts.ampm}
          className="w-full sm:w-[7.75rem] sm:shrink-0"
          onChange={({ hour12, minute, ampm }) =>
            emit(parts.date, hour12, minute, ampm)
          }
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Choose a date, then open the clock to set 12-hour time and AM/PM.
      </p>
    </div>
  );
}
