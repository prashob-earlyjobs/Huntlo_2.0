"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NavList } from "@/components/layout/nav-list";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";
import { ROUTES } from "@/lib/routes";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu aria-hidden />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex h-svh w-[min(100%,280px)] flex-col gap-0 border-r border-sidebar-border bg-sidebar p-0 sm:max-w-none"
      >
        <SheetHeader className="shrink-0 space-y-0 px-4 py-3">
          <SheetTitle>
            <Link
              href={ROUTES.home}
              onClick={() => setOpen(false)}
              aria-label="Huntlo home"
              className="inline-block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <BrandLogo variant="full" className="h-8" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation for Huntlo
          </SheetDescription>
        </SheetHeader>
        <div className="shrink-0 px-3 pb-2">
          <WorkspaceSwitcher />
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <NavList onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
