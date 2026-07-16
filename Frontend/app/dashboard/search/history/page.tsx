import type { Metadata } from "next";

import { SearchHistoryPageClient } from "@/components/sessions/search-history-page-client";

export const metadata: Metadata = { title: "Search History" };

export default function SearchHistoryPage() {
  return <SearchHistoryPageClient />;
}
