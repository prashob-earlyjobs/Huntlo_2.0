"use client";

import { Download, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Field, ToggleRow } from "@/components/outreach/builder-ui";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormSaveBar, type FormSaveStatus } from "@/components/shared/form-save-bar";
import { FormSection } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  AUDIT_LOG,
  CANDIDATE_STATUSES,
  DEFAULT_OUTREACH,
  DEFAULT_PRIVACY,
  DEFAULT_RECRUITING,
  DEFAULT_SCHEDULING,
  DEFAULT_SCREENING,
  DEFAULT_WORKSPACE,
  JOB_LOCATIONS,
  RECRUITERS,
  SETTINGS_TIMEZONES,
  TALENT_LISTS,
  type OutreachDefaults,
  type PrivacySettings,
  type RecruitingDefaults,
  type SchedulingDefaults,
  type ScreeningDefaults,
  type WorkspaceSettings,
} from "@/lib/mock-settings";

interface SettingsForm {
  workspace: WorkspaceSettings;
  recruiting: RecruitingDefaults;
  outreach: OutreachDefaults;
  screening: ScreeningDefaults;
  scheduling: SchedulingDefaults;
  privacy: PrivacySettings;
}

function cloneForm(value: SettingsForm): SettingsForm {
  return {
    workspace: { ...value.workspace },
    recruiting: { ...value.recruiting },
    outreach: { ...value.outreach },
    screening: { ...value.screening },
    scheduling: { ...value.scheduling },
    privacy: { ...value.privacy },
  };
}

const INITIAL_FORM: SettingsForm = {
  workspace: { ...DEFAULT_WORKSPACE },
  recruiting: { ...DEFAULT_RECRUITING },
  outreach: { ...DEFAULT_OUTREACH },
  screening: { ...DEFAULT_SCREENING },
  scheduling: { ...DEFAULT_SCHEDULING },
  privacy: { ...DEFAULT_PRIVACY },
};

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

function useSimulatedSave() {
  const [status, setStatus] = useState<FormSaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function runSave(options?: { error?: string; onSuccess?: () => void }) {
    setStatus("saving");
    setErrorMessage(undefined);
    window.setTimeout(() => {
      if (options?.error) {
        setStatus("error");
        setErrorMessage(options.error);
        return;
      }
      options?.onSuccess?.();
      setStatus("success");
    }, 700);
  }

  function clearStatus() {
    setStatus("idle");
    setErrorMessage(undefined);
  }

  return { status, errorMessage, runSave, clearStatus };
}

