"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVE_JOBS } from "@/lib/mock-dashboard";
import { ROUTES } from "@/lib/routes";

/** Primary home action: describe a role, scope it to a job, and open candidate search. */
export function AISearchPanel() {
  const [query, setQuery] = useState("");
  const [jobId, setJobId] = useState("all");

  return (
    <section aria-labelledby="search-heading" className="space-y-2">
      <h2
        id="search-heading"
        className="text-[13px] font-medium text-muted-foreground"
      >
        What are you hiring for today?
      </h2>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <Textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Senior React engineers in Bengaluru, 4–7 years, TypeScript…"
            aria-label="Describe the role you are hiring for"
            className="min-h-11 flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-2.5 shadow-none focus-visible:ring-0 lg:min-h-0"
          />

          <div className="flex flex-col gap-2 border-t border-border p-2.5 sm:flex-row sm:items-center lg:w-auto lg:shrink-0 lg:border-t-0 lg:border-l">
            <Select
              value={jobId}
              onValueChange={(value) => value && setJobId(value)}
            >
              <SelectTrigger
                size="sm"
                className="min-w-36"
                aria-label="Job"
              >
                <Briefcase aria-hidden className="size-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All jobs</SelectItem>
                {ACTIVE_JOBS.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              render={<Link href={ROUTES.search} />}
            >
              <SlidersHorizontal aria-hidden />
              Advanced filters
            </Button>

            <Button
              size="sm"
              className="shrink-0"
              render={<Link href={ROUTES.search} />}
            >
              <Search aria-hidden />
              Search candidates
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
