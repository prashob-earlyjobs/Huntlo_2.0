import type { Metadata } from "next";

import { AdminBlogWorkspace } from "@/components/admin/admin-blog-workspace";

export const metadata: Metadata = { title: "Blog" };

export default function AdminBlogPage() {
  return <AdminBlogWorkspace />;
}
