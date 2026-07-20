"use client";

import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: string };

export function OptionCardList<T extends string>({
  options,
  value,
  multiple = false,
  onChange,
}: {
  options: Option<T>[];
  value: T | T[] | null;
  multiple?: boolean;
  onChange: (next: T | T[]) => void;
}) {
  function toggle(option: T) {
    if (multiple) {
      const current = Array.isArray(value) ? value : [];
      if (current.includes(option)) {
        onChange(current.filter((item) => item !== option));
      } else {
        onChange([...current, option]);
      }
      return;
    }
    onChange(option);
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const selected = multiple
          ? Array.isArray(value) && value.includes(option.value)
          : value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={cn(
              "rounded-lg border px-4 py-3 text-left text-sm transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background hover:bg-muted/60"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
