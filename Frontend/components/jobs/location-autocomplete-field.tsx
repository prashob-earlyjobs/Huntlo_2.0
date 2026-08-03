"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { autocompleteCandidateFilter } from "@/lib/api/candidate-search";
import { JOB_LOCATIONS } from "@/lib/mock-jobs";
import { cn } from "@/lib/utils";

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

export function LocationAutocompleteField({
  id,
  value,
  onChange,
  placeholder = "Search location…",
  invalid = false,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteError, setAutocompleteError] = useState(false);

  useEffect(() => {
    if (!open) return;
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
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
          filter_type: "region",
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
  }, [open, query]);

  const options = useMemo(() => {
    const trimmedQuery = query.trim();
    const source =
      trimmedQuery.length >= 2
        ? suggestions
        : [...JOB_LOCATIONS, ...(value ? [value] : [])];

    return source.filter(
      (option, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.toLocaleLowerCase() === option.toLocaleLowerCase()
        ) === index
    );
  }, [query, suggestions, value]);

  const filtered = useMemo(() => {
    if (query.trim().length >= 2) return options;
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.toLowerCase().includes(needle));
  }, [options, query]);

  const canUseQuery =
    query.trim().length >= 2 &&
    !filtered.some(
      (option) => option.toLocaleLowerCase() === query.trim().toLocaleLowerCase()
    );

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
    setSuggestions([]);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setSuggestions([]);
        }
      }}
    >
      <PopoverTrigger
        id={id}
        type="button"
        aria-invalid={invalid}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          "flex h-8 w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        )}
      >
        <span
          className={cn(
            "truncate text-left",
            !value && "text-muted-foreground"
          )}
        >
          {value || "Select location"}
        </span>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <div className="border-b border-border p-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            aria-label="Search locations"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter" && canUseQuery) {
                event.preventDefault();
                select(query.trim());
              }
            }}
          />
        </div>
        <div
          id={listboxId}
          className="max-h-56 overflow-y-auto p-1"
          role="listbox"
        >
          {query.trim().length >= 2 && loading ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Loading suggestions…
            </p>
          ) : query.trim().length >= 2 && autocompleteError ? (
            <p className="px-2 py-4 text-center text-xs text-destructive">
              Could not load suggestions
            </p>
          ) : filtered.length === 0 && !canUseQuery ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {query.trim().length < 2
                ? "Type at least 2 characters to search"
                : `No locations match “${query.trim()}”`}
            </p>
          ) : (
            <>
              {canUseQuery ? (
                <button
                  type="button"
                  role="option"
                  onClick={() => select(query.trim())}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  Use “{query.trim()}”
                </button>
              ) : null}
              {filtered.map((option, index) => {
                const isActive =
                  value.toLocaleLowerCase() === option.toLocaleLowerCase();
                return (
                  <button
                    key={`${option}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => select(option)}
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
              })}
            </>
          )}
        </div>
        {value ? (
          <div className="border-t border-border p-1.5">
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="w-full"
              onClick={() => select("")}
            >
              Clear location
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
