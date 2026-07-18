"use client";

import {
  Archive,
  ArchiveRestore,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  Contact,
  Download,
  FolderOpen,
  Globe,
  ListPlus,
  Lock,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CreateListDialog } from "@/components/candidates/create-list-dialog";
import { PoolTable } from "@/components/candidates/pool-table";
import { SavedListsWorkspaceSkeleton } from "@/components/candidates/pool-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getApiErrorMessage,
  candidatePoolApi,
  type PoolPagination,
} from "@/lib/api";
import {
  type ListVisibility,
  type PoolCandidate,
  type SavedList,
} from "@/lib/mock-candidates";
import { jobDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SmartListId = "all" | "recent" | "revealed";

interface PanelSelection {
  kind: "smart" | "list";
  id: string;
}

const SMART_LISTS: {
  id: SmartListId;
  label: string;
  icon: typeof Users;
  description: string;
}[] = [
  {
    id: "all",
    label: "All Candidates",
    icon: Users,
    description: "Every candidate in your workspace pool.",
  },
  {
    id: "recent",
    label: "Recently Added",
    icon: Clock,
    description: "Candidates added to the pool in the last 7 days.",
  },
  {
    id: "revealed",
    label: "Contact Revealed",
    icon: Contact,
    description: "Candidates with at least one revealed email or mobile.",
  },
];

const VISIBILITY_META: Record<
  ListVisibility,
  { icon: typeof Lock; label: string }
> = {
  Private: { icon: Lock, label: "Private — only you" },
  Team: { icon: Users2, label: "Shared with your team" },
  Workspace: { icon: Globe, label: "Shared with the workspace" },
};

function NavButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  muted = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Users;
  label: string;
  count: number;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        active
          ? "bg-brand-subtle font-medium text-primary"
          : "text-foreground hover:bg-muted",
        muted && !active && "text-muted-foreground"
      )}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}

