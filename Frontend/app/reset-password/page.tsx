"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, getApiErrorMessage } from "@/lib/api";

function validatePassword(password: string, confirmPassword: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must include upper, lower, and a number.";
  }
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing or invalid. Request a new one.");
      return;
    }
    const validationError = validatePassword(password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to reset password. The link may have expired — request a new one."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 space-y-2">
          <BrandLogo />
          <h1 className="text-2xl font-semibold tracking-tight">Invalid reset link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing a token. Request a new one from the sign-in
            page.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/forgot-password" />}
          className="w-full"
        >
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2">
        <BrandLogo />
        <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters with upper, lower, and a number.
        </p>
      </div>

      {done ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Your password was updated. You can sign in with your new password.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => router.replace("/login")}
          >
            Go to sign in
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
