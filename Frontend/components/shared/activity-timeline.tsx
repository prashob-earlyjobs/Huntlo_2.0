import { ChannelBadge } from "@/components/shared/channel-badge"
import { cn } from "@/lib/utils"
import type { ActivityItem } from "@/lib/types"

export function ActivityTimeline({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {index < items.length - 1 ? <span aria-hidden className="absolute top-4 left-[5px] h-full w-px bg-border" /> : null}
          <span aria-hidden className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-primary bg-card" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.channel ? <ChannelBadge channel={item.channel} /> : null}
            </div>
            {item.description ? <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p> : null}
            <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
