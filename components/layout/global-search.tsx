"use client";

import { useRouter } from "next/navigation";
import {
  AudioLines,
  Bookmark,
  Briefcase,
  CalendarClock,
  History as HistoryIcon,
  Plug,
  Plus,
  Search,
  Send,
  User,
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

const SEARCH_ENTRIES: { group: string; icon: typeof Search; label: string; href: AppRoute }[] = [
  ...CANDIDATES.map((candidate) => ({
    group: "Candidates",
    icon: User,
    label: `${candidate.name} — ${candidate.title}`,
    href: ROUTES.candidates,
  })),
  { group: "Jobs", icon: Briefcase, label: "Senior Backend Engineer — Bengaluru", href: ROUTES.jobs },
  { group: "Jobs", icon: Briefcase, label: "Product Designer — Remote", href: ROUTES.jobs },
  { group: "Campaigns", icon: Send, label: "Backend Engineer — Sequence A", href: ROUTES.outreach },
  { group: "Campaigns", icon: Send, label: "Data Engineer — WhatsApp blast", href: ROUTES.outreach },
  { group: "Talent Lists", icon: Bookmark, label: "Backend bench — Bengaluru", href: ROUTES.saved },
  { group: "Screening Results", icon: AudioLines, label: "Priya Nair — Qualified (92)", href: ROUTES.screeningResults },
  { group: "Interviews", icon: CalendarClock, label: "Priya Nair — Tomorrow, 11:00 AM", href: ROUTES.interviews },
  { group: "Integrations", icon: Plug, label: "WhatsApp Business", href: ROUTES.integrations },
];

const SEARCH_GROUPS = [
  "Candidates",
  "Jobs",
  "Campaigns",
  "Talent Lists",
  "Screening Results",
  "Interviews",
  "Integrations",
];

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
      {/* Wide screens: search-box style trigger. Small screens: icon button. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-full max-w-md items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground outline-none transition-colors hover:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/50 md:flex"
      >
        <Search aria-hidden className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">
          Search candidates, campaigns, jobs or interviews...
        </span>
        <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Global search"
        description="Search candidates, jobs, campaigns, lists, screening results, interviews, integrations and pages."
        className="sm:max-w-xl max-sm:top-0 max-sm:left-0 max-sm:h-svh max-sm:max-w-full max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none"
      >
        <Command className="max-sm:h-svh **:data-[slot=command-list]:max-sm:max-h-none">
          <CommandInput placeholder="Search candidates, campaigns, jobs or interviews..." />
          <CommandList>
            <CommandEmpty>
              No results found. Try a different name, job or campaign.
            </CommandEmpty>
            <CommandGroup heading="Recent searches">
              {RECENT_SEARCHES.map((search) => (
                <CommandItem key={search} onSelect={() => go(ROUTES.search)}>
                  <HistoryIcon aria-hidden />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Suggested actions">
              <CommandItem onSelect={() => go(ROUTES.search)}>
                <Search aria-hidden />
                New AI candidate search
              </CommandItem>
              <CommandItem onSelect={() => go(ROUTES.jobs)}>
                <Plus aria-hidden />
                Create job
              </CommandItem>
              <CommandItem onSelect={() => go(ROUTES.outreach)}>
                <Send aria-hidden />
                Create outreach campaign
              </CommandItem>
            </CommandGroup>
            {SEARCH_GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {SEARCH_ENTRIES.filter((entry) => entry.group === group).map(
                  (entry) => (
                    <CommandItem key={entry.label} onSelect={() => go(entry.href)}>
                      <entry.icon aria-hidden />
                      {entry.label}
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            ))}
            <CommandSeparator />
            <CommandGroup heading="Navigation">
              {NAV_ITEMS.map((item) => (
                <CommandItem key={item.href} onSelect={() => go(item.href)}>
                  <item.icon aria-hidden />
                  Go to {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
