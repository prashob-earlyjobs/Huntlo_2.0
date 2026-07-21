"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbTrail } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  const trail = getBreadcrumbTrail(pathname);

  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="gap-1 text-xs">
        {trail.map((crumb, index) => {
          const isLast = index === trail.length - 1;
          return (
            <Fragment key={crumb.href}>
              {index > 0 ? (
                <BreadcrumbSeparator
                  className={
                    index - 1 < trail.length - 2 ? "max-sm:hidden" : undefined
                  }
                />
              ) : null}
              <BreadcrumbItem
                className={
                  !isLast && index < trail.length - 2 ? "max-sm:hidden" : "min-w-0"
                }
              >
                {isLast ? (
                  <BreadcrumbPage className="truncate text-[13px] font-medium">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "truncate text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    )}
                  >
                    {crumb.label}
                  </Link>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
