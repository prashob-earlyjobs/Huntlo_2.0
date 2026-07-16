"use client";

import { ListFilter } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface FilterOption {
  id: string;
  label: string;
}

export function FilterPopover({
  label,
  options,
  selected: selectedProp,
  onToggle,
  variant = "outline",
  className,
}: {
  label: string;
  options: FilterOption[];
  /** Controlled selected option ids. Falls back to internal state when omitted. */
  selected?: string[];
  onToggle?: (id: string) => void;
  /** `ghost` renders a lighter chip for toolbars with several filters side by side. */
  variant?: "outline" | "ghost";
  className?: string;
}) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const selectedSet = selectedProp
    ? new Set(selectedProp)
    : internalSelected;

  function toggle(id: string) {
    if (onToggle) {
      onToggle(id);
      return;
    }
    setInternalSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant={variant} size="sm" className={className}>
            <ListFilter aria-hidden />
            {label}
            {selectedSet.size > 0 ? (
              <span className="rounded-sm bg-muted px-1 text-xs font-medium tabular-nums text-foreground">
                {selectedSet.size}
              </span>
            ) : null}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-56 p-1">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Filter by {label.toLowerCase()}
        </p>
        {options.map((option) => {
          const isActive = selectedSet.has(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              aria-pressed={isActive}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                isActive && "bg-muted font-medium text-foreground hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
