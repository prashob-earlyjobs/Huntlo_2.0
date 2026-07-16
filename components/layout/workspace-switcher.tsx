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
import { WORKSPACES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const [activeId, setActiveId] = useState(WORKSPACES[0].id);
  const active = WORKSPACES.find((workspace) => workspace.id === activeId)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Workspace: ${active.name}`}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring/50",
          collapsed && "justify-center border-transparent p-1"
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-xs font-semibold text-primary">
          {active.initials}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13px] font-medium text-sidebar-foreground">
                {active.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {active.plan}
              </span>
            </span>
            <ChevronsUpDown aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        {WORKSPACES.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveId(workspace.id)}
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-brand-subtle text-[10px] font-semibold text-primary">
              {workspace.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate">{workspace.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {workspace.plan}
              </span>
            </span>
            {workspace.id === activeId ? (
              <Check aria-hidden className="size-4 text-primary" />
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