export function SettingsWorkspace() {
  const [saved, setSaved] = useState(() => cloneForm(INITIAL_FORM));
  const [form, setForm] = useState(() => cloneForm(INITIAL_FORM));
  const [toast, setToast] = useState<string | null>(null);
  const save = useSimulatedSave();

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  function patchWorkspace<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      workspace: { ...previous.workspace, [key]: value },
    }));
  }

  function patchRecruiting<K extends keyof RecruitingDefaults>(
    key: K,
    value: RecruitingDefaults[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      recruiting: { ...previous.recruiting, [key]: value },
    }));
  }

  function patchOutreach<K extends keyof OutreachDefaults>(
    key: K,
    value: OutreachDefaults[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      outreach: { ...previous.outreach, [key]: value },
    }));
  }

  function patchScreening<K extends keyof ScreeningDefaults>(
    key: K,
    value: ScreeningDefaults[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      screening: { ...previous.screening, [key]: value },
    }));
  }

  function patchScheduling<K extends keyof SchedulingDefaults>(
    key: K,
    value: SchedulingDefaults[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      scheduling: { ...previous.scheduling, [key]: value },
    }));
  }

  function patchPrivacy<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) {
    save.clearStatus();
    setForm((previous) => ({
      ...previous,
      privacy: { ...previous.privacy, [key]: value },
    }));
  }

  function handleSave() {
    if (!form.workspace.organisationName.trim()) {
      save.runSave({
        error: "Organisation name is required before saving workspace settings.",
      });
      return;
    }
    const score = Number(form.screening.minimumShortlistScore);
    if (
      Number.isNaN(score) ||
      score < 0 ||
      score > 100 ||
      !form.screening.minimumShortlistScore.trim()
    ) {
      save.runSave({
        error: "Minimum shortlist score must be a number between 0 and 100.",
      });
      return;
    }
    save.runSave({
      onSuccess: () => setSaved(cloneForm(form)),
    });
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div
          role="status"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm"
        >
          {toast}
        </div>
      ) : null}

      {/* Workspace */}
      <FormSection
        title="Workspace"
        description="Organisation identity and locale defaults for this workspace"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Organisation name" htmlFor="ws-name" required>
            <Input
              id="ws-name"
              value={form.workspace.organisationName}
              onChange={(event) =>
                patchWorkspace("organisationName", event.target.value)
              }
            />
          </Field>
          <Field label="Industry" htmlFor="ws-industry">
            <Input
              id="ws-industry"
              value={form.workspace.industry}
              onChange={(event) =>
                patchWorkspace("industry", event.target.value)
              }
            />
          </Field>
          <Field label="Website" htmlFor="ws-website">
            <Input
              id="ws-website"
              value={form.workspace.website}
              onChange={(event) =>
                patchWorkspace("website", event.target.value)
              }
            />
          </Field>
          <Field label="Company size" htmlFor="ws-size">
            <Select
              value={form.workspace.companySize}
              onValueChange={(value) =>
                value && patchWorkspace("companySize", value)
              }
            >
              <SelectTrigger id="ws-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "1–10 employees",
                  "11–50 employees",
                  "51–200 employees",
                  "201–500 employees",
                  "500+ employees",
                ].map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default timezone" htmlFor="ws-tz">
            <Select
              value={form.workspace.defaultTimezone}
              onValueChange={(value) =>
                value && patchWorkspace("defaultTimezone", value)
              }
            >
              <SelectTrigger id="ws-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SETTINGS_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Date format" htmlFor="ws-date">
            <Select
              value={form.workspace.dateFormat}
              onValueChange={(value) =>
                value && patchWorkspace("dateFormat", value)
              }
            >
              <SelectTrigger id="ws-date" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["DD MMM YYYY", "MMM DD, YYYY", "YYYY-MM-DD", "DD/MM/YYYY"].map(
                  (format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default currency" htmlFor="ws-currency">
            <Select
              value={form.workspace.defaultCurrency}
              onValueChange={(value) =>
                value && patchWorkspace("defaultCurrency", value)
              }
            >
              <SelectTrigger id="ws-currency" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["INR (₹)", "USD ($)", "AED (د.إ)", "SGD (S$)", "GBP (£)"].map(
                  (currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      {/* Recruiting */}
      <FormSection
        title="Recruiting Defaults"
        description="Applied when creating candidates, jobs and talent lists"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Default candidate status" htmlFor="rec-status">
            <Select
              value={form.recruiting.defaultCandidateStatus}
              onValueChange={(value) =>
                value && patchRecruiting("defaultCandidateStatus", value)
              }
            >
              <SelectTrigger id="rec-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANDIDATE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default recruiter" htmlFor="rec-recruiter">
            <Select
              value={form.recruiting.defaultRecruiter}
              onValueChange={(value) =>
                value && patchRecruiting("defaultRecruiter", value)
              }
            >
              <SelectTrigger id="rec-recruiter" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECRUITERS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default talent list" htmlFor="rec-list">
            <Select
              value={form.recruiting.defaultTalentList}
              onValueChange={(value) =>
                value && patchRecruiting("defaultTalentList", value)
              }
            >
              <SelectTrigger id="rec-list" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TALENT_LISTS.map((list) => (
                  <SelectItem key={list} value={list}>
                    {list}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Default job location" htmlFor="rec-location">
            <Select
              value={form.recruiting.defaultJobLocation}
              onValueChange={(value) =>
                value && patchRecruiting("defaultJobLocation", value)
              }
            >
              <SelectTrigger id="rec-location" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JOB_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      {/* Outreach */}
      <FormSection
        title="Outreach Defaults"
        description="Sender, send window and compliance defaults for new campaigns"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Default sender"
            htmlFor="out-sender"
            className="sm:col-span-2"
          >
            <Input
              id="out-sender"
              value={form.outreach.defaultSender}
              onChange={(event) =>
                patchOutreach("defaultSender", event.target.value)
              }
            />
          </Field>
          <Field label="Send window start" htmlFor="out-start">
            <Input
              id="out-start"
              type="time"
              value={form.outreach.sendWindowStart}
              onChange={(event) =>
                patchOutreach("sendWindowStart", event.target.value)
              }
            />
          </Field>
          <Field label="Send window end" htmlFor="out-end">
            <Input
              id="out-end"
              type="time"
              value={form.outreach.sendWindowEnd}
              onChange={(event) =>
                patchOutreach("sendWindowEnd", event.target.value)
              }
            />
          </Field>
          <Field label="Timezone handling" htmlFor="out-tz">
            <Select
              value={form.outreach.timezoneHandling}
              onValueChange={(value) =>
                value && patchOutreach("timezoneHandling", value)
              }
            >
              <SelectTrigger id="out-tz" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Candidate local timezone",
                  "Workspace timezone",
                  "Sender timezone",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reply-stop behaviour" htmlFor="out-stop">
            <Select
              value={form.outreach.replyStopBehaviour}
              onValueChange={(value) =>
                value && patchOutreach("replyStopBehaviour", value)
              }
            >
              <SelectTrigger id="out-stop" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Stop sequence on any reply",
                  "Stop only on positive reply",
                  "Continue sequence after reply",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Opt-out footer"
            htmlFor="out-footer"
            className="sm:col-span-2"
            hint="Appended to email and WhatsApp messages"
          >
            <Textarea
              id="out-footer"
              rows={2}
              value={form.outreach.optOutFooter}
              onChange={(event) =>
                patchOutreach("optOutFooter", event.target.value)
              }
            />
          </Field>
        </div>
      </FormSection>

      {/* Screening */}
      <FormSection
        title="Screening Defaults"
        description="Defaults for new AI voice screening batches"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Language" htmlFor="scr-lang">
            <Select
              value={form.screening.language}
              onValueChange={(value) =>
                value && patchScreening("language", value)
              }
            >
              <SelectTrigger id="scr-lang" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "English (India)",
                  "English (US)",
                  "Hindi",
                  "Hinglish",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Voice tone" htmlFor="scr-tone">
            <Select
              value={form.screening.voiceTone}
              onValueChange={(value) =>
                value && patchScreening("voiceTone", value)
              }
            >
              <SelectTrigger id="scr-tone" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Professional & warm",
                  "Formal",
                  "Conversational",
                  "Energetic",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Attempts" htmlFor="scr-attempts">
            <Select
              value={form.screening.attempts}
              onValueChange={(value) =>
                value && patchScreening("attempts", value)
              }
            >
              <SelectTrigger id="scr-attempts" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4", "5"].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Attempt interval" htmlFor="scr-interval">
            <Select
              value={form.screening.attemptInterval}
              onValueChange={(value) =>
                value && patchScreening("attemptInterval", value)
              }
            >
              <SelectTrigger id="scr-interval" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1 hour", "2 hours", "4 hours", "8 hours", "24 hours"].map(
                  (option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label="Minimum shortlist score"
            htmlFor="scr-score"
            hint="0–100"
          >
            <Input
              id="scr-score"
              type="number"
              min={0}
              max={100}
              value={form.screening.minimumShortlistScore}
              onChange={(event) =>
                patchScreening("minimumShortlistScore", event.target.value)
              }
            />
          </Field>
        </div>
      </FormSection>

      {/* Scheduling */}
      <FormSection
        title="Scheduling Defaults"
        description="Interview booking defaults — Calendly connection is UI-only"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Default Calendly event" htmlFor="sch-event">
            <Select
              value={form.scheduling.defaultCalendlyEvent}
              onValueChange={(value) =>
                value && patchScheduling("defaultCalendlyEvent", value)
              }
            >
              <SelectTrigger id="sch-event" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "15-min Intro Call",
                  "30-min Screening Call",
                  "45-min Panel Interview",
                  "60-min Hiring Manager",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Reminder timings" htmlFor="sch-reminders">
            <Select
              value={form.scheduling.reminderTimings}
              onValueChange={(value) =>
                value && patchScheduling("reminderTimings", value)
              }
            >
              <SelectTrigger id="sch-reminders" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "24h before",
                  "24h · 1h before",
                  "24h · 1h · 15m before",
                  "1h · 15m before",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Interview duration" htmlFor="sch-duration">
            <Select
              value={form.scheduling.interviewDuration}
              onValueChange={(value) =>
                value && patchScheduling("interviewDuration", value)
              }
            >
              <SelectTrigger id="sch-duration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "15 minutes",
                  "30 minutes",
                  "45 minutes",
                  "60 minutes",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Buffer time" htmlFor="sch-buffer">
            <Select
              value={form.scheduling.bufferTime}
              onValueChange={(value) =>
                value && patchScheduling("bufferTime", value)
              }
            >
              <SelectTrigger id="sch-buffer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "0 minutes",
                  "5 minutes",
                  "10 minutes",
                  "15 minutes",
                  "30 minutes",
                ].map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FormSection>

      {/* Data & Privacy */}
      <FormSection
        title="Data and Privacy"
        description="Retention, consent, export and workspace deletion"
      >
        <Field label="Candidate retention" htmlFor="priv-retention">
          <Select
            value={form.privacy.candidateRetention}
            onValueChange={(value) =>
              value && patchPrivacy("candidateRetention", value)
            }
          >
            <SelectTrigger id="priv-retention" className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "12 months after last activity",
                "24 months after last activity",
                "36 months after last activity",
                "Retain indefinitely",
              ].map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Consent settings
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <ToggleRow
              id="consent-email"
              label="Email outreach consent"
              description="Require recorded consent before email sequences"
              checked={form.privacy.consentEmail}
              onChange={(checked) => patchPrivacy("consentEmail", checked)}
            />
            <ToggleRow
              id="consent-whatsapp"
              label="WhatsApp consent"
              description="Require opt-in before WhatsApp outreach"
              checked={form.privacy.consentWhatsapp}
              onChange={(checked) => patchPrivacy("consentWhatsapp", checked)}
            />
            <ToggleRow
              id="consent-voice"
              label="AI voice screening consent"
              description="Confirm consent before placing screening calls"
              checked={form.privacy.consentVoice}
              onChange={(checked) => patchPrivacy("consentVoice", checked)}
            />
            <ToggleRow
              id="consent-share"
              label="Share anonymised usage data"
              description="Help improve Huntlo product quality"
              checked={form.privacy.consentDataSharing}
              onChange={(checked) =>
                patchPrivacy("consentDataSharing", checked)
              }
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setToast("Workspace export started. Download is a UI preview.")
            }
          >
            <Download aria-hidden />
            Export workspace data
          </Button>
          <ConfirmDialog
            trigger={
              <Button type="button" size="sm" variant="destructive">
                <Trash2 aria-hidden />
                Delete workspace
              </Button>
            }
            title="Delete this workspace?"
            description="This is a placeholder. Deleting a workspace would permanently remove members, candidates, campaigns and integrations. No data is deleted in this UI preview."
            confirmLabel="Delete workspace"
            destructive
            onConfirm={() =>
              setToast("Workspace deletion is a placeholder — nothing was deleted.")
            }
          />
        </div>
      </FormSection>

      <FormSaveBar
        dirty={dirty}
        status={save.status}
        errorMessage={save.errorMessage}
        successMessage="Workspace settings saved."
        onSave={handleSave}
        onReset={() => {
          setForm(cloneForm(saved));
          save.clearStatus();
        }}
      />

      {/* Audit log */}
      <FormSection
        title="Audit Log"
        description="Recent workspace actions — IP addresses are placeholders"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={HEAD}>User</TableHead>
                <TableHead className={HEAD}>Action</TableHead>
                <TableHead className={HEAD}>Module</TableHead>
                <TableHead className={HEAD}>Related entity</TableHead>
                <TableHead className={HEAD}>Timestamp</TableHead>
                <TableHead className={HEAD}>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AUDIT_LOG.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-sm font-medium">
                    {entry.user}
                  </TableCell>
                  <TableCell className="text-sm">{entry.action}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {entry.module}
                  </TableCell>
                  <TableCell className="max-w-[14rem] truncate text-sm text-muted-foreground">
                    {entry.relatedEntity}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {entry.timestamp}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                    {entry.ip}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </FormSection>
    </div>
  );
}
