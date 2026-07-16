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
        "flex flex-col items-start justify-center rounded-lg border border-dashed border-border px-4 py-8",
        className
      )}
    >
      {Icon ? (
        <Icon aria-hidden className="mb-2 size-4 text-muted-foreground" />
      ) : null}
      <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-[12px] leading-snug text-muted-foreground">
        {description}
      </p>
      {actionLabel ? (
        actionHref ? (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            nativeButton={false}
            render={<Link href={actionHref} />}
          >
            {actionLabel}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  );
}
