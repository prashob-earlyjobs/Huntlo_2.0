import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { ScreeningHome } from "@/components/screening/screening-home";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Screening" };

export default function ScreeningPage() {
  return (
    <>
      <PageHeader
        title="Screening"
        description="Voice batches, scores, and shortlists for active roles."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href={ROUTES.screeningNew} />}
          >
            <Plus aria-hidden />
            Create screening
          </Button>
        }
      />

      <ScreeningHome />
    </>
  );
}
