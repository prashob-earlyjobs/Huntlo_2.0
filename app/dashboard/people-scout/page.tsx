import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";

import { ScoutWorkspace } from "@/components/scout/scout-workspace";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "People Scout" };

export default function PeopleScoutPage() {
  return (
    <>
      <PageHeader
        title="People Scout"
        description="Find, enrich, reveal, and save an individual candidate profile."
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
      <ScoutWorkspace />
    </>
  );
}
