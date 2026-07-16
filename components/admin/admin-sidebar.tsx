"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/layout/sidebar-context";
import { ADMIN_NAV_ITEMS, ADMIN_NAV_SECTIONS } from "@/lib/admin-navigation";
import { ADMIN_ROUTES } from "@/lib/admin-routes";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

function useActiveAdminHref(): string | undefined {
  const pathname = usePathname();
  return ADMIN_NAV_ITEMS.map((item) => item.href as string)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

export function AdminSidebar() {
  const { collapsed, toggle } = useSidebar();
  const activeHref = useActiveAdminHref();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "sticky top-0 z-40 hidden h-svh shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:flex",
        "border-l-4 border-l-primary",
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
          href={ADMIN_ROUTES.dashboard}
          aria-label="Huntlo admin home"
          className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <BrandLogo variant={collapsed ? "compact" : "full"} showTagline={false} />
        </Link>
        {!collapsed ? (
          <>
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
              Admin
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ml-auto text-muted-foreground"
              onClick={toggle}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose aria-hidden />
            </Button>
          </>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Platform console
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Separated from recruiter workspaces
          </p>
        </div>
      ) : (
        <div className="flex justify-center border-b border-sidebar-border py-2">
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground uppercase">
            Admin
          </span>
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <nav aria-label="Admin navigation" className="space-y-4 px-2 py-3">
          {ADMIN_NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed ? (
                <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {section.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeHref === item.href;
                  const link = (
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        collapsed && "justify-center px-0",
                        isActive
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                      )}
                    >
                      <item.icon
                        aria-hidden
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      {!collapsed ? (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.title}
                          </span>
                          {item.badge !== undefined ? (
                            <span className="rounded-md bg-muted px-1.5 py-px text-[10px] font-semibold tabular-nums text-muted-foreground">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <li key={item.href}>
                        <Tooltip>
                          <TooltipTrigger render={link} />
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.href}>{link}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>
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
                    aria-label="Back to workspace"
                    nativeButton={false}
                    render={<Link href={ROUTES.home} />}
                  />
                }
              >
                <ArrowLeft aria-hidden />
              </TooltipTrigger>
              <TooltipContent side="right">Recruiter workspace</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            nativeButton={false}
            render={<Link href={ROUTES.home} />}
          >
            <ArrowLeft aria-hidden />
            Recruiter workspace
          </Button>
        )}
      </div>
    </aside>
  );
}
