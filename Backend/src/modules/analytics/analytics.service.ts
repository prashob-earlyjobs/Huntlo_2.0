import {
  aggregateChannelPerformance,
  aggregateCoreMetrics,
  aggregateJobsTable,
  aggregateMedianStageDurations,
  aggregatePipelineStages,
  aggregateRecruiterWorkload,
  aggregateUsageConsumption,
  ensureAnalyticsIndexes,
} from './aggregations.js';
import {
  analyticsCacheKey,
  getCachedAnalytics,
  setCachedAnalytics,
} from './cache.js';
import {
  analyticsFiltersSchema,
  resolveAnalyticsFilters,
  type AnalyticsFiltersInput,
} from './filters.js';
import { formatPercent, rate } from './format.js';
import { ScreeningCandidateModel } from '../screening/screening-candidate.model.js';
import { InterviewModel } from '../scheduling/interview.model.js';

function parseFilters(organizationId: string, query: unknown) {
  const input = analyticsFiltersSchema.parse(query ?? {});
  return resolveAnalyticsFilters(organizationId, input as AnalyticsFiltersInput);
}

export class AnalyticsService {
  async overview(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const key = analyticsCacheKey(organizationId, 'analytics.overview', filters);
    const cached = getCachedAnalytics<unknown>(key);
    if (cached) return cached;

    await ensureAnalyticsIndexes();
    const [current, previous, stages, durations] = await Promise.all([
      aggregateCoreMetrics(filters),
      aggregateCoreMetrics(filters, true),
      aggregatePipelineStages(filters),
      aggregateMedianStageDurations(filters),
    ]);

    const conversion = (from: number, to: number) =>
      formatPercent(rate(to, Math.max(from, 1)));

    const data = {
      metrics: {
        candidatesSourced: current.candidatesSourced,
        contactsRevealed: current.contactsRevealed,
        delivered: current.delivered,
        replies: current.replies,
        positiveReplies: current.positiveReplies,
        qualified: current.qualified,
        screeningsCompleted: current.screeningsCompleted,
        shortlisted: current.shortlisted,
        interviewsScheduled: current.interviewsScheduled,
        hired: current.hired,
      },
      previous,
      conversions: [
        {
          id: 'sourced_to_replied',
          label: 'Sourced → replied',
          value: conversion(current.candidatesSourced, current.replies),
        },
        {
          id: 'replied_to_qualified',
          label: 'Replied → qualified',
          value: conversion(current.replies, current.qualified),
        },
        {
          id: 'qualified_to_hired',
          label: 'Qualified → hired',
          value: conversion(current.qualified, current.hired),
        },
      ],
      pipeline: stages,
      medianStageDuration: durations,
      period: {
        from: filters.from.toISOString(),
        to: filters.to.toISOString(),
        timezone: filters.timezone,
      },
    };
    setCachedAnalytics(key, data);
    return data;
  }

  async pipeline(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const stages = await aggregatePipelineStages(filters);
    const withConversion = stages.map((stage, index) => {
      const prev = index === 0 ? stage.count : stages[index - 1]!.count;
      return {
        ...stage,
        conversionFromPrevious: index === 0 ? 100 : rate(stage.count, Math.max(prev, 1)),
      };
    });
    return { stages: withConversion };
  }

  async channels(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const comparison = await aggregateChannelPerformance(filters);
    return { comparison };
  }

  async jobs(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const items = await aggregateJobsTable(filters);
    return {
      items: items.map((job) => ({
        ...job,
        conversionRate: rate(job.interviews, Math.max(job.sourced, 1)),
      })),
    };
  }

  async recruiters(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const items = await aggregateRecruiterWorkload(filters);
    return { items };
  }

  async screening(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const rows = await ScreeningCandidateModel.aggregate<{
      _id: string;
      count: number;
      avgScore: number | null;
    }>([
      {
        $match: {
          organizationId: filters.organizationId,
          completedAt: { $gte: filters.from, $lt: filters.to },
        },
      },
      {
        $group: {
          _id: '$callStatus',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
        },
      },
    ]);

    const shortlisted = await ScreeningCandidateModel.countDocuments({
      organizationId: filters.organizationId,
      recruiterDecision: 'shortlisted',
      completedAt: { $gte: filters.from, $lt: filters.to },
    });

    return {
      byStatus: rows,
      shortlisted,
      completed: rows.find((r) => r._id === 'completed')?.count || 0,
    };
  }

  async scheduling(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const rows = await InterviewModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          organizationId: filters.organizationId,
          createdAt: { $gte: filters.from, $lt: filters.to },
          ...(filters.jobId ? { jobId: filters.jobId } : {}),
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus: Record<string, number> = {};
    for (const row of rows) byStatus[row._id] = row.count;
    return {
      byStatus,
      scheduled: (byStatus.scheduled || 0) + (byStatus.rescheduled || 0),
      completed: byStatus.completed || 0,
      noShow: byStatus.no_show || 0,
      cancelled: byStatus.cancelled || 0,
    };
  }

  async usage(organizationId: string, query: unknown) {
    const filters = parseFilters(organizationId, query);
    const consumption = await aggregateUsageConsumption(filters);
    return { consumption, period: { from: filters.from, to: filters.to } };
  }
}

export const analyticsService = new AnalyticsService();
