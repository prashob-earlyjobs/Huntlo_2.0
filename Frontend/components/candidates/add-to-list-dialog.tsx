"use client";

import { Check, ListPlus, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { candidatePoolApi, getApiErrorMessage } from "@/lib/api";
import type { SavedList } from "@/lib/mock-candidates";

const SEARCH_DEBOUNCE_MS = 300;
const BULK_WRITE_SIZE = 200;

export function AddToListDialog({
  open,
  onOpenChange,
  sourcedCandidateIds,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcedCandidateIds: string[];
  onSaved: (list: SavedList, savedCount: number) => void;
}) {
  const searchId = useId();
  const listNameId = useId();
  const [mode, setMode] = useState<"existing" | "create">("existing");
  const [query, setQuery] = useState("");
  const [lists, setLists] = useState<SavedList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [loadingLists, setLoadingLists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMode("existing");
    setQuery("");
    setSelectedListId(null);
    setNewListName("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || mode !== "existing") return;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoadingLists(true);
      setError(null);
      void candidatePoolApi
        .listLists({ search: query.trim() || undefined, limit: 100 }, controller.signal)
        .then((items) => {
          if (controller.signal.aborted) return;
          setLists(items);
          setSelectedListId((current) =>
            current && items.some((list) => list.id === current) ? current : null
          );
        })
        .catch((err) => {
          if (!controller.signal.aborted) setError(getApiErrorMessage(err));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoadingLists(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [mode, open, query]);

  async function handleSave() {
    if (!sourcedCandidateIds.length) return;
    if (mode === "existing" && !selectedListId) {
      setError("Choose a list first.");
      return;
    }
    if (mode === "create" && !newListName.trim()) {
      setError("Enter a name for the new list.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let targetList = lists.find((list) => list.id === selectedListId) ?? null;
      if (mode === "create") {
        targetList = await candidatePoolApi.createList({
          name: newListName.trim(),
          visibility: "Team",
        });
        setLists((current) => [targetList!, ...current]);
        setSelectedListId(targetList.id);
      }
      if (!targetList) {
        setError("Choose a list first.");
        return;
      }

      let savedCount = 0;
      for (let index = 0; index < sourcedCandidateIds.length; index += BULK_WRITE_SIZE) {
        const result = await candidatePoolApi.bulkSaveSourcedToList(
          sourcedCandidateIds.slice(index, index + BULK_WRITE_SIZE),
          targetList.id
        );
        savedCount += result.saved;
      }

      onSaved(targetList, savedCount);
      onOpenChange(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const selectedList = lists.find((list) => list.id === selectedListId) ?? null;
  const count = sourcedCandidateIds.length;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !saving && onOpenChange(nextOpen)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to list</DialogTitle>
          <DialogDescription>
            Add {count === 1 ? "this candidate" : `${count} candidates`} to an existing
            list or create a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={mode === "existing" ? "secondary" : "outline"}
              onClick={() => {
                setMode("existing");
                setError(null);
              }}
            >
              <ListPlus aria-hidden />
              Existing list
            </Button>
            <Button
              type="button"
              variant={mode === "create" ? "secondary" : "outline"}
              onClick={() => {
                setMode("create");
                setError(null);
              }}
            >
              <Plus aria-hidden />
              Create new
            </Button>
          </div>

          {mode === "existing" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={searchId}>Search lists</Label>
                <div className="relative">
                  <Search
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id={searchId}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search by list name"
                    className="pl-8"
                    autoComplete="off"
                  />
                  {loadingLists ? (
                    <Loader2
                      aria-hidden
                      className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    />
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`${searchId}-select`}>List</Label>
                <Select
                  value={selectedListId}
                  onValueChange={(value) => {
                    setSelectedListId(value);
                    setError(null);
                  }}
                >
                  <SelectTrigger id={`${searchId}-select`} className="w-full">
                    <SelectValue
                      placeholder={
                        loadingLists
                          ? "Loading lists…"
                          : lists.length
                            ? "Choose a list"
                            : "No lists found"
                      }
                    >
                      {selectedList?.name}
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
                {selectedList ? (
                  <p className="text-xs text-muted-foreground">
                    {selectedList.candidateCount} candidates currently in this list.
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor={listNameId}>New list name</Label>
              <Input
                id={listNameId}
                value={newListName}
                onChange={(event) => {
                  setNewListName(event.target.value);
                  setError(null);
                }}
                placeholder="e.g. Senior React candidates"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !saving) void handleSave();
                }}
              />
              <p className="text-xs text-muted-foreground">
                The new list will be visible to your team.
              </p>
            </div>
          )}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              saving ||
              !count ||
              (mode === "existing" ? !selectedListId : !newListName.trim())
            }
            onClick={() => void handleSave()}
          >
            {saving ? <Loader2 aria-hidden className="animate-spin" /> : <Check aria-hidden />}
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
