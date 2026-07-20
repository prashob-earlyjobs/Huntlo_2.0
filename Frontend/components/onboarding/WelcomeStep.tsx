"use client";

export function WelcomeStep() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to Huntlo</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Answer a few quick questions so we can personalize your workspace for the way your
        team hires. This takes about a minute and does not connect any integrations or start
        billing.
      </p>
    </div>
  );
}
