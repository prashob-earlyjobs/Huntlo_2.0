import { redirect } from "next/navigation";

import { ADMIN_ROUTES } from "@/lib/admin-routes";

/** Legacy path — keep so old bookmarks land on the real admin dashboard. */
export default function AdminDashboardRedirectPage() {
  redirect(ADMIN_ROUTES.dashboard);
}
