"use client";

import { Check, ChevronLeft, ChevronRight, Download, FileText, Info, Loader2, Megaphone, Rocket, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Snackbar } from "@/components/shared/snackbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ApiError,
  getApiErrorMessage,
  vocallabsApi,
  type CampaignContact,
  type VocallabsCampaign,
} from "@/lib/api";
import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import { ROUTES } from "@/lib/routes";

function contactColumns(contacts: CampaignContact[], answerColumns: string[]): string[] {
  const extras: string[] = [];
  const seen = new Set<string>(["name", "phone", "status", "call", "email"]);
  let hasEmail = false;
  for (const contact of contacts) {
    if (contact.email) hasEmail = true;
    for (const key of Object.keys(contact.data ?? {})) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      extras.push(key);
    }
  }
  const answers: string[] = [];
  const answerKeys = [
    ...answerColumns,
    ...contacts.flatMap((contact) => contact.call?.answers.map((answer) => answer.key) ?? []),
  ];
  for (const key of answerKeys) {
    const trimmed = key.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    answers.push(trimmed);
  }
  return ["name", "phone", "status", "call", ...answers, ...(hasEmail ? ["email"] : []), ...extras];
}

function formatAnswerKey(value: string): string {
  const text = value.trim().replace(/_/g, " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "";
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  if (minutes === 0) return `${rest} sec`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} sec`;
}

function speakerLabel(role: string): string {
  return role.toLowerCase() === "user" ? "Candidate" : "Agent";
}

function formatCallStatus(value: string): string {
  const text = value.trim().replace(/_/g, " ");
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function displayCallStatus(value: string, launched: boolean): string {
  const stored = value.trim().toLowerCase().replace(/_/g, " ");
  if (!stored || stored === "call initiated") return launched ? "Call initiated" : "Pending";
  return formatCallStatus(value);
}

function statusTone(value: string): string {
  const status = value.trim().toLowerCase().replace(/_/g, "-");
  if (status === "completed") return "bg-success/10 text-success";
  if (status === "failed" || status === "busy" || status === "no-answer") {
    return "bg-destructive/10 text-destructive";
  }
  if (status === "pending") return "bg-muted text-muted-foreground";
  if (status === "call initiated" || status === "initiated" || status === "queued" || status === "ringing") {
    return "bg-primary/10 text-primary";
  }
  return "bg-muted text-foreground";
}

function columnLabel(column: string): string {
  if (column === "call") return "Call";
  return formatAnswerKey(column);
}

function contactInitial(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}

function answerValue(contact: CampaignContact, column: string): string {
  return contact.call?.answers.find((answer) => answer.key === column)?.value ?? "";
}

function contactValue(contact: CampaignContact, column: string): string {
  if (column === "name") return contact.name;
  if (column === "phone") return contact.phone;
  if (column === "status") return formatCallStatus(contact.callStatus ?? "");
  if (column === "email") return contact.email;
  return contact.data?.[column] ?? "";
}

const LAUNCHED_TOAST_KEY = "huntlo-campaign-launched";

function ImportContactsBody({
  uploading,
  downloadingSample,
  uploadError,
  onChooseFile,
  onDownloadSample,
}: {
  uploading: boolean;
  downloadingSample: boolean;
  uploadError: string | null;
  onChooseFile: () => void;
  onDownloadSample: () => void;
}) {
  return (
    <div className="grid gap-4 p-4">
      <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-4 py-8 text-center">
        <FileText aria-hidden className="size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-foreground">Upload a CSV file containing your contacts</p>
        <p className="mt-1 text-sm text-muted-foreground">
          File should have a column for every required variable
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button type="button" disabled={uploading} onClick={onChooseFile}>
            <Upload aria-hidden />
            {uploading ? "Uploading…" : "Choose File"}
          </Button>
          <Button type="button" variant="secondary" disabled={downloadingSample} onClick={onDownloadSample}>
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
      {uploadError ? (
        <p className="text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

export function CampaignDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [campaign, setCampaign] = useState<VocallabsCampaign | null>(null);
  const [contacts, setContacts] = useState<CampaignContact[]>([]);
  const [answerColumns, setAnswerColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const [launchPhase, setLaunchPhase] = useState<
    "launching" | "creating" | "attaching" | "success" | null
  >(null);
  const [toast, setToast] = useState<{ message: string; variant: "default" | "error" } | null>(null);
  const [openCall, setOpenCall] = useState<CampaignContact | null>(null);
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
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([vocallabsApi.listCampaigns(), vocallabsApi.listCampaignContacts(id)])
      .then(([page, contactPage]) => {
        if (cancelled) return;
        setCampaign(page.items.find((item) => item.id === id) ?? null);
        setContacts(contactPage.items);
        setAnswerColumns(contactPage.answerColumns);
      })
      .catch((err) => {
        if (!cancelled) {
          setCampaign(null);
          setContacts([]);
          setAnswerColumns([]);
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

  const refreshContacts = useCallback(async () => {
    const contactPage = await vocallabsApi.listCampaignContacts(id);
    setContacts(contactPage.items);
    setAnswerColumns(contactPage.answerColumns);
    setOpenCall((current) => {
      if (!current) return null;
      return contactPage.items.find((item) => item.id === current.id) ?? current;
    });
  }, [id]);

  useRealtimeRefresh("ai-call.updated", (event) => {
    const data =
      event.data && typeof event.data === "object"
        ? (event.data as { campaignId?: string })
        : null;
    if (data?.campaignId && data.campaignId !== id) return;
    void refreshContacts().catch(() => undefined);
  });

  function uploadErrorMessage(err: unknown): string {
    if (err instanceof ApiError && (err.details?.length ?? 0) > 1) {
      return `This file has ${err.details?.length} problems and cannot be imported.`;
    }
    return getApiErrorMessage(err, "Could not import this file.");
  }

  async function uploadFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setUploadError("Upload a CSV file.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const page = await vocallabsApi.uploadCampaignContacts(id, file);
      setContacts(page.items);
      setImportOpen(false);
    } catch (err) {
      setUploadError(uploadErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function downloadSample() {
    setDownloadingSample(true);
    setUploadError(null);
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
      setUploadError(getApiErrorMessage(err, "Could not download the sample file."));
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
    setUploadError(null);
    setImportOpen(true);
  }

  const columns = contactColumns(contacts, answerColumns);
  const capturedColumns = new Set(columns.filter((column) => answerColumns.includes(column) || contacts.some((contact) => contact.call?.answers.some((answer) => answer.key === column))));

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
          <ImportContactsBody
            uploading={uploading}
            downloadingSample={downloadingSample}
            uploadError={uploadError}
            onChooseFile={() => fileRef.current?.click()}
            onDownloadSample={() => void downloadSample()}
          />
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
          <section className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-4 py-4">
              <h2 className="text-base font-medium text-foreground">Import Contacts to Campaign</h2>
            </div>
            <ImportContactsBody
              uploading={uploading}
              downloadingSample={downloadingSample}
              uploadError={uploadError}
              onChooseFile={() => fileRef.current?.click()}
              onDownloadSample={() => void downloadSample()}
            />
          </section>
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
                      {columnLabel(column)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border last:border-b-0 transition-colors duration-150 ease-out hover:bg-muted/30"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className={
                          column === "phone"
                            ? "whitespace-nowrap px-4 py-3 font-mono text-foreground"
                            : "whitespace-nowrap px-4 py-3 text-foreground"
                        }
                      >
                        {column === "status" ? (
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(displayCallStatus(contact.callStatus ?? "", Boolean(campaign?.active)))}`}
                          >
                            {displayCallStatus(contact.callStatus ?? "", Boolean(campaign?.active))}
                          </span>
                        ) : column === "call" ? (
                          contact.call ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground transition-[color,transform] duration-150 ease-out hover:text-foreground active:scale-[0.97]"
                              onClick={() => setOpenCall(contact)}
                            >
                              <span className="tabular-nums">
                                {formatDuration(contact.call.durationSeconds) || "Open"}
                              </span>
                              <ChevronRight aria-hidden className="size-3.5" />
                              <span className="sr-only">Open call for {contact.name || contact.phone}</span>
                            </button>
                          ) : (
                            "—"
                          )
                        ) : capturedColumns.has(column) ? (
                          answerValue(contact, column) || "—"
                        ) : (
                          contactValue(contact, column) || "—"
                        )}
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
      <Sheet open={Boolean(openCall)} onOpenChange={(next) => { if (!next) setOpenCall(null); }}>
        <SheetContent
          side="right"
          className="w-full gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-lg"
        >
          <SheetHeader className="border-b border-border pr-12">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {contactInitial(openCall?.name || "")}
              </span>
              <div className="min-w-0">
                <SheetTitle className="truncate">{openCall?.name || "Call"}</SheetTitle>
                <SheetDescription className="font-mono">{openCall?.phone}</SheetDescription>
              </div>
            </div>
            {openCall?.call ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {openCall.call.status ? (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusTone(openCall.call.status)}`}
                  >
                    {formatCallStatus(openCall.call.status)}
                  </span>
                ) : null}
                {formatDuration(openCall.call.durationSeconds) ? (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDuration(openCall.call.durationSeconds)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </SheetHeader>
          {openCall?.call ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="grid gap-5">
                {openCall.call.recordingUrl ? (
                  <audio
                    controls
                    preload="metadata"
                    src={openCall.call.recordingUrl}
                    className="h-10 w-full"
                  >
                    <a href={openCall.call.recordingUrl}>Play recording</a>
                  </audio>
                ) : null}
                <section className="grid gap-2">
                  <h2 className="text-sm font-medium text-foreground">Summary</h2>
                  <p className="rounded-xl bg-muted/50 px-3.5 py-3 text-sm leading-6 text-foreground">
                    {openCall.call.summary || "No summary yet."}
                  </p>
                </section>
                <section className="grid gap-2">
                  <h2 className="text-sm font-medium text-foreground">Answers</h2>
                  {openCall.call.answers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No answers captured.</p>
                  ) : (
                    <dl className="grid grid-cols-2 gap-2">
                      {openCall.call.answers.map((answer) => (
                        <div key={answer.key} className="rounded-xl bg-muted/50 px-3 py-2.5">
                          <dt className="text-[11px] text-muted-foreground">{formatAnswerKey(answer.key)}</dt>
                          <dd className="mt-0.5 text-sm font-medium text-foreground">{answer.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
                <section className="grid gap-3">
                  <h2 className="text-sm font-medium text-foreground">Transcript</h2>
                  {openCall.call.messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No transcript yet.</p>
                  ) : (
                    <ol className="grid gap-2.5">
                      {openCall.call.messages.map((message, index) => {
                        const candidate = message.role.toLowerCase() === "user";
                        return (
                          <li
                            key={`${message.createdAt}-${index}`}
                            className={candidate ? "flex justify-end" : "flex justify-start"}
                          >
                            <div
                              className={
                                candidate
                                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-primary-foreground"
                                  : "max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-foreground"
                              }
                            >
                              <p className={candidate ? "text-[11px] text-primary-foreground/70" : "text-[11px] text-muted-foreground"}>
                                {speakerLabel(message.role)}
                              </p>
                              <p className="mt-0.5 text-sm leading-6">{message.content}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <Snackbar message={toast?.message ?? null} variant={toast?.variant} onDismiss={dismissToast} />
    </div>
  );
}
