"use client"

import * as React from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react"

import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  tabsId: string
} | null>(null)

function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  children,
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}) {
  const tabsId = React.useId()
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")
  const current = value ?? internalValue
  const setValue = (next: string) => {
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
  }
  return (
    <TabsContext.Provider value={{ value: current, onValueChange: setValue, tabsId }}>
      <div data-slot="tabs" className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="tablist"
      data-slot="tabs-list"
      className={cn("relative inline-flex h-9 items-center gap-1 rounded-lg bg-muted p-1", className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const reduceMotion = useReducedMotion()
  if (!ctx) return null
  const active = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      data-slot="tabs-trigger"
      data-state={active ? "active" : "inactive"}
      aria-selected={active}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "relative z-0 inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2.5 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    >
      {active ? (
        <motion.span
          layoutId={`tabs-pill-${ctx.tabsId}`}
          className="absolute inset-0 -z-10 rounded-md bg-background shadow-sm"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 32, mass: 0.8 }
          }
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  )
}

function TabsContent({
  className,
  value,
  ...props
}: HTMLMotionProps<"div"> & { value: string }) {
  const ctx = React.useContext(TabsContext)
  const reduceMotion = useReducedMotion()
  if (!ctx || ctx.value !== value) return null
  return (
    <motion.div
      data-slot="tabs-content"
      key={value}
      initial={reduceMotion ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 380, damping: 34, mass: 0.7 }
      }
      className={cn("pt-3", className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
