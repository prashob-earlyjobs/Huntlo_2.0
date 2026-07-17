"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export function CommandDialog({
  title,
  description,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <Dialog {...props}>
      <DialogContent className={className}>
        {title || description ? (
          <DialogHeader>
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
        ) : null}
        {children as React.ReactNode}
      </DialogContent>
    </Dialog>
  )
}

export function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />
}
export function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return <CommandPrimitive.Input className={cn("flex h-10 w-full border-b border-border bg-transparent px-3 py-2 text-sm outline-none", className)} {...props} />
}
export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" className={cn("max-h-80 overflow-y-auto overflow-x-hidden", className)} {...props} />
}
export function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) { return <CommandPrimitive.Empty className="px-3 py-6 text-sm text-muted-foreground" {...props} /> }
export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) { return <CommandPrimitive.Group className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)} {...props} /> }
export function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) { return <CommandPrimitive.Item className={cn("relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", className)} {...props} /> }
export function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) { return <CommandPrimitive.Separator className={cn("-mx-1 h-px bg-border", className)} {...props} /> }
