"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { CompanyTypeStep } from "@/components/onboarding/CompanyTypeStep";
import { HiringChallengesStep } from "@/components/onboarding/HiringChallengesStep";
import { HiringVolumeStep } from "@/components/onboarding/HiringVolumeStep";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { OutreachChannelsStep } from "@/components/onboarding/OutreachChannelsStep";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, onboardingApi } from "@/lib/api";
import { postAuthPath, resolvePostAuthDestination } from "@/lib/auth-redirect";
import {
  consumePendingRedirectPath,
  peekPendingRedirectPath,
} from "@/lib/claim-public-search";
import {
  COMPANY_TYPES,
  emptyOnboardingAnswers,
  HIRING_CHALLENGES,
  HIRING_VOLUMES,
  isStepValid,
  ONBOARDING_DRAFT_KEY,
  OUTREACH_CHANNELS,
  toCompletionPayload,
  type CompanyType,
  type HiringChallenge,
  type HiringVolume,
  type OnboardingAnswers,
  type OutreachChannel,
} from "@/lib/onboarding";
import { useAuth } from "@/providers/auth-provider";

function loadDraft(): OnboardingAnswers {
  if (typeof window === "undefined") return emptyOnboardingAnswers();
  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return emptyOnboardingAnswers();
    return { ...emptyOnboardingAnswers(), ...(JSON.parse(raw) as OnboardingAnswers) };
  } catch {
    return emptyOnboardingAnswers();
  }
}

function saveDraft(answers: OnboardingAnswers) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(answers));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_DRAFT_KEY);
}

function asCompanyType(value: string | null | undefined): CompanyType | null {
  return value && (COMPANY_TYPES as readonly string[]).includes(value)
    ? (value as CompanyType)
    : null;
}

function asHiringChallenges(values: string[] | undefined): HiringChallenge[] {
  return (values ?? []).filter((value): value is HiringChallenge =>
    (HIRING_CHALLENGES as readonly string[]).includes(value)
  );
}

function asOutreachChannels(values: string[] | undefined): OutreachChannel[] {
  return (values ?? []).filter((value): value is OutreachChannel =>
    (OUTREACH_CHANNELS as readonly string[]).includes(value)
  );
}

function asHiringVolume(value: string | null | undefined): HiringVolume | null {
  return value && (HIRING_VOLUMES as readonly string[]).includes(value)
    ? (value as HiringVolume)
    : null;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, applyUser } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyOnboardingAnswers);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/onboarding");
      return;
    }

    const destination = postAuthPath(user);
    if (destination !== "/onboarding") {
      router.replace(resolvePostAuthDestination(user, peekPendingRedirectPath()));
      return;
    }

    const draft = loadDraft();
    void onboardingApi
      .get()
      .then((record) => {
        setAnswers({
          companyType: asCompanyType(record.companyType) ?? draft.companyType,
          hiringChallenges:
            record.hiringChallenges.length > 0
              ? asHiringChallenges(record.hiringChallenges)
              : draft.hiringChallenges,
          outreachChannels:
            record.outreachChannels.length > 0
              ? asOutreachChannels(record.outreachChannels)
              : draft.outreachChannels,
          hiringVolume: asHiringVolume(record.hiringVolume) ?? draft.hiringVolume,
        });
      })
      .catch(() => setAnswers(draft))
      .finally(() => setReady(true));
  }, [isAuthenticated, isLoading, router, user]);

  useEffect(() => {
    if (!ready) return;
    saveDraft(answers);
  }, [answers, ready]);

  function updateAnswers(patch: Partial<OnboardingAnswers>) {
    setAnswers((previous) => ({ ...previous, ...patch }));
  }

  async function finishSetup() {
    setSubmitting(true);
    setError(null);
    try {
      const payload = toCompletionPayload(answers);
      const result = await onboardingApi.complete(payload);
      applyUser({
        user: result.user,
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          plan: user?.plan ?? "Starter",
          initials: result.organization.name.slice(0, 2).toUpperCase(),
        },
      });
      clearDraft();
      const pending = consumePendingRedirectPath();
      router.replace(
        resolvePostAuthDestination(result.user, pending ?? result.redirectPath)
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to finish setup. Your answers are saved."));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading onboarding…</p>
      </div>
    );
  }

  const canContinue = isStepValid(step, answers) && !submitting;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-10">
      <div className="mb-8 space-y-4">
        <BrandLogo />
        <OnboardingProgress step={step} />
      </div>

      <div className="flex-1">
        {step === 0 ? <WelcomeStep /> : null}
        {step === 1 ? (
          <CompanyTypeStep
            value={answers.companyType}
            onChange={(companyType) => updateAnswers({ companyType })}
          />
        ) : null}
        {step === 2 ? (
          <HiringChallengesStep
            value={answers.hiringChallenges}
            onChange={(hiringChallenges) => updateAnswers({ hiringChallenges })}
          />
        ) : null}
        {step === 3 ? (
          <OutreachChannelsStep
            value={answers.outreachChannels}
            onChange={(outreachChannels) => updateAnswers({ outreachChannels })}
          />
        ) : null}
        {step === 4 ? (
          <HiringVolumeStep
            value={answers.hiringVolume}
            onChange={(hiringVolume) => updateAnswers({ hiringVolume })}
          />
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0 || submitting}
          onClick={() => setStep((previous) => Math.max(0, previous - 1))}
        >
          Back
        </Button>
        {step < 4 ? (
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => setStep((previous) => Math.min(4, previous + 1))}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" disabled={!canContinue} onClick={() => void finishSetup()}>
            {submitting ? "Finishing setup…" : "Finish Setup"}
          </Button>
        )}
      </div>
    </div>
  );
}
