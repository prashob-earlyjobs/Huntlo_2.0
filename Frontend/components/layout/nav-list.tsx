"use client";

import { ChevronDown } from "lucide-react";
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
import { NAV_ITEMS, type NavItem, type NavSection } from "@/lib/navigation";
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

const SECTION_STORAGE_KEY = "huntlo:nav-sections-open:v3";

/** Longest nav href that prefixes the current pathname wins active state. */
function useActiveHref(): string | undefined {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) => item.href as string)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function sectionContainsHref(section: NavSection, href: string | undefined) {
  if (!href) return false;
  return section.items.some((item) => item.href === href);
}

function readStoredOpenSections(): Record<string, boolean> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SECTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistOpenSections(next: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SECTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage failures.
  }
}

/**
 * First visit: open only the first 2 modules.
 * Later visits: restore whatever the user expanded/collapsed.
 */
function resolveOpenSections(labels: string[]): Record<string, boolean> {
  const stored = readStoredOpenSections();
  if (!stored) {
    const initial = Object.fromEntries(
      labels.map((label, index) => [label, index < 2])
    );
    persistOpenSections(initial);
    return initial;
  }
  return Object.fromEntries(
    labels.map((label) => [
      label,
      typeof stored[label] === "boolean" ? stored[label]! : false,
    ])
  );
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
  const activeHref = useActiveHref();
  const [interviewCount, setInterviewCount] = useState<number | undefined>();
  const sections = useMemo(
    () => filterNavSections(permissions),
    [permissions]
  );
  const sectionLabels = useMemo(
    () => sections.map((section) => section.label),
    [sections]
  );
  const sectionLabelsKey = sectionLabels.join("|");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(sectionLabels.map((label, index) => [label, index < 2]))
  );

  // First visit seeds first-2-open; later visits restore saved usage.
  useEffect(() => {
    if (!sectionLabelsKey) return;
    const labels = sectionLabelsKey.split("|").filter(Boolean);
    setOpenSections(resolveOpenSections(labels));
  }, [sectionLabelsKey]);

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

  function toggleSection(label: string) {
    setOpenSections((previous) => {
      const next = {
        ...previous,
        [label]: !(previous[label] ?? false),
      };
      persistOpenSections(next);
      return next;
    });
  }

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0.5 px-2 py-2">
      {sections.map((section, index) => {
        const isActiveSection = sectionContainsHref(section, activeHref);
        // Usage from localStorage; active page section stays visible while you're there.
        const isOpen =
          collapsed ||
          Boolean(openSections[section.label]) ||
          isActiveSection;
        const panelId = `nav-section-${section.label.toLowerCase().replace(/\s+/g, "-")}`;

        return (
          <div
            key={section.label}
            className={cn(
              index > 0 &&
                (collapsed
                  ? "mt-2.5 border-t border-sidebar-border/70 pt-2.5"
                  : "mt-3 border-t border-sidebar-border/70 pt-2")
            )}
          >
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={cn(
                  "group mb-1 flex h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left outline-none transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring/50",
                  isActiveSection
                    ? "text-primary"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[11px] font-medium tracking-[0.06em] uppercase",
                    isActiveSection
                      ? "text-primary"
                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground"
                  )}
                >
                  {section.label}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-3 shrink-0 opacity-70 transition-transform duration-200",
                    isActiveSection
                      ? "text-primary opacity-100"
                      : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground/80 group-hover:opacity-100",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>
            ) : null}
            <ul
              id={panelId}
              hidden={!isOpen}
              className={cn("space-y-0.5", !isOpen && "hidden")}
            >
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
        );
      })}
    </nav>
  );
}
