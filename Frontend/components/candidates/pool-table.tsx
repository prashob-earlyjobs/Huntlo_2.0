"use client";

import {
  AudioLines,
  CalendarClock,
  Eye,
  ListPlus,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PipelineStatusBadge } from "@/components/candidates/pipeline-status-badge";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CandidateStatus, PoolCandidate } from "@/lib/mock-candidates";
import { candidateDetailPath } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

/** One clear, status-appropriate action per row instead of a wall of buttons. */
const PRIMARY_ACTION: Partial<
  Record<CandidateStatus, { label: string; icon: LucideIcon }>
> = {
  Qualified: { label: "Start Screening", icon: AudioLines },
  Screening: { label: "Start Screening", icon: AudioLines },
  Shortlisted: { label: "Schedule Interview", icon: CalendarClock },
  "Interview Scheduled": { label: "Schedule Interview", icon: CalendarClock },
  Rejected: { label: "View Profile", icon: Eye },
  Hired: { label: "View Profile", icon: Eye },
};

function ContactIndicator({ candidate }: { candidate: PoolCandidate }) {
  const { emailRevealed, phoneRevealed } = candidate;
  if (!emailRevealed && !phoneRevealed) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      {emailRevealed ? (
        <Tooltip>
          <TooltipTrigger
            aria-label={`${candidate.name}'s email is revealed`}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Mail aria-hidden className="size-3.5 text-foreground" />
          </TooltipTrigger>
          <TooltipContent>Email revealed</TooltipContent>
        </Tooltip>
      ) : null}
      {phoneRevealed ? (
        <Tooltip>
          <TooltipTrigger
            aria-label={`${candidate.name}'s mobile is revealed`}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Phone aria-hidden className="size-3.5 text-foreground" />
          </TooltipTrigger>
          <TooltipContent>Mobile revealed</TooltipContent>
        </Tooltip>
      ) : null}
    </span>
  );
}

export function PoolTable({
  candidates,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  onRemove,
  lists = [],
  onAddToList,
  onCreateList,
  onStartScreening,
  onScheduleInterview,
  removeLabel = "Remove from pool",
  caption = "Candidate pool with pipeline status, lists and owners",
}: {
  candidates: PoolCandidate[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRemove: (id: string) => void;
  lists?: { id: string; name: string }[];
  onAddToList?: (candidateId: string, listId: string, listName: string) => void;
  onCreateList?: (candidateId: string) => void;
  onStartScreening?: (candidateId: string) => void;
  onScheduleInterview?: (candidateId: string) => void;
  removeLabel?: string;
  caption?: string;
}) {
  const router = useRouter();
  const allSelected =
    candidates.length > 0 && candidates.every((c) => selected.has(c.id));

  function runPrimaryAction(
    candidate: PoolCandidate,
    label: string
  ) {
    if (label === "View Profile") {
      router.push(candidateDetailPath(candidate.id));
      return;
    }
    if (label === "Start Screening") {
      onStartScreening?.(candidate.id);
      return;
    }
    if (label === "Schedule Interview") {
      onScheduleInterview?.(candidate.id);
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`${HEAD} w-8`}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleSelectAll}
                aria-label={
                  allSelected ? "Deselect all candidates" : "Select all candidates"
                }
                className="size-3.5 accent-primary"
              />
            </TableHead>
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={`${HEAD} text-right`}>Experience</TableHead>
            <TableHead className={HEAD}>Skills</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={HEAD}>Contact</TableHead>
            <TableHead className={HEAD}>Lists</TableHead>
            <TableHead className={HEAD}>Owner</TableHead>
            <TableHead className={`${HEAD} w-24 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const primaryAction = PRIMARY_ACTION[candidate.pipelineStatus];
            const PrimaryIcon = primaryAction?.icon;
            return (
              <TableRow
                key={candidate.id}
                data-selected={selected.has(candidate.id) || undefined}
                className="data-selected:bg-brand-subtle/40"
              >
                <TableCell className="py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(candidate.id)}
                    onChange={() => onToggleSelect(candidate.id)}
                    aria-label={`Select ${candidate.name}`}
                    className="size-3.5 accent-primary"
                  />
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <CandidateAvatar
                      name={candidate.name}
                      src={candidate.avatarUrl}
                      className="size-7"
                    />
                    <div className="min-w-0">
                      <Link
                        href={candidateDetailPath(candidate.id)}
                        className="block truncate text-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        {candidate.name}
                      </Link>
                      <p className="max-w-52 truncate text-xs text-muted-foreground">
                        {candidate.currentRole} · {candidate.currentCompany}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-right text-sm tabular-nums">
                  {candidate.experienceYears} yrs
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex max-w-40 flex-wrap gap-1">
                    {candidate.skills.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 2 ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        +{candidate.skills.length - 2}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <PipelineStatusBadge status={candidate.pipelineStatus} />
                </TableCell>
                <TableCell className="py-2.5">
                  <ContactIndicator candidate={candidate} />
                </TableCell>
                <TableCell className="py-2.5">
                  {candidate.lists.length > 0 ? (
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={`In ${candidate.lists.length} lists`}
                        className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <span className="inline-flex h-5 items-center rounded-md bg-muted px-2 text-xs font-medium whitespace-nowrap tabular-nums text-muted-foreground">
                          {candidate.lists.length}{" "}
                          {candidate.lists.length === 1 ? "list" : "lists"}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {candidate.lists.join(" · ")}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                  {candidate.owner}
                </TableCell>
                <TableCell className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {primaryAction && PrimaryIcon ? (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              aria-label={`${primaryAction.label} for ${candidate.name}`}
                              onClick={() =>
                                runPrimaryAction(candidate, primaryAction.label)
                              }
                            />
                          }
                        >
                          <PrimaryIcon aria-hidden />
                        </TooltipTrigger>
                        <TooltipContent>{primaryAction.label}</TooltipContent>
                      </Tooltip>
                    ) : null}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            aria-label={`Actions for ${candidate.name}`}
                          />
                        }
                      >
                        <MoreHorizontal aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(candidateDetailPath(candidate.id))
                          }
                        >
                          <Eye aria-hidden />
                          View profile
                        </DropdownMenuItem>
                        {onAddToList || onCreateList ? (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ListPlus aria-hidden />
                              Add to list
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-52">
                              <DropdownMenuLabel>Choose list</DropdownMenuLabel>
                              {lists.length > 0 ? (
                                lists.map((list) => (
                                  <DropdownMenuItem
                                    key={list.id}
                                    onClick={() =>
                                      onAddToList?.(
                                        candidate.id,
                                        list.id,
                                        list.name
                                      )
                                    }
                                  >
                                    {list.name}
                                  </DropdownMenuItem>
                                ))
                              ) : (
                                <DropdownMenuItem disabled>
                                  No lists yet
                                </DropdownMenuItem>
                              )}
                              {onCreateList ? (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => onCreateList(candidate.id)}
                                  >
                                    <Plus aria-hidden />
                                    Create new list
                                  </DropdownMenuItem>
                                </>
                              ) : null}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        ) : null}
                        {onStartScreening ? (
                          <DropdownMenuItem
                            onClick={() => onStartScreening(candidate.id)}
                          >
                            <AudioLines aria-hidden />
                            Start screening
                          </DropdownMenuItem>
                        ) : null}
                        {onScheduleInterview ? (
                          <DropdownMenuItem
                            onClick={() => onScheduleInterview(candidate.id)}
                          >
                            <CalendarClock aria-hidden />
                            Schedule interview
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onRemove(candidate.id)}
                        >
                          <Trash2 aria-hidden />
                          {removeLabel}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
