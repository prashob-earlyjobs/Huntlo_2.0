"use client";

import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { autocompleteCandidateFilter } from "@/lib/api/candidate-search";
import type { RangeValue } from "@/lib/mock-search";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Multi-select combobox with option search                             */
/* ------------------------------------------------------------------ */

export function MultiSelectField({
  label,
  options,
  values,
  onChange,
  placeholder = "Search…",
  autocompleteFilterType,
}: {
  label: string;
  options: readonly string[];
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  autocompleteFilterType?: string;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(false);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!autocompleteFilterType || trimmedQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setAutocompleteError(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setAutocompleteError(false);
      try {
        const result = await autocompleteCandidateFilter({
          filter_type: autocompleteFilterType,
          query: trimmedQuery,
          limit: 10,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setSuggestions(
          result.suggestions
            .map(normalizeAutocompleteSuggestion)
            .filter((item): item is string => item !== null)
            .filter(
              (item, index, all) =>
                all.findIndex(
                  (candidate) =>
                    candidate.toLocaleLowerCase() === item.toLocaleLowerCase()
                ) === index
            )
        );
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setAutocompleteError(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [autocompleteFilterType, query]);

  const availableOptions = useMemo(() => {
    // Autocomplete results are already ranked by the provider — show them first
    // without requiring a local substring match (provider may use fuzzy matching).
    const source = autocompleteFilterType
      ? [...suggestions, ...values]
      : [...suggestions, ...options, ...values];
    return source.filter(
      (option, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase() === option.toLocaleLowerCase()
        ) === index
    );
  }, [autocompleteFilterType, options, suggestions, values]);

  const filtered = useMemo(() => {
    if (autocompleteFilterType && suggestions.length > 0) {
      return availableOptions;
    }
    const needle = query.trim().toLowerCase();
    if (!needle) return availableOptions;
    return availableOptions.filter((option) =>
      option.toLowerCase().includes(needle)
    );
  }, [autocompleteFilterType, availableOptions, query, suggestions.length]);

  function toggle(option: string) {
    onChange(
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option]
    );
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            setQuery("");
            setSuggestions([]);
          }
        }}
      >
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between font-normal"
            />
          }
        >
          <span className="truncate text-left">
            {values.length === 0
              ? "Any"
              : values.length <= 2
                ? values.join(", ")
                : `${values.length} selected`}
          </span>
          <ChevronDown aria-hidden className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <div className="border-b border-border p-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              aria-label={`Search ${label.toLowerCase()} options`}
              className="h-7 text-sm"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1" role="listbox" aria-multiselectable>
            {autocompleteFilterType && query.trim().length < 2 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Type at least 2 characters
              </p>
            ) : loading ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Loading suggestions…
              </p>
            ) : autocompleteError ? (
              <p className="px-2 py-4 text-center text-xs text-destructive">
                Could not load suggestions
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                No options match “{query}”
              </p>
            ) : (
              filtered.map((option, index) => {
                const isActive = values.includes(option);
                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => toggle(option)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                      isActive && "text-primary"
                    )}
                  >
                    <span className="truncate">{option}</span>
                    {isActive ? (
                      <Check aria-hidden className="size-3.5 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
          {values.length > 0 ? (
            <div className="border-t border-border p-1.5">
              <Button
                type="button"
                size="xs"
                variant="ghost"
                className="w-full"
                onClick={() => onChange([])}
              >
                <X aria-hidden />
                Clear {values.length} selected
              </Button>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className="inline-flex items-center gap-1 rounded-md bg-brand-subtle px-1.5 py-0.5 text-xs font-medium text-primary outline-none hover:bg-brand-subtle/70 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {value}
              <X aria-hidden className="size-3" />
              <span className="sr-only">Remove {value}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function normalizeAutocompleteSuggestion(suggestion: unknown): string | null {
  if (typeof suggestion === "string") {
    const value = suggestion.trim();
    return value || null;
  }
  if (!suggestion || typeof suggestion !== "object") return null;

  const record = suggestion as Record<string, unknown>;
  for (const key of ["label", "name", "value", "title", "text"]) {
    if (typeof record[key] === "string" && record[key].trim()) {
      return record[key].trim();
    }
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Free-text tag input                                                  */
/* ------------------------------------------------------------------ */

export function TagInputField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-1.5">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          aria-label={`Add ${label.toLowerCase()}`}
          className="h-7 text-sm"
        />
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={commit}
          aria-label={`Add to ${label.toLowerCase()}`}
        >
          <Plus aria-hidden />
        </Button>
      </div>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground outline-none hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {value}
              <X aria-hidden className="size-3" />
              <span className="sr-only">Remove {value}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toggle switch                                                        */
/* ------------------------------------------------------------------ */

export function ToggleField({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm text-foreground">
          {label}
        </Label>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow transition-transform",
            checked && "translate-x-4"
          )}
        />
        <span className="sr-only">Toggle {label}</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Range with dual-thumb slider                                         */
/* ------------------------------------------------------------------ */

const THUMB_CLASSES =
  "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent outline-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-3 focus-visible:[&::-webkit-slider-thumb]:ring-ring/50";

export function RangeField({
  label,
  min,
  max,
  unit,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  unit?: string;
  value: RangeValue;
  onChange: (value: RangeValue) => void;
}) {
  const low = value.min ?? min;
  const high = value.max ?? max;
  const lowPct = ((low - min) / (max - min)) * 100;
  const highPct = ((high - min) / (max - min)) * 100;

  function setLow(next: number) {
    onChange({ min: Math.min(next, high), max: value.max });
  }
  function setHigh(next: number) {
    onChange({ min: value.min, max: Math.max(next, low) });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
        <span className="text-xs tabular-nums text-muted-foreground">
          {low.toLocaleString("en-IN")}–{high.toLocaleString("en-IN")}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <div className="relative h-5">
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-muted" />
        <div
          aria-hidden
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${lowPct}%`, width: `${Math.max(highPct - lowPct, 0)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={(event) => setLow(Number(event.target.value))}
          aria-label={`${label} minimum`}
          className={THUMB_CLASSES}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={(event) => setHigh(Number(event.target.value))}
          aria-label={`${label} maximum`}
          className={THUMB_CLASSES}
        />
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value.min ?? ""}
          placeholder={String(min)}
          onChange={(event) =>
            onChange({
              min: event.target.value === "" ? null : Number(event.target.value),
              max: value.max,
            })
          }
          aria-label={`${label} minimum value`}
          className="h-7 text-sm"
        />
        <span aria-hidden className="text-xs text-muted-foreground">
          to
        </span>
        <Input
          type="number"
          min={min}
          max={max}
          value={value.max ?? ""}
          placeholder={String(max)}
          onChange={(event) =>
            onChange({
              min: value.min,
              max: event.target.value === "" ? null : Number(event.target.value),
            })
          }
          aria-label={`${label} maximum value`}
          className="h-7 text-sm"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Single select                                                        */
/* ------------------------------------------------------------------ */

export function SelectFilterField({
  label,
  options,
  value,
  onChange,
  className,
  hideLabel = false,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  hideLabel?: boolean;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        className={cn(
          "text-xs font-medium text-muted-foreground",
          hideLabel && "sr-only"
        )}
      >
        {label}
      </Label>
      <Select value={value || options[0]} onValueChange={(next) => next && onChange(next)}>
        <SelectTrigger size="sm" className="w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
