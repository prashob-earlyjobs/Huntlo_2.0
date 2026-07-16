import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { QuickCreateMenu } from "@/components/layout/quick-create-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UsageIndicator } from "@/components/layout/usage-indicator";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />
        <Breadcrumbs />
      </div>

      <div className="flex min-w-0 flex-1 justify-center">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <QuickCreateMenu />
        <UsageIndicator />
        <NotificationPanel />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help & support"
          className="max-sm:hidden"
        >
          <CircleHelp aria-hidden />
        </Button>
        <UserProfileMenu />
      </div>
    </header>
  );
}
