"use client";

import {
  AudioLines,
  CalendarClock,
  Eye,
  ListPlus,
  Mail,
  MoreHorizontal,
  Phone,
  Send,
  Trash2,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PoolCandidate } from "@/lib/mock-candidates";
import { candidateDetailPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function ContactIcons({ candidate }: { candidate: PoolCandidate }) {
  const emailRevealed = candidate.emailRevealed;
  const phoneRevealed = candidate.phoneRevealed;
  if (!emailRevealed && !phoneRevealed) {
    return <span className="text-xs text-muted-foreground">Not revealed</span>;
  }
  return (
    <span className="flex items-center gap-1">
      {emailRevealed ? (
        <Tooltip>
          <TooltipTrigger
            aria-label={`${candidate.name}'s email is revealed`}
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="flex size-5 items-center justify-center rounded-md bg-success/10">
              <Mail aria-hidden className="size-3 text-success" />
            </span>
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
            <span className="flex size-5 items-center justify-center rounded-md bg-success/10">
              <Phone aria-hidden className="size-3 text-success" />
            </span>
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
  caption = "Candidate pool with pipeline status, lists and owners",
}: {
  candidates: PoolCandidate[];
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRemove: (id: string) => void;
  caption?: string;
}) {
  const router = useRouter();
  const allSelected =
    candidates.length > 0 && candidates.every((c) => selected.has(c.id));

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
            <TableHead className={HEAD}>Current role</TableHead>
            <TableHead className={HEAD}>Company</TableHead>
            <TableHead className={HEAD}>Location</TableHead>
            <TableHead className={`${HEAD} text-right`}>Experience</TableHead>
            <TableHead className={HEAD}>Skills</TableHead>
            <TableHead className={HEAD}>Lists</TableHead>
            <TableHead className={HEAD}>Pipeline status</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={HEAD}>Owner</TableHead>
            <TableHead className={HEAD}>Contact</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
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
                  <CandidateAvatar name={candidate.name} className="size-8" />
                  <div className="min-w-0">
                    <Link
                      href={candidateDetailPath(candidate.id)}
                      className="block truncate text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {candidate.name}
                    </Link>
                    <p className="max-w-48 truncate text-xs text-muted-foreground">
                      {candidate.headline}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.currentRole}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.currentCompany}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.location}
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
              <TableCell className="py-2.5">
                <PipelineStatusBadge status={candidate.pipelineStatus} />
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.lastActivity}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.owner}
              </TableCell>
              <TableCell className={cn("py-2.5 whitespace-nowrap")}>
                <ContactIcons candidate={candidate} />
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${candidate.name}`}
                      />
                    }
                  >
                    <MoreHorizontal aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() => router.push(candidateDetailPath(candidate.id))}
                    >
                      <Eye aria-hidden />
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ListPlus aria-hidden />
                      Add to list
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Send aria-hidden />
                      Add to outreach
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <AudioLines aria-hidden />
                      Start screening
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CalendarClock aria-hidden />
                      Schedule interview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onRemove(candidate.id)}
                    >
                      <Trash2 aria-hidden />
                      Remove from pool
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
