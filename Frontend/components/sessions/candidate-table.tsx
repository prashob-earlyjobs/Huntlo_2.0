"use client";

import {
  Bookmark,
  BookmarkCheck,
  Eye,
  Link2,
  MapPin,
  MoreHorizontal,
  Send,
} from "lucide-react";

import { ContactReveal, type RevealState } from "@/components/sessions/contact-reveal";
import { MatchScoreDetail } from "@/components/sessions/match-score";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { ContactStatus, SessionCandidate } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const CONTACT_STATUS_CLASSES: Record<ContactStatus, string> = {
  "Not contacted": "bg-muted text-muted-foreground",
  Contacted: "bg-info/10 text-info",
  Replied: "bg-success/10 text-success",
  "In outreach": "bg-brand-subtle text-primary",
};

export function CandidateTable({
  candidates,
  density,
  selected,
  onToggleSelect,
  onToggleSelectAll,
  savedMap,
  onToggleSave,
  revealedMap,
  onReveal,
  onOpenProfile,
  onAddToOutreach,
}: {
  candidates: SessionCandidate[];
  density: "comfortable" | "compact";
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  savedMap: Record<string, boolean>;
  onToggleSave: (id: string) => void;
  revealedMap: Record<string, RevealState>;
  onReveal: (id: string, kind: "email" | "phone") => void;
  onOpenProfile: (id: string) => void;
  onAddToOutreach: (id: string) => void;
}) {
  const allSelected =
    candidates.length > 0 && candidates.every((c) => selected.has(c.id));
  const cellPad = density === "compact" ? "py-1.5" : "py-3";

  return (
    <div className="overflow-x-auto">
      <Table>
        <caption className="sr-only">
          Search results with match scores, contact status and actions
        </caption>
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
            <TableHead className={HEAD}>Key skills</TableHead>
            <TableHead className={HEAD}>Match</TableHead>
            <TableHead className={HEAD}>Contact</TableHead>
            <TableHead className={HEAD}>Status</TableHead>
            <TableHead className={`${HEAD} w-16 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const isSaved = savedMap[candidate.id] ?? candidate.saved;
            const revealed = revealedMap[candidate.id] ?? {
              email: false,
              phone: false,
            };
            return (
              <TableRow
                key={candidate.id}
                data-selected={selected.has(candidate.id) || undefined}
                className="data-selected:bg-brand-subtle/40"
              >
                <TableCell className={cellPad}>
                  <input
                    type="checkbox"
                    checked={selected.has(candidate.id)}
                    onChange={() => onToggleSelect(candidate.id)}
                    aria-label={`Select ${candidate.name}`}
                    className="size-3.5 accent-primary"
                  />
                </TableCell>
                <TableCell className={cellPad}>
                  <div className="flex items-center gap-2.5">
                    <CandidateAvatar
                      name={candidate.name}
                      src={candidate.avatarUrl}
                      className={density === "compact" ? "size-7" : "size-9"}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Tooltip>
                          <TooltipTrigger
                            type="button"
                            onClick={() => onOpenProfile(candidate.id)}
                            className="min-w-0 truncate text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            {candidate.name}
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            {candidate.headline}
                          </TooltipContent>
                        </Tooltip>
                        {candidate.linkedin ? (
                          <Tooltip>
                            <TooltipTrigger
                              aria-label={`${candidate.name} has a LinkedIn profile`}
                              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                            >
                              <Link2
                                aria-hidden
                                className="size-3 text-info"
                              />
                            </TooltipTrigger>
                            <TooltipContent>LinkedIn profile linked</TooltipContent>
                          </Tooltip>
                        ) : null}
                      </div>
                      <p className="max-w-52 truncate text-xs text-muted-foreground">
                        {candidate.currentRole} · {candidate.currentCompany}
                      </p>
                      {density === "comfortable" ? (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin aria-hidden className="size-3" />
                          {candidate.location}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={`${cellPad} text-right text-sm tabular-nums`}
                >
                  {candidate.experienceYears} yrs
                </TableCell>
                <TableCell className={cellPad}>
                  <div className="flex max-w-44 flex-wrap gap-1">
                    {candidate.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 ? (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        +{candidate.skills.length - 3}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className={cellPad}>
                  <MatchScoreDetail
                    score={candidate.matchScore}
                    breakdown={candidate.matchBreakdown}
                    name={candidate.name}
                    showLabel={density === "comfortable"}
                  />
                </TableCell>
                <TableCell className={cellPad}>
                  <ContactReveal
                    candidate={candidate}
                    revealed={revealed}
                    onReveal={(kind) => onReveal(candidate.id, kind)}
                  />
                </TableCell>
                <TableCell className={cellPad}>
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
                      CONTACT_STATUS_CLASSES[candidate.contactStatus]
                    )}
                  >
                    {candidate.contactStatus}
                  </span>
                </TableCell>
                <TableCell className={`${cellPad} text-right`}>
                  <div className="flex items-center justify-end gap-0.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      aria-label={
                        isSaved
                          ? `Remove ${candidate.name} from saved`
                          : `Save ${candidate.name}`
                      }
                      aria-pressed={isSaved}
                      onClick={() => onToggleSave(candidate.id)}
                    >
                      {isSaved ? (
                        <BookmarkCheck aria-hidden className="text-primary" />
                      ) : (
                        <Bookmark aria-hidden />
                      )}
                    </Button>
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
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => onOpenProfile(candidate.id)}>
                          <Eye aria-hidden />
                          View profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onAddToOutreach(candidate.id)}
                        >
                          <Send aria-hidden />
                          Add to outreach
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
