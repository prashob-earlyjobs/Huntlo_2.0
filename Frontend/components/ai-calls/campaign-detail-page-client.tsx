"use client";

import { Check, ChevronLeft, Download, FileText, Info, Loader2, Megaphone, Rocket, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Snackbar } from "@/components/shared/snackbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError,
  getApiErrorMessage,
  vocallabsApi,
  type CampaignContact,
  type VocallabsCampaign,
} from "@/lib/api";
import { ROUTES } from "@/lib/routes";

function contactColumns(contacts: CampaignContact[]): string[] {
  const extras: string[] = [];
  const seen = new Set<string>();
  let hasEmail = false;
  for (const contact of contacts) {
    if (contact.email) hasEmail = true;
    for (const key of Object.keys(contact.data ?? {})) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      extras.push(key);
    }
  }
  return ["name", "phone", ...(hasEmail ? ["email"] : []), ...extras];
}

function contactValue(contact: CampaignContact, column: string): string {
  if (column === "name") return contact.name;
  if (column === "phone") return contact.phone;
  if (column === "email") return contact.email;
  return contact.data?.[column] ?? "";
}

const LAUNCHED_TOAST_KEY = "huntlo-campaign-launched";

export function CampaignDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [campaign, setCampaign] = useState<VocallabsCampaign | null>(null);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<
    "launching" | "creating" | "attaching" | "success" | null
  >(null);
  const [toast, setToast] = useState<{ message: string; variant: "default" | "error" } | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") !== "1") return;
    setToast({ message: "Campaign created. It will show under Campaigns.", variant: "default" });
    params.delete("created");
    const next = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${next ? `?${next}` : ""}`);
  }, [id]);
  const [error, setError] = useState<string | null>(null);
  const [uploadIssues, setUploadIssues] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([vocallabsApi.listCampaigns(), vocallabsApi.listCampaignContacts(id)])
      .then(([page, contactPage]) => {
        if (cancelled) return;
        setCampaign(page.items.find((item) => item.id === id) ?? null);
        setContacts(contactPage.items);
      })
      .catch((err) => {
        if (!cancelled) {
          setCampaign(null);
          setContacts([]);
          setError(getApiErrorMessage(err, "Could not load this campaign."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function issuesFromUploadError(err: unknown): string[] {
    if (err instanceof ApiError && err.details?.length) {
      const messages = err.details.map((detail) => detail.message.trim()).filter(Boolean);
      if (messages.length) return messages;
    }
    return [getApiErrorMessage(err, "Could not import this file.")];
  }

  async function uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadIssues(["Upload a CSV file."]);
      return;
    }
    setUploading(true);
    setUploadIssues([]);
    try {
      const page = await vocallabsApi.uploadCampaignContacts(id, file);
      setContacts(page.items);
      setImportOpen(false);
    } catch (err) {
      setUploadIssues(issuesFromUploadError(err));
    } finally {
      setUploading(false);
    }
  }

  async function downloadSample() {
    setDownloadingSample(true);
    setUploadIssues([]);
    try {
      const file = await vocallabsApi.downloadCampaignContactSample(id);
      const url = URL.createObjectURL(file.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename || "campaign-contacts.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setUploadIssues([getApiErrorMessage(err, "Could not download the sample file.")]);
    } finally {
      setDownloadingSample(false);
    }
  }

  async function launchCampaign() {
    if (launchPhase || campaign?.active) return;
    setLaunchPhase("launching");
    setToast(null);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setLaunchPhase("creating");
      const launched = await vocallabsApi.createCampaignGroup(id);
      setLaunchPhase("attaching");
      await vocallabsApi.attachCampaignGroup(id);
      await vocallabsApi.startCampaign(id);
      setLaunchPhase("success");
      const added =
        launched.contactCount === 1
          ? "1 candidate was added"
          : `${launched.contactCount} candidates were added`;
      const message = `Launched. ${added} to ${launched.groupName}.`;
      window.setTimeout(() => {
        sessionStorage.setItem(LAUNCHED_TOAST_KEY, message);
        router.push(ROUTES.aiCallCampaigns);
      }, 1600);
    } catch (err) {
      setLaunchPhase(null);
      setToast({
        message: getApiErrorMessage(err, "Could not launch this campaign."),
        variant: "error",
      });
    }
  }

  function openImport() {
    setUploadIssues([]);
    setImportOpen(true);
  }

  const columns = contactColumns(contacts);

  const addButton = (
    <Button type="button" onClick={openImport}>
      Add candidates
    </Button>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          className="-ml-2"
          nativeButton={false}
          render={<Link href={ROUTES.aiCallCampaigns} />}
        >
          <ChevronLeft aria-hidden />
          Back
        </Button>
        {campaign ? (
          <h1 className="min-w-0 truncate text-sm font-semibold text-foreground">{campaign.name}</h1>
        ) : null}
        {!loading && campaign && contacts.length > 0 ? <div className="ml-auto">{addButton}</div> : null}
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-border px-4 py-4 pr-12">
            <DialogTitle>Import Contacts to Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 p-4">
            <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
              <FileText aria-hidden className="size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-foreground">Upload a CSV file containing your contacts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                File should have a column for every required variable
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  <Upload aria-hidden />
                  {uploading ? "Uploading…" : "Choose File"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={downloadingSample}
                  onClick={() => void downloadSample()}
                >
                  <Download aria-hidden />
                  {downloadingSample ? "Downloading…" : "Download Sample File"}
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm text-foreground">
              <p className="flex items-center gap-2 font-medium">
                <Info aria-hidden className="size-4 text-primary" />
                File Format Requirements
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>CSV file (.csv)</li>
                <li>One contact per row</li>
              </ul>
            </div>
            {uploadIssues.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-destructive" role="alert">
                {uploadIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        aria-label="Choose CSV file"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void uploadFile(file);
        }}
      />

      {loading ? <Skeleton className="min-h-64 flex-1 rounded-xl" /> : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && !campaign ? (
        <EmptyState
          icon={Megaphone}
          title="Campaign not found"
          description="This campaign is not in your calling campaigns."
        />
      ) : null}

      {!loading && campaign && contacts.length === 0 ? (
        <div className="flex min-h-64 flex-1 items-center justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={openImport}
            className="h-16 min-w-64 border-2 border-dotted px-10 text-base"
          >
            Add candidates
          </Button>
        </div>
      ) : null}

      {!loading && campaign && contacts.length > 0 ? (
        <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
          <div className="scrollbar-none overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left">
                  {columns.map((column) => (
                    <th key={column} className="px-4 py-2.5 font-medium text-muted-foreground">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-border last:border-b-0">
                    {columns.map((column) => (
                      <td
                        key={column}
                        className={
                          column === "phone"
                            ? "whitespace-nowrap px-4 py-3 font-mono text-foreground"
                            : "whitespace-nowrap px-4 py-3 text-foreground"
                        }
                      >
                        {contactValue(contact, column) || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!loading && campaign && contacts.length > 0 && (!campaign.active || launchPhase) ? (
        <div className="mt-auto flex justify-end">
          <Button
            type="button"
            disabled={Boolean(launchPhase)}
            className="h-11 min-w-72 px-5 text-sm font-semibold tracking-wide uppercase"
            onClick={() => void launchCampaign()}
          >
            {launchPhase === "success" ? (
              <Check aria-hidden />
            ) : launchPhase ? (
              <Loader2 aria-hidden className="animate-spin" />
            ) : (
              <Rocket aria-hidden />
            )}
            {launchPhase === "launching"
              ? "Launching"
              : launchPhase === "creating"
                ? "Creating group"
                : launchPhase === "attaching"
                  ? "Attaching to campaign"
                  : launchPhase === "success"
                    ? "Launching success"
                    : "Launch"}
          </Button>
        </div>
      ) : null}
      <Snackbar message={toast?.message ?? null} variant={toast?.variant} onDismiss={dismissToast} />
    </div>
  );
}
