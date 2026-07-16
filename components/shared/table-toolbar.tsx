"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TableToolbar({
  searchPlaceholder = "Search...",
  children,
  className,
}: {
  searchPlaceholder?: string;
  /** Filters and actions rendered next to the search input. */
  children?: React.ReactNode;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="relative w-full max-w-xs">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-8 pl-8"
        />
      </div>
      {children}
    </div>
  );
}
