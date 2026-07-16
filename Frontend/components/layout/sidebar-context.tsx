"use client"

import * as React from "react"

const SidebarContext = React.createContext<{
  collapsed: boolean
  toggle: () => void
} | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const value = React.useMemo(
    () => ({ collapsed, toggle: () => setCollapsed((v) => !v) }),
    [collapsed]
  )
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}
