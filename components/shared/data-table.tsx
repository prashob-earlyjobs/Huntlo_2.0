import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChannelBadge } from "@/components/shared/channel-badge";
import { MatchScoreBadge } from "@/components/shared/match-score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils";
import type { TableCell as CellValue, TableColumn } from "@/lib/types";

function renderCell(value: CellValue | undefined) {
  if (value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    return <span className="tabular-nums">{value.toLocaleString("en-IN")}</span>;
  }
  switch (value.kind) {
    case "status":
      return <StatusBadge status={value.value} />;
    case "channel":
      return <ChannelBadge channel={value.value} />;
    case "score":
      return <MatchScoreBadge score={value.value} />;
  }
}

export function DataTable({
  columns,
  rows,
  caption,
  className,
}: {
  columns: TableColumn[];
  rows: Record<string, CellValue>[];
  /** Screen-reader-only summary of the table contents. */
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-9 text-xs font-medium text-muted-foreground",
                  column.align === "right" && "text-right"
                )}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column, columnIndex) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    "py-2.5 text-sm",
                    columnIndex === 0 && "font-medium text-foreground",
                    column.align === "right" && "text-right"
                  )}
                >
                  {renderCell(row[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
