"use client";

import {
  AudioLines,
  Download,
  ListPlus,
  Search,
  Send,
  SlidersHorizontal,
  Trash2,
  UserRoundCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { CreateListDialog } from "@/components/candidates/create-list-dialog";
import { ImportCandidatesDialog } from "@/components/candidates/import-dialog";
import { PoolTable } from "@/components/candidates/pool-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  CANDIDATE_STATUSES,
  CONTACT_AVAILABILITY,
  LIST_NAMES,
  POOL_CANDIDATES,
  POOL_LOCATIONS,
  POOL_OWNERS,
  POOL_SAVED_VIEWS,
  POOL_SOURCES,
  type PoolCandidate,
} from "@/lib/mock-candidates";
import { JOBS } from "@/lib/mock-jobs";

const EXPERIENCE_BUCKETS = [
  { id: "any", label: "Any experience", min: 0, max: Infinity },
  { id: "0-3", label: "0 – 3 yrs", min: 0, max: 3 },
  { id: "4-6", label: "4 – 6 yrs", min: 4, max: 6 },
  { id: "7-10", label: "7 – 10 yrs", min: 7, max: 10 },
  { id: "10+", label: "10+ yrs", min: 10, max: Infinity },
] as const;

const SKILL_OPTIONS = Array.from(
  new Set(POOL_CANDIDATES.flatMap((candidate) => candidate.skills))
).sort();

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function contactMatches(candidate: PoolCandidate, availability: string) {
  switch (availability) {
    case "Email revealed":
      return candidate.emailRevealed;
    case "Mobile revealed":
      return candidate.phoneRevealed;
    case "Both revealed":
      return candidate.emailRevealed && candidate.phoneRevealed;
    case "None revealed":
      return !candidate.emailRevealed && !candidate.phoneRevealed;
    default:
      return true;
  }
}

