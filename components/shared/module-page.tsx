import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterPopover } from "@/components/shared/filter-popover";
import { MetricCard } from "@/components/shared/metric-card";
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {children}

      {data.table ? (
        <section className="rounded-xl border border-border bg-card">
          <div className="space-y-3 p-4 pb-0">
            <SectionHeader
              title={data.table.title}
              description={data.table.description}
            />
            <TableToolbar searchPlaceholder={`Search ${data.title.toLowerCase()}...`}>
              <FilterPopover label="Status" options={STATUS_FILTER_OPTIONS} />
            </TableToolbar>
          </div>
          <div className="mt-1 px-2 pb-2">
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
