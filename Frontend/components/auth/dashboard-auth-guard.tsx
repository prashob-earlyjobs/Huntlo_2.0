"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  canAccessPath,
  firstAccessibleRoute,
} from "@/lib/access-control";
import { postAuthPath } from "@/lib/auth-redirect";
import { useAuth } from "@/providers/auth-provider";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionState, user, isMockMode, permissions } = useAuth();

  const accessDenied =
    sessionState === "authenticated" &&
    !canAccessPath(permissions, pathname);

  useEffect(() => {
    if (sessionState === "loading") return;

    if (sessionState === "unauthenticated" || sessionState === "expired") {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
      return;
    }

    if (sessionState === "authenticated" && !isMockMode && user) {
      const destination = postAuthPath(user);
      if (destination === "/onboarding") {
        router.replace("/onboarding");
        return;
      }
      if (destination === "/admin/dashboard" && !pathname.startsWith("/admin")) {
        router.replace("/admin/dashboard");
      }
    }
  }, [sessionState, user, pathname, router, isMockMode]);

  if (sessionState === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <BrandLogo variant="compact" className="mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (sessionState === "blocked") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 text-center">
          <BrandLogo variant="compact" className="mx-auto" />
          <h1 className="text-xl font-semibold">Account access restricted</h1>
          <p className="text-sm text-muted-foreground">
            Your account has been blocked or suspended. Contact your workspace administrator
            for help.
          </p>
          <Button render={<Link href="/login" />} variant="outline">
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  if (sessionState === "expired") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 text-center">
          <BrandLogo variant="compact" className="mx-auto" />
          <h1 className="text-xl font-semibold">Session expired</h1>
          <p className="text-sm text-muted-foreground">
            Sign in again to continue to your recruiting workspace.
          </p>
          <Button render={<Link href={`/login?next=${encodeURIComponent(pathname)}`} />}>
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  if (sessionState !== "authenticated") {
    return null;
  }

  if (user && !isMockMode && postAuthPath(user) === "/onboarding") {
    return null;
  }

  if (accessDenied) {
    const fallback = firstAccessibleRoute(permissions);
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4">
        <div className="max-w-md space-y-4 text-center">
          <BrandLogo variant="compact" className="mx-auto" />
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have permission to open this module. Ask a workspace admin to update
            your module access.
          </p>
          <Button render={<Link href={fallback} />}>Go to available workspace</Button>
        </div>
      </div>
    );
  }

  return children;
}
