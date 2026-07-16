"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WORKSPACES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const [activeId, setActiveId] = useState(WORKSPACES[0].id);
  const active = WORKSPACES.find((workspace) => workspace.id === activeId)!;

  const trigger = (
    <DropdownMenuTrigger
      aria-label={`Workspace: ${active.name}`}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50",
        collapsed && "size-9 justify-center p-0"
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-medium text-muted-foreground">
        {active.initials}
      </span>
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[12px] font-medium text-sidebar-foreground">
              {active.name}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground">
              {active.plan}
            </span>
          </span>
          <ChevronsUpDown
            aria-hidden
            className="size-3 shrink-0 text-muted-foreground"
          />
        </>
      ) : null}
    </DropdownMenuTrigger>
  );

  return (
    <DropdownMenu>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={trigger} />
          <TooltipContent side="right">{active.name}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {WORKSPACES.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveId(workspace.id)}
          >
            <span className="flex size-5 items-center justify-center rounded bg-muted text-[9px] font-medium text-muted-foreground">
              {workspace.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px]">{workspace.name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {workspace.plan}
              </span>
            </span>
            {workspace.id === activeId ? (
              <Check aria-hidden className="size-3.5 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus aria-hidden />
          Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
