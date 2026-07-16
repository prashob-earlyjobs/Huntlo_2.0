import { cn } from "@/lib/utils";

const LOGO_SRC = "/logo_3.png";

interface BrandLogoProps {
  /** `full` shows the logo lockup with optional tagline; `compact` shows the mark. */
  variant?: "full" | "compact";
  /** Hide the “Agentic AI Recruiting · by EarlyJobs” tagline in full mode. */
  showTagline?: boolean;
  className?: string;
}

function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public brand asset
    <img
      src={LOGO_SRC}
      alt="Huntlo"
      width={compact ? 32 : 140}
      height={32}
      className={cn(
        "shrink-0 object-contain object-left",
        // Black logo canvas blends out on light surfaces; stays natural in dark.
        "mix-blend-multiply dark:mix-blend-normal",
        compact ? "size-8" : "h-8 w-auto max-w-[148px]",
        className
      )}
    />
  );
}

export function BrandLogo({
  variant = "full",
  showTagline = false,
  className,
}: BrandLogoProps) {
  if (variant === "compact") {
    return <BrandMark compact className={className} />;
  }

  return (
    <span className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <BrandMark />
      {showTagline ? (
        <span className="truncate text-[10px] font-medium text-muted-foreground">
          Agentic AI Recruiting · by EarlyJobs
        </span>
      ) : null}
    </span>
  );
}
