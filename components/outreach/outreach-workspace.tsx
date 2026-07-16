"use client";

import {
  Copy,
  Eye,
  MoreHorizontal,
  Pause,
  Play,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CampaignStatusBadge } from "@/components/outreach/campaign-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FilterPopover,
  type FilterOption,
} from "@/components/shared/filter-popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATE_RANGE_OPTIONS } from "@/lib/mock-jobs";
import {
  CAMPAIGN_OWNERS,
  CAMPAIGN_STATUSES,
  CHANNEL_ICONS,
  OUTREACH_CAMPAIGNS,
  OUTREACH_CHANNELS,
  type OutreachCampaign,
} from "@/lib/mock-outreach";
import { campaignDetailPath, jobDetailPath, ROUTES } from "@/lib/routes";

const HEAD = "h-9 whitespace-nowrap text-xs font-medium text-muted-foreground";

const DATE_RANGE_DAYS: Record<string, number> = {
  any: Infinity,
  "7d": 7,
  "30d": 30,
  "90d": 90,
  ytd: 365,
};

function toOptions(values: readonly string[]): FilterOption[] {
  return values.map((value) => ({ id: value, label: value }));
}

function ChannelIcons({ channels }: { channels: OutreachCampaign["channels"] }) {
  return (
    <span className="flex items-center gap-1">
      {channels.map((channel) => {
        const Icon = CHANNEL_ICONS[channel];
        return (
          <Tooltip key={channel}>
            <TooltipTrigger
              aria-label={channel}
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="flex size-6 items-center justify-center rounded-md border border-border bg-muted/60">
                <Icon aria-hidden className="size-3.5 text-muted-foreground" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{channel}</TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}

function percent(part: number, whole: number): string {
  if (whole === 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function CampaignRowActions({
  campaign,
  onAction,
}: {
  campaign: OutreachCampaign;
  onAction: (message: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${campaign.name}`}
            />
          }
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            render={<Link href={campaignDetailPath(campaign.id)} />}
          >
            <Eye aria-hidden />
            View campaign
          </DropdownMenuItem>
          {campaign.status === "Running" ? (
            <DropdownMenuItem
              onClick={() => onAction(`Paused “${campaign.name}”.`)}
            >
              <Pause aria-hidden />
              Pause
            </DropdownMenuItem>
          ) : campaign.status === "Paused" ? (
            <DropdownMenuItem
              onClick={() => onAction(`Resumed “${campaign.name}”.`)}
            >
              <Play aria-hidden />
              Resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() => onAction(`Duplicated “${campaign.name}” as a draft.`)}
          >
            <Copy aria-hidden />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{campaign.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              The campaign and its analytics will be permanently removed.
              Enrolled candidates stop receiving messages immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmDelete(false);
                onAction(`Deleted “${campaign.name}”.`);
              }}
            >
              Delete campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function OutreachWorkspace() {
  const [query, setQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("any");
  const [message, setMessage] = useState<string | null>(null);

  const jobOptions = useMemo(() => {
    const titles = new Map<string, string>();
    OUTREACH_CAMPAIGNS.forEach((campaign) => {
      if (campaign.relatedJobId && campaign.relatedJobTitle) {
        titles.set(campaign.relatedJobId, campaign.relatedJobTitle);
      }
    });
    return Array.from(titles, ([id, label]) => ({ id, label }));
  }, []);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const maxDays = DATE_RANGE_DAYS[dateRange] ?? Infinity;
    return OUTREACH_CAMPAIGNS.filter((campaign) => {
      if (
        normalized &&
        !`${campaign.name} ${campaign.relatedJobTitle ?? ""}`
          .toLowerCase()
          .includes(normalized)
      )
        return false;
      if (
        channelFilter.length > 0 &&
        !campaign.channels.some((channel) => channelFilter.includes(channel))
      )
        return false;
      if (statusFilter.length > 0 && !statusFilter.includes(campaign.status))
        return false;
      if (
        jobFilter.length > 0 &&
        !jobFilter.includes(campaign.relatedJobId ?? "")
      )
        return false;
      if (ownerFilter.length > 0 && !ownerFilter.includes(campaign.owner))
        return false;
      if (campaign.createdDaysAgo > maxDays) return false;
      return true;
    });
  }, [query, channelFilter, statusFilter, jobFilter, ownerFilter, dateRange]);

  const hasFilters =
    Boolean(query) ||
    channelFilter.length > 0 ||
    statusFilter.length > 0 ||
    jobFilter.length > 0 ||
    ownerFilter.length > 0 ||
    dateRange !== "any";

  function resetFilters() {
    setQuery("");
    setChannelFilter([]);
    setStatusFilter([]);
    setJobFilter([]);
    setOwnerFilter([]);
    setDateRange("any");
  }

  function flash(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2400);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaigns…"
              aria-label="Search campaigns"
              className="pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPopover
              label="Channel"
              options={toOptions(OUTREACH_CHANNELS)}
              selected={channelFilter}
              onToggle={toggle(setChannelFilter)}
            />
            <FilterPopover
              label="Status"
              options={toOptions(CAMPAIGN_STATUSES)}
              selected={statusFilter}
              onToggle={toggle(setStatusFilter)}
            />
            <FilterPopover
              label="Job"
              options={jobOptions}
              selected={jobFilter}
              onToggle={toggle(setJobFilter)}
            />
            <FilterPopover
              label="Owner"
              options={toOptions(CAMPAIGN_OWNERS)}
              selected={ownerFilter}
              onToggle={toggle(setOwnerFilter)}
            />
            <Select
              value={dateRange}
              onValueChange={(value) => value && setDateRange(value)}
            >
              <SelectTrigger size="sm" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasFilters ? (
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                <X aria-hidden />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {/* Table */}
      <section className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {filtered.length}
            </span>{" "}
            campaigns
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <caption className="sr-only">
                Outreach campaigns with delivery and reply performance
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className={HEAD}>Campaign</TableHead>
                  <TableHead className={HEAD}>Related job</TableHead>
                  <TableHead className={HEAD}>Channels</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Candidates</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Sent</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Delivered</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Replies</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Interested</TableHead>
                  <TableHead className={`${HEAD} text-right`}>Qualified</TableHead>
                  <TableHead className={HEAD}>Status</TableHead>
                  <TableHead className={HEAD}>Owner</TableHead>
                  <TableHead className={HEAD}>Last activity</TableHead>
                  <TableHead className={`${HEAD} w-10 text-right`}>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="py-2.5">
                      <Link
                        href={campaignDetailPath(campaign.id)}
                        className="block max-w-52 truncate text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell className="py-2.5 whitespace-nowrap">
                      {campaign.relatedJobId && campaign.relatedJobTitle ? (
                        <Link
                          href={jobDetailPath(campaign.relatedJobId)}
                          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                          {campaign.relatedJobTitle}
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <ChannelIcons channels={campaign.channels} />
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                      {campaign.candidates.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                      {campaign.sent.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums text-muted-foreground">
                      {campaign.sent > 0
                        ? `${campaign.delivered.toLocaleString("en-IN")} (${percent(campaign.delivered, campaign.sent)})`
                        : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums">
                      {campaign.replies > 0 ? campaign.replies : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm tabular-nums text-success">
                      {campaign.interested > 0 ? campaign.interested : "—"}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-medium tabular-nums text-primary">
                      {campaign.qualified > 0 ? campaign.qualified : "—"}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <CampaignStatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {campaign.owner}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm whitespace-nowrap text-muted-foreground">
                      {campaign.lastActivity}
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <CampaignRowActions campaign={campaign} onAction={flash} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            icon={Send}
            title="No campaigns match these filters"
            description="Adjust your filters, or create a new campaign to start reaching candidates."
            actionLabel="Create Campaign"
            actionHref={ROUTES.outreachNew}
            className="m-4 border-0"
          />
        )}
      </section>
    </div>
  );
}
