"use client";

import {
  CheckCircle2,
  CopyX,
  FileSpreadsheet,
  ListChecks,
  Search,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  loadAudiencePoolRows,
  statsFromPoolRows,
} from "@/components/outreach/audience-resolve";
import { Field, StepCard } from "@/components/outreach/builder-ui";
import type {
  BuilderState,
  UpdateBuilder,
} from "@/components/outreach/builder-types";
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
} from "@/lib/mock-outreach";
import { cn } from "@/lib/utils";

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
  const selected = new Set(selectedIds);

  function toggle(id: string) {
    if (selected.has(id)) {
      onChange(selectedIds.filter((value) => value !== id));
    } else {
      onChange([...selectedIds, id]);
    }
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
          variant="ghost"
          disabled={selectedIds.length === 0}
          onClick={() => onChange([])}
        >
          Clear
        </Button>
        <span className="text-xs text-muted-foreground">
          {selectedIds.length} selected
        </span>
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
        {loading ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            Loading candidates…
          </p>
        ) : rows.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => {
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
                      <span className="block truncate text-sm font-medium text-foreground">
                        {row.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {[row.currentTitle, row.currentCompany, row.email]
                          .filter(Boolean)
                          .join(" · ") || "No contact details"}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function AudienceStep({
  state,
  update,
  showErrors,
}: {
  state: BuilderState;
  update: UpdateBuilder;
  showErrors: boolean;
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
        setLists(nextLists.filter((list) => !list.archived));
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
  }, []);

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
          const rows = await loadAudiencePoolRows({
            source: state.source,
            sourceDetail: state.sourceDetail,
            selectedCandidateIds: state.selectedCandidateIds,
            poolSearch: state.poolSearch,
          });
          if (cancelled) return;

          const needsPicker =
            state.source === "Manual Add" ||
            state.source === "Candidate Pool" ||
            (state.source === "CSV/Excel Import" &&
              state.selectedCandidateIds.length > 0);

          if (state.source === "Manual Add" || state.source === "Candidate Pool") {
            const browse = await candidatePoolApi.listRaw({
              limit: 200,
              search: state.poolSearch.trim() || undefined,
            });
            if (cancelled) return;
            setPickerRows(browse);
            if (state.selectedCandidateIds.length > 0) {
              update("audiencePreview", statsFromPoolRows(rows));
            } else if (state.source === "Candidate Pool") {
              update("audiencePreview", statsFromPoolRows(browse));
            } else {
              update("audiencePreview", {
                selected: 0,
                withEmail: 0,
                withPhone: 0,
                duplicates: 0,
                invalid: 0,
              });
            }
          } else if (needsPicker) {
            setPickerRows(rows);
            update("audiencePreview", statsFromPoolRows(rows));
          } else {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- update is stable enough; avoid loops
  }, [
    state.source,
    state.sourceDetail,
    state.selectedCandidateIds,
    state.poolSearch,
  ]);

  function selectSource(source: AudienceSource) {
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
            name: `Outreach import ${new Date().toLocaleString("en-IN")}`,
            description: "Candidates imported for an outreach campaign",
            visibility: "Team",
            tags: ["outreach-import"],
          });
          setImportListId(list.id);
          update("sourceDetail", list.id);
        } catch (err) {
          setError(
            getApiErrorMessage(err, "Unable to prepare import list.")
          );
        }
      })();
    }
  }

  return (
    <StepCard
      title="Audience"
      description="Choose where the campaign audience comes from. Duplicates and invalid contacts are excluded automatically."
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_SOURCES.map((source) => {
            const meta = SOURCE_META[source];
            const Icon = meta.icon;
            const selected = state.source === source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => selectSource(source)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors",
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
          })}
        </div>

        {showErrors && !state.source ? (
          <p role="alert" className="text-sm text-destructive">
            Choose where the campaign audience comes from.
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
                update("sourceDetail", value);
                update("selectedCandidateIds", []);
              }}
              disabled={loadingOptions}
            >
              <SelectTrigger id="audience-list" className="w-full sm:w-80">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Loading lists…" : "Select a list"
                  }
                />
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
                update("sourceDetail", value);
                update("selectedCandidateIds", []);
              }}
              disabled={loadingOptions}
            >
              <SelectTrigger id="audience-session" className="w-full sm:w-80">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Loading sessions…" : "Select a search session"
                  }
                />
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
                update("sourceDetail", id);
                setImportListId(id);
                try {
                  const rows = await candidatePoolApi.listRaw({
                    listId: id,
                    limit: 200,
                  });
                  update(
                    "selectedCandidateIds",
                    rows.map((row) => row.id)
                  );
                  update("audiencePreview", statsFromPoolRows(rows));
                  setPickerRows(rows);
                  if (imported === 0 && rows.length === 0) {
                    setError("Import finished but no new candidates were added.");
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
                Imported candidates are attached to a saved list for this campaign.
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
            <Field label="Search pool" htmlFor="audience-pool-search">
              <Input
                id="audience-pool-search"
                value={state.poolSearch}
                onChange={(event) => update("poolSearch", event.target.value)}
                placeholder="Search by name, company, skill…"
                className="sm:max-w-sm"
              />
            </Field>
            <CandidatePicker
              rows={pickerRows}
              selectedIds={state.selectedCandidateIds}
              onChange={(ids) => update("selectedCandidateIds", ids)}
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
            onChange={(ids) => update("selectedCandidateIds", ids)}
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
