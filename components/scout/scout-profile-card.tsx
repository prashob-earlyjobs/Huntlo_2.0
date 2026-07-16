"use client";

import {
  AudioLines,
  BadgeCheck,
  Building2,
  Check,
  Copy,
  ExternalLink,
  ListPlus,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldQuestion,
  Sparkles,
  UserRoundPlus,
} from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LIST_NAMES } from "@/lib/mock-candidates";
import type { ScoutProfile } from "@/lib/mock-scout";
import { REVEAL_COSTS, REVEAL_QUOTA } from "@/lib/mock-sessions";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  );
}

function RevealedRow({
  icon: Icon,
  value,
  verified,
  label,
}: {
  icon: typeof Mail;
  value: string;
  verified: boolean;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1.5">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-xs font-medium text-foreground">
        {value}
      </span>
      <Tooltip>
        <TooltipTrigger
          aria-label={verified ? "Verified contact" : "Unverified contact"}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {verified ? (
            <BadgeCheck aria-hidden className="size-3.5 text-success" />
          ) : (
            <ShieldQuestion aria-hidden className="size-3.5 text-warning" />
          )}
        </TooltipTrigger>
        <TooltipContent>
          {verified
            ? "Verified in the last 30 days"
            : "Unverified — deliverability not guaranteed"}
        </TooltipContent>
      </Tooltip>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <Check aria-hidden className="text-success" />
        ) : (
          <Copy aria-hidden />
        )}
      </Button>
    </div>
  );
}

export function ScoutProfileCard({ profile }: { profile: ScoutProfile }) {
  const [revealed, setRevealed] = useState({ email: false, phone: false });
  const [saved, setSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  const revealCount = Number(revealed.email) + Number(revealed.phone);

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Header band */}
      <div className="border-b border-border bg-gradient-to-r from-brand-subtle/60 to-transparent p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <CandidateAvatar name={profile.name} className="size-16 text-lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {profile.name}
                </h2>
                <span className="inline-flex h-5 items-center gap-1 rounded-md bg-success/10 px-2 text-xs font-medium text-success">
                  <Sparkles aria-hidden className="size-3" />
                  {profile.enrichment.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile.headline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 aria-hidden className="size-3" />
                  {profile.currentTitle} · {profile.currentCompany}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden className="size-3" />
                  {profile.location}
                </span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-info underline-offset-4 hover:underline"
                >
                  <ExternalLink aria-hidden className="size-3" />
                  linkedin.com/in/{profile.linkedinUsername}
                </a>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {profile.enrichment.sources} data sources ·{" "}
                {profile.enrichment.lastRefreshed} ·{" "}
                {revealCount > 0
                  ? `${revealCount === 2 ? "Email & phone" : revealed.email ? "Email" : "Phone"} revealed`
                  : "Contact not yet revealed"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={saved ? "secondary" : "default"}
              onClick={() => {
                setSaved((previous) => !previous);
                flash(
                  saved
                    ? "Removed from Candidate Pool."
                    : `${profile.name} saved to your Candidate Pool.`
                );
              }}
            >
              {saved ? <Check aria-hidden /> : <UserRoundPlus aria-hidden />}
              {saved ? "Saved to Pool" : "Save to Candidate Pool"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
                <ListPlus aria-hidden />
                Add to List
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>Add to list</DropdownMenuLabel>
                {LIST_NAMES.map((list) => (
                  <DropdownMenuItem
                    key={list}
                    onClick={() => flash(`Added ${profile.name} to “${list}”.`)}
                  >
                    {list}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash(`${profile.name} added to outreach.`)}
            >
              <Send aria-hidden />
              Start Outreach
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => flash(`Screening started for ${profile.name}.`)}
            >
              <AudioLines aria-hidden />
              Start Screening
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(profile.linkedinUrl);
                setLinkCopied(true);
                window.setTimeout(() => setLinkCopied(false), 1500);
              }}
            >
              {linkCopied ? (
                <Check aria-hidden className="text-success" />
              ) : (
                <Copy aria-hidden />
              )}
              {linkCopied ? "Link Copied" : "Copy Profile Link"}
            </Button>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
      </div>

      {/* Body */}
      <div className="grid gap-6 p-5 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-2">
            <SectionTitle>About</SectionTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {profile.about}
            </p>
          </section>

          <section className="space-y-3">
            <SectionTitle>Experience</SectionTitle>
            <ol className="space-y-0">
              {profile.experience.map((entry, index) => (
                <li
                  key={`${entry.company}-${entry.role}`}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < profile.experience.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute top-4 left-[5px] h-full w-px bg-border"
                    />
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      "relative mt-1.5 size-[11px] shrink-0 rounded-full border-2",
                      entry.current
                        ? "border-primary bg-primary"
                        : "border-primary bg-card"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {entry.role}
                      </p>
                      {entry.current ? (
                        <span className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                          Current
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.company} · {entry.duration}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-2">
            <SectionTitle>Education</SectionTitle>
            {profile.education.map((entry) => (
              <div
                key={entry.school}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-sm font-medium text-foreground">
                  {entry.school}
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.degree}, {entry.field} · {entry.years}
                </p>
              </div>
            ))}
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-2">
            <SectionTitle>Contact</SectionTitle>
            <div className="space-y-1.5">
              {revealed.email ? (
                <RevealedRow
                  icon={Mail}
                  value={profile.email}
                  verified={profile.emailVerified}
                  label="email"
                />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Mail aria-hidden />
                      Reveal Email
                      <span className="ml-auto tabular-nums text-muted-foreground">
                        {REVEAL_COSTS.email} cr
                      </span>
                    </Button>
                  }
                  title={`Reveal ${profile.name.split(" ")[0]}’s email?`}
                  description={`This uses ${REVEAL_COSTS.email} email credits. You have ${REVEAL_QUOTA.emailRemaining.toLocaleString("en-IN")} of ${REVEAL_QUOTA.emailTotal.toLocaleString("en-IN")} email reveals remaining this cycle.`}
                  confirmLabel={`Reveal for ${REVEAL_COSTS.email} credits`}
                  onConfirm={() =>
                    setRevealed((previous) => ({ ...previous, email: true }))
                  }
                />
              )}
              {revealed.phone ? (
                <RevealedRow
                  icon={Phone}
                  value={profile.phone}
                  verified={profile.phoneVerified}
                  label="phone number"
                />
              ) : (
                <ConfirmDialog
                  trigger={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Phone aria-hidden />
                      Reveal Phone
                      <span className="ml-auto tabular-nums text-muted-foreground">
                        {REVEAL_COSTS.mobile} cr
                      </span>
                    </Button>
                  }
                  title={`Reveal ${profile.name.split(" ")[0]}’s phone?`}
                  description={`This uses ${REVEAL_COSTS.mobile} mobile credits. You have ${REVEAL_QUOTA.mobileRemaining.toLocaleString("en-IN")} of ${REVEAL_QUOTA.mobileTotal.toLocaleString("en-IN")} mobile reveals remaining this cycle.`}
                  confirmLabel={`Reveal for ${REVEAL_COSTS.mobile} credits`}
                  onConfirm={() =>
                    setRevealed((previous) => ({ ...previous, phone: true }))
                  }
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Contacts already revealed are never charged again.
            </p>
          </section>

          <section className="space-y-2">
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-brand-subtle px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
