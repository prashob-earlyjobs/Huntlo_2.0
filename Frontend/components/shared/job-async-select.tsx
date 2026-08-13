"use client";

import { useEffect, useId, useState } from "react";
import AsyncSelect from "react-select/async";
import type { GroupBase, StylesConfig } from "react-select";

import { jobsApi } from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";

export type JobOption = {
  value: string;
  label: string;
  meta?: string;
};

function toOption(job: Pick<JobListItem, "id" | "title" | "location" | "status">): JobOption {
  const location = job.location && job.location !== "—" ? job.location : "";
  return {
    value: job.id,
    label: location ? `${job.title} · ${location}` : job.title,
    meta: job.status,
  };
}

const selectStyles: StylesConfig<JobOption, false, GroupBase<JobOption>> = {
  control: (base, state) => ({
    ...base,
    minHeight: 32,
    borderRadius: 6,
    borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    boxShadow: state.isFocused
      ? "0 0 0 2px color-mix(in oklab, var(--ring) 50%, transparent)"
      : "none",
    // Match shadcn Input: transparent on card (not page --background).
    backgroundColor: "transparent",
    "&:hover": {
      borderColor: state.isFocused ? "var(--ring)" : "var(--input)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    paddingInline: 10,
    backgroundColor: "transparent",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: 14,
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: 14,
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: 14,
    backgroundColor: "transparent",
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 50,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    backgroundColor: state.isSelected
      ? "var(--brand-subtle)"
      : state.isFocused
        ? "var(--muted)"
        : "transparent",
    color: state.isSelected ? "var(--primary)" : "var(--foreground)",
    cursor: "pointer",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    padding: 6,
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    padding: 6,
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: 13,
  }),
  loadingMessage: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: 13,
  }),
};

async function searchJobs(input: string): Promise<JobOption[]> {
  const items = await jobsApi.list({
    search: input.trim() || undefined,
    limit: 25,
    page: 1,
  });
  return items
    .filter((job) => job.status === "Active" || job.status === "Paused")
    .map(toOption);
}

export function JobAsyncSelect({
  value,
  onChange,
  invalid,
  inputId,
  placeholder = "Search jobs…",
  isClearable = false,
}: {
  value: string | null;
  onChange: (jobId: string | null) => void;
  invalid?: boolean;
  inputId?: string;
  placeholder?: string;
  isClearable?: boolean;
}) {
  const reactId = useId();
  const resolvedInputId = inputId || `job-async-${reactId}`;
  const [selected, setSelected] = useState<JobOption | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setSelected(null);
      return;
    }
    if (selected?.value === value) return;

    void jobsApi
      .getById(value)
      .then((job) => {
        if (cancelled || !job) return;
        setSelected(toOption(job));
      })
      .catch(() => {
        if (!cancelled) {
          setSelected({ value, label: "Selected job" });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once when value changes
  }, [value]);

  return (
    <AsyncSelect<JobOption, false>
      inputId={resolvedInputId}
      instanceId={resolvedInputId}
      cacheOptions
      defaultOptions
      isClearable={isClearable}
      placeholder={placeholder}
      value={selected}
      loadOptions={searchJobs}
      onChange={(option) => {
        setSelected(option);
        onChange(option?.value ?? null);
      }}
      styles={{
        ...selectStyles,
        control: (base, state) => {
          const next = selectStyles.control
            ? selectStyles.control(base, state)
            : base;
          return {
            ...next,
            backgroundColor: "transparent",
            borderColor: invalid
              ? "var(--destructive)"
              : state.isFocused
                ? "var(--ring)"
                : "var(--input)",
          };
        },
      }}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? "No matching jobs" : "No open jobs found"
      }
      loadingMessage={() => "Searching jobs…"}
      aria-invalid={invalid || undefined}
    />
  );
}
