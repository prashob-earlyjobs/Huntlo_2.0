"use client";

import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  MultiSelectField,
  RangeField,
  SelectFilterField,
  TagInputField,
  ToggleField,
} from "@/components/search/filter-controls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FILTER_SECTIONS,
  isFieldActive,
  type FilterField,
  type FilterSection,
  type FilterValue,
  type RangeValue,
  type SearchFilterState,
} from "@/lib/mock-search";
import { cn } from "@/lib/utils";

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FilterField;
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
}) {
  switch (field.type) {
    case "multi":
      return (
        <MultiSelectField
          label={field.label}
          options={field.options ?? []}
          values={Array.isArray(value) ? value : []}
          onChange={(next) => onChange(next.length > 0 ? next : undefined)}
          placeholder={field.placeholder}
        />
      );
    case "tags":
      return (
        <TagInputField
          label={field.label}
          values={Array.isArray(value) ? value : []}
          onChange={(next) => onChange(next.length > 0 ? next : undefined)}
          placeholder={field.placeholder}
        />
      );
    case "toggle":
      return (
        <ToggleField
          label={field.label}
          hint={field.hint}
          checked={value === true}
          onChange={(next) => onChange(next ? true : undefined)}
        />
      );
    case "range":
      return (
        <RangeField
          label={field.label}
          min={field.min ?? 0}
          max={field.max ?? 100}
          unit={field.unit}
          value={
            value && typeof value === "object" && !Array.isArray(value)
              ? (value as RangeValue)
              : { min: null, max: null }
          }
          onChange={(next) =>
            onChange(
              next.min === null && next.max === null ? undefined : next
            )
          }
        />
      );
    case "select":
      return (
        <SelectFilterField
          label={field.label}
          options={field.options ?? []}
          value={typeof value === "string" ? value : ""}
          onChange={(next) =>
            onChange(next === field.options?.[0] ? undefined : next)
          }
        />
      );
  }
}

function SectionBlock({
  section,
  filters,
  onFieldChange,
  onResetSection,
  forceOpen,
}: {
  section: FilterSection;
  filters: SearchFilterState;
  onFieldChange: (fieldId: string, value: FilterValue | undefined) => void;
  onResetSection: (sectionId: string) => void;
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(section.id === "titles");
  const isOpen = forceOpen || open;

  const activeCount = section.fields.filter((field) =>
    isFieldActive(filters[field.id])
  ).length;

  return (
    <section className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={isOpen}
          className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted">
            <section.icon aria-hidden className="size-3.5 text-muted-foreground" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              {section.title}
              {activeCount > 0 ? (
                <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                  {activeCount}
                </span>
              ) : null}
            </span>
            <span className="block text-xs text-muted-foreground">
              {section.description}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>
        {activeCount > 0 ? (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            className="mr-2 shrink-0"
            onClick={() => onResetSection(section.id)}
            aria-label={`Reset ${section.title} filters`}
          >
            <RotateCcw aria-hidden />
          </Button>
        ) : null}
      </div>
      {isOpen ? (
        <div className="space-y-4 px-3 pt-1 pb-4">
          {section.fields.map((field) => (
            <FieldControl
              key={field.id}
              field={field}
              value={filters[field.id]}
              onChange={(value) => onFieldChange(field.id, value)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function FilterPanel({
  filters,
  onFieldChange,
  onResetSection,
  onResetAll,
  activeCount,
  className,
}: {
  filters: SearchFilterState;
  onFieldChange: (fieldId: string, value: FilterValue | undefined) => void;
  onResetSection: (sectionId: string) => void;
  onResetAll: () => void;
  activeCount: number;
  className?: string;
}) {
  const [sectionQuery, setSectionQuery] = useState("");

  const visibleSections = useMemo(() => {
    if (!sectionQuery) return FILTER_SECTIONS;
    const query = sectionQuery.toLowerCase();
    return FILTER_SECTIONS.map((section) => {
      const sectionMatches = section.title.toLowerCase().includes(query);
      const fields = sectionMatches
        ? section.fields
        : section.fields.filter((field) =>
            field.label.toLowerCase().includes(query)
          );
      return fields.length > 0 ? { ...section, fields } : null;
    }).filter((section): section is FilterSection => section !== null);
  }, [sectionQuery]);

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="space-y-2 border-b border-border p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            Advanced filters
          </h2>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={onResetAll}
            disabled={activeCount === 0}
          >
            <RotateCcw aria-hidden />
            Reset all
          </Button>
        </div>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={sectionQuery}
            onChange={(event) => setSectionQuery(event.target.value)}
            placeholder="Search filters…"
            aria-label="Search filter sections"
            className="h-7 pl-8 text-sm"
          />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {visibleSections.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">
            No filters match “{sectionQuery}”
          </p>
        ) : (
          visibleSections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              filters={filters}
              onFieldChange={onFieldChange}
              onResetSection={onResetSection}
              forceOpen={sectionQuery.length > 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
