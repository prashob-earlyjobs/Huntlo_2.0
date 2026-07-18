import { ConversationThreadModel } from '../conversations/conversation-thread.model.js';
import { InterviewModel } from '../scheduling/interview.model.js';
import { JobModel } from '../jobs/job.model.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { quotaService, type QuotaUsageView } from '../../shared/usage/index.js';
import { plansService } from '../plans/plans.service.js';
import {
  analyticsCacheKey,
  getCachedAnalytics,
  setCachedAnalytics,
} from './cache.js';
import {
  aggregateChannelPerformance,
  aggregateCoreMetrics,
  aggregateJobsTable,
  aggregatePipelineStages,
  aggregateRecentActivity,
  aggregateUsageConsumption,
  type CoreMetricCounts,
} from './aggregations.js';
import {
  analyticsFiltersSchema,
  resolveAnalyticsFilters,
  type AnalyticsFiltersInput,
} from './filters.js';
import {
  formatCount,
  formatPercent,
  formatSigned,
  rate,
  relativeTime,
  trendFromDelta,
} from './format.js';
import { zonedParts } from '../scheduling/timezone.js';

function parseFilters(organizationId: string, query: unknown) {
  const input = analyticsFiltersSchema.parse(query ?? {});
  return resolveAnalyticsFilters(organizationId, input as AnalyticsFiltersInput);
}

type DashboardSummaryResult = {
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'flat';
    comparison: string;
    tooltip: string;
    raw: number;
  }>;
  secondary: Array<{ id: string; label: string; value: string }>;
  totals: CoreMetricCounts;
  period: { from: string; to: string; timezone: string; preset: string };
};

export class DashboardService {
  async summary(organizationId: string, query: unknown): Promise<DashboardSummaryResult> {
    const filters = parseFilters(organizationId, query);
    const cacheKey = analyticsCacheKey(organizationId, 'dashboard.summary', filters);
    const cached = getCachedAnalytics<DashboardSummaryResult>(cacheKey);
    if (cached) return cached;

    const [current, previous] = await Promise.all([
      aggregateCoreMetrics(filters, false),
      aggregateCoreMetrics(filters, true),
    ]);

    const metric = (
      id: string,
      label: string,
      value: number,
      prev: number,
      tooltip: string,
      asPercentDelta = false
    ) => {
      const delta = value - prev;
      const pct =
        prev > 0 ? ((value - prev) / prev) * 100 : value > 0 ? 100 : 0;
      return {
        id,
        label,
        value: formatCount(value),
        change: asPercentDelta
          ? formatSigned(pct, true)
          : formatSigned(delta),
        trend: trendFromDelta(delta),
        comparison: 'vs prior period',
        tooltip,
        raw: value,
      };
    };

    const data = {
      metrics: [
        metric(
          'active-jobs',
          'Active Jobs',
          current.activeJobs,
          previous.activeJobs,
          'Jobs currently open and sourcing candidates in this workspace.'
        ),
        metric(
          'candidates-sourced',
          'Candidates Sourced',
          current.candidatesSourced,
          previous.candidatesSourced,
          'Candidates added to the pool in the selected date range.',
          true
        ),
        metric(
          'positive-replies',
          'Positive Replies',
          current.positiveReplies,
          previous.positiveReplies,
          'Candidates marked interested across outreach campaigns.'
        ),
        metric(
          'interviews',
          'Interviews Scheduled',
          current.interviewsScheduled,
          previous.interviewsScheduled,
          'Confirmed interviews starting in the selected range.'
        ),
      ],
      secondary: [
        {
          id: 'contacted',
          label: 'Contacted this period',
          value: formatCount(Math.max(current.delivered, current.sent)),
        },
        {
          id: 'screenings',
          label: 'Screenings completed',
          value: formatCount(current.screeningsCompleted),
        },
        {
          id: 'reveals',
          label: 'Contacts revealed',
          value: formatCount(current.contactsRevealed),
        },
      ],
      totals: current,
      period: {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        timezone: filters.timezone,
        preset: filters.preset,
      },
    };

    setCachedAnalytics(cacheKey, data);
    return data;
  }

