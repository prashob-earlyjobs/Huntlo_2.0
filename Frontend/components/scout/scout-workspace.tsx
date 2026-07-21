"use client";

import {
  AlertTriangle,
  ArrowRight,
  CloudOff,
  Coins,
  History,
  Loader2,
  Radar,
  Search,
  SearchX,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ScoutLookupsTable } from "@/components/scout/scout-lookups-table";
import { ScoutProfileCard } from "@/components/scout/scout-profile-card";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { UsageProgress } from "@/components/shared/usage-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getApiErrorMessage,
  peopleScoutApi,
  uiLookupTypeToApi,
  type ScoutLookupResponse,
  type ScoutQuota,
} from "@/lib/api";
import {
  LOOKUP_PLACEHOLDERS,
  LOOKUP_TYPES,
  type LookupType,
  type RecentLookup,
  type ScoutMatchOption,
  type ScoutProfile,
} from "@/lib/mock-scout";

type ScoutState =
  | { kind: "idle" }
  | { kind: "invalid"; message: string }
  | { kind: "searching" }
  | { kind: "found"; lookup: ScoutLookupResponse; profile: ScoutProfile }
  | { kind: "multiple"; lookup: ScoutLookupResponse; matches: ScoutMatchOption[] }
  | { kind: "not-found" }
  | { kind: "quota" }
  | { kind: "provider-down" }
  | { kind: "failed"; message: string };

const DEMO_INPUTS: { label: string; type: LookupType; value: string }[] = [
  {
    label: "Profile found",
    type: "LinkedIn URL",
    value: "https://linkedin.com/in/arjun-malhotra-platform",
  },
  { label: "Multiple matches", type: "LinkedIn Username", value: "arjun-multi" },
  {
    label: "Not found",
    type: "Email Address",
    value: "notfound@stealth.xyz",
  },
];

function validate(type: LookupType, value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Enter a value to look up.";
  switch (type) {
    case "LinkedIn URL":
      return /linkedin\.com\/in\/[\w-]+/i.test(trimmed)
        ? null
        : "That doesn't look like a LinkedIn profile URL. Expected a link like linkedin.com/in/candidate-name.";
    case "LinkedIn Username":
      return /^[\w.-]+$/.test(trimmed)
        ? null
        : "Usernames can only contain letters, numbers, dots and hyphens — no spaces.";
    case "Email Address":
      return /^\S+@\S+\.\S+$/.test(trimmed)
        ? null
        : "That doesn't look like a valid email address.";
  }
}

