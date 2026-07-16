"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EXAMPLE_SEARCH_QUERIES } from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";

/**
 * Primary AI action on the dashboard: describe a role in plain language
 * and jump into candidate search. Compact and operational by design.
 */
export function AISearchPanel() {
  const [query, setQuery] = useState("");

  return (
    <section
      aria-labelledby="ai-search-heading"
      className="rounded-xl border border-primary/20 bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-subtle">
          <Sparkles aria-hidden className="size-4 text-primary" />
        </span>
        <h2
          id="ai-search-heading"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          What are you hiring for today?
        </h2>
      </div>

      <Textarea
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Find senior React developers in Bengaluru with 4–7 years of experience, SaaS background, and strong TypeScript skills."
        aria-label="Describe the role you are hiring for"
        className="mt-3 min-h-20 resize-none bg-background"
      />

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Try:</span>
          {EXAMPLE_SEARCH_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuery(example)}
              className="inline-flex h-6 items-center rounded-full border border-border bg-muted/50 px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {example}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button size="sm" variant="ghost" render={<Link href={ROUTES.search} />}>
            <SlidersHorizontal aria-hidden />
            Advanced Filters
          </Button>
          <Button size="sm" variant="outline" render={<Link href={ROUTES.jobs} />}>
            <Briefcase aria-hidden />
            Select Existing Job
          </Button>
          <Button size="sm" render={<Link href={ROUTES.search} />}>
            <Search aria-hidden />
            Search Candidates
          </Button>
        </div>
      </div>
    </section>
  );
}
