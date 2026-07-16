import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function AIInsightCard({
  title,
  insight,
  action,
  className,
}: {
  title: string;
  insight: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-primary/20 bg-brand-subtle/60 p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles aria-hidden className="size-4 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{insight}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </aside>
  );
}
