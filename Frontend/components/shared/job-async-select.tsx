"use client";

import { useEffect, useId, useState } from "react";
import AsyncSelect from "react-select/async";

import { stringSelectStyles } from "@/components/shared/react-select-styles";
import { jobsApi } from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";

export type JobOption = {
  value: string;
  label: string;
  meta?: string;
};

function toOption(job: Pick<JobListItem, "id" | "title" | "location" | "status">): JobOption {
  const rawLocation = String(job.location || "").trim();
  const location = rawLocation && rawLocation !== "—" ? rawLocation : "";
  return {
    value: job.id,
    label: location ? `${job.title} · ${location}` : job.title,
    meta: job.status,
  };
}

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
        ...stringSelectStyles(invalid),
        loadingMessage: (base) => ({
          ...base,
          color: "var(--muted-foreground)",
          fontSize: 13,
        }),
      }}
      noOptionsMessage={({ inputValue }) =>
        inputValue ? "No matching jobs" : "No open jobs found"
      }
      loadingMessage={() => "Searching jobs…"}
      aria-invalid={invalid || undefined}
    />
  );
}
