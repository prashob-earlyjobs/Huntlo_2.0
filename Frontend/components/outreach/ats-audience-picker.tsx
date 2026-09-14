"use client";

import { Loader2, Plug } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getApiErrorMessage,
  integrationsApi,
  type AtsApplication,
  type AtsConnectedProvider,
  type AtsJob,
} from "@/lib/api";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function encodeAtsSourceDetail(provider: string, jobId: string): string {
  return `${provider}::${jobId}`;
}

export function parseAtsSourceDetail(
  detail: string
): { provider: string; jobId: string } | null {
  const raw = String(detail || "").trim();
  const idx = raw.indexOf("::");
  if (idx <= 0) return null;
  const provider = raw.slice(0, idx).trim();
  const jobId = raw.slice(idx + 2).trim();
  if (!provider || !jobId) return null;
  return { provider, jobId };
}

type AtsAudiencePickerProps = {
  sourceDetail: string;
  selectedCandidateIds: string[];
  huntloJobId?: string | null;
  onSourceDetailChange: (detail: string) => void;
  onSelectedIdsChange: (ids: string[]) => void;
  onImported?: (stats: {
    selected: number;
    withEmail: number;
    withPhone: number;
    candidateIds: string[];
  }) => void;
};

export function AtsAudiencePicker({
  sourceDetail,
  selectedCandidateIds,
  huntloJobId,
  onSourceDetailChange,
  onSelectedIdsChange,
  onImported,
}: AtsAudiencePickerProps) {
  const [providers, setProviders] = useState<AtsConnectedProvider[]>([]);
  const [providerId, setProviderId] = useState<string>("");
  const [providerPickerOpen, setProviderPickerOpen] = useState(false);
  const [jobs, setJobs] = useState<AtsJob[]>([]);
  const [applications, setApplications] = useState<AtsApplication[]>([]);
  const [applyIds, setApplyIds] = useState<string[]>([]);
  const [applyToPool, setApplyToPool] = useState<Record<string, string>>({});
  const [jobSearch, setJobSearch] = useState("");
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(
    () => parseAtsSourceDetail(sourceDetail),
    [sourceDetail]
  );
  const selectedJobId = parsed?.jobId || "";

  useEffect(() => {
    let cancelled = false;
    setLoadingProviders(true);
    void integrationsApi
      .listAtsProviders()
      .then((rows) => {
        if (cancelled) return;
        setProviders(rows);
        if (rows.length === 0) {
          setProviderId("");
          return;
        }
        const preferred =
          (parsed?.provider &&
            rows.find((row) => row.provider === parsed.provider)?.provider) ||
          (rows.length === 1 ? rows[0].provider : "");
        if (preferred) {
          setProviderId(preferred);
        } else if (rows.length > 1) {
          setProviderPickerOpen(true);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingProviders(false);
      });
    return () => {
      cancelled = true;
    };
    // Only bootstrap once on mount / when detail provider changes externally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!providerId) {
      setJobs([]);
      return;
    }
    let cancelled = false;
    setLoadingJobs(true);
    setError(null);
    void integrationsApi
      .listAtsJobs(providerId, { page: 1, pageSize: 50, search: jobSearch || undefined })
      .then((result) => {
        if (cancelled) return;
        setJobs(result.jobs);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId, jobSearch]);

  useEffect(() => {
    if (!providerId || !selectedJobId) {
      setApplications([]);
      return;
    }
    let cancelled = false;
    setLoadingApps(true);
    setError(null);
    void integrationsApi
      .listAtsApplications(providerId, selectedJobId, { page: 1, pageSize: 100 })
      .then((result) => {
        if (cancelled) return;
        setApplications(result.applications);
      })
      .catch((err) => {
        if (!cancelled) setError(getApiErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingApps(false);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId, selectedJobId]);

  function chooseProvider(next: string) {
    setProviderId(next);
    setProviderPickerOpen(false);
    onSourceDetailChange("");
    onSelectedIdsChange([]);
    setApplyIds([]);
    setApplyToPool({});
    setApplications([]);
  }

  function chooseJob(job: AtsJob) {
    if (!providerId) return;
    onSourceDetailChange(encodeAtsSourceDetail(providerId, job.id));
    onSelectedIdsChange([]);
    setApplyIds([]);
    setApplyToPool({});
  }

  function toggleApply(id: string) {
    setApplyIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    setApplyIds((prev) => {
      const ids = applications.map((app) => app.id);
      const allSelected = ids.length > 0 && ids.every((id) => prev.includes(id));
      return allSelected ? [] : ids;
    });
  }

  async function importSelected() {
    if (!providerId || !selectedJobId || applyIds.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const result = await integrationsApi.importAtsApplications(providerId, {
        jobId: selectedJobId,
        applicationIds: applyIds,
        huntloJobId: huntloJobId || null,
      });
      const map: Record<string, string> = { ...applyToPool };
      for (const row of result.candidates) {
        map[row.applyId] = row.id;
      }
      setApplyToPool(map);
      const poolIds = result.candidates.map((row) => row.id);
      onSelectedIdsChange(poolIds);

      const selectedApps = applications.filter((app) => applyIds.includes(app.id));
      onImported?.({
        selected: poolIds.length,
        withEmail: selectedApps.filter((app) => Boolean(app.email)).length,
        withPhone: selectedApps.filter((app) => Boolean(app.phone)).length,
        candidateIds: poolIds,
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setImporting(false);
    }
  }

  if (loadingProviders) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Checking ATS connections…
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
        <p className="text-sm font-medium text-foreground">No ATS connected</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Connect Zoho Recruit (or another ATS) under Integrations → ATS to
          import applicants.
        </p>
        <Link
          href={ROUTES.integrations}
          className="mt-3 inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground hover:bg-primary/80"
        >
          <Plug aria-hidden className="size-3.5" />
          Open Integrations
        </Link>
      </div>
    );
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || null;
  const allApplicantIds = applications.map((app) => app.id);
  const allApplicantsSelected =
    allApplicantIds.length > 0 &&
    allApplicantIds.every((id) => applyIds.includes(id));
  const someApplicantsSelected = applyIds.length > 0 && !allApplicantsSelected;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {providers.find((row) => row.provider === providerId)?.name ||
              "ATS provider"}
          </p>
          <p className="text-xs text-muted-foreground">
            Pick a job opening, then select candidates to add to this campaign.
          </p>
        </div>
        {providers.length > 1 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setProviderPickerOpen(true)}
          >
            Switch ATS
          </Button>
        ) : null}
      </div>

      {!selectedJobId ? (
        <div className="space-y-3">
          <Input
            value={jobSearch}
            onChange={(event) => setJobSearch(event.target.value)}
            placeholder="Search job openings"
          />
          {loadingJobs ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No job openings found. Create or open a job in your ATS, then
              refresh.
            </p>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border">
              {jobs.map((job) => (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => chooseJob(job)}
                    className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/40"
                  >
                    <span>
                      <span className="block text-sm font-medium text-foreground">
                        {job.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {[job.jobBoard, job.location, job.status]
                          .filter(Boolean)
                          .join(" · ") || job.id}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedJob?.title || "Selected job"}
              </p>
              <p className="text-xs text-muted-foreground">{selectedJobId}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                onSourceDetailChange("");
                onSelectedIdsChange([]);
                setApplyIds([]);
              }}
            >
              Change job
            </Button>
          </div>

          {loadingApps ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Loading applicants…
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications found for this job (or they are older than 90 days).
            </p>
          ) : (
            <>
              <ul className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border">
                <li className="sticky top-0 z-10 border-b border-border bg-card">
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
                    <input
                      type="checkbox"
                      checked={allApplicantsSelected}
                      ref={(node) => {
                        if (node) node.indeterminate = someApplicantsSelected;
                      }}
                      onChange={toggleSelectAll}
                      aria-label={
                        allApplicantsSelected
                          ? "Deselect all applicants"
                          : "Select all applicants"
                      }
                      className="size-4 rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {allApplicantsSelected ? "Deselect all" : "Select all"}
                      <span className="ml-1 font-normal text-muted-foreground">
                        ({applications.length})
                      </span>
                    </span>
                  </label>
                </li>
                {applications.map((app) => {
                  const checked = applyIds.includes(app.id);
                  return (
                    <li key={app.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-muted/40",
                          checked && "bg-brand-subtle/40"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleApply(app.id)}
                          className="mt-1 size-4 rounded border-border"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-foreground">
                            {app.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {[
                              app.currentTitle,
                              app.currentCompany,
                              app.email,
                              app.phone,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No contact details"}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {applyIds.length} selected
                  {selectedCandidateIds.length > 0
                    ? ` · ${selectedCandidateIds.length} in audience`
                    : ""}
                </p>
                <Button
                  type="button"
                  size="sm"
                  disabled={importing || applyIds.length === 0}
                  onClick={() => void importSelected()}
                >
                  {importing ? "Importing…" : "Import selected"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Dialog open={providerPickerOpen} onOpenChange={setProviderPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose ATS</DialogTitle>
            <DialogDescription>
              Select which connected ATS to import applicants from.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {providers.map((row) => (
              <li key={row.provider}>
                <button
                  type="button"
                  onClick={() => chooseProvider(row.provider)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left",
                    providerId === row.provider
                      ? "border-primary bg-brand-subtle"
                      : "border-border hover:bg-muted/40"
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {row.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {row.displayName || row.provider}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProviderPickerOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
