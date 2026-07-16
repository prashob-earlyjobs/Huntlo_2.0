import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · Huntlo Admin",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full bg-background">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
            <div className="mx-auto w-full max-w-7xl space-y-5">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
