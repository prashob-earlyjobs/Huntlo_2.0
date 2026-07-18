"use client";

import { CircleHelp, EllipsisVertical, Gauge, Monitor, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission } from "@/lib/access-control";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

export function HeaderOverflowMenu() {
  const { theme, setTheme } = useTheme();
  const { permissions } = useAuth();
  const canViewPlans = hasPermission(permissions, "plans:view");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="More actions"
            className="sm:hidden"
          />
        }
      >
        <EllipsisVertical aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {canViewPlans ? (
          <DropdownMenuItem render={<Link href={ROUTES.plans} />}>
            <Gauge aria-hidden />
            <span className="flex-1">Usage</span>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun aria-hidden className="dark:hidden" />
            <Moon aria-hidden className="hidden dark:block" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as string)}
            >
              <DropdownMenuRadioItem value="light">
                <Sun aria-hidden />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon aria-hidden />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor aria-hidden />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem>
          <CircleHelp aria-hidden />
          Help & support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
