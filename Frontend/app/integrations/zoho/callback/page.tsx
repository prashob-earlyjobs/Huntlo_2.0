"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, integrationsApi } from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

function ZohoCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Finishing Zoho Mail connection…");

  useEffect(() => {
    if (isLoading || started.current) return;

    const oauthError = (searchParams.get("error") || "").trim();
    if (oauthError) {
      setError(
        searchParams.get("error_description") ||
          oauthError ||
          "Zoho authorization was denied."
      );
      return;
    }

    const code = (searchParams.get("code") || "").trim();
    const state = (searchParams.get("state") || "").trim();
    if (!code || !state) {
      setError("Missing OAuth code or state from Zoho.");
      return;
    }

    if (!isAuthenticated) {
      const next = `/integrations/zoho/callback?${searchParams.toString()}`;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    started.current = true;
    void (async () => {
      try {
        const result = await integrationsApi.completeOAuthCallback("zoho-mail", {
          code,
          state,
          location: searchParams.get("location"),
          "accounts-server": searchParams.get("accounts-server"),
          accounts_server: searchParams.get("accounts-server"),
          error: searchParams.get("error"),
          error_description: searchParams.get("error_description"),
        });
        if (result.mode !== "connected") {
          throw new Error(result.message || "Zoho Mail connection did not complete.");
        }
        setStatus("Zoho Mail connected. Redirecting…");
        router.replace(`${ROUTES.integrations}?connected=zoho-mail`);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not finish Zoho Mail connection."));
      }
    })();
  }, [isAuthenticated, isLoading, router, searchParams]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <BrandLogo className="h-8" />
      {error ? (
        <>
          <p className="max-w-md text-sm text-destructive">{error}</p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.integrations} />}
          >
            Back to Integrations
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{status}</p>
      )}
    </div>
  );
}

export default function ZohoOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
          Finishing Zoho Mail connection…
        </div>
      }
    >
      <ZohoCallbackInner />
    </Suspense>
  );
}
