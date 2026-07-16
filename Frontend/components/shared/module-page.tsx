import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterPopover } from "@/components/shared/filter-popover";
import { MetricStrip } from "@/components/shared/metric-strip";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { TableToolbar } from "@/components/shared/table-toolbar";
import type { ModulePageData } from "@/lib/mock-modules";

const STATUS_FILTER_OPTIONS = [
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "paused", label: "Paused" },
  { id: "completed", label: "Completed" },
];

/**
 * Standard placeholder layout for a module: header, metric row,
 * a preview table or chart, and an empty state when neither exists.
 */
export function ModulePage({
  data,
  children,
}: {
  data: ModulePageData;
  children?: React.ReactNode;
}) {
  const hasPreview = Boolean(data.table || data.chart);

  return (
    <>
      <PageHeader
        title={data.title}
        description={data.description}
        actions={
          data.empty.actionLabel ? (
            <Button size="sm">{data.empty.actionLabel}</Button>
          ) : undefined
        }
      />

      {data.metrics.length > 0 ? (
        <MetricStrip
          metrics={data.metrics.map((metric, index) => ({
            id: `metric-${index}`,
            label: metric.label,
            value: metric.value,
            change: metric.change ?? "",
            comparison: metric.hint ?? "",
            trend: metric.trend ?? "flat",
            tooltip: metric.hint ?? metric.label,
          }))}
          columns={data.metrics.length <= 4 ? "4" : "6"}
        />
      ) : null}

      {children}

      {data.table ? (
        <section className="rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader title={data.table.title} className="min-w-0" />
            <TableToolbar
              searchPlaceholder={`Search ${data.title.toLowerCase()}…`}
              className="sm:justify-end"
            >
              <FilterPopover label="Status" options={STATUS_FILTER_OPTIONS} />
            </TableToolbar>
          </div>
          <div className="px-2 pb-2">
            <DataTable
              columns={data.table.columns}
              rows={data.table.rows}
              caption={data.table.title}
            />
          </div>
        </section>
      ) : null}

      {data.chart ? <ChartCard chart={data.chart} /> : null}

      {!hasPreview ? (
        <EmptyState
          icon={Inbox}
          title={data.empty.title}
          description={data.empty.description}
          actionLabel={data.empty.actionLabel}
        />
      ) : null}
    </>
  );
}
