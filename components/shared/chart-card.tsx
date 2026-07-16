"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/lib/utils";
import type { PlaceholderChart } from "@/lib/types";

function ChartDataSummary({ chart }: { chart: PlaceholderChart }) {
  return (
    <table className="sr-only">
      <caption>
        {chart.title}
        {chart.description ? `. ${chart.description}` : ""}
      </caption>
      <thead>
        <tr>
          <th scope="col">Period</th>
          <th scope="col">{chart.series.primary}</th>
          {chart.series.secondary ? (
            <th scope="col">{chart.series.secondary}</th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {chart.data.map((point) => (
          <tr key={point.label}>
            <th scope="row">{point.label}</th>
            <td>{point.primary}</td>
            {chart.series.secondary ? <td>{point.secondary}</td> : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ChartCard({
  chart,
  className,
}: {
  chart: PlaceholderChart;
  className?: string;
}) {
  const config: ChartConfig = {
    primary: { label: chart.series.primary, color: "var(--chart-1)" },
    ...(chart.series.secondary
      ? { secondary: { label: chart.series.secondary, color: "var(--chart-2)" } }
      : {}),
  };

  return (
    <section
      className={cn("rounded-xl border border-border bg-card p-4", className)}
      aria-labelledby={`chart-${chart.title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <SectionHeader
        title={chart.title}
        description={chart.description}
        titleId={`chart-${chart.title.replace(/\s+/g, "-").toLowerCase()}`}
      />
      <ChartDataSummary chart={chart} />
      <ChartContainer
        config={config}
        className="mt-4 h-64 w-full"
        aria-hidden
      >
        {chart.type === "area" ? (
          <AreaChart data={chart.data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Area
              dataKey="primary"
              type="monotone"
              fill="var(--color-primary)"
              fillOpacity={0.12}
              stroke="var(--color-primary)"
              strokeWidth={2}
            />
            {chart.series.secondary ? (
              <Area
                dataKey="secondary"
                type="monotone"
                fill="var(--color-secondary)"
                fillOpacity={0.12}
                stroke="var(--color-secondary)"
                strokeWidth={2}
              />
            ) : null}
          </AreaChart>
        ) : (
          <BarChart data={chart.data} margin={{ left: 4, right: 4 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Bar
              dataKey="primary"
              fill="var(--color-primary)"
              radius={4}
              maxBarSize={40}
            />
            {chart.series.secondary ? (
              <Bar
                dataKey="secondary"
                fill="var(--color-secondary)"
                radius={4}
                maxBarSize={40}
              />
            ) : null}
          </BarChart>
        )}
      </ChartContainer>
    </section>
  );
}
