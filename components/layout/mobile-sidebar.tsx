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
      <SheetContent side="left" className="w-[290px] gap-0 bg-sidebar p-0">
        <SheetHeader className="border-b border-sidebar-border py-3">
          <SheetTitle>
            <Link
              href={ROUTES.home}
              onClick={() => setOpen(false)}
              aria-label="Huntlo home"
              className="inline-block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <BrandLogo variant="full" />
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Main navigation for Huntlo
          </SheetDescription>
        </SheetHeader>
        <div className="px-2 pt-2">
          <WorkspaceSwitcher />
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <NavList onNavigate={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
