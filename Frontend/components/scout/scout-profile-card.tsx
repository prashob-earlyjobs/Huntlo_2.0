"use client";

import {
  AudioLines,
  Building2,
  Check,
  Copy,
  ExternalLink,
  ListPlus,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  UserRoundPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import type { ScoutProfile } from "@/lib/mock-scout";
import { candidatePoolApi, getApiErrorMessage, peopleScoutApi } from "@/lib/api";
import { REVEAL_COSTS, useRevealQuota } from "@/hooks/use-reveal-quota";
import { ROUTES } from "@/lib/routes";
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
  label,
}: {
  icon: typeof Mail;
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1.5">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 truncate text-xs font-medium text-foreground">
        {value}
      </span>
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

export function ScoutProfileCard({
  profile,
  lookupId,
  initiallySaved = false,
  onSaved,
  className,
  embedded = false,
}: {
  profile: ScoutProfile;
  lookupId?: string;
  initiallySaved?: boolean;
  onSaved?: () => void;
  className?: string;
  /** Flatten chrome when nested inside a sheet/drawer. */
  embedded?: boolean;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState({ email: false, phone: false });
  const [emailValue, setEmailValue] = useState(profile.email);
  const [phoneValue, setPhoneValue] = useState(profile.phone);
  const [saved, setSaved] = useState(initiallySaved);
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [revealing, setRevealing] = useState<"email" | "mobile" | null>(null);
  const [listNames, setListNames] = useState<string[]>([]);
  const revealQuota = useRevealQuota();

  useEffect(() => {
    let cancelled = false;
    void candidatePoolApi
      .listLists()
      .then((lists) => {
        if (!cancelled) setListNames(lists.map((list) => list.name));
      })
      .catch(() => {
        // Leave the list picker empty when the lists API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function flash(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  async function handleReveal(type: "email" | "mobile") {
    setRevealError(null);
    setRevealing(type);
    try {
      const result = await peopleScoutApi.revealContact({
        lookupId: lookupId ?? "",
        profileId: profile.id,
        linkedinUrl: profile.linkedinUrl,
        type,
      });
      const value = result.value || result.values[0] || "";
      if (type === "email") {
        setEmailValue(value || emailValue);
        setRevealed((previous) => ({ ...previous, email: true }));
      } else {
        setPhoneValue(value || phoneValue);
        setRevealed((previous) => ({ ...previous, phone: true }));
      }
      flash(
        result.charged
          ? `Revealed (${result.creditsCharged} credits)`
          : "Already unlocked — no credits charged"
      );
    } catch (err) {
      setRevealError(getApiErrorMessage(err));
    } finally {
      setRevealing(null);
    }
  }

  async function handleSave() {
    if (!lookupId) {
      setSaved(true);
      flash(`${profile.name} saved to your Candidate Pool.`);
      return;
    }
    try {
      const result = await peopleScoutApi.saveToPool(lookupId);
      setSaved(true);
      flash(
        result.created
          ? `${profile.name} saved to your Candidate Pool.`
          : `${profile.name} is already in your Candidate Pool.`
      );
      onSaved?.();
    } catch (err) {
      flash(getApiErrorMessage(err));
    }
  }

  const revealCount = Number(revealed.email) + Number(revealed.phone);

  return (
    <article
      className={cn(
        "overflow-hidden bg-card",
        embedded
          ? "rounded-none border-0"
          : "rounded-xl border border-border",
        className
      )}
    >
      {/* Header band — identity full width, actions below so buttons never squeeze text */}
      <div className={cn("border-b border-border", embedded ? "px-4 py-4" : "p-5")}>
        <div className="space-y-4">
          <div className="flex w-full min-w-0 items-start gap-4">
            {embedded ? null : (
              <CandidateAvatar
                name={profile.name}
                src={profile.avatarUrl}
                preview
                className="size-16 shrink-0 text-lg"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {embedded ? null : (
                  <h2 className="text-lg font-semibold tracking-tight text-foreground">
                    {profile.name}
                  </h2>
                )}
                <span className="inline-flex h-5 items-center rounded-md bg-muted px-2 text-xs font-medium text-muted-foreground">
                  {profile.enrichment.status}
                </span>
              </div>
              <p className="mt-0.5 break-words text-sm text-muted-foreground">
                {profile.headline}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <Building2 aria-hidden className="size-3 shrink-0" />
                  <span className="break-words">
                    {profile.currentTitle} · {profile.currentCompany}
                  </span>
                </span>
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin aria-hidden className="size-3 shrink-0" />
                  <span className="break-words">{profile.location}</span>
                </span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-w-0 items-center gap-1 font-medium break-all text-info underline-offset-4 hover:underline"
                >
                  <ExternalLink aria-hidden className="size-3 shrink-0" />
                  linkedin.com/in/{profile.linkedinUsername}
                </a>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {profile.enrichment.sources} data sources ·{" "}
                {profile.enrichment.lastRefreshed} ·{" "}
                {typeof profile.connections === "number"
                  ? `${profile.connections.toLocaleString("en-IN")} connections · `
                  : null}
                {revealCount > 0
                  ? `${revealCount === 2 ? "Email & phone" : revealed.email ? "Email" : "Phone"} revealed`
                  : "Contact not yet revealed"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={saved ? "secondary" : "default"}
              onClick={() => void handleSave()}
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
                {listNames.length === 0 ? (
                  <DropdownMenuItem disabled>No lists yet</DropdownMenuItem>
                ) : (
                  listNames.map((list) => (
                    <DropdownMenuItem
                      key={list}
                      onClick={() => flash(`Added ${profile.name} to “${list}”.`)}
                    >
                      {list}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams();
                if (lookupId) params.set("lookupId", lookupId);
                params.set("name", profile.name);
                router.push(`${ROUTES.outreachNew}?${params.toString()}`);
              }}
            >
              <Send aria-hidden />
              Start Outreach
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const params = new URLSearchParams();
                if (lookupId) params.set("lookupId", lookupId);
                params.set("name", profile.name);
                router.push(`${ROUTES.screeningNew}?${params.toString()}`);
              }}
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
      <div className={cn("grid gap-6 lg:grid-cols-3", embedded ? "p-4" : "p-5")}>
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-2">
            <SectionTitle>About</SectionTitle>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {profile.about?.trim()
                ? profile.about
                : "No summary available for this profile."}
            </p>
          </section>

          <section className="space-y-3">
            <SectionTitle>Experience</SectionTitle>
            {profile.experience.length === 0 ? (
              <p className="text-sm text-muted-foreground">No experience listed.</p>
            ) : (
              <ol className="space-y-0">
                {profile.experience.map((entry, index) => (
                  <li
                    key={`${entry.company}-${entry.role}-${entry.duration}-${index}`}
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
                        {entry.location ? ` · ${entry.location}` : ""}
                      </p>
                      {entry.description ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {entry.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="space-y-2">
            <SectionTitle>Education</SectionTitle>
            {profile.education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education listed.</p>
            ) : (
              profile.education.map((entry, index) => (
                <div
                  key={`${entry.school}-${entry.degree}-${index}`}
                  className="rounded-lg border border-border px-3 py-2.5"
                >
                  <p className="text-sm font-medium text-foreground">
                    {entry.school}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[entry.degree, entry.field].filter(Boolean).join(", ")}
                    {entry.years ? ` · ${entry.years}` : ""}
                  </p>
                </div>
              ))
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-2">
            <SectionTitle>Contact</SectionTitle>
            <div className="space-y-1.5">
              {revealing === "email" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                  aria-busy
                >
                  <Loader2 aria-hidden className="animate-spin" />
                  Unlocking email…
                </Button>
              ) : revealed.email ? (
                <RevealedRow
                  icon={Mail}
                  value={emailValue}
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
                      disabled={revealing !== null}
                    >
                      <Mail aria-hidden />
                      Reveal Email
                      <span className="ml-auto tabular-nums text-muted-foreground">
                        {REVEAL_COSTS.email} cr
                      </span>
                    </Button>
                  }
                  title={`Reveal ${profile.name.split(" ")[0]}’s email?`}
                  description={`This uses ${REVEAL_COSTS.email} email credits. You have ${revealQuota.emailRemaining.toLocaleString("en-IN")} of ${revealQuota.emailTotal.toLocaleString("en-IN")} email reveals remaining this cycle.`}
                  confirmLabel={`Reveal for ${REVEAL_COSTS.email} credits`}
                  onConfirm={() => void handleReveal("email")}
                />
              )}
              {revealing === "mobile" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                  aria-busy
                >
                  <Loader2 aria-hidden className="animate-spin" />
                  Unlocking phone…
                </Button>
              ) : revealed.phone ? (
                <RevealedRow
                  icon={Phone}
                  value={phoneValue}
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
                      disabled={revealing !== null}
                    >
                      <Phone aria-hidden />
                      Reveal Phone
                      <span className="ml-auto tabular-nums text-muted-foreground">
                        {REVEAL_COSTS.mobile} cr
                      </span>
                    </Button>
                  }
                  title={`Reveal ${profile.name.split(" ")[0]}’s phone?`}
                  description={`This uses ${REVEAL_COSTS.mobile} mobile credits. You have ${revealQuota.mobileRemaining.toLocaleString("en-IN")} of ${revealQuota.mobileTotal.toLocaleString("en-IN")} mobile reveals remaining this cycle.`}
                  confirmLabel={`Reveal for ${REVEAL_COSTS.mobile} credits`}
                  onConfirm={() => void handleReveal("mobile")}
                />
              )}
              {revealError ? (
                <p role="alert" className="text-xs text-destructive">
                  {revealError}
                </p>
              ) : null}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Contacts already revealed are never charged again.
            </p>
          </section>

          <section className="space-y-2">
            <SectionTitle>Skills</SectionTitle>
            {profile.skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills listed.</p>
            ) : (
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
            )}
          </section>

          {(profile.languages?.length ?? 0) > 0 ? (
            <section className="space-y-2">
              <SectionTitle>Languages</SectionTitle>
              <div className="flex flex-wrap gap-1.5">
                {profile.languages!.map((language) => (
                  <span
                    key={language}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
