import { ChannelBadge } from "@/components/shared/channel-badge"
import { MatchScoreBadge } from "@/components/shared/match-score-badge"
import { StatusBadge } from "@/components/shared/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { TableCell as TableCellValue, TableColumn } from "@/lib/types"

function renderCell(cell: TableCellValue) {
  if (typeof cell === "string" || typeof cell === "number") return cell
  if (cell.kind === "status") return <StatusBadge status={cell.value} />
  if (cell.kind === "channel") return <ChannelBadge channel={cell.value} />
  return <MatchScoreBadge score={cell.value} />
}

export function DataTable({
  columns,
  rows,
  caption,
  className,
}: {
  columns: TableColumn[]
  rows: Record<string, TableCellValue>[]
  caption?: string
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.key} className={cn(column.align === "right" && "text-right")}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key} className={cn(column.align === "right" && "text-right")}>{renderCell(row[column.key])}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
