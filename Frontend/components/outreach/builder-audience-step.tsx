"use client";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CopyX,
  FileSpreadsheet,
  ListChecks,
  Plug,
  Search,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  listAllPoolPages,
  loadAudiencePoolRows,
  statsFromPoolRows,
} from "@/components/outreach/audience-resolve";
import { Field, StepCard } from "@/components/outreach/builder-ui";
import { ImportCandidatesDialog } from "@/components/candidates/import-dialog";
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
  candidatePoolApi,
  getApiErrorMessage,
  sourcingApi,
  type ApiPoolCandidate,
  type SourcingSessionApi,
} from "@/lib/api";
import type { SavedList } from "@/lib/mock-candidates";
import {
  AUDIENCE_SOURCES,
  reachableCount,
  type AudienceSource,
  type AudienceStats,
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

export type AudienceStepState = {
  source: AudienceSource | null;
  sourceDetail: string;
  selectedCandidateIds: string[];
  poolSearch: string;
  audiencePreview: AudienceStats | null;
};

/** Bivariant so wider builder `update` fns (WorkflowBuilderState / BuilderState) assign cleanly. */
export type AudienceStepUpdate = {
  bivarianceHack<K extends keyof AudienceStepState>(
    key: K,
    value: AudienceStepState[K]
  ): void;
}["bivarianceHack"];

const SOURCE_META: Record<
  AudienceSource,
  { icon: typeof Users; description: string }
> = {
  "Candidate Pool": {
    icon: Users,
    description: "Use filtered candidates from your pool",
  },
  "Saved List": {
    icon: ListChecks,
    description: "Enroll everyone in a saved list",
  },
  "Sourcing Session": {
    icon: Search,
    description: "Use results from an AI search",
  },
  "CSV/Excel Import": {
    icon: FileSpreadsheet,
    description: "Upload a file of candidates",
  },
  "Manual Add": {
    icon: UserPlus,
    description: "Hand-pick a few candidates",
  },
};

const DISABLED_AUDIENCE_SOURCES = [
  {
    id: "Upload resumes",
    icon: Upload,
    description: "Upload resumes to add candidates",
  },
  {
    id: "Import from ATS",
    icon: Plug,
    description: "Pull candidates from a connected ATS",
  },
] as const;

function CandidatePicker({
  rows,
  selectedIds,
  onChange,
  loading,
  emptyLabel,
}: {
  rows: ApiPoolCandidate[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
  emptyLabel: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const selected = new Set(selectedIds);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = rows.length === 0 ? 0 : (currentPage - 1) * pageSize;
  const pageRows = useMemo(
    () => rows.slice(pageStart, pageStart + pageSize),
    [rows, pageStart, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [rows, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggle(id: string) {
    if (selected.has(id)) {
      onChange(selectedIds.filter((value) => value !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function togglePage() {
    const pageIds = pageRows.map((row) => row.id);
    const allSelected = pageIds.every((id) => selected.has(id));
    if (allSelected) {
      const remove = new Set(pageIds);
      onChange(selectedIds.filter((id) => !remove.has(id)));
      return;
    }
    onChange([...new Set([...selectedIds, ...pageIds])]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading || rows.length === 0}
          onClick={() => onChange(rows.map((row) => row.id))}
        >
          Select all ({rows.length})
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading || pageRows.length === 0}
          onClick={togglePage}
        >
          {pageRows.every((row) => selected.has(row.id)) && pageRows.length > 0
            ? "Clear page"
            : "Select page"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={selectedIds.length === 0}
          onClick={() => onChange([])}
        >
          Clear
        </Button>
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} selected · {rows.length} total
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Loading candidates…
            </p>
          ) : rows.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <ul className="divide-y divide-border">
              {pageRows.map((row, index) => {
                const checked = selected.has(row.id);
                return (
                  <li key={row.id}>
                    <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/40">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() => toggle(row.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {pageStart + index + 1}.
                          </span>
                          <span className="truncate text-sm font-medium text-foreground">
                            {row.name}
                          </span>
                        </span>
                        <span className="mt-0.5 block pl-5 text-xs text-muted-foreground">
                          {[row.email || null, row.phone || null]
                            .filter(Boolean)
                            .join(" · ") || "No email or mobile"}
                        </span>
                        {(row.currentTitle || row.currentCompany) && (
                          <span className="mt-0.5 block truncate pl-5 text-[11px] text-muted-foreground/80">
                            {[row.currentTitle, row.currentCompany]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {rows.length > 0 ? (
          <div className="flex flex-col gap-3 border-t border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {pageStart + 1}
              </span>
              {"–"}
              <span className="font-medium text-foreground">
                {Math.min(pageStart + pageSize, rows.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{rows.length}</span>
            </p>
            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Rows
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Previous page"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AudienceStep({
  state,
  update,
  showErrors,
  title = "Audience",
  description = "Choose where the campaign audience comes from. CSV imports include new rows and existing pool matches linked to this campaign list.",
  sourceErrorLabel = "Choose where the campaign audience comes from.",
  importListNamePrefix = "Outreach import",
  importListDescription = "Candidates imported for an outreach campaign",
  importListTags = ["outreach-import"],
}: {
  state: AudienceStepState;
  update: AudienceStepUpdate;
  showErrors: boolean;
  title?: string;
  description?: string;
  sourceErrorLabel?: string;
  importListNamePrefix?: string;
  importListDescription?: string;
  importListTags?: string[];
}) {
  const stats = state.audiencePreview;
  const [lists, setLists] = useState<SavedList[]>([]);
  const [sessions, setSessions] = useState<SourcingSessionApi[]>([]);
  const [pickerRows, setPickerRows] = useState<ApiPoolCandidate[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingAudience, setLoadingAudience] = useState(false);
  const [importListId, setImportListId] = useState<string | null>(
    state.source === "CSV/Excel Import" ? state.sourceDetail || null : null
  );
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingOptions(true);
      try {
        const [nextLists, nextSessions] = await Promise.all([
          candidatePoolApi.listLists(),
          sourcingApi.listSessions({ limit: 50, sort: "-createdAt" }),
        ]);
        if (cancelled) return;
        // Keep the currently selected list even if archived so the trigger
        // can show its name instead of a raw id.
        setLists(
          nextLists.filter(
            (list) =>
              !list.archived ||
              (state.source === "Saved List" && list.id === state.sourceDetail)
          )
        );
        setSessions(nextSessions);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Unable to load audience options."));
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.source, state.sourceDetail]);

  useEffect(() => {
    if (!state.source) {
      update("audiencePreview", null);
      setPickerRows([]);
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        setLoadingAudience(true);
        setError(null);
        try {
          const needsPicker =
            state.source === "Manual Add" ||
            state.source === "Candidate Pool" ||
            (state.source === "CSV/Excel Import" &&
              Boolean(state.sourceDetail));

          if (state.source === "Manual Add" || state.source === "Candidate Pool") {
            const browse = await candidatePoolApi.listRaw({
              limit: 200,
              search: state.poolSearch.trim() || undefined,
            });
            if (cancelled) return;

            if (state.selectedCandidateIds.length > 0) {
              const wanted = new Set(state.selectedCandidateIds);
              const selectedRows = browse.filter((row) => wanted.has(row.id));
              if (selectedRows.length === state.selectedCandidateIds.length) {
                setPickerRows(browse);
                update("audiencePreview", statsFromPoolRows(selectedRows));
              } else {
                const rows = await loadAudiencePoolRows({
                  source: state.source,
                  sourceDetail: state.sourceDetail,
                  selectedCandidateIds: state.selectedCandidateIds,
                  poolSearch: state.poolSearch,
                });
                if (cancelled) return;
                const byId = new Map(browse.map((row) => [row.id, row]));
                for (const row of rows) byId.set(row.id, row);
                // Keep selected people visible even when they fall outside the browse page.
                setPickerRows([
                  ...rows,
                  ...browse.filter((row) => !wanted.has(row.id)),
                ]);
                update("audiencePreview", statsFromPoolRows(rows));
              }
            } else if (state.source === "Candidate Pool") {
              setPickerRows(browse);
              update("audiencePreview", statsFromPoolRows(browse));
            } else {
              setPickerRows(browse);
              update("audiencePreview", {
                selected: 0,
                withEmail: 0,
                withPhone: 0,
                duplicates: 0,
                invalid: 0,
              });
            }
          } else if (needsPicker) {
            const rows = await loadAudiencePoolRows({
              source: state.source,
              sourceDetail: state.sourceDetail,
              selectedCandidateIds: [],
              poolSearch: state.poolSearch,
            });
            if (cancelled) return;
            setPickerRows(rows);
            if (
              state.source === "CSV/Excel Import" &&
              state.selectedCandidateIds.length === 0 &&
              rows.length > 0
            ) {
              // List already has members (e.g. re-import / already-on-list) —
              // treat them as the campaign audience so Continue is not blocked.
              update(
                "selectedCandidateIds",
                rows.map((row) => row.id)
              );
              update("audiencePreview", statsFromPoolRows(rows));
            } else if (state.selectedCandidateIds.length > 0) {
              const wanted = new Set(state.selectedCandidateIds);
              update(
                "audiencePreview",
                statsFromPoolRows(rows.filter((row) => wanted.has(row.id)))
              );
            } else {
              update("audiencePreview", statsFromPoolRows(rows));
            }
          } else {
            const rows = await loadAudiencePoolRows({
              source: state.source,
              sourceDetail: state.sourceDetail,
              selectedCandidateIds: state.selectedCandidateIds,
              poolSearch: state.poolSearch,
            });
            if (cancelled) return;
            setPickerRows([]);
            update("audiencePreview", statsFromPoolRows(rows));
          }
        } catch (err) {
          if (!cancelled) {
            setError(getApiErrorMessage(err, "Unable to load audience."));
            update("audiencePreview", null);
          }
        } finally {
          if (!cancelled) setLoadingAudience(false);
        }
      })();
    }, state.source === "Candidate Pool" || state.source === "Manual Add" ? 250 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
    // `update` is recreated each render; selection is tracked via joined ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.source,
    state.sourceDetail,
    state.poolSearch,
    state.selectedCandidateIds.join(","),
  ]);

  function handleCandidateSelectionChange(ids: string[]) {
    update("selectedCandidateIds", ids);

    if (ids.length === 0) {
      if (state.source === "Candidate Pool" || state.source === "CSV/Excel Import") {
        update("audiencePreview", statsFromPoolRows(pickerRows));
      } else {
        update("audiencePreview", {
          selected: 0,
          withEmail: 0,
          withPhone: 0,
          duplicates: 0,
          invalid: 0,
        });
      }
      return;
    }

    const wanted = new Set(ids);
    const selectedRows = pickerRows.filter((row) => wanted.has(row.id));
    if (selectedRows.length === ids.length) {
      update("audiencePreview", statsFromPoolRows(selectedRows));
      return;
    }

    // Selected rows may be outside the current browse page/search — refresh stats quietly.
    void loadAudiencePoolRows({
      source: state.source,
      sourceDetail: state.sourceDetail,
      selectedCandidateIds: ids,
      poolSearch: state.poolSearch,
    })
      .then((rows) => update("audiencePreview", statsFromPoolRows(rows)))
      .catch(() => {
        update("audiencePreview", statsFromPoolRows(selectedRows));
      });
  }

  function selectSource(source: AudienceSource) {
    if (
      source === "CSV/Excel Import" &&
      state.source === source &&
      importListId
    ) {
      setImportDialogOpen(true);
      return;
    }

    update("source", source);
    update("sourceDetail", "");
    update("selectedCandidateIds", []);
    update("poolSearch", "");
    update("audiencePreview", null);
    setImportListId(null);
    setPickerRows([]);

    if (source === "CSV/Excel Import") {
      void (async () => {
        try {
          const list = await candidatePoolApi.createList({
            name: `${importListNamePrefix} ${new Date().toLocaleString("en-IN")}`,
            description: importListDescription,
            visibility: "Team",
            tags: importListTags,
          });
          setImportListId(list.id);
          update("sourceDetail", list.id);
          setImportDialogOpen(true);
        } catch (err) {
          setError(
            getApiErrorMessage(err, "Unable to prepare import list.")
          );
        }
      })();
    }
  }

  return (
    <StepCard title={title} description={description}>
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_SOURCES.filter((source) => source !== "Manual Add").map(
            (source) => {
            const meta = SOURCE_META[source];
            const Icon = meta.icon;
            const selected = state.source === source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => selectSource(source)}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
                  selected
                    ? "border-primary bg-brand-subtle"
                    : "border-border bg-card hover:bg-muted/40"
                )}
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    selected ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    {source}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {meta.description}
                  </span>
                </span>
              </button>
            );
          }
          )}
          {DISABLED_AUDIENCE_SOURCES.map((source) => {
            const Icon = source.icon;
            return (
              <button
                key={source.id}
                type="button"
                disabled
                aria-disabled="true"
                className="flex cursor-not-allowed items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 text-left opacity-60"
              >
                <Icon
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">
                    {source.id}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {source.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {showErrors && !state.source ? (
          <p role="alert" className="text-sm text-destructive">
            {sourceErrorLabel}
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {state.source === "Saved List" ? (
          <Field label="Saved list" htmlFor="audience-list">
            <Select
              value={state.sourceDetail || undefined}
              onValueChange={(value) => {
                update("sourceDetail", value ?? "");
                update("selectedCandidateIds", []);
              }}
              disabled={loadingOptions}
            >
              <SelectTrigger id="audience-list" className="w-full sm:w-80">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Loading lists…" : "Select a list"
                  }
                >
                  {(value: string | null) => {
                    if (!value) return null;
                    const selected = lists.find((list) => list.id === value);
                    if (!selected) {
                      return loadingOptions
                        ? "Loading lists…"
                        : "Selected list unavailable";
                    }
                    return typeof selected.candidateCount === "number"
                      ? `${selected.name} (${selected.candidateCount})`
                      : selected.name;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                    {typeof list.candidateCount === "number"
                      ? ` (${list.candidateCount})`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showErrors && !state.sourceDetail ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                Select a saved list.
              </p>
            ) : null}
          </Field>
        ) : null}

        {state.source === "Sourcing Session" ? (
          <Field label="Sourcing session" htmlFor="audience-session">
            <Select
              value={state.sourceDetail || undefined}
              onValueChange={(value) => {
                update("sourceDetail", value ?? "");
                update("selectedCandidateIds", []);
              }}
              disabled={loadingOptions}
            >
              <SelectTrigger id="audience-session" className="w-full sm:w-80">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Loading sessions…" : "Select a search session"
                  }
                >
                  {(value: string | null) => {
                    if (!value) return null;
                    const selected = sessions.find(
                      (session) => session.id === value
                    );
                    if (!selected) {
                      return loadingOptions
                        ? "Loading sessions…"
                        : "Selected session unavailable";
                    }
                    const count =
                      typeof selected.resultCount === "number"
                        ? ` (${selected.resultCount})`
                        : typeof selected.estimatedResults === "number"
                          ? ` (~${selected.estimatedResults})`
                          : "";
                    return `${selected.name}${count}`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.name}
                    {typeof session.resultCount === "number"
                      ? ` (${session.resultCount})`
                      : typeof session.estimatedResults === "number"
                        ? ` (~${session.estimatedResults})`
                        : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Session results are saved to your candidate pool when you launch.
            </p>
            {showErrors && !state.sourceDetail ? (
              <p role="alert" className="mt-1 text-sm text-destructive">
                Select a sourcing session.
              </p>
            ) : null}
          </Field>
        ) : null}

        {state.source === "CSV/Excel Import" ? (
          <div className="space-y-3">
            <ImportCandidatesDialog
              listId={importListId}
              open={importDialogOpen}
              onOpenChange={setImportDialogOpen}
              trigger={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!importListId}
                >
                  <Upload aria-hidden />
                  {state.selectedCandidateIds.length > 0
                    ? "Import another file"
                    : "Upload CSV / Excel"}
                </Button>
              }
              onImported={async ({ imported, listId }) => {
                const id = listId || importListId;
                if (!id) return;
                setError(null);
                update("sourceDetail", id);
                setImportListId(id);
                try {
                  const rows = await listAllPoolPages({ listId: id });
                  update(
                    "selectedCandidateIds",
                    rows.map((row) => row.id)
                  );
                  update("audiencePreview", statsFromPoolRows(rows));
                  setPickerRows(rows);
                  if (imported === 0 && rows.length === 0) {
                    setError(
                      "Import finished but no candidates were added to this campaign."
                    );
                  }
                } catch (err) {
                  setError(
                    getApiErrorMessage(err, "Unable to load imported candidates.")
                  );
                }
              }}
            />
            {!importListId ? (
              <p className="text-xs text-muted-foreground">
                Preparing import list…
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Imported candidates (and existing pool matches) are attached to a
                saved list for this audience.
              </p>
            )}
            {showErrors && state.selectedCandidateIds.length === 0 ? (
              <p role="alert" className="text-sm text-destructive">
                Import a CSV/Excel file before continuing.
              </p>
            ) : null}
          </div>
        ) : null}

        {state.source === "Candidate Pool" || state.source === "Manual Add" ? (
          <div className="space-y-3">
            {state.selectedCandidateIds.length > 0 ? (
              <p className="rounded-lg border border-primary/20 bg-brand-subtle px-3 py-2 text-sm text-foreground">
                {state.selectedCandidateIds.length.toLocaleString("en-IN")} candidate
                {state.selectedCandidateIds.length === 1 ? "" : "s"} selected for this
                campaign. Confirm the selection below, then continue.
              </p>
            ) : null}
            <Field
              label="Search pool"
              htmlFor="audience-pool-search"
              className="flex flex-row flex-wrap items-center gap-3 space-y-0"
            >
              <Input
                id="audience-pool-search"
                value={state.poolSearch}
                onChange={(event) => update("poolSearch", event.target.value)}
                placeholder="Search by name, company, skill…"
                className="min-w-[12rem] flex-1 sm:max-w-sm"
              />
            </Field>
            <CandidatePicker
              rows={pickerRows}
              selectedIds={state.selectedCandidateIds}
              onChange={handleCandidateSelectionChange}
              loading={loadingAudience}
              emptyLabel={
                state.source === "Manual Add"
                  ? "No candidates in your pool yet."
                  : "No candidates match this search."
              }
            />
            {state.source === "Candidate Pool" ? (
              <p className="text-xs text-muted-foreground">
                Leave selection empty to enroll everyone matching the search
                (up to 200).
              </p>
            ) : null}
            {showErrors &&
            state.source === "Manual Add" &&
            state.selectedCandidateIds.length === 0 ? (
              <p role="alert" className="text-sm text-destructive">
                Pick at least one candidate to enroll.
              </p>
            ) : null}
          </div>
        ) : null}

        {state.source === "CSV/Excel Import" &&
        state.selectedCandidateIds.length > 0 ? (
          <CandidatePicker
            rows={pickerRows}
            selectedIds={state.selectedCandidateIds}
            onChange={handleCandidateSelectionChange}
            loading={loadingAudience}
            emptyLabel="No imported candidates found."
          />
        ) : null}

        {stats ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["Selected", stats.selected, Users],
                ["Duplicates", stats.duplicates, CopyX],
                ["Invalid", stats.invalid, XCircle],
                ["Estimated reachable", reachableCount(stats), CheckCircle2],
              ] as const
            ).map(([label, value, Icon]) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-muted/30 px-3 py-2.5"
              >
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon aria-hidden className="size-3.5" />
                  {label}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                  {loadingAudience ? "…" : value.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        ) : loadingAudience ? (
          <p className="text-sm text-muted-foreground">Calculating audience…</p>
        ) : null}
      </div>
    </StepCard>
  );
}
