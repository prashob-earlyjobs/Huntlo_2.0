"use client";

import { Check, ListPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from "@/components/ui/textarea";
import type { ListVisibility, SavedList } from "@/lib/mock-candidates";
import { getApiErrorMessage, candidatePoolApi, jobsApi } from "@/lib/api";
import type { JobListItem } from "@/lib/api/contracts";

const VISIBILITY_OPTIONS: { value: ListVisibility; hint: string }[] = [
  { value: "Private", hint: "Only you can see this list" },
  { value: "Team", hint: "Visible to your recruiting team" },
  { value: "Workspace", hint: "Visible to everyone in the workspace" },
];

export function CreateListDialog({
  trigger,
  onCreated,
  open: openProp,
  onOpenChange,
}: {
  trigger?: React.ReactElement | null;
  onCreated?: (list: SavedList) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ListVisibility>("Team");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jobs, setJobs] = useState<JobListItem[]>([]);

  const activeJobs = jobs.filter((job) => job.status !== "Archived");
  const jobItems = Object.fromEntries(
    activeJobs.map((job) => [job.id, job.title || job.id])
  );
  const visibilityItems = Object.fromEntries(
    VISIBILITY_OPTIONS.map((option) => [option.value, option.value])
  );

  useEffect(() => {
    let cancelled = false;
    void jobsApi
      .list({ limit: 100 })
      .then((rows) => {
        if (!cancelled) setJobs(rows);
      })
      .catch(() => {
        // Leave the job picker empty when the jobs API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setJobId(null);
    setVisibility("Team");
    setTags("");
    setError(null);
    setCreated(false);
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("List name is required.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const list = await candidatePoolApi.createList({
        name: name.trim(),
        description: description.trim() || undefined,
        jobId,
        visibility,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setCreated(true);
      onCreated?.(list);
      window.setTimeout(() => {
        setCreated(false);
        resetForm();
        setOpen(false);
      }, 900);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy && !next) return;
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      {trigger !== null ? (
        <DialogTrigger
          render={
            trigger ?? (
              <Button size="sm" variant="outline">
                <ListPlus aria-hidden />
                Create List
              </Button>
            )
          }
        />
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create list</DialogTitle>
          <DialogDescription>
            Group candidates into a reusable list shared with your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="list-name">
              List name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="list-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Bengaluru React Developers"
              aria-invalid={Boolean(error)}
            />
            {error ? (
              <p role="alert" className="text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this list for?"
              className="min-h-16"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="list-job">Related job</Label>
              <Select
                items={jobItems}
                value={jobId}
                onValueChange={(value) => setJobId(value)}
              >
                <SelectTrigger id="list-job" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {activeJobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="list-visibility">Visibility</Label>
              <Select
                items={visibilityItems}
                value={visibility}
                onValueChange={(value) =>
                  value && setVisibility(value as ListVisibility)
                }
              >
                <SelectTrigger id="list-visibility" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {
                  VISIBILITY_OPTIONS.find((option) => option.value === visibility)
                    ?.hint
                }
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-tags">Tags</Label>
            <Input
              id="list-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="frontend, bengaluru (comma-separated)"
            />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button
            type="button"
            size="sm"
            onClick={() => void handleCreate()}
            disabled={busy}
          >
            {busy ? (
              "Creating…"
            ) : created ? (
              <>
                <Check aria-hidden />
                List created
              </>
            ) : (
              "Create List"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
