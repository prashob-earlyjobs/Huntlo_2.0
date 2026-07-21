"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CircleUser,
  CreditCard,
  HelpCircle,
  LogOut,
  Monitor,
  Moon,
  RotateCcw,
  Settings,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardProductTourOptional } from "@/hooks/use-dashboard-product-tour";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/providers/auth-provider";

export function UserProfileMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, isMockMode } = useAuth();
  const tour = useDashboardProductTourOptional();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const displayName = user?.name ?? "Account";
  const displayEmail = user?.email ?? "";
  const displayInitials = user?.initials ?? "?";
  const canRestartTour = Boolean(tour?.canRestart);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Account: ${displayName}`}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-muted text-[11px] font-medium text-muted-foreground">
              {displayInitials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-sm font-medium text-foreground">{displayName}</span>
          <span className="block truncate text-xs text-muted-foreground">{displayEmail}</span>
          {isMockMode ? (
            <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
              Mock session
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={ROUTES.profile} />}>
          <CircleUser aria-hidden />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.plans} />}>
          <CreditCard aria-hidden />
          Plans & usage
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href={ROUTES.settings} />}>
          <Settings aria-hidden />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon aria-hidden />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as string)}
            >
              <DropdownMenuRadioItem value="light">
                <Sun aria-hidden />
                Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <Moon aria-hidden />
                Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <Monitor aria-hidden />
                System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {canRestartTour ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <HelpCircle aria-hidden />
                Help and Support
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => {
                    void tour?.restartProductTour();
                  }}
                >
                  <RotateCcw aria-hidden />
                  Product Tour
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        ) : null}
        <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowLogoutConfirmation(true)}
          >
            <LogOut aria-hidden />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={showLogoutConfirmation}
        onOpenChange={setShowLogoutConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your Huntlo account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleLogout()}
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
