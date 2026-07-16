import { redirect } from "next/navigation";

import { ADMIN_ROUTES } from "@/lib/admin-routes";

export default function AdminIndexPage() {
  redirect(ADMIN_ROUTES.dashboard);
}
