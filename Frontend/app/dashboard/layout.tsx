import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { TopHeader } from "@/components/layout/top-header";
import { DashboardAuthGuard } from "@/components/auth/dashboard-auth-guard";
import { ProductTourDialogs } from "@/components/product-tour/DashboardProductTour";
import { DashboardProductTourProvider } from "@/hooks/use-dashboard-product-tour";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardAuthGuard>
      <SidebarProvider>
        <DashboardProductTourProvider>
          <div className="flex h-svh w-full min-w-0 max-w-full overflow-hidden">
            <AppSidebar />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <TopHeader />
              <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-3 py-4 sm:px-5 sm:py-4">
                <div className="mx-auto flex w-full min-h-0 min-w-0 max-w-7xl flex-1 flex-col gap-4">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <ProductTourDialogs />
        </DashboardProductTourProvider>
      </SidebarProvider>
    </DashboardAuthGuard>
  );
}
