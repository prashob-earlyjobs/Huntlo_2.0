"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage, onboardingApi, type OnboardingRecord } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const STEPS = [
  { step: 1, title: "Personal details", description: "Tell us about yourself." },
  { step: 2, title: "Organisation details", description: "Set up your company profile." },
  { step: 3, title: "Recruiting goals", description: "What are you hiring for?" },
  { step: 4, title: "Team size", description: "How large is your recruiting team?" },
  { step: 5, title: "Hiring locations", description: "Where do you hire most often?" },
  { step: 6, title: "Module preferences", description: "Pick the modules you want to start with." },
  { step: 7, title: "Initial integrations", description: "Connect tools you already use." },
  { step: 8, title: "Completion", description: "Review and launch your workspace." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refresh, user } = useAuth();
  const [record, setRecord] = useState<OnboardingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?next=/onboarding");
      return;
    }
    if (user?.onboardingStatus === "completed") {
      router.replace("/dashboard");
      return;
    }

    void onboardingApi
      .get()
      .then(setRecord)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router, user?.onboardingStatus]);

  const currentStep = record?.currentStep ?? 1;
  const stepMeta = STEPS.find((step) => step.step === currentStep) ?? STEPS[0]!;

  async function saveStep(patch: Parameters<typeof onboardingApi.patch>[0], nextStep?: number) {
    if (!record) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await onboardingApi.patch({
        ...patch,
        currentStep: nextStep ?? currentStep,
      });
      setRecord(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function finishOnboarding() {
    setSubmitting(true);
    setError(null);
    try {
      await onboardingApi.complete();
      await refresh();
      router.replace("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || loading || !record) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading onboarding…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-10">
      <div className="mb-8 space-y-4">
        <BrandLogo />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step {currentStep} of 8
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{stepMeta.title}</h1>
          <p className="text-sm text-muted-foreground">{stepMeta.description}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
        {currentStep === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={record.personalDetails.firstName ?? ""}
                onChange={(event) =>
                  setRecord({
                    ...record,
                    personalDetails: {
                      ...record.personalDetails,
                      firstName: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={record.personalDetails.lastName ?? ""}
                onChange={(event) =>
                  setRecord({
                    ...record,
                    personalDetails: {
                      ...record.personalDetails,
                      lastName: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                value={record.personalDetails.jobTitle ?? ""}
                onChange={(event) =>
                  setRecord({
                    ...record,
                    personalDetails: {
                      ...record.personalDetails,
                      jobTitle: event.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input
                id="orgName"
                value={record.organisationDetails.name ?? ""}
                onChange={(event) =>
                  setRecord({
                    ...record,
                    organisationDetails: {
                      ...record.organisationDetails,
                      name: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={record.organisationDetails.industry ?? ""}
                onChange={(event) =>
                  setRecord({
                    ...record,
                    organisationDetails: {
                      ...record.organisationDetails,
                      industry: event.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-2">
            <Label htmlFor="goals">Recruiting goals (comma separated)</Label>
            <Input
              id="goals"
              value={record.recruitingGoals.join(", ")}
              onChange={(event) =>
                setRecord({
                  ...record,
                  recruitingGoals: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        ) : null}

        {currentStep === 4 ? (
          <div className="space-y-2">
            <Label htmlFor="teamSize">Team size</Label>
            <Input
              id="teamSize"
              placeholder="e.g. 1-5 recruiters"
              value={record.teamSize ?? ""}
              onChange={(event) => setRecord({ ...record, teamSize: event.target.value })}
            />
          </div>
        ) : null}

        {currentStep === 5 ? (
          <div className="space-y-2">
            <Label htmlFor="locations">Main hiring locations</Label>
            <Input
              id="locations"
              value={record.hiringLocations.join(", ")}
              onChange={(event) =>
                setRecord({
                  ...record,
                  hiringLocations: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        ) : null}

        {currentStep === 6 ? (
          <div className="space-y-2">
            <Label htmlFor="modules">Preferred modules</Label>
            <Input
              id="modules"
              placeholder="Outreach, Screening, Scheduling"
              value={record.modulePreferences.join(", ")}
              onChange={(event) =>
                setRecord({
                  ...record,
                  modulePreferences: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        ) : null}

        {currentStep === 7 ? (
          <div className="space-y-2">
            <Label htmlFor="integrations">Initial integrations</Label>
            <Input
              id="integrations"
              placeholder="LinkedIn, Gmail, Greenhouse"
              value={record.initialIntegrations.join(", ")}
              onChange={(event) =>
                setRecord({
                  ...record,
                  initialIntegrations: event.target.value
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        ) : null}

        {currentStep === 8 ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>You are ready to launch Huntlo for {record.organisationDetails.name ?? "your team"}.</p>
            <p>We will apply your module and integration preferences to the workspace dashboard.</p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting || currentStep <= 1}
            onClick={() => void saveStep({}, currentStep - 1)}
          >
            Back
          </Button>
          {currentStep < 8 ? (
            <Button
              type="button"
              disabled={submitting}
              onClick={() =>
                void saveStep(
                  {
                    personalDetails: record.personalDetails,
                    organisationDetails: record.organisationDetails,
                    recruitingGoals: record.recruitingGoals,
                    teamSize: record.teamSize,
                    hiringLocations: record.hiringLocations,
                    modulePreferences: record.modulePreferences,
                    initialIntegrations: record.initialIntegrations,
                  },
                  currentStep + 1
                )
              }
            >
              Continue
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={() => void finishOnboarding()}>
              Complete setup
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
