"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api";
import { postAuthPath, resolvePostAuthDestination, sanitizeInternalPath } from "@/lib/auth-redirect";
import { peekPendingRedirectPath } from "@/lib/claim-public-search";
import { useAuth } from "@/providers/auth-provider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isLoading, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nextFromQuery = sanitizeInternalPath(searchParams.get("next"), "");

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(
        resolvePostAuthDestination(user, peekPendingRedirectPath() || nextFromQuery || null)
      );
    }
  }, [isAuthenticated, isLoading, nextFromQuery, router, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const nextUser = await login({ email, password });
      const preferred =
        peekPendingRedirectPath() ||
        (postAuthPath(nextUser) === "/dashboard" ? nextFromQuery || null : null);
      router.replace(resolvePostAuthDestination(nextUser, preferred));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to sign in. Check your credentials."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2">
        <BrandLogo />
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access your recruiting workspace, campaigns, and candidate pipeline.
        </p>
      </div>

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
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Huntlo?{" "}
        <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
