"use client";

import {
  Briefcase,
  Copy,
  Download,
  Eye,
  MoreHorizontal,
  Pause,
  Pencil,
  Phone,
  Play,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { ResultsWorkspace } from "@/components/screening/results-workspace";
import { CandidateAvatar } from "@/components/shared/candidate-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BATCH_CANDIDATES,
  BATCH_SETTINGS,
  type CallStatus,
  type ScreeningBatch,
  type ScreeningBatchStatus,
} from "@/lib/mock-screening";
import {
  candidateDetailPath,
  jobDetailPath,
  screeningResultPath,
} from "@/lib/routes";
import { cn } from "@/lib/utils";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const CALL_CLASSES: Record<CallStatus, string> = {
  Queued: "bg-muted text-muted-foreground",
  Ringing: "bg-info/10 text-info",
  Completed: "bg-success/10 text-success",
  "No answer": "bg-warning/10 text-warning",
  Voicemail: "bg-warning/10 text-warning",
  Failed: "bg-destructive/10 text-destructive",
  "Opted out": "bg-destructive/10 text-destructive",
};

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-md px-2 text-xs font-medium whitespace-nowrap",
        className
      )}
    >
      {text}
    </span>
  );
}

function OverviewTab({ batch }: { batch: ScreeningBatch }) {
  const completion =
    batch.candidates > 0
      ? Math.round((batch.completed / batch.candidates) * 100)
      : 0;

  const kpis = [
    { label: "Candidates", value: batch.candidates.toLocaleString("en-IN") },
    { label: "Completed", value: `${batch.completed}/${batch.candidates || "—"}` },
    { label: "Completion rate", value: `${completion}%` },
    {
      label: "Average score",
      value: batch.averageScore !== null ? String(batch.averageScore) : "—",
    },
    { label: "Shortlisted", value: String(batch.shortlisted) },
    { label: "Attempts", value: String(batch.attempts) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs font-medium text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      <ResultsWorkspace screeningId={batch.id} />
    </div>
  );
}

function CandidatesTab() {
  return (
    <section className="overflow-x-auto rounded-xl border border-border bg-card">
      <Table>
        <caption className="sr-only">
          Candidates enrolled in this screening batch
        </caption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={HEAD}>Candidate</TableHead>
            <TableHead className={HEAD}>Call status</TableHead>
            <TableHead className={HEAD}>Attempts</TableHead>
            <TableHead className={HEAD}>Duration</TableHead>
            <TableHead className={`${HEAD} text-right`}>Score</TableHead>
            <TableHead className={HEAD}>Last activity</TableHead>
            <TableHead className={`${HEAD} w-10 text-right`}>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {BATCH_CANDIDATES.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="py-2.5">
                <div className="flex items-center gap-2.5">
                  <CandidateAvatar name={candidate.name} className="size-7" />
                  {candidate.candidateId ? (
                    <Link
                      href={candidateDetailPath(candidate.candidateId)}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {candidate.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {candidate.name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <Badge
                  text={candidate.callStatus}
                  className={CALL_CLASSES[candidate.callStatus]}
                />
              </TableCell>
              <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                {candidate.attemptsUsed}/{candidate.attemptsMax}
              </TableCell>
              <TableCell className="py-2.5 text-sm tabular-nums text-muted-foreground">
                {candidate.duration ?? "—"}
              </TableCell>
              <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums">
                {candidate.score !== null ? (
                  <Link
                    href={screeningResultPath(candidate.resultId!)}
                    className={cn(
                      "underline-offset-4 hover:underline",
                      candidate.score >= 75 ? "text-success" : "text-foreground"
                    )}
                  >
                    {candidate.score}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                {candidate.lastActivity}
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Actions for ${candidate.name}`}
                      />
                    }
                  >
                    <MoreHorizontal aria-hidden />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {candidate.resultId ? (
                      <DropdownMenuItem
                        render={
                          <Link href={screeningResultPath(candidate.resultId)} />
                        }
                      >
                        <Eye aria-hidden />
                        View result
                      </DropdownMenuItem>
                    ) : null}
                    {candidate.candidateId ? (
                      <DropdownMenuItem
                        render={
                          <Link
                            href={candidateDetailPath(candidate.candidateId)}
                          />
                        }
                      >
                        <Eye aria-hidden />
                        View profile
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem>
                      <Phone aria-hidden />
                      Call again
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      <Trash2 aria-hidden />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function SettingsTab() {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Screening settings
        </h3>
        <p className="text-xs text-muted-foreground">
          Pause the batch to edit agent scripts, questions or call windows.
        </p>
      </div>
      <dl className="divide-y divide-border">
        {BATCH_SETTINGS.map((setting) => (
          <div
            key={setting.id}
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
          >
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{setting.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {setting.value}
              </dd>
            </div>
            <Button size="xs" variant="ghost">
              <Pencil aria-hidden />
              Edit
            </Button>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ScreeningDetail({ batch }: { batch: ScreeningBatch }) {
  const [status, setStatus] = useState<ScreeningBatchStatus>(batch.status);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  function flash(text: string) {
    setFeedback(text);
    window.setTimeout(() => setFeedback(null), 2400);
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {batch.name}
              </h1>
              <CampaignStatusBadge status={status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {batch.jobId && batch.jobTitle ? (
                <span className="inline-flex items-center gap-1">
                  <Briefcase aria-hidden className="size-3" />
                  <Link
                    href={jobDetailPath(batch.jobId)}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    {batch.jobTitle}
                  </Link>
                </span>
              ) : null}
              <span>Owner: {batch.owner}</span>
              <span>{batch.language}</span>
              <span className="inline-flex items-center gap-1">
                <Users aria-hidden className="size-3" />
                {batch.candidates.toLocaleString("en-IN")} candidates
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {status === "Running" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setStatus("Paused");
                  flash("Screening paused — queued calls will not dial.");
                }}
              >
                <Pause aria-hidden />
                Pause
              </Button>
            ) : status === "Paused" ? (
              <Button
                size="sm"
                onClick={() => {
                  setStatus("Running");
                  flash("Screening resumed.");
                }}
              >
                <Play aria-hidden />
                Resume
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                flash("Edit opens the screening builder. (UI preview)")
              }
            >
              <Pencil aria-hidden />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                flash("Add candidates from the pool, a list, or a session.")
              }
            >
              <UserPlus aria-hidden />
              Add Candidates
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveTab("overview")}
            >
              View Results
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="More actions"
                  />
                }
              >
                <MoreHorizontal aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => flash("Duplicated screening as a draft.")}
                >
                  <Copy aria-hidden />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => flash("Exported screening report.")}
                >
                  <Download aria-hidden />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => flash("Screening deleted. (UI preview)")}
                >
                  <Trash2 aria-hidden />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {feedback ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
          >
            {feedback}
          </p>
        ) : null}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="pt-3">
          <OverviewTab batch={batch} />
        </TabsContent>
        <TabsContent value="candidates" className="pt-3">
          <CandidatesTab />
        </TabsContent>
        <TabsContent value="settings" className="pt-3">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
