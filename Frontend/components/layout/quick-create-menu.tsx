"use client";

import Link from "next/link";
import {
  AudioLines,
  Briefcase,
  CalendarClock,
  Plus,
  Search,
  Send,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ROUTES } from "@/lib/routes";

const QUICK_CREATE_OPTIONS = [
  { title: "Job", href: ROUTES.jobsNew, icon: Briefcase },
  { title: "Candidate search", href: ROUTES.search, icon: Search },
  { title: "Outreach campaign", href: ROUTES.outreach, icon: Send },
  { title: "Screening batch", href: ROUTES.screening, icon: AudioLines },
  { title: "Interview", href: ROUTES.interviews, icon: CalendarClock },
  { title: "Import candidates", href: ROUTES.candidates, icon: Upload },
] as const;

export function QuickCreateMenu() {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  className="h-8 gap-1 px-2 sm:px-2.5"
                  aria-label="Create"
                />
              }
            />
          }
        >
          <Plus aria-hidden />
          <span className="hidden sm:inline">Create</span>
        </TooltipTrigger>
        <TooltipContent className="sm:hidden">Create</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-52">
        {QUICK_CREATE_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.title} render={<Link href={option.href} />}>
            <option.icon aria-hidden />
            {option.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
