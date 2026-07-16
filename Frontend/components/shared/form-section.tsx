import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  children,
  className,
  /** When false, drops the card chrome — use spacing/typography only. */
  bordered = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <fieldset
      className={cn(
        bordered
          ? "rounded-lg border border-border bg-card p-4"
          : "space-y-0",
        className
      )}
    >
      <legend className="sr-only">{title}</legend>
      <div className={cn(bordered ? "mb-3" : "mb-2.5")}>
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </fieldset>
  );
}
