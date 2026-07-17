"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";

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
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "WS";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function WorkspaceSwitcher({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { organization, setWorkspace } = useAuth();
  const workspaces = useMemo(() => {
    if (!organization) return [];
    return [
      {
        id: organization.id,
        name: organization.name,
        plan: organization.plan || "Plan",
        initials: initialsFromName(organization.name),
      },
    ];
  }, [organization]);

  const [activeId, setActiveId] = useState(workspaces[0]?.id ?? "");
  const active =
    workspaces.find((workspace) => workspace.id === activeId) ?? workspaces[0];

  if (!active) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-muted-foreground",
          collapsed && "size-9 justify-center p-0"
        )}
      >
        {collapsed ? "…" : "No workspace"}
      </div>
    );
  }

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
        <DropdownMenuSeparator />
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => {
              setActiveId(workspace.id);
              setWorkspace(workspace.id);
            }}
          >
            <span className="flex size-6 items-center justify-center rounded bg-muted text-[10px] font-medium">
              {workspace.initials}
            </span>
            <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
            {workspace.id === active.id ? (
              <Check aria-hidden className="size-3.5 text-primary" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
