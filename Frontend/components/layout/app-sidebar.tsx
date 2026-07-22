"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NavList } from "@/components/layout/nav-list";
import { useSidebar } from "@/components/layout/sidebar-context";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { HelpMenu } from "@/components/product-tour/HelpMenu";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "z-40 hidden h-full min-h-0 shrink-0 flex-col overflow-hidden bg-sidebar transition-[width] duration-200 lg:flex",
        collapsed ? "w-[60px]" : "w-[248px]"
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center gap-2 px-3",
          collapsed && "justify-center px-2"
        )}
      >
        <Link
          href={ROUTES.home}
          aria-label="Huntlo home"
          className="min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <BrandLogo variant={collapsed ? "compact" : "full"} />
        </Link>
        {!collapsed ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={toggle}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose aria-hidden />
          </Button>
        ) : null}
      </div>

      <div className={cn("shrink-0 px-2 pb-1", collapsed && "px-1.5")}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <NavList collapsed={collapsed} />
        <div className={cn("px-2 py-2", collapsed && "px-1.5")}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={toggle}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen aria-hidden />
              </Button>
              <HelpMenu variant="sidebar-collapsed" />
            </div>
          ) : (
            <HelpMenu variant="sidebar" />
          )}
        </div>
      </div>
    </aside>
  );
}
