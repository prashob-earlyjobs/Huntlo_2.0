"use client";

import {
  BookmarkCheck,
  Copy,
  Eye,
  Link as LinkIcon,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ScoutProfileCard } from "@/components/scout/scout-profile-card";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getApiErrorMessage,
  peopleScoutApi,
  type ScoutLookupResponse,
} from "@/lib/api";
import type {
  LookupResult,
  LookupType,
  RecentLookup,
} from "@/lib/mock-scout";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const RESULT_CLASSES: Record<LookupResult, string> = {
  Found: "bg-success/10 text-success",
  "Multiple matches": "bg-warning/10 text-warning",
  "Not found": "bg-muted text-muted-foreground",
  Failed: "bg-destructive/10 text-destructive",
};

const TYPE_ICONS: Record<LookupType, typeof LinkIcon> = {
  "LinkedIn URL": LinkIcon,
  "LinkedIn Username": User,
  "Email Address": Mail,
};

function ResultBadge({ result }: { result: LookupResult }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        RESULT_CLASSES[result]
      )}
    >
      {result}
    </span>
  );
}

function RevealCell({ lookup }: { lookup: RecentLookup }) {
  if (lookup.contactRevealed === "None") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <span className="flex items-center gap-1">
      {lookup.contactRevealed !== "Phone" ? (
        <span className="flex size-5 items-center justify-center rounded-md bg-success/10">
          <Mail aria-hidden className="size-3 text-success" />
        </span>
      ) : null}
      {lookup.contactRevealed !== "Email" ? (
        <span className="flex size-5 items-center justify-center rounded-md bg-success/10">
          <Phone aria-hidden className="size-3 text-success" />
        </span>
      ) : null}
      <span className="sr-only">{lookup.contactRevealed} revealed</span>
    </span>
  );
}

function LookupDrawer({
  lookup,
  open,
  onOpenChange,
  onRerun,
  onProfileSaved,
}: {
  lookup: RecentLookup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRerun: (lookup: RecentLookup) => void;
  onProfileSaved?: () => void;
}) {
  const [detail, setDetail] = useState<ScoutLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !lookup) {
      setDetail(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setDetail(null);

    void peopleScoutApi
      .getLookup(lookup.id)
      .then((row) => {
        if (cancelled) return;
        setDetail(row);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err, "Unable to load candidate details."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, lookup?.id]);

  if (!lookup) return null;
  const TypeIcon = TYPE_ICONS[lookup.type];
  const profile = detail?.profile ?? null;
  const displayName = profile?.name ?? lookup.candidateName;
  const displayAvatar = profile?.avatarUrl ?? lookup.avatarUrl;

  const metaRows: [string, React.ReactNode][] = [
    ["Lookup input", <span key="i" className="break-all">{lookup.input}</span>],
    ["Lookup type", lookup.type],
    ["Result", <ResultBadge key="r" result={lookup.result} />],
    ["Contact revealed", lookup.contactRevealed],
    ["Saved to pool", lookup.saved || Boolean(detail?.saved) ? "Yes" : "No"],
    ["Credits used", `${lookup.creditsUsed} credits`],
    ["Performed by", lookup.performedBy],
    ["Date", lookup.date],
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 bg-card p-0 max-sm:max-w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border pb-3">
          <div className="flex items-start gap-3 pr-8">
            {displayName ? (
              <CandidateAvatar
                name={displayName}
                src={displayAvatar}
                className="size-10"
              />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full border border-border bg-muted">
                <TypeIcon aria-hidden className="size-4 text-muted-foreground" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate">
                {displayName ?? "No profile matched"}
              </SheetTitle>
              <SheetDescription className="truncate">
                {profile?.currentTitle && profile.currentCompany
                  ? `${profile.currentTitle} · ${profile.currentCompany}`
                  : `${lookup.type} lookup · ${lookup.date}`}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            {loading ? (
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-6 text-sm text-muted-foreground">
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Loading candidate details…
              </div>
            ) : null}

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {!loading && profile ? (
              <ScoutProfileCard
                embedded
                profile={profile}
                lookupId={lookup.id}
                initiallySaved={lookup.saved || Boolean(detail?.saved)}
                onSaved={onProfileSaved}
              />
            ) : null}

            {!loading && !error && !profile ? (
              <p className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
                {lookup.result === "Found"
                  ? "Candidate profile details are unavailable for this lookup."
                  : "No candidate profile was matched for this lookup."}
              </p>
            ) : null}

            <dl className="divide-y divide-border rounded-lg border border-border">
              {metaRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-3 py-2"
                >
                  <dt className="shrink-0 text-xs text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-right text-sm text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            {lookup.note ? (
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">
                  {lookup.note}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onRerun(lookup);
                }}
              >
                <RotateCcw aria-hidden />
                Rerun Lookup
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void navigator.clipboard?.writeText(lookup.input)}
              >
                <Copy aria-hidden />
                Copy Input
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export function ScoutLookupsTable({
  lookups,
  onRerun,
  onLookupUpdated,
}: {
  lookups: RecentLookup[];
  onRerun: (lookup: RecentLookup) => void;
  onLookupUpdated?: () => void;
}) {
  const [active, setActive] = useState<RecentLookup | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDrawer(lookup: RecentLookup) {
    setActive(lookup);
    setDrawerOpen(true);
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recent lookups
          </h2>
          <p className="text-xs text-muted-foreground">
            Lookups performed by your team in the last 30 days.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <caption className="sr-only">
            Recent person lookups with results and reveal status
          </caption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={HEAD}>Candidate</TableHead>
              <TableHead className={HEAD}>Lookup input</TableHead>
              <TableHead className={HEAD}>Type</TableHead>
              <TableHead className={HEAD}>Result</TableHead>
              <TableHead className={HEAD}>Contact revealed</TableHead>
              <TableHead className={HEAD}>Saved</TableHead>
              <TableHead className={HEAD}>Date</TableHead>
              <TableHead className={HEAD}>Performed by</TableHead>
              <TableHead className={`${HEAD} w-10 text-right`}>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lookups.map((lookup) => {
              const TypeIcon = TYPE_ICONS[lookup.type];
              return (
                <TableRow key={lookup.id}>
                  <TableCell className="py-2.5">
                    {lookup.candidateName ? (
                      <div className="flex items-center gap-2.5">
                        <CandidateAvatar
                          name={lookup.candidateName}
                          src={lookup.avatarUrl}
                          className="size-7"
                        />
                        <button
                          type="button"
                          onClick={() => openDrawer(lookup)}
                          className="truncate text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          {lookup.candidateName}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No match
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-52 py-2.5">
                    <p className="truncate text-sm text-muted-foreground">
                      {lookup.input}
                    </p>
                  </TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <TypeIcon aria-hidden className="size-3.5" />
                      {lookup.type}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <ResultBadge result={lookup.result} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <RevealCell lookup={lookup} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    {lookup.saved ? (
                      <BookmarkCheck
                        aria-label="Saved to pool"
                        className="size-4 text-primary"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                    {lookup.date}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                    {lookup.performedBy}
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label={`Actions for lookup ${lookup.input}`}
                          />
                        }
                      >
                        <MoreHorizontal aria-hidden />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => openDrawer(lookup)}>
                          <Eye aria-hidden />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRerun(lookup)}>
                          <RotateCcw aria-hidden />
                          Rerun lookup
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            void navigator.clipboard?.writeText(lookup.input)
                          }
                        >
                          <Copy aria-hidden />
                          Copy input
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <LookupDrawer
        lookup={active}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onRerun={onRerun}
        onProfileSaved={onLookupUpdated}
      />
    </section>
  );
}
