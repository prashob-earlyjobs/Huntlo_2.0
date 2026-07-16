"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ChannelComparisonPoint } from "@/lib/mock-dashboard";

const config: ChartConfig = {
  email: { label: "Email", color: "var(--chart-1)" },
  whatsapp: { label: "WhatsApp", color: "var(--chart-4)" },
  voice: { label: "AI Voice", color: "var(--chart-2)" },
};

/** Grouped bars comparing delivery, reply and positive-reply rates per channel. */
export function ChannelComparisonChart({
  data,
}: {
  data: ChannelComparisonPoint[];
}) {
  return (
    <ChartContainer config={config} className="h-56 w-full">
      <BarChart data={data} margin={{ left: 4, right: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="metric" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={36}
          tickFormatter={(value: number) => `${value}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="dot"
              formatter={(value, name, item) => (
                <>
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex flex-1 items-center justify-between gap-2 leading-none">
                    <span className="text-muted-foreground">
                      {config[name as keyof typeof config]?.label ?? name}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {value}%
                    </span>
                  </span>
                </>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="email" fill="var(--color-email)" radius={4} maxBarSize={28} />
        <Bar
          dataKey="whatsapp"
          fill="var(--color-whatsapp)"
          radius={4}
          maxBarSize={28}
        />
        <Bar dataKey="voice" fill="var(--color-voice)" radius={4} maxBarSize={28} />
      </BarChart>
    </ChartContainer>
  );
}
