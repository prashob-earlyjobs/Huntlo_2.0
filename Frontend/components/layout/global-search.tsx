"use client";

import { useRouter } from "next/navigation";
import {
  AudioLines,
  Bookmark,
  Briefcase,
  CalendarClock,
  History as HistoryIcon,
  Search,
  Send,
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
import { NAV_ITEMS } from "@/lib/navigation";
import { CANDIDATES, RECENT_SEARCHES } from "@/lib/mock-data";
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

const SEARCH_RESULTS: SearchResult[] = [
  ...CANDIDATES.map((candidate) => ({
    id: `candidate-${candidate.id}`,
    group: "Candidates",
    title: candidate.name,
    meta: `${candidate.title} · ${candidate.company} · ${candidate.location}`,
    href: ROUTES.candidates,
    icon: User,
  })),
  {
    id: "job-1",
    group: "Jobs",
    title: "Senior Backend Engineer",
    meta: "Active · Priya Sharma",
    href: ROUTES.jobs,
    icon: Briefcase,
  },
  {
    id: "job-2",
    group: "Jobs",
    title: "Product Designer",
    meta: "Draft · Rohan Mehta",
    href: ROUTES.jobs,
    icon: Briefcase,
  },
  {
    id: "campaign-1",
    group: "Campaigns",
    title: "Backend Engineer — Sequence A",
    meta: "Email · Running",
    href: ROUTES.outreach,
    icon: Send,
  },
  {
    id: "campaign-2",
    group: "Campaigns",
    title: "Data Engineer — WhatsApp follow-up",
    meta: "WhatsApp · Paused",
    href: ROUTES.outreach,
    icon: Send,
  },
  {
    id: "list-1",
    group: "Lists",
    title: "Backend bench — Bengaluru",
    meta: "48 candidates",
    href: ROUTES.saved,
    icon: Bookmark,
  },
  {
    id: "screening-1",
    group: "Screening",
    title: "Priya Nair",
    meta: "Qualified · 92 score",
    href: ROUTES.screeningResults,
    icon: AudioLines,
  },
  {
    id: "interview-1",
    group: "Interviews",
    title: "Priya Nair",
    meta: "Tomorrow, 11:00 AM · Technical",
    href: ROUTES.interviews,
    icon: CalendarClock,
  },
];

const RESULT_GROUPS = [
  "Candidates",
  "Jobs",
  "Campaigns",
  "Lists",
  "Screening",
  "Interviews",
] as const;

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: () => void;
}) {
  const Icon = result.icon;
  return (
    <CommandItem
      value={`${result.title} ${result.meta}`}
      onSelect={onSelect}
      className="items-start gap-2.5 py-2"
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">{result.title}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {result.meta}
        </span>
      </span>
    </CommandItem>
  );
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: AppRoute) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden h-8 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 text-left text-[13px] text-muted-foreground outline-none transition-colors transition-ui",
          "hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 md:flex lg:max-w-md"
        )}
      >
        <Search aria-hidden className="size-3.5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">Search…</span>
        <kbd className="hidden rounded border border-border bg-background px-1 py-px font-mono text-[10px] text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        className="text-muted-foreground md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search candidates, jobs, campaigns, and interviews."
        className="sm:max-w-lg max-sm:top-0 max-sm:left-0 max-sm:h-svh max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none"
      >
        <Command className="max-sm:h-svh **:data-[slot=command-list]:max-sm:max-h-none">
          <CommandInput placeholder="Search candidates, jobs, campaigns…" />
          <CommandList>
            <CommandEmpty>No matches. Try a name, role, or campaign.</CommandEmpty>

            <CommandGroup heading="Recent">
              {RECENT_SEARCHES.map((search) => (
                <CommandItem
                  key={search}
                  value={search}
                  onSelect={() => go(ROUTES.search)}
                  className="gap-2"
                >
                  <HistoryIcon aria-hidden className="size-4 text-muted-foreground" />
                  <span className="truncate text-sm">{search}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {RESULT_GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {SEARCH_RESULTS.filter((result) => result.group === group).map(
                  (result) => (
                    <SearchResultItem
                      key={result.id}
                      result={result}
                      onSelect={() => go(result.href)}
                    />
                  )
                )}
              </CommandGroup>
            ))}

            <CommandSeparator />

            <CommandGroup heading="Go to">
              {NAV_ITEMS.map((item) => (
                <CommandItem
                  key={item.href}
                  value={item.title}
                  onSelect={() => go(item.href)}
                  className="gap-2 text-muted-foreground"
                >
                  <item.icon aria-hidden className="size-4 opacity-70" />
                  <span className="text-sm">{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
