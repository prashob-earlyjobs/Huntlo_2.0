import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopHeader } from "@/components/layout/top-header";
import { DashboardAuthGuard } from "@/components/auth/dashboard-auth-guard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardAuthGuard>
      <SidebarProvider>
        <div className="flex min-h-svh w-full">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopHeader />
            <main className="flex-1 px-3 py-4 sm:px-5 sm:py-4">
              <div className="mx-auto w-full max-w-7xl space-y-4">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardAuthGuard>
  );
}