  async priorities(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const items: Array<{
      id: string;
      title: string;
      context: string;
      priority: 'High' | 'Medium' | 'Low';
      href: string;
      actionLabel: string;
      time: string;
    }> = [];

    const [unreadThreads, pendingScreenings, recentInterested, interviewsToday] =
      await Promise.all([
        ConversationThreadModel.countDocuments({
          organizationId: filters.organizationId,
          status: { $in: ['open', 'awaiting_reply', 'handed_off'] },
        }).catch(() => 0),
        SavedCandidateModel.countDocuments({
          organizationId: filters.organizationId,
          status: 'screening',
          deletedAt: null,
        }),
        SavedCandidateModel.countDocuments({
          organizationId: filters.organizationId,
          status: 'interested',
          deletedAt: null,
          lastActivityAt: {
            $gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
        }),
        InterviewModel.countDocuments({
          organizationId: filters.organizationId,
          status: { $in: ['scheduled', 'rescheduled'] },
          startAt: { $gte: filters.from, $lt: filters.to },
        }),
      ]);

    if (unreadThreads > 0) {
      items.push({
        id: 'replies-review',
        title: `${unreadThreads} conversations need attention`,
        context: 'Conversations · Open threads awaiting recruiter action',
        priority: 'High',
        href: '/dashboard/conversations',
        actionLabel: 'Open inbox',
        time: 'Now',
      });
    }
    if (pendingScreenings > 0) {
      items.push({
        id: 'screenings-pending',
        title: `${pendingScreenings} candidates in screening`,
        context: 'AI Screening · Review scores and decisions',
        priority: 'Medium',
        href: '/dashboard/screening/results',
        actionLabel: 'View results',
        time: 'Today',
      });
    }
    if (recentInterested > 0) {
      items.push({
        id: 'high-intent',
        title: `${recentInterested} high-intent candidates`,
        context: 'Candidate pool · Interested in the last 48 hours',
        priority: 'High',
        href: '/dashboard/candidates',
        actionLabel: 'Review',
        time: '48h',
      });
    }
    if (interviewsToday > 0) {
      items.push({
        id: 'interviews-period',
        title: `${interviewsToday} interviews in range`,
        context: 'Schedule · Upcoming confirmed interviews',
        priority: 'Medium',
        href: '/dashboard/schedule',
        actionLabel: 'View schedule',
        time: 'Period',
      });
    }

    return { items };
  }

  async jobs(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const jobs = await aggregateJobsTable(filters);
    return {
      items: jobs.map((job) => ({
        ...job,
        lastActivity: relativeTime(new Date(job.lastActivity)),
      })),
    };
  }

  async pipeline(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const stages = await aggregatePipelineStages(filters);
    return { stages };
  }

  async campaignPerformance(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const [current, comparison] = await Promise.all([
      aggregateCoreMetrics(filters),
      aggregateChannelPerformance(filters),
    ]);
    const contacted = Math.max(current.delivered, current.sent, 0);
    const sendAttempts = current.sent + (current.failedSends || 0);
    return {
      summary: [
        {
          id: 'active',
          label: 'Active campaigns',
          value: formatCount(current.activeCampaigns),
        },
        {
          id: 'sent',
          label: 'Messages sent',
          value: formatCount(current.sent),
        },
        {
          id: 'delivery',
          label: 'Delivery rate',
          value: formatPercent(
            rate(current.sent, Math.max(sendAttempts, 1))
          ),
        },
        {
          id: 'reply',
          label: 'Reply rate',
          value: formatPercent(rate(current.replies, Math.max(contacted, 1))),
        },
        {
          id: 'positive',
          label: 'Positive reply rate',
          value: formatPercent(
            rate(current.positiveReplies, Math.max(current.replies, 1))
          ),
        },
        {
          id: 'qualified',
          label: 'Qualified candidates',
          value: formatCount(current.qualified),
        },
      ],
      comparison,
    };
  }

  async interviews(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const rows = await InterviewModel.find({
      organizationId: filters.organizationId,
      status: { $in: ['scheduled', 'rescheduled', 'awaiting_booking', 'link_sent'] },
      startAt: { $gte: new Date(), $lt: new Date(Date.now() + 14 * 86400_000) },
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
    })
      .sort({ startAt: 1 })
      .limit(20)
      .lean();

    const jobIds = [
      ...new Set(rows.map((r) => (r.jobId ? String(r.jobId) : null)).filter(Boolean)),
    ] as string[];
    const jobs = jobIds.length
      ? await JobModel.find({ _id: { $in: jobIds } }).select('title').lean()
      : [];
    const jobMap = new Map(jobs.map((j) => [String(j._id), j.title]));

    const items = rows.map((row) => {
      const start = row.startAt ? new Date(row.startAt) : null;
      const parts = start ? zonedParts(start, filters.timezone) : null;
      const dateTime = start
        ? start.toLocaleString('en-IN', {
            timeZone: filters.timezone,
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })
        : '—';
      return {
        id: String(row._id),
        candidate: row.inviteeName || 'Candidate',
        role: row.jobId ? jobMap.get(String(row.jobId)) || '—' : '—',
        type: row.interviewType || 'Interview',
        dateTime,
        interviewer: (row.interviewerIds || [])[0] || '—',
        platform: row.meetingUrl ? 'Video' : row.location || '—',
        status:
          row.status === 'scheduled' || row.status === 'rescheduled'
            ? 'Scheduled'
            : 'Awaiting Response',
        weekday: parts?.weekday || null,
      };
    });

    return { items };
  }

  async activity(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const items = await aggregateRecentActivity(filters, 25);
    return {
      items: items.map((item) => ({
        ...item,
        time: item.time ? relativeTime(new Date(item.time)) : '—',
      })),
    };
  }

  async usage(organizationId: string, query: unknown, userId: string) {
    const filters = parseFilters(organizationId, query);
    const [consumption, plan, usageRows] = await Promise.all([
      aggregateUsageConsumption(filters),
      plansService.getCurrentPlan(organizationId, userId),
      quotaService.getUsage(organizationId),
    ]);

    const rows = (Array.isArray(usageRows) ? usageRows : []) as QuotaUsageView[];

    const toCredit = (row: QuotaUsageView) => ({
      id: row.metric,
      label: row.label || row.metric,
      used: row.used,
      total: row.limit,
      unit: row.metric === 'ai_voice_minutes' ? 'min' : undefined,
    });

    const buildGroup = (
      id: string,
      label: string,
      metrics: QuotaUsageView['metric'][],
      unit?: string
    ) => {
      const items = rows.filter((r) => metrics.includes(r.metric)).map(toCredit);
      return {
        id,
        label,
        used: items.reduce((sum, item) => sum + item.used, 0),
        total: items.reduce((sum, item) => sum + item.total, 0),
        unit: items.length === 1 ? items[0]?.unit ?? unit : unit,
        items,
      };
    };

    const groups = [
      buildGroup('sourcing', 'Sourcing', ['candidate_search', 'people_scout']),
      buildGroup('reveals', 'Contact reveals', ['email_reveal', 'mobile_reveal']),
      buildGroup('outreach', 'Outreach', [
        'email_outreach',
        'whatsapp_outreach',
      ]),
      buildGroup('voice', 'AI voice', ['ai_voice_minutes'], 'min'),
    ].filter((group) => group.items.length > 0);

    return {
      planName: plan.name,
      groups,
      consumption,
    };
  }
}

export const dashboardService = new DashboardService();
