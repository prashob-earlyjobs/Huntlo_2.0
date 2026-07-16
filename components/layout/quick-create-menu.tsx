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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/routes";

const QUICK_CREATE_OPTIONS = [
  { title: "Create Job", href: ROUTES.jobsNew, icon: Briefcase },
  { title: "Search Candidates", href: ROUTES.search, icon: Search },
  { title: "Create Outreach Campaign", href: ROUTES.outreach, icon: Send },
  { title: "Start Screening", href: ROUTES.screening, icon: AudioLines },
  { title: "Schedule Interview", href: ROUTES.interviews, icon: CalendarClock },
  { title: "Import Candidates", href: ROUTES.candidates, icon: Upload },
] as const;

export function QuickCreateMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button size="sm" aria-label="Quick create" />}
      >
        <Plus aria-hidden />
        <span className="hidden sm:inline">Create</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Quick create</DropdownMenuLabel>
          {QUICK_CREATE_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.title} render={<Link href={option.href} />}>
              <option.icon aria-hidden />
              {option.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
