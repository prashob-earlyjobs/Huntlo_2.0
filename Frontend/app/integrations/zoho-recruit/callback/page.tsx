"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";
import { integrationsApi } from "@/lib/api/integrations";
import { sanitizeInternalPath } from "@/lib/auth-redirect";
import { useAuth } from "@/providers/auth-provider";

function ZohoRecruitCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [status, setStatus] = useState<"working" | "success" | "error">("working");
  const [message, setMessage] = useState("Finishing Zoho Recruit connection…");
  const started = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const nextPath = sanitizeInternalPath(
      `/integrations/zoho-recruit/callback?${searchParams.toString()}`,
      "/integrations/zoho-recruit/callback"
    );

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        const oauthError = searchParams.get("error");
        if (oauthError) {
          throw new Error(
            searchParams.get("error_description") || oauthError || "Authorization denied"
          );
        }

        const result = await integrationsApi.completeOAuthCallback("zoho-recruit", {
          code: searchParams.get("code"),
          state: searchParams.get("state"),
          location: searchParams.get("location"),
          "accounts-server": searchParams.get("accounts-server"),
          accounts_server: searchParams.get("accounts_server"),
        });

        if (result.mode !== "connected") {
          throw new Error(result.message || "Zoho Recruit connection did not complete.");
        }

        setStatus("success");
        setMessage(result.message || "Zoho Recruit connected.");
        window.setTimeout(() => {
          router.replace("/dashboard/integrations");
        }, 800);
      } catch (error) {
        setStatus("error");
        setMessage(getApiErrorMessage(error, "Could not connect Zoho Recruit."));
      }
    })();
  }, [isAuthenticated, isLoading, router, searchParams]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 space-y-2">
        <BrandLogo />
        <h1 className="text-2xl font-semibold tracking-tight">Zoho Recruit</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {status === "error" ? (
        <Button render={<Link href="/dashboard/integrations" />}>
          Back to integrations
        </Button>
      ) : null}
      {status === "success" ? (
        <p className="text-sm text-muted-foreground">Redirecting to integrations…</p>
      ) : null}
    </div>
  );
}

export default function ZohoRecruitCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-10">
          <BrandLogo />
          <p className="mt-6 text-sm text-muted-foreground">
            Finishing Zoho Recruit connection…
          </p>
        </div>
      }
    >
      <ZohoRecruitCallbackInner />
    </Suspense>
  );
}
