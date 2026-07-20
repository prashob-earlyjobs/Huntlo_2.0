"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { schedulingApi } from "@/lib/api";
import { filterNavSections } from "@/lib/access-control";
import { NAV_ITEMS, type NavItem } from "@/lib/navigation";
import type { TourTargetId } from "@/lib/config/dashboard-tour";
import { ROUTES, type AppRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const NAV_TOUR_TARGETS: Partial<Record<AppRoute, TourTargetId>> = {
  [ROUTES.search]: "source-navigation",
  [ROUTES.candidates]: "candidate-pool-navigation",
  [ROUTES.outreach]: "outreach-navigation",
  [ROUTES.screening]: "screening-navigation",
  [ROUTES.interviews]: "schedule-navigation",
  [ROUTES.integrations]: "integrations-navigation",
};

/** Longest nav href that prefixes the current pathname wins active state. */
function useActiveHref(): string | undefined {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) => item.href as string)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function NavBadge({ item }: { item: NavItem }) {
  if (item.badge === undefined) return null;
  return (
    <span
      className={cn(
        "ml-auto rounded px-1.5 py-px text-[10px] font-medium tabular-nums",
        item.badgeTone === "warning"
          ? "text-warning"
          : "text-muted-foreground"
      )}
    >
      {item.badge}
    </span>
  );
}

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const activeHref = useActiveHref();
  const isActive = activeHref === item.href;

  const tourTarget = NAV_TOUR_TARGETS[item.href];

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={item.disabled || undefined}
      tabIndex={item.disabled ? -1 : undefined}
      {...(tourTarget ? { "data-tour": tourTarget } : {})}
      className={cn(
        "group relative flex items-center gap-2 text-[13px] outline-none transition-colors transition-ui",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        collapsed
          ? "mx-auto size-9 justify-center rounded-md"
          : "h-8 rounded-md px-2",
        isActive
          ? collapsed
            ? "text-primary"
            : "font-medium text-primary"
          : "text-sidebar-foreground/75 hover:text-sidebar-foreground",
        item.disabled && "pointer-events-none opacity-50",
        isActive &&
          (collapsed
            ? "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
            : "before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary")
      )}
    >
      <item.icon
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
        )}
      />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          <NavBadge item={item} />
        </>
      )}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">
        {item.title}
        {item.badge !== undefined ? ` · ${item.badge}` : ""}
      </TooltipContent>
    </Tooltip>
  );
}

export function NavList({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { permissions } = useAuth();
  const [interviewCount, setInterviewCount] = useState<number | undefined>();
  const sections = useMemo(
    () => filterNavSections(permissions),
    [permissions]
  );
  const canViewScheduling = useMemo(
    () =>
      permissions.includes("*") ||
      permissions.some((permission) => permission.startsWith("scheduling:")),
    [permissions]
  );

  const refreshInterviewCount = useCallback(async () => {
    if (!canViewScheduling) {
      setInterviewCount(undefined);
      return;
    }
    try {
      const rows = await schedulingApi.listInterviews({ limit: 100 });
      setInterviewCount(
        rows.filter(
          (row) =>
            row.status !== "Completed" &&
            row.status !== "Cancelled" &&
            row.status !== "No Show"
        ).length
      );
    } catch {
      setInterviewCount(undefined);
    }
  }, [canViewScheduling]);

  useEffect(() => {
    void refreshInterviewCount();
  }, [refreshInterviewCount]);

  useRealtimeRefresh("interview.updated", () => {
    void refreshInterviewCount();
  });

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-2 py-2">
      {sections.map((section, index) => (
        <div
          key={section.label}
          className={cn(index > 0 && (collapsed ? "mt-2.5" : "mt-3"))}
        >
          {!collapsed ? (
            <p className="px-2 pb-1 text-[10px] font-medium text-muted-foreground/80">
              {section.label}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const displayItem =
                item.href === ROUTES.interviews
                  ? { ...item, badge: interviewCount }
                  : item;
              return (
                <li key={item.href}>
                  <NavLink
                    item={displayItem}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
