import { cn } from "@/lib/utils"

export function Progress({ value = 0, className, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  return (
    <div data-slot="progress" className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div
        data-slot="progress-indicator"
        className="h-full bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
