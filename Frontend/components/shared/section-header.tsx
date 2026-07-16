import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  actions,
  className,
  titleId,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2
          id={titleId}
          className="text-[15px] leading-snug font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </div>
  );
}
