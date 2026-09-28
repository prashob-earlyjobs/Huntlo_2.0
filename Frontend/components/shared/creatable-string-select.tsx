"use client";

import { useId, useMemo } from "react";
import CreatableSelect from "react-select/creatable";

import {
  stringSelectStyles,
  type StringSelectOption,
} from "@/components/shared/react-select-styles";

function buildOptions(
  suggestions: readonly string[],
  value: string
): StringSelectOption[] {
  const seen = new Set<string>();
  const out: StringSelectOption[] = [];
  const push = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ value: label, label });
  };
  if (value.trim()) push(value);
  for (const item of suggestions) push(item);
  return out;
}

export function CreatableStringSelect({
  id,
  value,
  onChange,
  options: suggestionOptions,
  placeholder = "Select or type…",
  invalid,
  isClearable = true,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  invalid?: boolean;
  isClearable?: boolean;
}) {
  const reactId = useId();
  const inputId = id || `creatable-select-${reactId}`;

  const options = useMemo(
    () => buildOptions(suggestionOptions, value),
    [suggestionOptions, value]
  );

  const selected = useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return { value: trimmed, label: trimmed } satisfies StringSelectOption;
  }, [value]);

  return (
    <CreatableSelect<StringSelectOption, false>
      inputId={inputId}
      instanceId={inputId}
      classNamePrefix="huntlo-select"
      isClearable={isClearable}
      placeholder={placeholder}
      options={options}
      value={selected}
      styles={stringSelectStyles(invalid)}
      formatCreateLabel={(inputValue) => {
        const next = inputValue.trim();
        return next ? `Add “${next}”` : "Add value";
      }}
      isValidNewOption={(inputValue) => inputValue.trim().length > 0}
      onCreateOption={(inputValue) => onChange(inputValue.trim())}
      onChange={(option) => onChange(option?.value?.trim() ?? "")}
      noOptionsMessage={() => "Type to add a department"}
      aria-invalid={invalid || undefined}
    />
  );
}