function StatePanel({
  icon: Icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: typeof Search;
  iconClassName?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-border bg-muted">
        <Icon aria-hidden className={iconClassName ?? "size-5 text-muted-foreground"} />
      </div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

function SearchingPanel() {
  return (
    <div
      aria-busy
      aria-live="polite"
      className="rounded-xl border border-border bg-card p-5"
    >
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 aria-hidden className="size-4 animate-spin text-primary" />
        Searching providers and enriching the profile…
      </p>
      <div className="mt-5 flex items-start gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-3.5 w-64 max-w-full" />
        </div>
      </div>
    </div>
  );
}

function MultipleMatchesPanel({
  matches,
  onSelect,
}: {
  matches: ScoutMatchOption[];
  onSelect: (match: ScoutMatchOption) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UsersRound aria-hidden className="size-4 text-warning" />
          {matches.length} possible matches
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The lookup wasn&rsquo;t specific enough to identify one person. Pick the
          right profile — only the selected profile is enriched.
        </p>
      </div>
      <ul className="divide-y divide-border">
        {matches.map((option) => (
          <li
            key={option.id}
            className="flex flex-wrap items-center gap-3 px-4 py-3"
          >
            <CandidateAvatar name={option.name} src={option.avatarUrl} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{option.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {option.headline} · {option.location}
              </p>
              <p className="text-xs text-info">
                linkedin.com/in/{option.linkedinUsername}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onSelect(option)}>
              View Profile
              <ArrowRight aria-hidden />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScoutWorkspace() {
  const [type, setType] = useState<LookupType>("LinkedIn URL");
  const [value, setValue] = useState("");
  const [state, setState] = useState<ScoutState>({ kind: "idle" });
  const [recent, setRecent] = useState<RecentLookup[]>([]);
  const [quota, setQuota] = useState<ScoutQuota>({
    limit: 0,
    used: 0,
    remaining: 0,
    costPerLookup: 0,
  });

  async function refreshSideData() {
    try {
      const [nextRecent, nextQuota] = await Promise.all([
        peopleScoutApi.getRecentLookups(),
        peopleScoutApi.getQuota(),
      ]);
      setRecent(nextRecent);
      setQuota(nextQuota);
    } catch {
      // Keep prior quota / recent snapshot on soft failure.
    }
  }

  useEffect(() => {
    void refreshSideData();
  }, []);

  async function runLookup(lookupType: LookupType, lookupValue: string) {
    const error = validate(lookupType, lookupValue);
    if (error) {
      setState({ kind: "invalid", message: error });
      return;
    }

    setState({ kind: "searching" });
    try {
      const result = await peopleScoutApi.lookup({
        type: uiLookupTypeToApi(lookupType),
        input: lookupValue.trim(),
      });

      switch (result.resultStatus) {
        case "found":
          if (result.profile) {
            setState({ kind: "found", lookup: result, profile: result.profile });
          } else {
            setState({ kind: "not-found" });
          }
          break;
        case "multiple_matches":
          setState({
            kind: "multiple",
            lookup: result,
            matches: result.matches,
          });
          break;
        case "not_found":
          setState({ kind: "not-found" });
          break;
        case "quota_exhausted":
          setState({ kind: "quota" });
          break;
        case "provider_unavailable":
          setState({ kind: "provider-down" });
          break;
        case "invalid_input":
          setState({
            kind: "invalid",
            message: "That lookup input is not valid.",
          });
          break;
        default:
          setState({
            kind: "failed",
            message: "Lookup failed. Please try again.",
          });
      }
      await refreshSideData();
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (/quota/i.test(message)) {
        setState({ kind: "quota" });
      } else if (/unavailable|provider|upstream/i.test(message)) {
        setState({ kind: "provider-down" });
      } else {
        setState({ kind: "failed", message });
      }
    }
  }

  function clear() {
    setValue("");
    setState({ kind: "idle" });
  }

  function rerunFromHistory(lookup: RecentLookup) {
    setType(lookup.type);
    setValue(lookup.input);
    void runLookup(lookup.type, lookup.input);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function selectMatch(match: ScoutMatchOption) {
    setType("LinkedIn Username");
    setValue(match.linkedinUsername);
    await runLookup("LinkedIn Username", match.linkedinUsername);
  }

  const searching = state.kind === "searching";

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runLookup(type, value);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Select
            value={type}
            onValueChange={(next) => next && setType(next as LookupType)}
          >
            <SelectTrigger aria-label="Lookup type" className="sm:w-44 sm:shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOOKUP_TYPES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={LOOKUP_PLACEHOLDERS[type]}
              aria-label={`${type} to look up`}
              aria-invalid={state.kind === "invalid"}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={searching}>
              {searching ? (
                <Loader2 aria-hidden className="animate-spin" />
              ) : (
                <Radar aria-hidden />
              )}
              {searching ? "Finding…" : "Find Profile"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clear}
              disabled={!value && state.kind === "idle"}
            >
              <X aria-hidden />
              Clear
            </Button>
          </div>
        </form>

        {state.kind === "invalid" ? (
          <p
            role="alert"
            className="mt-2 flex items-center gap-1.5 text-sm text-destructive"
          >
            <AlertTriangle aria-hidden className="size-3.5 shrink-0" />
            {state.message}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
          <UsageProgress
            metric={{
              id: "lookups",
              label: "Lookup quota",
              used: quota.used,
              total: quota.limit,
              unit: "lookups",
            }}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins aria-hidden className="size-3.5 shrink-0" />
            <span>
              <span className="font-medium tabular-nums text-foreground">
                {quota.costPerLookup} credits
              </span>{" "}
              per lookup — failed lookups are never charged
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History aria-hidden className="size-3.5 shrink-0" />
            <span>
              <span className="font-medium tabular-nums text-foreground">
                {recent.length} lookups
              </span>{" "}
              in recent history
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Try:</span>
          {DEMO_INPUTS.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => {
                setType(demo.type);
                setValue(demo.value);
                void runLookup(demo.type, demo.value);
              }}
              className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </section>

      {state.kind === "idle" ? (
        <StatePanel
          icon={Radar}
          title="Look up a specific person"
          description="Paste a LinkedIn URL, enter a username, or search by email address. We'll find the profile, enrich it from multiple providers, and let you reveal verified contact details."
        />
      ) : null}

      {searching ? <SearchingPanel /> : null}

      {state.kind === "found" ? (
        <ScoutProfileCard
          profile={state.profile}
          lookupId={state.lookup.id}
          initiallySaved={state.lookup.saved}
          onSaved={() => void refreshSideData()}
        />
      ) : null}

      {state.kind === "multiple" ? (
        <MultipleMatchesPanel
          matches={state.matches}
          onSelect={(match) => void selectMatch(match)}
        />
      ) : null}

      {state.kind === "not-found" ? (
        <StatePanel
          icon={SearchX}
          title="No profile found"
          description="We searched all connected providers but couldn't match this input to a person. Double-check the spelling, or try a different identifier — no credits were charged."
        >
          <Button size="sm" variant="outline" className="mt-4" onClick={clear}>
            Try Another Lookup
          </Button>
        </StatePanel>
      ) : null}

      {state.kind === "quota" ? (
        <StatePanel
          icon={Coins}
          iconClassName="size-5 text-warning"
          title="Lookup quota exhausted"
          description="Your workspace has used all of its people lookups for this billing cycle. Upgrade your plan or wait for the quota to reset to continue."
        >
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="outline" onClick={clear}>
              Dismiss
            </Button>
          </div>
        </StatePanel>
      ) : null}

      {state.kind === "provider-down" ? (
        <StatePanel
          icon={CloudOff}
          iconClassName="size-5 text-destructive"
          title="Provider temporarily unavailable"
          description="Our enrichment provider is not responding right now. Your lookup was not charged. Please try again in a few minutes."
        >
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => void runLookup(type, value)}
          >
            Retry Lookup
          </Button>
        </StatePanel>
      ) : null}

      {state.kind === "failed" ? (
        <StatePanel
          icon={AlertTriangle}
          iconClassName="size-5 text-destructive"
          title="Lookup failed"
          description={state.message}
        >
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => void runLookup(type, value)}
          >
            Retry Lookup
          </Button>
        </StatePanel>
      ) : null}

      <ScoutLookupsTable lookups={recent} onRerun={rerunFromHistory} />
    </div>
  );
}
