import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Bookmark, History, Upload } from "lucide-react";

import { SearchWorkspace } from "@/components/search/search-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "AI Candidate Search" };

export default function SearchPage() {
  return (
    <>
      <PageHeader
        title="AI Candidate Search"
        description="Describe the people you need and refine the search with precise recruiting filters."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.searchHistory} />}
            >
              <History aria-hidden />
              Search History
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.saved} />}
            >
              <Bookmark aria-hidden />
              Saved Searches
            </Button>
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href={ROUTES.candidates} />}
            >
              <Upload aria-hidden />
              Import Candidates
            </Button>
          </div>
        }
      />

      <Suspense fallback={null}>
        <SearchWorkspace />
      </Suspense>
    </>
  );
}
