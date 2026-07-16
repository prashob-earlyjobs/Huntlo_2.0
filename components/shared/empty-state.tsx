import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-muted">
          <Icon aria-hidden className="size-5 text-muted-foreground" />
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel ? (
        actionHref ? (
          <Button
            size="sm"
            className="mt-4"
            nativeButton={false}
            render={<Link href={actionHref} />}
          >
            {actionLabel}
          </Button>
        ) : (
          <Button size="sm" className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  );
}
