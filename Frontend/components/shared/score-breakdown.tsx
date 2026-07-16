import { cn } from "@/lib/utils"
import type { ScoreBreakdownItem } from "@/lib/types"

export function ScoreBreakdown({ items, className }: { items: ScoreBreakdownItem[]; className?: string }) {
  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums text-foreground">{item.score}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
