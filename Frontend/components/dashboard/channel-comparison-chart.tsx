import type { ChannelComparisonPoint } from "@/lib/mock-dashboard";
import { cn } from "@/lib/utils";

const CHANNELS = [
  { key: "email" as const, label: "Email", tone: "bg-chart-1" },
  { key: "whatsapp" as const, label: "WhatsApp", tone: "bg-chart-2" },
  { key: "voice" as const, label: "AI voice", tone: "bg-chart-3" },
];

/** Reply rate by channel — answers which outreach channel converts best. */
export function ChannelComparisonChart({
  data,
  className,
}: {
  data: ChannelComparisonPoint[];
  className?: string;
}) {
  const replyRates = data.find((row) => row.metric === "Reply rate");
  if (!replyRates) return null;

  const maxRate = Math.max(
    replyRates.email,
    replyRates.whatsapp,
    replyRates.voice,
    1
  );

  return (
    <div className={cn("space-y-2", className)}>
      {CHANNELS.map((channel) => {
        const rate = replyRates[channel.key];
        const width = Math.round((rate / maxRate) * 100);
        return (
          <div key={channel.key} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2">
            <span className="text-xs text-muted-foreground">{channel.label}</span>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", channel.tone)}
                style={{ width: `${Math.max(width, 4)}%` }}
              />
            </div>
            <span className="text-right text-xs font-medium tabular-nums text-foreground">
              {rate}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
