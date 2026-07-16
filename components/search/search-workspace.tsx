"use client";

import Link from "next/link";
import {
  Bookmark,
  Briefcase,
  Check,
  Coins,
  Eraser,
  FileText,
  PenLine,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { FilterPanel } from "@/components/search/filter-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { JOBS } from "@/lib/mock-jobs";
import {
  EXAMPLE_QUERIES,
  FILTER_FIELD_INDEX,
  INTERPRETED_CRITERIA,
  INTERPRETED_FILTER_STATE,
  SEARCH_QUOTA,
  estimateReach,
  isFieldActive,
  type FilterValue,
  type InterpretedCriterion,
  type SearchFilterState,
} from "@/lib/mock-search";
import { sessionDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

function formatFilterValue(value: FilterValue): string {
  if (typeof value === "boolean") return "Yes";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  const low = value.min !== null ? NUMBER_FORMAT.format(value.min) : "";
  const high = value.max !== null ? NUMBER_FORMAT.format(value.max) : "";
  if (low && high) return `${low}–${high}`;
  if (low) return `${low}+`;
  return `up to ${high}`;
}

/* ------------------------------------------------------------------ */
/* AI interpretation panel                                              */
/* ------------------------------------------------------------------ */

function InterpretationPanel({
  criteria,
  onEdit,
  onRemove,
  onApply,
  applied,
}: {
  criteria: InterpretedCriterion[];
  onEdit: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onApply: () => void;
  applied: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  return (
    <section
      aria-labelledby="ai-interpretation-heading"
      className="rounded-xl border border-primary/20 bg-brand-subtle/40 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles aria-hidden className="size-4 text-primary" />
          </span>
          <div>
            <h2
              id="ai-interpretation-heading"
              className="text-sm font-semibold text-foreground"
            >
              AI interpretation
            </h2>
            <p className="text-xs text-muted-foreground">
              Review how your description was translated into criteria. Edit or
              remove anything before searching.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={applied ? "outline" : "default"}
          onClick={onApply}
          disabled={applied || criteria.length === 0}
        >
          {applied ? (
            <>
              <Check aria-hidden />
              Applied to filters
            </>
          ) : (
            "Apply to filters"
          )}
        </Button>
      </div>

      {criteria.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          All interpreted criteria were removed. Re-generate filters or add
          criteria manually in the filter panel.
        </p>
      ) : (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {criteria.map((criterion) => {
            const isEditing = editingId === criterion.id;
            return (
              <li
                key={criterion.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {criterion.label}
                  </p>
                  {isEditing ? (
                    <Input
                      autoFocus
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onEdit(criterion.id, draft);
                          setEditingId(null);
                        }
                        if (event.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => {
                        onEdit(criterion.id, draft);
                        setEditingId(null);
                      }}
                      aria-label={`Edit ${criterion.label}`}
                      className="mt-1 h-7 text-sm"
                    />
                  ) : (
                    <p className="truncate text-sm font-medium text-foreground">
                      {criterion.value}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Edit ${criterion.label}`}
                    onClick={() => {
                      setEditingId(criterion.id);
                      setDraft(criterion.value);
                    }}
                  >
                    <PenLine aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Remove ${criterion.label}`}
                    onClick={() => onRemove(criterion.id)}
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Workspace                                                            */
/* ------------------------------------------------------------------ */

export function SearchWorkspace() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilterState>({});
  const [criteria, setCriteria] = useState<InterpretedCriterion[] | null>(null);
  const [criteriaApplied, setCriteriaApplied] = useState(false);
  const [saveSearch, setSaveSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const selectedJob = JOBS.find((job) => job.id === selectedJobId);

  const activeEntries = useMemo(
    () =>
      Object.entries(filters).filter(
        ([fieldId, value]) =>
          FILTER_FIELD_INDEX[fieldId] && isFieldActive(value)
      ),
    [filters]
  );
  const activeCount = activeEntries.length;

  const reach = useMemo(
    () => estimateReach(activeCount, query.trim().length > 0),
    [activeCount, query]
  );

  function setField(fieldId: string, value: FilterValue | undefined) {
    setFilters((previous) => {
      const next = { ...previous };
      if (value === undefined) {
        delete next[fieldId];
      } else {
        next[fieldId] = value;
      }
      return next;
    });
  }

  function resetSection(sectionId: string) {
    setFilters((previous) =>
      Object.fromEntries(
        Object.entries(previous).filter(
          ([fieldId]) => FILTER_FIELD_INDEX[fieldId]?.sectionId !== sectionId
        )
      )
    );
  }

  function resetAll() {
    setFilters({});
    setCriteriaApplied(false);
  }

  function generateFilters() {
    if (!query.trim()) return;
    setCriteria(INTERPRETED_CRITERIA);
    setCriteriaApplied(false);
  }

  function applyCriteria() {
    if (!criteria) return;
    const activeFieldIds = new Set(criteria.map((item) => item.fieldId));
    const next: SearchFilterState = { ...filters };
    for (const [fieldId, value] of Object.entries(INTERPRETED_FILTER_STATE)) {
      if (activeFieldIds.has(fieldId)) next[fieldId] = value;
    }
    setFilters(next);
    setCriteriaApplied(true);
  }

  function clearSearch() {
    setQuery("");
    setCriteria(null);
    setCriteriaApplied(false);
    setSearched(false);
  }

  function useJobDescription() {
    const job = selectedJob ?? JOBS[0];
    if (!selectedJobId) setSelectedJobId(job.id);
    setQuery(
      `Find ${job.title.toLowerCase()}s in ${job.location} with ${job.experienceMin}–${job.experienceMax} years of experience for the ${job.department} team.`
    );
    setCriteria(null);
    setCriteriaApplied(false);
  }

  function runSearch() {
    setSearching(true);
    window.setTimeout(() => {
      setSearching(false);
      setSearched(true);
      router.push(sessionDetailPath("s1"));
    }, 900);
  }

  const canSearch = query.trim().length > 0 || activeCount > 0;

  const filterPanel = (
    <FilterPanel
      filters={filters}
      onFieldChange={setField}
      onResetSection={resetSection}
      onResetAll={resetAll}
      activeCount={activeCount}
    />
  );

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
      <div className="min-w-0 space-y-4">
        {/* Natural-language search */}
        <section
          aria-labelledby="nl-search-heading"
          className="rounded-xl border border-primary/20 bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-subtle">
                <Sparkles aria-hidden className="size-4 text-primary" />
              </span>
              <h2
                id="nl-search-heading"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Describe your ideal candidate
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={selectedJobId}
                onValueChange={(value) => setSelectedJobId(value)}
              >
                <SelectTrigger
                  size="sm"
                  className="max-w-56"
                  aria-label="Select job"
                >
                  <Briefcase
                    aria-hidden
                    className="size-3.5 shrink-0 text-muted-foreground"
                  />
                  <SelectValue placeholder="Select Job" />
                </SelectTrigger>
                <SelectContent>
                  {JOBS.filter((job) =>
                    ["Active", "Draft", "Paused"].includes(job.status)
                  ).map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={useJobDescription}
              >
                <FileText aria-hidden />
                Use Job Description
              </Button>
            </div>
          </div>

          <Textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find backend engineers in Bengaluru with 4–7 years of experience, Node.js and AWS skills, currently working at SaaS companies."
            aria-label="Describe the candidates you are looking for"
            className="mt-3 min-h-24 resize-none bg-background text-sm"
          />

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Try:</span>
              {EXAMPLE_QUERIES.slice(1).map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setQuery(example)}
                  className="inline-flex h-6 max-w-72 items-center truncate rounded-full border border-border bg-muted/50 px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {example}
                </button>
              ))}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearSearch}
                disabled={!query && !criteria}
              >
                <Eraser aria-hidden />
                Clear Search
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={generateFilters}
                disabled={!query.trim()}
              >
                <Sparkles aria-hidden />
                Generate Filters
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={runSearch}
                disabled={!canSearch || searching}
              >
                <Search aria-hidden />
                {searching ? "Searching…" : "Search Candidates"}
              </Button>
            </div>
          </div>
        </section>

        {/* Mobile filter sheet */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button type="button" size="sm" variant="outline" className="w-full" />
              }
            >
              <SlidersHorizontal aria-hidden />
              Advanced Filters
              {activeCount > 0 ? (
                <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                  {activeCount}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Advanced filters</SheetTitle>
                <SheetDescription className="sr-only">
                  Refine candidate search criteria by experience, location, skills and more
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1">{filterPanel}</div>
            </SheetContent>
          </Sheet>
        </div>

        {/* AI interpretation */}
        {criteria !== null ? (
          <InterpretationPanel
            criteria={criteria}
            applied={criteriaApplied}
            onApply={applyCriteria}
            onEdit={(id, value) =>
              setCriteria((previous) =>
                previous
                  ? previous.map((item) =>
                      item.id === id && value.trim()
                        ? { ...item, value: value.trim() }
                        : item
                    )
                  : previous
              )
            }
            onRemove={(id) => {
              setCriteria((previous) =>
                previous ? previous.filter((item) => item.id !== id) : previous
              );
              setCriteriaApplied(false);
            }}
          />
        ) : null}

        {/* Active filter summary */}
        <section
          aria-labelledby="active-filters-heading"
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="active-filters-heading"
              className="text-sm font-semibold text-foreground"
            >
              Active filters
              <span className="ml-1.5 rounded-sm bg-muted px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
                {activeCount}
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="size-3.5" />
                Est. reach{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {NUMBER_FORMAT.format(reach.low)}–{NUMBER_FORMAT.format(reach.high)}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Coins aria-hidden className="size-3.5" />
                Cost{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {SEARCH_QUOTA.costPerSearch} credits
                </span>
              </span>
              <span>
                Quota{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {NUMBER_FORMAT.format(SEARCH_QUOTA.remaining)}
                </span>{" "}
                of {NUMBER_FORMAT.format(SEARCH_QUOTA.total)}
              </span>
            </div>
          </div>

          {activeCount === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No filters applied yet. Generate filters from your description or
              refine manually in the filter panel.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeEntries.map(([fieldId, value]) => {
                const meta = FILTER_FIELD_INDEX[fieldId];
                return (
                  <button
                    key={fieldId}
                    type="button"
                    onClick={() => setField(fieldId, undefined)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-xs outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <span className="font-medium text-muted-foreground">
                      {meta.field.label}:
                    </span>
                    <span className="max-w-48 truncate font-medium text-foreground">
                      {formatFilterValue(value)}
                    </span>
                    <X aria-hidden className="size-3 text-muted-foreground" />
                    <span className="sr-only">Remove {meta.field.label} filter</span>
                  </button>
                );
              })}
              <Button type="button" size="xs" variant="ghost" onClick={resetAll}>
                Clear all
              </Button>
            </div>
          )}
        </section>

        {/* Search preview */}
        <section
          aria-labelledby="search-preview-heading"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2
            id="search-preview-heading"
            className="text-sm font-semibold text-foreground"
          >
            Search preview
          </h2>
          <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Search summary
              </dt>
              <dd className="mt-0.5 text-foreground">
                {query.trim()
                  ? query.trim()
                  : activeCount > 0
                    ? `Structured search with ${activeCount} filter${activeCount === 1 ? "" : "s"}`
                    : "Describe candidates above or apply filters to build a search."}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Expected results
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                {canSearch
                  ? `${NUMBER_FORMAT.format(reach.low)} – ${NUMBER_FORMAT.format(reach.high)} candidates`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Quota cost
              </dt>
              <dd className="mt-0.5 font-medium tabular-nums text-foreground">
                {SEARCH_QUOTA.costPerSearch} credits ·{" "}
                {NUMBER_FORMAT.format(SEARCH_QUOTA.remaining - SEARCH_QUOTA.costPerSearch)}{" "}
                remaining after search
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Selected job
              </dt>
              <dd className="mt-0.5 text-foreground">
                {selectedJob ? (
                  <>
                    {selectedJob.title}
                    <span className="text-muted-foreground">
                      {" "}
                      · {selectedJob.location}
                    </span>
                  </>
                ) : (
                  "No job linked"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted-foreground">
                Save search
              </dt>
              <dd className="mt-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={saveSearch}
                  onClick={() => setSaveSearch((previous) => !previous)}
                  className="inline-flex items-center gap-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors",
                      saveSearch ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow transition-transform",
                        saveSearch && "translate-x-4"
                      )}
                    />
                  </span>
                  <Bookmark aria-hidden className="size-3.5 text-muted-foreground" />
                  Save this search for reuse
                </button>
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            {searched ? (
              <p className="text-sm text-success">
                Search complete —{" "}
                <Link
                  href={sessionDetailPath("s1")}
                  className="font-medium underline underline-offset-4"
                >
                  view results
                </Link>
                .
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Searches run against the live candidate graph. UI preview uses
                mock data only.
              </p>
            )}
            <Button
              type="button"
              size="sm"
              onClick={runSearch}
              disabled={!canSearch || searching}
            >
              <Search aria-hidden />
              {searching ? "Searching…" : "Search Candidates"}
            </Button>
          </div>
        </section>
      </div>

      {/* Desktop filter sidebar */}
      <aside className="sticky top-20 hidden max-h-[calc(100svh-6rem)] overflow-hidden rounded-xl border border-border bg-card lg:block">
        {filterPanel}
      </aside>
    </div>
  );
}
