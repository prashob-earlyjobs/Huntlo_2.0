import type { Metadata } from "next";

import { DashboardHomeClient } from "@/components/dashboard/dashboard-home-client";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return <DashboardHomeClient />;
}
