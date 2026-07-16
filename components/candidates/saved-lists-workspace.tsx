"use client";

import {
  Archive,
  Briefcase,
  Clock,
  Contact,
  FolderOpen,
  Globe,
  ListPlus,
  Lock,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CreateListDialog } from "@/components/candidates/create-list-dialog";
import { PoolTable } from "@/components/candidates/pool-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  POOL_CANDIDATES,
  SAVED_LISTS,
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

function smartCandidates(id: SmartListId): PoolCandidate[] {
  switch (id) {
    case "recent":
      return POOL_CANDIDATES.filter((candidate) =>
        /m ago|h ago|^Today|^Yesterday|^[1-6]d ago/.test(candidate.lastActivity)
      );
    case "revealed":
      return POOL_CANDIDATES.filter(
        (candidate) => candidate.emailRevealed || candidate.phoneRevealed
      );
    default:
      return POOL_CANDIDATES;
  }
}

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
  const [selection, setSelection] = useState<PanelSelection>({
    kind: "smart",
    id: "all",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeLists = SAVED_LISTS.filter((list) => !list.archived);
  const archivedLists = SAVED_LISTS.filter((list) => list.archived);

  const currentList: SavedList | null =
    selection.kind === "list"
      ? (SAVED_LISTS.find((list) => list.id === selection.id) ?? null)
      : null;

  const currentSmart =
    selection.kind === "smart"
      ? SMART_LISTS.find((entry) => entry.id === selection.id)!
      : null;

  const candidates = useMemo(() => {
    if (currentList) {
      return POOL_CANDIDATES.filter((candidate) =>
        currentList.candidateIds.includes(candidate.id)
      );
    }
    return smartCandidates(selection.id as SmartListId);
  }, [currentList, selection.id]);

  function select(next: PanelSelection) {
    setSelection(next);
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

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      {/* Left panel */}
      <aside className="h-fit rounded-xl border border-border bg-card p-2 lg:sticky lg:top-20">
        <nav aria-label="Saved lists">
          <ul className="space-y-0.5">
            {SMART_LISTS.map((entry) => (
              <li key={entry.id}>
                <NavButton
                  active={selection.kind === "smart" && selection.id === entry.id}
                  onClick={() => select({ kind: "smart", id: entry.id })}
                  icon={entry.icon}
                  label={entry.label}
                  count={smartCandidates(entry.id).length}
                />
              </li>
            ))}
          </ul>

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
                  count={list.candidateIds.length}
                />
              </li>
            ))}
          </ul>

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
                  count={list.candidateIds.length}
                  muted
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-2 border-t border-border p-1.5">
          <CreateListDialog
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
            {currentList?.archived ? (
              <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground">
                <Archive aria-hidden className="size-3" />
                Archived
              </span>
            ) : null}
          </div>

          <dl className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Candidate count</dt>
              <Users aria-hidden className="size-3.5" />
              <dd>
                <span className="font-medium tabular-nums text-foreground">
                  {candidates.length}
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
          {candidates.length > 0 ? (
            <PoolTable
              candidates={candidates}
              selected={selected}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onRemove={() => {}}
              caption={`Candidates in ${currentList ? currentList.name : currentSmart!.label}`}
            />
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
    </div>
  );
}
