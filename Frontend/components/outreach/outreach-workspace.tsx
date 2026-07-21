"use client";

import {
  ChevronLeft,
  ChevronRight,
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
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
import type { PaginationMeta } from "@/lib/api";
import { DATE_RANGE_OPTIONS } from "@/lib/mock-jobs";
import {
  CAMPAIGN_OWNERS,
  CAMPAIGN_STATUSES,
  CHANNEL_ICONS,
  OUTREACH_CHANNELS,
  type OutreachCampaign,
} from "@/lib/mock-outreach";
import { getApiErrorMessage, outreachApi } from "@/lib/api";
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

function getPageItems(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);
  return items;
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
  onUpdated,
  onDeleted,
}: {
  campaign: OutreachCampaign;
  onAction: (message: string) => void;
  onUpdated: (campaign: OutreachCampaign) => void;
  onDeleted: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function run(
    action: () => Promise<OutreachCampaign | void>,
    successMessage: string
  ) {
    setBusy(true);
    try {
      const result = await action();
      if (result) onUpdated(result);
      onAction(successMessage);
    } catch (err) {
      onAction(getApiErrorMessage(err, "Action failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Actions for ${campaign.name}`}
              disabled={busy}
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
              onClick={() =>
                void run(
                  () => outreachApi.pauseCampaign(campaign.id),
                  `Paused “${campaign.name}”.`
                )
              }
            >
              <Pause aria-hidden />
              Pause
            </DropdownMenuItem>
          ) : campaign.status === "Paused" ? (
            <DropdownMenuItem
              onClick={() =>
                void run(
                  () => outreachApi.resumeCampaign(campaign.id),
                  `Resumed “${campaign.name}”.`
                )
              }
            >
              <Play aria-hidden />
              Resume
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem
            onClick={() =>
              void run(
                () => outreachApi.duplicateCampaign(campaign.id),
                `Duplicated “${campaign.name}” as a draft.`
              )
            }
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
                void run(async () => {
                  await outreachApi.deleteCampaign(campaign.id);
                  onDeleted(campaign.id);
                }, `Deleted “${campaign.name}”.`);
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

export function OutreachWorkspace({
  campaigns: initialCampaigns,
  pagination,
  search,
  onSearchChange,
  onPageChange,
  onCampaignsChange,
}: {
  campaigns: OutreachCampaign[];
  pagination: PaginationMeta;
  search: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onCampaignsChange?: (campaigns: OutreachCampaign[]) => void;
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [ownerFilter, setOwnerFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState("any");
  const [message, setMessage] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIdleTimer = useRef<number | null>(null);

  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  useEffect(() => {
    if (pagination.totalPages <= 1) return;

    function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
      let current = node;
      while (current) {
        const { overflowY } = window.getComputedStyle(current);
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          current.scrollHeight > current.clientHeight
        ) {
          return current;
        }
        current = current.parentElement;
      }
      return window;
    }

    const target = getScrollParent(document.querySelector("main"));
    const onScroll = () => {
      setIsScrolling(true);
      if (scrollIdleTimer.current != null) {
        window.clearTimeout(scrollIdleTimer.current);
      }
      scrollIdleTimer.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollIdleTimer.current = null;
      }, 180);
    };

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      if (scrollIdleTimer.current != null) {
        window.clearTimeout(scrollIdleTimer.current);
      }
    };
  }, [pagination.totalPages]);

  function setAll(next: OutreachCampaign[]) {
    setCampaigns(next);
    onCampaignsChange?.(next);
  }

  const jobOptions = useMemo(() => {
    const titles = new Map<string, string>();
    campaigns.forEach((campaign) => {
      if (campaign.relatedJobId && campaign.relatedJobTitle) {
        titles.set(campaign.relatedJobId, campaign.relatedJobTitle);
      }
    });
    return Array.from(titles, ([id, label]) => ({ id, label }));
  }, [campaigns]);

  const ownerOptions = useMemo(() => {
    const owners = new Set(campaigns.map((c) => c.owner));
    return Array.from(owners).map((owner) => ({ id: owner, label: owner }));
  }, [campaigns]);

  function toggle(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    return (id: string) =>
      setter((previous) =>
        previous.includes(id)
          ? previous.filter((value) => value !== id)
          : [...previous, id]
      );
  }

  const filtered = useMemo(() => {
    const maxDays = DATE_RANGE_DAYS[dateRange] ?? Infinity;
    return campaigns.filter((campaign) => {
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
  }, [
    campaigns,
    channelFilter,
    statusFilter,
    jobFilter,
    ownerFilter,
    dateRange,
  ]);

  const hasFilters =
    Boolean(search) ||
    channelFilter.length > 0 ||
    statusFilter.length > 0 ||
    jobFilter.length > 0 ||
    ownerFilter.length > 0 ||
    dateRange !== "any";

  const hasClientFilters =
    channelFilter.length > 0 ||
    statusFilter.length > 0 ||
    jobFilter.length > 0 ||
    ownerFilter.length > 0 ||
    dateRange !== "any";

  function resetFilters() {
    onSearchChange("");
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
    <div className="min-w-0 max-w-full space-y-4">
      {/* Toolbar */}
      <div className="flex min-w-0 flex-col gap-3 pb-1">
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
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
              options={ownerOptions.length > 0 ? ownerOptions : toOptions(CAMPAIGN_OWNERS)}
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
      </div>

      {message ? (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
        >
          {message}
        </p>
      ) : null}

      {/* Table */}
      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">
              {hasClientFilters ? filtered.length : pagination.total}
            </span>{" "}
            {hasClientFilters ? "matching on this page" : "campaigns"}
          </p>
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="min-w-0 overflow-x-auto">
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
                        <CampaignRowActions
                          campaign={campaign}
                          onAction={flash}
                          onUpdated={(next) => {
                            const exists = campaigns.some((c) => c.id === next.id);
                            setAll(
                              exists
                                ? campaigns.map((c) => (c.id === next.id ? next : c))
                                : [next, ...campaigns]
                            );
                          }}
                          onDeleted={(id) =>
                            setAll(campaigns.filter((c) => c.id !== id))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pagination.totalPages > 1 ? (
              <div
                className={cn(
                  "fixed bottom-5 right-5 z-40 transition-opacity duration-200 sm:bottom-6 sm:right-6",
                  isScrolling ? "opacity-40" : "opacity-100"
                )}
                role="navigation"
                aria-label="Campaign pages"
              >
                <div className="flex items-center gap-1 rounded-lg border border-border bg-card/95 p-1 shadow-md backdrop-blur-sm">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Previous page"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      onPageChange(Math.max(1, pagination.page - 1))
                    }
                  >
                    <ChevronLeft aria-hidden />
                  </Button>
                  {getPageItems(pagination.page, pagination.totalPages).map(
                    (item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-1.5 text-xs text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <Button
                          key={item}
                          type="button"
                          size="icon-sm"
                          variant={
                            item === pagination.page ? "secondary" : "ghost"
                          }
                          aria-label={`Page ${item}`}
                          aria-current={
                            item === pagination.page ? "page" : undefined
                          }
                          onClick={() => onPageChange(item)}
                        >
                          {item}
                        </Button>
                      )
                  )}
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Next page"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() =>
                      onPageChange(
                        Math.min(pagination.totalPages, pagination.page + 1)
                      )
                    }
                  >
                    <ChevronRight aria-hidden />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
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
