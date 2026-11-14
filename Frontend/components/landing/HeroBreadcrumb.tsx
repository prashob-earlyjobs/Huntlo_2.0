import Link from "next/link";
import { Fragment } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import type { BreadcrumbSchemaItem } from "@/lib/jsonLd";

/**
 * Visible breadcrumb for dark marketing heroes. Pass the same items given to
 * `breadcrumbJsonLd` so the trail and structured data stay identical; the last
 * item is the current page and is never linked.
 */
export function HeroBreadcrumb({ items }: { items: BreadcrumbSchemaItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-white/60">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <Fragment key={`${item.name}-${index}`}>
              {index > 0 ? (
                <li aria-hidden className="flex items-center text-white/30">
                  <MaterialIcon name="chevron_right" className="text-[16px]!" />
                </li>
              ) : null}
              {isCurrent || !item.href ? (
                <li aria-current={isCurrent ? "page" : undefined} className="font-medium text-white">
                  {item.name}
                </li>
              ) : (
                <li>
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.name}
                  </Link>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
