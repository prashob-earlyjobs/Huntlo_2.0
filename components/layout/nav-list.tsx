"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAV_ITEMS, NAV_SECTIONS, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Longest nav href that prefixes the current pathname wins active state. */
function useActiveHref(): string | undefined {
  const pathname = usePathname();
  return NAV_ITEMS.map((item) => item.href as string)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

function NavBadge({ item }: { item: NavItem }) {
  if (item.badge === undefined && !item.featureLabel) return null;
  return (
    <span className="ml-auto flex items-center gap-1">
      {item.featureLabel ? (
        <span className="rounded-md bg-brand-subtle px-1.5 py-px text-[10px] font-semibold text-primary">
          {item.featureLabel}
        </span>
      ) : null}
      {item.badge !== undefined ? (
        <span
          className={cn(
            "rounded-md px-1.5 py-px text-[10px] font-semibold tabular-nums",
            item.badgeTone === "warning"
              ? "bg-warning/15 text-warning"
              : "bg-muted text-muted-foreground"
          )}
        >
          {item.badge}
        </span>
      ) : null}
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

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={item.disabled || undefined}
      tabIndex={item.disabled ? -1 : undefined}
      className={cn(
        "flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm outline-none transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring/50",
        isActive
          ? "bg-brand-subtle font-medium text-primary"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        item.disabled && "pointer-events-none opacity-50",
        collapsed && "justify-center px-0"
      )}
    >
      <item.icon
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      />
      {!collapsed && (
        <>
          <span className="truncate">{item.title}</span>
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
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-4 px-2 py-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          {!collapsed ? (
            <p className="px-2.5 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {section.label}
            </p>
          ) : (
            <div aria-hidden className="mx-2 mb-2 border-t border-sidebar-border first:hidden" />
          )}
          <ul className="space-y-0.5">
            {section.items.map((item) => (
              <li key={item.href}>
                <NavLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
