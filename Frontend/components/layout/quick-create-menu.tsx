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
import { canAccessPath } from "@/lib/access-control";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

const QUICK_CREATE_OPTIONS = [
  {
    title: "Job",
    href: ROUTES.jobsNew,
    icon: Briefcase,
    permission: "jobs:create",
  },
  {
    title: "Candidate search",
    href: ROUTES.search,
    icon: Search,
    permission: "sourcing:view",
  },
  {
    title: "Outreach campaign",
    href: ROUTES.outreach,
    icon: Send,
    permission: "outreach:create",
  },
  {
    title: "Screening batch",
    href: ROUTES.screening,
    icon: AudioLines,
    permission: "screening:create",
  },
  {
    title: "Interview",
    href: ROUTES.interviews,
    icon: CalendarClock,
    permission: "scheduling:create",
  },
  {
    title: "Import candidates",
    href: ROUTES.candidates,
    icon: Upload,
    permission: "candidates:create",
  },
] as const;

export function QuickCreateMenu() {
  const { permissions } = useAuth();
  const options = QUICK_CREATE_OPTIONS.filter(
    (option) =>
      canAccessPath(permissions, option.href) ||
      permissions.includes("*") ||
      permissions.includes(option.permission) ||
      permissions.includes(`${option.permission.split(":")[0]}:manage`)
  );

  if (options.length === 0) return null;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  data-tour="quick-create"
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
        {options.map((option) => (
          <DropdownMenuItem key={option.title} render={<Link href={option.href} />}>
            <option.icon aria-hidden />
            {option.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
