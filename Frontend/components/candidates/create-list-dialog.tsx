"use client";

import { Check, ListPlus } from "lucide-react";
import { useState } from "react";

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
import { JOBS } from "@/lib/mock-jobs";
import type { ListVisibility } from "@/lib/mock-candidates";

const VISIBILITY_OPTIONS: { value: ListVisibility; hint: string }[] = [
  { value: "Private", hint: "Only you can see this list" },
  { value: "Team", hint: "Visible to your recruiting team" },
  { value: "Workspace", hint: "Visible to everyone in the workspace" },
];

export function CreateListDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ListVisibility>("Team");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  function handleCreate() {
    if (!name.trim()) {
      setError("List name is required.");
      return;
    }
    setError(null);
    setCreated(true);
    window.setTimeout(() => setCreated(false), 1600);
  }

  return (
    <Dialog>
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
              <Select value={jobId} onValueChange={(value) => setJobId(value)}>
                <SelectTrigger id="list-job" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {JOBS.filter((job) => job.status !== "Archived").map((job) => (
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
          <Button type="button" size="sm" onClick={handleCreate}>
            {created ? (
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
