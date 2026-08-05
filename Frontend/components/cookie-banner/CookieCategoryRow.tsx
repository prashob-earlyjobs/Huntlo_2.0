"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export type CookieCategoryRowProps = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  alwaysActive?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function CookieCategoryRow({
  id,
  title,
  description,
  checked,
  disabled = false,
  alwaysActive = false,
  onCheckedChange,
}: CookieCategoryRowProps) {
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0"
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p id={labelId} className="text-sm font-medium text-foreground">
            {title}
          </p>
          {alwaysActive ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
              Always active
            </span>
          ) : null}
        </div>
        <p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className="mt-0.5"
      />
    </div>
  );
}
