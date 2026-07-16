"use client";

import Link from "next/link";
import { CircleHelp, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NavList } from "@/components/layout/nav-list";
import { useSidebar } from "@/components/layout/sidebar-context";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { MOCK_USER } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-40 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-2"
        )}
      >
        <Link
          href={ROUTES.home}
          aria-label="Huntlo home"
          className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <BrandLogo variant={collapsed ? "compact" : "full"} />
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto text-muted-foreground"
            onClick={toggle}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose aria-hidden />
          </Button>
        )}
      </div>

      <div className={cn("shrink-0 px-2 pt-2", collapsed && "px-2")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <NavList collapsed={collapsed} />
      </ScrollArea>

      <div className="shrink-0 border-t border-sidebar-border p-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={toggle}
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen aria-hidden />
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground"
                    aria-label="Help & support"
                  />
                }
              >
                <CircleHelp aria-hidden />
              </TooltipTrigger>
              <TooltipContent side="right">Help & support</TooltipContent>
            </Tooltip>
            <CandidateAvatar name={MOCK_USER.name} className="mt-1" />
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
            >
              <CircleHelp aria-hidden />
              Help & support
            </Button>
            <div className="mt-1 flex items-center gap-2 rounded-lg px-2 py-1.5">
              <CandidateAvatar name={MOCK_USER.name} />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-medium text-sidebar-foreground">
                  {MOCK_USER.name}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {MOCK_USER.email}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
