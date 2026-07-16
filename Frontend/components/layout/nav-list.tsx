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

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={item.disabled || undefined}
      tabIndex={item.disabled ? -1 : undefined}
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
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1 px-2 py-2">
      {NAV_SECTIONS.map((section, index) => (
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
