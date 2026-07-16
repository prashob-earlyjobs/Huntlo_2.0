"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_NAV_ITEMS, ADMIN_NAV_SECTIONS } from "@/lib/admin-navigation";
import { ADMIN_ROUTE_LABELS, type AdminRoute } from "@/lib/admin-routes";
import { ADMIN_OPERATOR } from "@/lib/mock-admin";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

function useActiveAdminHref(): string | undefined {
  const pathname = usePathname();
  return ADMIN_NAV_ITEMS.map((item) => item.href as string)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
}

export function AdminHeader() {
  const pathname = usePathname();
  const activeHref = useActiveAdminHref();
  const [open, setOpen] = useState(false);

  const title =
    ADMIN_ROUTE_LABELS[(activeHref as AdminRoute) ?? pathname] ??
    "Administration";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        aria-label="Open admin navigation"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden />
      </Button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary-foreground uppercase">
            Admin
          </span>
          <h1 className="truncate text-sm font-semibold text-foreground sm:text-base">
            {title}
          </h1>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Huntlo platform administration · UI preview
        </p>
      </div>

      <ThemeToggle />
      <CandidateAvatar name={ADMIN_OPERATOR.name} />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <SheetTitle className="flex items-center gap-2">
              <BrandLogo showTagline={false} />
              <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground uppercase">
                Admin
              </span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Huntlo platform administration navigation
            </SheetDescription>
          </SheetHeader>
          <nav aria-label="Admin navigation" className="space-y-4 px-3 py-4">
            {ADMIN_NAV_SECTIONS.map((section) => (
              <div key={section.label}>
                <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = activeHref === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex min-h-10 items-center gap-2 rounded-lg px-2 py-1.5 text-sm",
                            isActive
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                          )}
                        >
                          <item.icon aria-hidden className="size-4" />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href={ROUTES.home} />}
              onClick={() => setOpen(false)}
            >
              Recruiter workspace
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
