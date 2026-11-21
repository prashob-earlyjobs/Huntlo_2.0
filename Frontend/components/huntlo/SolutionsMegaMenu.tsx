"use client";

import { cn } from "@/lib/utils";
import {
  V2_SOLUTIONS_MEGA,
  type V2SolutionsMegaTone,
} from "@/lib/v2Nav";

const toneHeader: Record<V2SolutionsMegaTone, string> = {
  hiring: "bg-hiring-grad",
  onboarding: "bg-onboarding-grad",
  retention: "bg-retention-grad",
};

type SolutionsMegaMenuProps = {
  onNavigate?: () => void;
  className?: string;
  /** Compact stacked layout for the mobile drawer */
  stacked?: boolean;
};

export function SolutionsMegaMenu({
  onNavigate,
  className,
  stacked = false,
}: SolutionsMegaMenuProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-popover p-3 shadow-lift sm:p-4",
        className,
      )}
      role="menu"
      aria-label="Solutions"
    >
      <div
        className={cn(
          "grid gap-3",
          stacked ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3 sm:gap-4",
        )}
      >
        {V2_SOLUTIONS_MEGA.map((column) => (
          <div key={column.id} className="min-w-0">
            <a
              href={column.href}
              role="menuitem"
              onClick={onNavigate}
              className={cn(
                "flex min-h-14 items-center rounded-xl px-4 py-3 text-base font-semibold text-white shadow-soft transition-transform hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                toneHeader[column.tone],
              )}
            >
              {column.label}
            </a>
            <ul className="mt-2 space-y-0.5">
              {column.items.map((item) => (
                <li key={item.href + item.label}>
                  <a
                    href={item.href}
                    role="menuitem"
                    onClick={onNavigate}
                    className="flex min-h-11 items-center rounded-lg px-3 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