export function PoolWorkspace() {
  const [query, setQuery] = useState("");
  const [savedView, setSavedView] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [listFilter, setListFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("any");
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [contactFilter, setContactFilter] = useState<string>("Any contact");
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);

  const jobTitles = useMemo(() => {
    const ids = new Set(
      POOL_CANDIDATES.map((candidate) => candidate.relatedJobId).filter(Boolean)
    );
    return JOBS.filter((job) => ids.has(job.id)).map((job) => ({
      id: job.id,
      label: job.title,
    }));
  }, []);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const filtered = useMemo(() => {
    const bucket = EXPERIENCE_BUCKETS.find((entry) => entry.id === experience)!;
    const normalized = query.trim().toLowerCase();
    return POOL_CANDIDATES.filter((candidate) => {
      if (removed.has(candidate.id)) return false;
      if (savedView === "my" && candidate.owner !== "Ananya Sharma") return false;
      if (
        savedView === "hot" &&
        !["Shortlisted", "Interview Scheduled", "Qualified"].includes(
          candidate.pipelineStatus
        )
      )
        return false;
      if (
        savedView === "needs-action" &&
        !["New", "Interested"].includes(candidate.pipelineStatus)
      )
        return false;
      if (
        normalized &&
        ![candidate.name, candidate.currentRole, candidate.currentCompany, candidate.headline]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (jobFilter.length > 0 && !jobFilter.includes(candidate.relatedJobId ?? ""))
        return false;
      if (
        listFilter.length > 0 &&
        !candidate.lists.some((list) => listFilter.includes(list))
      )
        return false;
      if (
        statusFilter.length > 0 &&
        !statusFilter.includes(candidate.pipelineStatus)
      )
        return false;
      if (locationFilter.length > 0 && !locationFilter.includes(candidate.location))
        return false;
      if (
        candidate.experienceYears < bucket.min ||
        candidate.experienceYears > bucket.max
      )
        return false;
      if (
        skillFilter.length > 0 &&
        !candidate.skills.some((skill) => skillFilter.includes(skill))
      )
        return false;
      if (sourceFilter.length > 0 && !sourceFilter.includes(candidate.source))
        return false;
      if (!contactMatches(candidate, contactFilter)) return false;
      if (ownerFilter.length > 0 && !ownerFilter.includes(candidate.owner))
        return false;
      return true;
    });
  }, [
    query,
    savedView,
    jobFilter,
    listFilter,
    statusFilter,
    locationFilter,
    experience,
    skillFilter,
    sourceFilter,
    contactFilter,
    ownerFilter,
    removed,
  ]);

  const primaryFilterCount =
    jobFilter.length + statusFilter.length + listFilter.length + locationFilter.length;
  const moreFilterCount =
    skillFilter.length +
    sourceFilter.length +
    ownerFilter.length +
    (experience !== "any" ? 1 : 0) +
    (contactFilter !== "Any contact" ? 1 : 0);
  const activeFilterCount = primaryFilterCount + moreFilterCount;

  function resetFilters() {
    setQuery("");
    setJobFilter([]);
    setListFilter([]);
    setStatusFilter([]);
    setLocationFilter([]);
    setExperience("any");
    setSkillFilter([]);
    setSourceFilter([]);
    setContactFilter("Any contact");
    setOwnerFilter([]);
  }

  function toggleSelect(id: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((previous) =>
      filtered.every((candidate) => previous.has(candidate.id))
        ? new Set()
        : new Set(filtered.map((candidate) => candidate.id))
    );
  }

  function runBulkAction(message: string) {
    setBulkMessage(message);
    setSelected(new Set());
    window.setTimeout(() => setBulkMessage(null), 2400);
  }

  function removeSelected() {
    setRemoved((previous) => {
      const next = new Set(previous);
      selected.forEach((id) => next.add(id));
      return next;
    });
    runBulkAction(`Removed ${selected.size} candidates from the pool.`);
  }

  const primaryFilterControls = (
    <>
      <FilterPopover
        label="Job"
        options={jobTitles}
        selected={jobFilter}
        onToggle={toggle(setJobFilter)}
      />
      <FilterPopover
        label="Status"
        options={toOptions(CANDIDATE_STATUSES)}
        selected={statusFilter}
        onToggle={toggle(setStatusFilter)}
      />
      <FilterPopover
        label="List"
        options={toOptions(LIST_NAMES)}
        selected={listFilter}
        onToggle={toggle(setListFilter)}
      />
      <FilterPopover
        label="Location"
        options={toOptions(POOL_LOCATIONS)}
        selected={locationFilter}
        onToggle={toggle(setLocationFilter)}
      />
    </>
  );

  const moreFilterControls = (
    <>
      <Select
        value={experience}
        onValueChange={(value) => value && setExperience(value)}
      >
        <SelectTrigger size="sm" className="w-full" aria-label="Experience range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {EXPERIENCE_BUCKETS.map((bucket) => (
            <SelectItem key={bucket.id} value={bucket.id}>
              {bucket.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FilterPopover
        label="Skills"
        options={toOptions(SKILL_OPTIONS)}
        selected={skillFilter}
        onToggle={toggle(setSkillFilter)}
      />
      <FilterPopover
        label="Source"
        options={toOptions(POOL_SOURCES)}
        selected={sourceFilter}
        onToggle={toggle(setSourceFilter)}
      />
      <Select
        value={contactFilter}
        onValueChange={(value) => value && setContactFilter(value)}
      >
        <SelectTrigger size="sm" className="w-full" aria-label="Contact availability">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CONTACT_AVAILABILITY.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FilterPopover
        label="Owner"
        options={toOptions(POOL_OWNERS)}
        selected={ownerFilter}
        onToggle={toggle(setOwnerFilter)}
      />
    </>
  );

  const filterControls = (
    <>
      {primaryFilterControls}
      {moreFilterControls}
      {activeFilterCount > 0 || query ? (
        <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
          <X aria-hidden />
          Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </Button>
      ) : null}
    </>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, role, company…"
              aria-label="Search candidates"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={savedView}
              onValueChange={(value) => value && setSavedView(value)}
            >
              <SelectTrigger size="sm" aria-label="Saved view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POOL_SAVED_VIEWS.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ImportCandidatesDialog />
            <CreateListDialog />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button type="button" size="sm" variant="outline" />
              }
            >
              <SlidersHorizontal aria-hidden />
              Filters
              {activeFilterCount > 0 ? (
                <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                  {activeFilterCount}
                </span>
              ) : null}
            </SheetTrigger>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
              <SheetHeader className="border-b border-border">
                <SheetTitle>Candidate filters</SheetTitle>
                <SheetDescription className="sr-only">
                  Filter the candidate pool by job, status, location and more
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-wrap gap-2 p-4">{filterControls}</div>
            </SheetContent>
          </Sheet>
          {activeFilterCount > 0 || query ? (
            <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
              <X aria-hidden />
              Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          ) : null}
        </div>

        <div className="mt-3 hidden flex-wrap items-center gap-2 border-t border-border pt-3 md:flex">
          {primaryFilterControls}
          <Popover>
            <PopoverTrigger
              render={<Button type="button" size="sm" variant="outline" />}
            >
              <SlidersHorizontal aria-hidden />
              More Filters
              {moreFilterCount > 0 ? (
                <span className="rounded-sm bg-brand-subtle px-1 text-xs font-semibold tabular-nums text-primary">
                  {moreFilterCount}
                </span>
              ) : null}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-2">
              {moreFilterControls}
            </PopoverContent>
          </Popover>
          {activeFilterCount > 0 || query ? (
            <Button type="button" size="sm" variant="ghost" onClick={resetFilters}>
              <X aria-hidden />
              Reset{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </Button>
          ) : null}
        </div>
      </section>

      {bulkMessage ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {bulkMessage}
        </p>
      ) : null}

      {/* Bulk action bar */}
      {selected.size > 0 ? (
        <section
          aria-label="Bulk actions"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-brand-subtle/50 px-4 py-2.5"
        >
          <p className="mr-1 text-sm font-medium text-foreground">
            <span className="tabular-nums">{selected.size}</span> selected
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runBulkAction(`Added ${selected.size} candidates to a list.`)}
          >
            <ListPlus aria-hidden />
            Add to List
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              runBulkAction(`Added ${selected.size} candidates to outreach.`)
            }
          >
            <Send aria-hidden />
            Add to Outreach
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              runBulkAction(`Screening started for ${selected.size} candidates.`)
            }
          >
            <AudioLines aria-hidden />
            Start Screening
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="sm" variant="outline" />}
            >
              <UserRoundCheck aria-hidden />
              Assign Owner
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Assign to</DropdownMenuLabel>
              {POOL_OWNERS.map((owner) => (
                <DropdownMenuItem
                  key={owner}
                  onClick={() =>
                    runBulkAction(`Assigned ${selected.size} candidates to ${owner}.`)
                  }
                >
                  {owner}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="sm" variant="outline" />}
            >
              <Workflow aria-hidden />
              Change Status
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Move to status</DropdownMenuLabel>
              {CANDIDATE_STATUSES.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() =>
                    runBulkAction(
                      `Moved ${selected.size} candidates to “${status}”.`
                    )
                  }
                >
                  {status}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="outline"
            onClick={() => runBulkAction(`Exported ${selected.size} candidates.`)}
          >
            <Download aria-hidden />
            Export
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="text-destructive">
                <Trash2 aria-hidden />
                Remove from Pool
              </Button>
            }
            title={`Remove ${selected.size} candidates?`}
            description="They will be removed from your candidate pool but remain available through search. Lists referencing them will be updated."
            confirmLabel="Remove"
            destructive
            onConfirm={removeSelected}
          />
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </section>
      ) : null}

      {/* Table */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length.toLocaleString("en-IN")}
            </span>{" "}
            candidates
          </p>
        </div>
        {filtered.length > 0 ? (
          <PoolTable
            candidates={filtered}
            selected={selected}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onRemove={(id) => {
              setRemoved((previous) => new Set(previous).add(id));
            }}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No candidates match these filters"
            description="Try removing a filter or two, or import candidates to grow your pool."
            actionLabel="Reset filters"
            onAction={resetFilters}
            className="m-4 border-0"
          />
        )}
      </section>
    </div>
  );
}
