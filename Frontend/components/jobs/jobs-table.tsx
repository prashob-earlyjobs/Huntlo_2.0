"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Briefcase,
  Copy,
  MoreHorizontal,
  Pause,
  PenLine,
  Play,
  Send,
  Trash2,
  UserSearch,
} from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage, jobsApi } from "@/lib/api";
import { hasPermission } from "@/lib/access-control";
import type { JobListItem } from "@/lib/mock-jobs";
import { ROUTES, jobDetailPath, jobEditPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers";

const HEAD =
  "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function experienceLabel(job: JobListItem) {
  return `${job.experienceMin}–${job.experienceMax} yrs`;
}

export function JobsTable({
  jobs,
  className,
  onJobUpdated,
  onJobRemoved,
  onActionMessage,
}: {
  jobs: JobListItem[];
  className?: string;
  onJobUpdated?: (job: JobListItem) => void;
  onJobRemoved?: (jobId: string) => void;
  onActionMessage?: (message: string, variant?: "success" | "error") => void;
}) {
  const router = useRouter();

  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No jobs match your filters"
        description="Try clearing filters or create a new hiring requirement to get started."
        actionLabel="Create Job"
        actionHref={ROUTES.jobsNew}
        className={className}
      />
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        <caption className="sr-only">
          Jobs with pipeline counts, owners and status
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Job</TableHead>
            <TableHead className={HEAD}>Owner</TableHead>
            <TableHead className={HEAD}>Posted</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const href = jobDetailPath(job.id);
            return (
              <TableRow
                key={job.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer"
                onClick={() => router.push(href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(href);
                  }
                }}
              >
                <TableCell className="py-2">
                  <span className="font-medium text-foreground">{job.title}</span>
                  <p className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    {job.department} · {job.location} · {experienceLabel(job)}
                  </p>
                </TableCell>
                <TableCell className="py-2">
                  <p className="text-sm whitespace-nowrap text-foreground">{job.recruiter}</p>
                  <p className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                    Hiring manager: {job.hiringManager}
                  </p>
                </TableCell>
                <TableCell className="py-2 text-sm whitespace-nowrap text-muted-foreground">
                  {job.createdAt}
                </TableCell>
                <TableCell className="py-2">
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell
                  className="py-2 text-right"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <JobRowActions
                    job={job}
                    onJobUpdated={onJobUpdated}
                    onJobRemoved={onJobRemoved}
                    onActionMessage={onActionMessage}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function JobRowActions({
  job,
  onJobUpdated,
  onJobRemoved,
  onActionMessage,
}: {
  job: JobListItem;
  onJobUpdated?: (job: JobListItem) => void;
  onJobRemoved?: (jobId: string) => void;
  onActionMessage?: (message: string, variant?: "success" | "error") => void;
}) {
  const router = useRouter();
  const { user, permissions } = useAuth();
  const canDelete =
    hasPermission(permissions, "jobs:delete") ||
    Boolean(user?.id && job.createdBy && job.createdBy === user.id);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function runAction(
    action: "duplicate" | "pause" | "reopen" | "archive"
  ) {
    if (busy) return;
    setBusy(true);
    try {
      let updated: JobListItem;
      if (action === "duplicate") {
        updated = await jobsApi.duplicate(job.id);
        onJobUpdated?.(updated);
        onActionMessage?.(`Duplicated “${job.title}”.`, "success");
        router.push(jobEditPath(updated.id));
        return;
      }
      if (action === "pause") {
        updated = await jobsApi.pause(job.id);
        onJobUpdated?.(updated);
        onActionMessage?.(`Paused “${job.title}”.`, "success");
        return;
      }
      if (action === "reopen") {
        updated = await jobsApi.reopen(job.id);
        onJobUpdated?.(updated);
        onActionMessage?.(`Reopened “${job.title}”.`, "success");
        return;
      }
      updated = await jobsApi.archive(job.id);
      onJobUpdated?.(updated);
      onActionMessage?.(`Archived “${job.title}”.`, "success");
    } catch (error) {
      onActionMessage?.(
        getApiErrorMessage(error, `Unable to ${action} job.`),
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  const canPause = job.status === "Active";
  const canReopen =
    job.status === "Paused" ||
    job.status === "On Hold" ||
    job.status === "Archived";
  const canArchive = job.status !== "Archived";

  async function deleteJob() {
    if (busy) return false;
    setBusy(true);
    try {
      await jobsApi.remove(job.id);
      onJobRemoved?.(job.id);
      onActionMessage?.(`Deleted “${job.title}”.`, "success");
      return true;
    } catch (error) {
      onActionMessage?.(
        getApiErrorMessage(error, "Unable to delete job."),
        "error"
      );
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Actions for ${job.title}`}
            disabled={busy}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem render={<Link href={jobDetailPath(job.id)} />}>
          <Briefcase aria-hidden />
          View job
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={jobEditPath(job.id)} />}>
          <PenLine aria-hidden />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.search} />}>
          <UserSearch aria-hidden />
          Source candidates
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.outreach} />}>
          <Send aria-hidden />
          Create outreach
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy}
          onClick={() => void runAction("duplicate")}
        >
          <Copy aria-hidden />
          Duplicate
        </DropdownMenuItem>
        {canPause ? (
          <DropdownMenuItem
            disabled={busy}
            onClick={() => void runAction("pause")}
          >
            <Pause aria-hidden />
            Pause job
          </DropdownMenuItem>
        ) : null}
        {canReopen ? (
          <DropdownMenuItem
            disabled={busy}
            onClick={() => void runAction("reopen")}
          >
            <Play aria-hidden />
            Reopen job
          </DropdownMenuItem>
        ) : null}
        {canArchive ? (
          <DropdownMenuItem
            variant="destructive"
            disabled={busy}
            onClick={() => void runAction("archive")}
          >
            <Archive aria-hidden />
            Archive
          </DropdownMenuItem>
        ) : null}
        {canDelete ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 aria-hidden />
              Delete
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
    <AlertDialog
      open={confirmDelete}
      onOpenChange={(open) => {
        if (busy && !open) return;
        setConfirmDelete(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{job.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the job from your workspace. Linked pipeline data may
            remain for audit purposes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={busy}
            onClick={(event) => {
              event.preventDefault();
              void (async () => {
                const ok = await deleteJob();
                if (ok) setConfirmDelete(false);
              })();
            }}
          >
            {busy ? "Deleting…" : "Delete job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
