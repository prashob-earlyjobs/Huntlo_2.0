import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function TableToolbar({
  searchPlaceholder = "Search…",
  className,
  children,
}: {
  searchPlaceholder?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative min-w-[12rem] flex-1">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={searchPlaceholder} className="pl-8" aria-label={searchPlaceholder} />
      </div>
      {children}
    </div>
  )
}
