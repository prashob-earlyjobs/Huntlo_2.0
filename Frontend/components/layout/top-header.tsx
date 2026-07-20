import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { HeaderOverflowMenu } from "@/components/layout/header-overflow-menu";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NotificationPanel } from "@/components/layout/notification-panel";
import { QuickCreateMenu } from "@/components/layout/quick-create-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UsageIndicator } from "@/components/layout/usage-indicator";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { HelpMenu } from "@/components/product-tour/HelpMenu";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:gap-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <MobileSidebar />
        <Breadcrumbs />
      </div>

      <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-2">
        <GlobalSearch />
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <QuickCreateMenu />
        <div className="hidden sm:contents">
          <UsageIndicator />
        </div>
        <NotificationPanel />
        <div className="hidden sm:contents">
          <ThemeToggle />
          <HelpMenu variant="icon" />
        </div>
        <HeaderOverflowMenu />
        <UserProfileMenu />
      </div>
    </header>
  );
}
