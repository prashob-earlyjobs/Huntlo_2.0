import { cn } from "@/lib/utils"
import type { Channel } from "@/lib/types"

const CHANNEL_TONES: Record<Channel, string> = {
  Email: "bg-info/10 text-info",
  WhatsApp: "bg-success/10 text-success",
  "AI Voice": "bg-brand-subtle text-primary",
  LinkedIn: "bg-muted text-foreground",
  Calendly: "bg-warning/10 text-warning",
}

export function ChannelBadge({ channel, className }: { channel: Channel; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap", CHANNEL_TONES[channel], className)}>
      {channel}
    </span>
  )
}
