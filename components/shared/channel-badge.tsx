import {
  AudioLines,
  CalendarDays,
  Globe,
  Mail,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/types";

const CHANNEL_ICONS: Record<Channel, LucideIcon> = {
  Email: Mail,
  WhatsApp: MessageCircle,
  "AI Voice": AudioLines,
  LinkedIn: Globe,
  Calendly: CalendarDays,
};

export function ChannelBadge({
  channel,
  className,
}: {
  channel: Channel;
  className?: string;
}) {
  const Icon = CHANNEL_ICONS[channel];
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs font-medium whitespace-nowrap text-foreground",
        className
      )}
    >
      <Icon aria-hidden className="size-3 text-muted-foreground" />
      {channel}
    </span>
  );
}
