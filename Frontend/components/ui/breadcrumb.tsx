import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" className={cn(className)} {...props} />
}
export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol className={cn("flex flex-wrap items-center", className)} {...props} />
}
export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1", className)} {...props} />
}
export function BreadcrumbLink({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<"a"> & { render?: React.ReactNode }) {
  if (render) return <>{render}</>
  return (
    <a className={cn(className)} {...props}>
      {children}
    </a>
  )
}
export function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-current="page" className={cn(className)} {...props} />
}
export function BreadcrumbSeparator({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("text-muted-foreground", className)} {...props}><ChevronRight className="size-3" /></li>
}
