import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";

import { SavedListsWorkspace } from "@/components/candidates/saved-lists-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Saved Lists" };

export default function SavedListsPage() {
  return (
    <>
      <PageHeader
        title="Saved Lists"
        description="Organise candidates into shareable lists tied to your open roles."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.candidates} />}
          >
            <Users aria-hidden />
            Candidate Pool
          </Button>
        }
      />
      <SavedListsWorkspace />
    </>
  );
}