export function SavedListsWorkspace() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [pool, setPool] = useState<PoolCandidate[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState<PoolPagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [smartCounts, setSmartCounts] = useState<Record<SmartListId, number>>({
    all: 0,
    recent: 0,
    revealed: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<PanelSelection>({
    kind: "smart",
    id: "all",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [listQuery, setListQuery] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function refresh() {
    try {
      const [nextLists, all, recent, revealed] = await Promise.all([
        candidatePoolApi.listLists(),
        candidatePoolApi.listPage({ view: "all", page: 1, limit: 1 }),
        candidatePoolApi.listPage({ view: "recent", page: 1, limit: 1 }),
        candidatePoolApi.listPage({ view: "revealed", page: 1, limit: 1 }),
      ]);
      setLists(nextLists);
      setSmartCounts({
        all: all.pagination.total,
        recent: recent.pagination.total,
        revealed: revealed.pagination.total,
      });
      setRefreshVersion((value) => value + 1);
    } catch (err) {
      setFeedback(getApiErrorMessage(err));
      setLists([]);
      setPool([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  const normalizedQuery = listQuery.trim().toLowerCase();
  const matchesQuery = (label: string) =>
    !normalizedQuery || label.toLowerCase().includes(normalizedQuery);

  const smartLists = SMART_LISTS.filter((entry) => matchesQuery(entry.label));
  const activeLists = lists.filter(
    (list) => !list.archived && matchesQuery(list.name)
  );
  const archivedLists = lists.filter(
    (list) => list.archived && matchesQuery(list.name)
  );

  const currentList: SavedList | null =
    selection.kind === "list"
      ? (lists.find((list) => list.id === selection.id) ?? null)
      : null;

  const currentSmart =
    selection.kind === "smart"
      ? SMART_LISTS.find((entry) => entry.id === selection.id)!
      : null;

  const candidates = pool;

  function openRename() {
    if (!currentList) return;
    setRenameValue(currentList.name);
    setRenameOpen(true);
  }

  async function saveRename() {
    if (!currentList) return;
    const nextName = renameValue.trim();
    if (!nextName) {
      flash("List name is required.");
      return;
    }
    setRenameBusy(true);
    try {
      const updated = await candidatePoolApi.updateList(currentList.id, {
        name: nextName,
      });
      setLists((previous) =>
        previous.map((list) =>
          list.id === updated.id ? { ...list, ...updated, name: nextName } : list
        )
      );
      setRenameOpen(false);
      flash(`Renamed to “${nextName}”.`);
      await refresh();
    } catch (err) {
      flash(getApiErrorMessage(err));
    } finally {
      setRenameBusy(false);
    }
  }

  async function exportListCandidates() {
    if (!currentList) return;
    setExportBusy(true);
    try {
      const ids = candidates.map((candidate) => candidate.id);
      const result = await candidatePoolApi.bulkExport([], {
        listId: currentList.id,
      });
      if ("csv" in result && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        const safeName = currentList.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        anchor.download = `${safeName || "saved-list"}-export.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
      const exportedCount = Math.max(
        ids.length,
        currentList.candidateCount ?? 0
      );
      flash(`Exported ${exportedCount} candidates.`);
    } catch (err) {
      flash(getApiErrorMessage(err));
    } finally {
      setExportBusy(false);
    }
  }

  async function confirmDeleteList() {
    if (!currentList) return;
    const name = currentList.name;
    const id = currentList.id;
    setDeleteBusy(true);
    try {
      await candidatePoolApi.deleteList(id);
      setDeleteOpen(false);
      flash(`Deleted “${name}”.`);
      setSelection({ kind: "smart", id: "all" });
      await refresh();
    } catch (err) {
      flash(getApiErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setTableLoading(true);
    void (async () => {
      try {
        const result = await candidatePoolApi.listPage({
          ...(selection.kind === "list"
            ? { listId: selection.id }
            : { view: selection.id as SmartListId }),
          page,
          limit: pageSize,
        });
        if (!cancelled) {
          setPool(result.items);
          setPagination(result.pagination);
          if (result.pagination.page !== page) setPage(result.pagination.page);
        }
      } catch (err) {
        if (!cancelled) {
          setPool([]);
          setFeedback(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setTableLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selection, page, pageSize, refreshVersion]);

  function listCount(list: SavedList) {
    return list.candidateCount ?? list.candidateIds.length;
  }

  function select(next: PanelSelection) {
    setSelection(next);
    setPage(1);
    setSelected(new Set());
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
      candidates.every((candidate) => previous.has(candidate.id))
        ? new Set()
        : new Set(candidates.map((candidate) => candidate.id))
    );
  }

  const visibilityMeta = currentList
    ? VISIBILITY_META[currentList.visibility]
    : null;

  if (loading) {
    return <SavedListsWorkspaceSkeleton />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* Left panel */}
      <aside className="h-fit rounded-xl border border-border bg-card p-2 lg:sticky lg:top-20">
        <div className="relative p-1 pb-2">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={listQuery}
            onChange={(event) => setListQuery(event.target.value)}
            placeholder="Search lists…"
            aria-label="Search lists"
            className="h-8 pl-8 text-sm"
          />
        </div>
        <nav aria-label="Saved lists">
          {smartLists.length > 0 ? (
            <ul className="space-y-0.5">
              {smartLists.map((entry) => (
                <li key={entry.id}>
                  <NavButton
                    active={selection.kind === "smart" && selection.id === entry.id}
                    onClick={() => select({ kind: "smart", id: entry.id })}
                    icon={entry.icon}
                    label={entry.label}
                    count={smartCounts[entry.id]}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {activeLists.length > 0 ? (
            <>
              <p className="mt-3 mb-1 px-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Custom Lists
              </p>
              <ul className="space-y-0.5">
                {activeLists.map((list) => (
                  <li key={list.id}>
                    <NavButton
                      active={selection.kind === "list" && selection.id === list.id}
                      onClick={() => select({ kind: "list", id: list.id })}
                      icon={FolderOpen}
                      label={list.name}
                      count={listCount(list)}
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {archivedLists.length > 0 ? (
            <>
              <p className="mt-3 mb-1 px-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Archived Lists
              </p>
              <ul className="space-y-0.5">
                {archivedLists.map((list) => (
                  <li key={list.id}>
                    <NavButton
                      active={selection.kind === "list" && selection.id === list.id}
                      onClick={() => select({ kind: "list", id: list.id })}
                      icon={Archive}
                      label={list.name}
                      count={listCount(list)}
                      muted
                    />
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {smartLists.length === 0 &&
          activeLists.length === 0 &&
          archivedLists.length === 0 ? (
            <p className="px-2.5 py-3 text-sm text-muted-foreground">
              No lists match “{listQuery}”.
            </p>
          ) : null}
        </nav>

        <div className="mt-2 border-t border-border p-1.5">
          <CreateListDialog
            onCreated={() => void refresh()}
            trigger={
              <Button size="sm" variant="outline" className="w-full">
                <ListPlus aria-hidden />
                Create List
              </Button>
            }
          />
        </div>
      </aside>

      {/* Main panel */}
      <div className="min-w-0 space-y-4">
        <header className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {currentList ? currentList.name : currentSmart!.label}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {currentList ? currentList.description : currentSmart!.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {currentList?.archived ? (
                <span className="inline-flex h-6 items-center gap-1.5 rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground">
                  <Archive aria-hidden className="size-3" />
                  Archived
                </span>
              ) : null}
              {currentList ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${currentList.name}`}
                      />
                    }
                  >
                    <MoreHorizontal aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={openRename}>
                      <Pencil aria-hidden />
                      Rename list
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={exportBusy}
                      onClick={() => void exportListCandidates()}
                    >
                      <Download aria-hidden />
                      {exportBusy ? "Exporting…" : "Export candidates"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        void (async () => {
                          try {
                            await candidatePoolApi.archiveList(currentList.id);
                            flash(
                              currentList.archived
                                ? `Restored “${currentList.name}”.`
                                : `Archived “${currentList.name}”.`
                            );
                            await refresh();
                          } catch (err) {
                            flash(getApiErrorMessage(err));
                          }
                        })()
                      }
                    >
                      {currentList.archived ? (
                        <ArchiveRestore aria-hidden />
                      ) : (
                        <Archive aria-hidden />
                      )}
                      {currentList.archived ? "Restore list" : "Archive list"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 aria-hidden />
                      Delete list
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>

          {feedback ? (
            <p
              role="status"
              className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
            >
              {feedback}
            </p>
          ) : null}

          <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Candidate count</dt>
              <Users aria-hidden className="size-3.5" />
              <dd>
                <span className="font-medium tabular-nums text-foreground">
                  {pagination.total}
                </span>{" "}
                candidates
              </dd>
            </div>
            {currentList ? (
              <>
                <div className="flex items-center gap-1.5">
                  <dt>Created by</dt>
                  <dd className="font-medium text-foreground">
                    {currentList.createdBy}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt>Last updated</dt>
                  <dd className="font-medium text-foreground">
                    {currentList.updated}
                  </dd>
                </div>
                {currentList.relatedJobId && currentList.relatedJobTitle ? (
                  <div className="flex items-center gap-1.5">
                    <Briefcase aria-hidden className="size-3.5" />
                    <dt className="sr-only">Related job</dt>
                    <dd>
                      <Link
                        href={jobDetailPath(currentList.relatedJobId)}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {currentList.relatedJobTitle}
                      </Link>
                    </dd>
                  </div>
                ) : null}
                {visibilityMeta ? (
                  <div className="flex items-center gap-1.5">
                    <visibilityMeta.icon aria-hidden className="size-3.5" />
                    <dt className="sr-only">Sharing status</dt>
                    <dd>{visibilityMeta.label}</dd>
                  </div>
                ) : null}
                {currentList.tags.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <dt className="sr-only">Tags</dt>
                    <dd className="flex gap-1">
                      {currentList.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
              </>
            ) : null}
          </dl>
        </header>

        <section className="rounded-xl border border-border bg-card">
          {tableLoading ? (
            <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">
              Loading candidates…
            </div>
          ) : candidates.length > 0 ? (
            <>
              <PoolTable
                candidates={candidates}
                selected={selected}
                onToggleSelect={toggleSelect}
                onToggleSelectAll={toggleSelectAll}
                onRemove={() => {}}
                caption={`Candidates in ${currentList ? currentList.name : currentSmart!.label}`}
              />
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>
                  {"–"}
                  <span className="font-medium text-foreground">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {pagination.total}
                  </span>
                </p>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Rows
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                        setSelected(new Set());
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
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label="Previous page"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setPage((value) => Math.max(1, value - 1));
                        setSelected(new Set());
                      }}
                    >
                      <ChevronLeft aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="outline"
                      aria-label="Next page"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setPage((value) =>
                          Math.min(pagination.totalPages, value + 1)
                        );
                        setSelected(new Set());
                      }}
                    >
                      <ChevronRight aria-hidden />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="This list is empty"
              description="Add candidates from the pool or from search results to fill this list."
              actionLabel="Open Candidate Pool"
              actionHref="/dashboard/candidates"
              className="m-4 border-0"
            />
          )}
        </section>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename list</DialogTitle>
            <DialogDescription>
              Update the display name for this saved list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-list-name">List name</Label>
            <Input
              id="rename-list-name"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void saveRename();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={renameBusy}
              onClick={() => setRenameOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={renameBusy || !renameValue.trim()}
              onClick={() => void saveRename()}
            >
              {renameBusy ? "Saving…" : "Save name"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentList
                ? `“${currentList.name}” will be permanently deleted. Candidates in the pool are not removed — only this list grouping.`
                : "This list will be permanently deleted. Candidates in the pool are not removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteBusy}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteList();
              }}
            >
              {deleteBusy ? "Deleting…" : "Delete list"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
