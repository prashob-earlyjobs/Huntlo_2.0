import { Plug } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { Integration } from "@/lib/types";

export function IntegrationCard({
  integration,
  className,
}: {
  integration: Integration;
  className?: string;
}) {
  const connected = integration.status === "Connected";
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted">
          <Plug aria-hidden className="size-4 text-muted-foreground" />
        </span>
        <StatusBadge status={integration.status} />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{integration.name}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{integration.category}</p>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {integration.description}
      </p>
      <Button
        variant={connected ? "outline" : "default"}
        size="sm"
        className="mt-4 self-start"
      >
        {connected ? "Manage" : "Connect"}
      </Button>
    </article>
  );
}
