"use client";

import Link from "next/link";
import { useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentWithEmail, setSentWithEmail] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await authApi.forgotPassword(email.trim());
      setSent(true);
      setSentWithEmail(Boolean(result.emailed));
      setDevResetUrl(result.resetUrl ?? null);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Unable to start password reset. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2">
        <BrandLogo />
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your work email and we&apos;ll send a link to choose a new password.
        </p>
      </div>

      {sent ? (
        <div className="space-y-4">
          {sentWithEmail ? (
            <p className="text-sm text-foreground">
              A reset email was sent. Check your inbox and spam folder, then open the
              link to choose a new password.
            </p>
          ) : (
            <p className="text-sm text-foreground">
              If an account exists for that email, a reset link has been issued. Check
              your inbox and spam folder.
            </p>
          )}
          {!sentWithEmail && devResetUrl ? (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Email could not be delivered in this environment. Use this fallback link:{" "}
              <Link
                href={devResetUrl}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Continue to reset password
              </Link>
            </p>
          ) : null}
          <Button nativeButton={false} render={<Link href="/login" />} className="w-full">
            Back to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
