import { cn } from "@/lib/utils";

/** Compact operational note — no sparkle icon or blue wash. */
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
        "rounded-lg border border-border border-l-[3px] border-l-primary/50 bg-card px-3.5 py-3",
        className
      )}
    >
      <h3 className="text-[13px] font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
        {insight}
      </p>
      {action ? <div className="mt-2.5">{action}</div> : null}
    </aside>
  );
}
