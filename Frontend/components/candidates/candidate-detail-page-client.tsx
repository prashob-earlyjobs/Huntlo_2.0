"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { notFound } from "next/navigation";

import { CandidateProfile } from "@/components/candidates/candidate-profile";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage, candidatesApi } from "@/lib/api";
import type { PoolCandidate } from "@/lib/mock-candidates";
import { getPoolCandidate } from "@/lib/mock-candidates";
import { ROUTES } from "@/lib/routes";

export function CandidateDetailPageClient({ candidateId }: { candidateId: string }) {
  const [candidate, setCandidate] = useState<PoolCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const fallback = getPoolCandidate(candidateId) ?? null;
        const detail = await candidatesApi.getById(candidateId);

        if (!detail && !fallback) {
          if (!cancelled) setMissing(true);
          return;
        }

        if (!detail) {
          if (!cancelled) setCandidate(fallback);
          return;
        }

        const reveal = (
          detail as {
            revealStatus?: {
              email?: { revealed?: boolean; values?: string[] };
              mobile?: { revealed?: boolean; values?: string[] };
            };
            basicProfile?: { name?: string };
          }
        ).revealStatus;

        if (fallback) {
          if (!cancelled) {
            setCandidate({
              ...fallback,
              emailRevealed: Boolean(reveal?.email?.revealed ?? fallback.emailRevealed),
              phoneRevealed: Boolean(reveal?.mobile?.revealed ?? fallback.phoneRevealed),
              email: reveal?.email?.values?.[0] ?? fallback.email,
              phone: reveal?.mobile?.values?.[0] ?? fallback.phone,
            });
          }
          return;
        }

        // Live SourcedCandidate without pool mock — build a minimal pool shape.
        const basic = (detail as { basicProfile?: { name?: string; headline?: string | null } })
          .basicProfile;
        const employment = (
          detail as {
            currentEmployment?: { title?: string | null; company?: string | null };
          }
        ).currentEmployment;

        if (!cancelled) {
          setCandidate({
            id: String((detail as { id?: string }).id ?? candidateId),
            name: basic?.name ?? "Candidate",
            headline: basic?.headline ?? "",
            currentRole: employment?.title ?? "—",
            currentCompany: employment?.company ?? "—",
            previousCompany: "—",
            location: String((detail as { location?: string }).location ?? "—"),
            experienceYears: Number((detail as { experienceYears?: number }).experienceYears ?? 0),
            skills: Array.isArray((detail as { skills?: string[] }).skills)
              ? ((detail as { skills: string[] }).skills)
              : [],
            matchScore: Number((detail as { matchScore?: number }).matchScore ?? 0),
            matchBreakdown: {
              skills: 0,
              role: 0,
              experience: 0,
              location: 0,
              industry: 0,
              education: 0,
            },
            contactStatus: "Not contacted",
            saved: false,
            linkedin: true,
            email: reveal?.email?.values?.[0] ?? "",
            emailVerified: false,
            phone: reveal?.mobile?.values?.[0] ?? "",
            phoneVerified: false,
            emailRevealed: Boolean(reveal?.email?.revealed),
            phoneRevealed: Boolean(reveal?.mobile?.revealed),
            education: [],
            experience: [],
            summary: "",
            signals: Array.isArray((detail as { profileSignals?: string[] }).profileSignals)
              ? ((detail as { profileSignals: string[] }).profileSignals)
              : [],
            status: "New",
            updated: "Just now",
            activity: [],
            similar: [],
            pipelineStatus: "New",
            lists: [],
            owner: "You",
            source: "AI Search",
            lastActivity: "Just now",
            relatedJobId: null,
            outreachHistory: [],
            screeningResults: [],
            interviews: [],
            notes: [],
          });
        }
      } catch (err) {
        const fallback = getPoolCandidate(candidateId);
        if (fallback) {
          if (!cancelled) setCandidate(fallback);
        } else if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  if (missing) notFound();

  if (loading && !candidate) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }

  if (!candidate) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error ?? "Candidate not found"}
      </p>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="-ml-2 w-fit text-muted-foreground"
        nativeButton={false}
        render={<Link href={ROUTES.candidates} />}
      >
        <ArrowLeft aria-hidden />
        Candidate Pool
      </Button>
      <CandidateProfile candidate={candidate} />
    </>
  );
}
