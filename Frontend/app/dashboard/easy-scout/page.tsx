import type { Metadata } from "next";
import Link from "next/link";
import { UserSearch } from "lucide-react";

import { EasyScoutWorkspace } from "@/components/scout/easy-scout-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Easy Scout" };

export default function EasyScoutPage() {
  return (
    <>
      <PageHeader
        title="Easy Scout"
        description="Look up LinkedIn profiles or Indian DINs and reveal verified contacts via EazyReach."
        actions={
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={ROUTES.peopleScout} />}
          >
            <UserSearch aria-hidden />
            People Scout
          </Button>
        }
      />
      <EasyScoutWorkspace />
    </>
  );
}
