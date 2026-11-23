import Link from "next/link";
import { Fragment } from "react";

type Crumb = { name: string; href?: string };

export function AgentsBreadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <Fragment key={`${item.name}-${index}`}>
              {index > 0 ? (
                <li aria-hidden className="text-border">
                  /
                </li>
              ) : null}
              {isCurrent || !item.href ? (
                <li
                  aria-current={isCurrent ? "page" : undefined}
                  className="font-medium text-foreground"
                >
                  {item.name}
                </li>
              ) : (
                <li>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center rounded-md px-1 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
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
