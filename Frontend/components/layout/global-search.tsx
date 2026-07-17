"use client";

import { useRouter } from "next/navigation";
import {
  Briefcase,
  History as HistoryIcon,
  Search,
  User,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { candidatePoolApi, jobsApi, sourcingApi } from "@/lib/api";
import { NAV_ITEMS } from "@/lib/navigation";
import { ROUTES, type AppRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

type SearchResult = {
  id: string;
  group: string;
  title: string;
  meta: string;
  href: AppRoute;
  icon: LucideIcon;
};

const NAV_RESULTS: SearchResult[] = NAV_ITEMS.map((item) => ({
  id: `nav-${item.href}`,
  group: "Go to",
  title: item.title,
  meta: item.description || item.title,
  href: item.href as AppRoute,
  icon: item.icon,
}));

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>(NAV_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults(NAV_RESULTS);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const [candidates, jobs, history] = await Promise.all([
            candidatePoolApi.list({ q, limit: 8 }).catch(() => []),
            jobsApi.list({ q, limit: 8 }).catch(() => []),
            sourcingApi.listHistory().catch(() => []),
          ]);
          if (cancelled) return;
          const next: SearchResult[] = [
            ...NAV_RESULTS.filter((item) =>
              item.title.toLowerCase().includes(q.toLowerCase())
            ),
            ...candidates.slice(0, 8).map((candidate) => ({
              id: `candidate-${candidate.id}`,
              group: "Candidates",
              title: candidate.name || "Candidate",
              meta: [
                candidate.currentRole,
                candidate.currentCompany,
                candidate.location,
              ]
                .filter(Boolean)
                .join(" · "),
              href: `/dashboard/candidates/${candidate.id}` as AppRoute,
              icon: User,
            })),
            ...jobs.slice(0, 8).map((job) => ({
              id: `job-${job.id}`,
              group: "Jobs",
              title: job.title || "Job",
              meta: String(job.status || ""),
              href: `/dashboard/jobs/${job.id}` as AppRoute,
              icon: Briefcase,
            })),
            ...history.slice(0, 5).map((session) => ({
              id: `session-${session.id}`,
              group: "Recent searches",
              title: session.query || "Search session",
              meta: "Sourcing history",
              href: `/dashboard/sessions/${session.id}` as AppRoute,
              icon: HistoryIcon,
            })),
          ];
          setResults(next);
        } catch {
          if (!cancelled) setResults(NAV_RESULTS);
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const groups = Array.from(new Set(results.map((item) => item.group)));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "hidden h-8 w-56 justify-start gap-2 text-muted-foreground md:inline-flex"
        )}
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden className="size-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="rounded border border-border bg-muted px-1.5 text-[10px]">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Search"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search candidates, jobs, pages…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching…" : "No results found."}
            </CommandEmpty>
            {groups.map((group, index) => (
              <div key={group}>
                {index > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group}>
                  {results
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <CommandItem
                        key={item.id}
                        value={`${item.title} ${item.meta}`}
                        onSelect={() => {
                          setOpen(false);
                          router.push(item.href);
                        }}
                      >
                        <item.icon aria-hidden className="size-3.5" />
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.meta}
                        </span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </div>
            ))}
            {!loading && query.trim().length >= 2 ? (
              <>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      router.push(`${ROUTES.search}?q=${encodeURIComponent(query.trim())}`);
                    }}
                  >
                    <Search aria-hidden className="size-3.5" />
                    Search candidates for “{query.trim()}”
                  </CommandItem>
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
