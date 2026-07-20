"use client";

import { CircleHelp, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardProductTourOptional } from "@/hooks/use-dashboard-product-tour";
import { cn } from "@/lib/utils";

type HelpMenuProps = {
  variant?: "icon" | "sidebar" | "sidebar-collapsed";
  className?: string;
};

export function HelpMenu({ variant = "icon", className }: HelpMenuProps) {
  const tour = useDashboardProductTourOptional();
  const canRestart = Boolean(tour?.canRestart);

  async function handleRestart() {
    if (!tour) return;
    await tour.restartProductTour();
  }

  const triggerButton =
    variant === "sidebar" ? (
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-full justify-start px-2 text-[13px] text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label="Help & support"
      >
        <CircleHelp aria-hidden />
        Help & support
      </Button>
    ) : (
      <Button
        variant="ghost"
        size={variant === "sidebar-collapsed" ? "icon-sm" : "icon"}
        className={cn(
          "text-muted-foreground hover:text-foreground",
          className
        )}
        aria-label="Help & support"
      >
        <CircleHelp aria-hidden />
      </Button>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={triggerButton} />
      <DropdownMenuContent
        side={variant.startsWith("sidebar") ? "top" : "bottom"}
        align={variant.startsWith("sidebar") ? "start" : "end"}
        className="w-56"
      >
        <DropdownMenuLabel>Help & support</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canRestart ? (
          <DropdownMenuItem
            onClick={() => {
              void handleRestart();
            }}
          >
            <RotateCcw aria-hidden />
            Restart Product Tour
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled>
            Product tour unavailable
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
