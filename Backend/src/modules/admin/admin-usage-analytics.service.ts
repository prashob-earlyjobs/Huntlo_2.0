import mongoose from 'mongoose';

import {
  currentPeriodKey,
  METRIC_LABELS,
  UsageLedgerModel,
  type UsageMetric,
} from '../../shared/usage/index.js';
import { QuotaCounterModel } from '../../shared/usage/quota-counter.model.js';
import { CandidateActivityModel } from '../candidates/candidate-activity.model.js';
import { PeopleScoutLookupModel } from '../people-scout/lookup.model.js';
import { UserModel } from '../auth/user.model.js';
import { maskAdminEmail, maskAdminName } from './admin-mask.js';

export const ANALYTICS_SOURCES = [
  'user_cache',
  'shared_cache',
  'futurejobs',
  'not_found',
] as const;

export type AnalyticsSource = (typeof ANALYTICS_SOURCES)[number];

export type AnalyticsEventType =
  | 'people_scout_lookup'
  | 'email_unveil'
  | 'phone_unveil';

export type SourceCounts = Record<AnalyticsSource, { count: number; credits: number }>;

export type AnalyticsBreakdownRow = {
  eventType: AnalyticsEventType;
  sources: SourceCounts;
  total: { count: number; credits: number };
};

export type OutreachCreditsRow = {
  metric: UsageMetric;
  label: string;
  used: number;
  limit: number | null;
  remaining: number | null;
};

export type UsageHistoryEntry = {
  id: string;
  createdAt: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  metric: UsageMetric;
  activity: string;
  units: number;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
};

function emptySources(): SourceCounts {
  return {
    user_cache: { count: 0, credits: 0 },
    shared_cache: { count: 0, credits: 0 },
    futurejobs: { count: 0, credits: 0 },
    not_found: { count: 0, credits: 0 },
  };
}

function addSource(
  sources: SourceCounts,
  source: AnalyticsSource,
  count: number,
  credits: number
) {
  sources[source].count += count;
  sources[source].credits += credits;
}

function totalFromSources(sources: SourceCounts) {
  return Object.values(sources).reduce(
    (acc, row) => ({
      count: acc.count + row.count,
      credits: acc.credits + row.credits,
    }),
    { count: 0, credits: 0 }
  );
}

function buildDateFilter(from?: string, to?: string): Record<string, Date> | null {
  const range: Record<string, Date> = {};
  if (from) {
    const start = new Date(from);
    if (!Number.isNaN(start.getTime())) range.$gte = start;
  }
  if (to) {
    const end = new Date(to);
    if (!Number.isNaN(end.getTime())) range.$lte = end;
  }
  return Object.keys(range).length > 0 ? range : null;
}

function mapRevealSource(raw: unknown): AnalyticsSource {
  switch (raw) {
    case 'previous_reveal':
      return 'user_cache';
    case 'shared_cache':
      return 'shared_cache';
    case 'provider':
      return 'futurejobs';
    case 'missing':
    default:
      return 'not_found';
  }
}

function mapPeopleScoutSource(
  cacheSource: string | null | undefined,
  resultStatus: string
): AnalyticsSource {
  if (resultStatus === 'not_found') return 'not_found';
  switch (cacheSource) {
    case 'user_cache':
      return 'user_cache';
    case 'shared_cache':
      return 'shared_cache';
    case 'futurejobs':
      return 'futurejobs';
    default:
      return resultStatus === 'found' || resultStatus === 'multiple_matches'
        ? 'futurejobs'
        : 'not_found';
  }
}

function buildUserFilter(userId?: string) {
  if (!userId?.trim()) return {};
  if (!mongoose.isValidObjectId(userId)) return {};
  return { userId: new mongoose.Types.ObjectId(userId) };
}

export const adminUsageAnalyticsService = {
  async getSummary(query: {
    userId?: string;
    from?: string;
    to?: string;
    organizationId?: string;
  }) {
    const periodKey = currentPeriodKey();
    const userFilter = buildUserFilter(query.userId);
    const orgFilter =
      query.organizationId && mongoose.isValidObjectId(query.organizationId)
        ? { organizationId: new mongoose.Types.ObjectId(query.organizationId) }
        : {};
    const createdAt = buildDateFilter(query.from, query.to);
    const dateFilter = createdAt ? { createdAt } : {};

    const scoutFilter = { deletedAt: null, ...userFilter, ...orgFilter, ...dateFilter };
    const activityFilter = {
      action: { $in: ['email_revealed', 'mobile_revealed'] },
      ...userFilter,
      ...orgFilter,
      ...dateFilter,
    };

    const [scoutRows, activityRows, outreachUsed] = await Promise.all([
      PeopleScoutLookupModel.find(scoutFilter)
        .select('cacheSource resultStatus charged')
        .lean(),
      CandidateActivityModel.find(activityFilter)
        .select('action metadata')
        .lean(),
      UsageLedgerModel.aggregate([
        {
          $match: {
            status: 'committed',
            metric: { $in: ['email_outreach', 'whatsapp_outreach', 'ai_voice_minutes'] },
            periodKey,
            ...userFilter,
            ...orgFilter,
            ...(createdAt ? { createdAt } : {}),
          },
        },
        {
          $group: {
            _id: '$metric',
            used: { $sum: '$quantity' },
          },
        },
      ]),
    ]);

    const breakdown: AnalyticsBreakdownRow[] = [];

    const scoutSources = emptySources();
    for (const row of scoutRows) {
      const source = mapPeopleScoutSource(row.cacheSource, row.resultStatus);
      addSource(scoutSources, source, 1, row.charged ? 1 : 0);
    }
    breakdown.push({
      eventType: 'people_scout_lookup',
      sources: scoutSources,
      total: totalFromSources(scoutSources),
    });

    const emailSources = emptySources();
    const phoneSources = emptySources();
    for (const row of activityRows) {
      const target = row.action === 'email_revealed' ? emailSources : phoneSources;
      const metadata =
        row.metadata && typeof row.metadata === 'object'
          ? (row.metadata as Record<string, unknown>)
          : {};
      const source = mapRevealSource(metadata.source);
      const charged = metadata.charged === true ? 1 : 0;
      addSource(target, source, 1, charged);
    }

    breakdown.push({
      eventType: 'email_unveil',
      sources: emailSources,
      total: totalFromSources(emailSources),
    });
    breakdown.push({
      eventType: 'phone_unveil',
      sources: phoneSources,
      total: totalFromSources(phoneSources),
    });

    const outreachMetrics: UsageMetric[] = [
      'email_outreach',
      'whatsapp_outreach',
      'ai_voice_minutes',
    ];
    const usedByMetric = new Map<string, number>(
      outreachUsed.map((row) => [String(row._id), Number(row.used || 0)])
    );

    let quotaRows: Array<{ metric: UsageMetric; used: number; limit: number }> = [];
    if (query.organizationId && mongoose.isValidObjectId(query.organizationId)) {
      quotaRows = await QuotaCounterModel.find({
        organizationId: query.organizationId,
        periodKey,
        metric: { $in: outreachMetrics },
      })
        .select('metric used limit')
        .lean();
    } else if (query.userId && mongoose.isValidObjectId(query.userId)) {
      const user = await UserModel.findById(query.userId).select('organizationId').lean();
      if (user?.organizationId) {
        quotaRows = await QuotaCounterModel.find({
          organizationId: user.organizationId,
          periodKey,
          metric: { $in: outreachMetrics },
        })
          .select('metric used limit')
          .lean();
      }
    } else {
      const aggregated = await QuotaCounterModel.aggregate([
        {
          $match: {
            periodKey,
            metric: { $in: outreachMetrics },
          },
        },
        {
          $group: {
            _id: '$metric',
            used: { $sum: '$used' },
            limit: { $sum: '$limit' },
          },
        },
      ]);
      quotaRows = aggregated.map((row) => ({
        metric: row._id as UsageMetric,
        used: Number(row.used || 0),
        limit: Number(row.limit || 0),
      }));
    }

    const quotaMap = new Map(
      quotaRows.map((row) => [row.metric, { used: row.used, limit: row.limit }])
    );

    const outreachCredits: OutreachCreditsRow[] = outreachMetrics.map((metric) => {
      const ledgerUsed = usedByMetric.get(metric) ?? 0;
      const quota = quotaMap.get(metric);
      const used = Math.max(ledgerUsed, quota?.used ?? 0);
      const limit = quota?.limit ?? null;
      return {
        metric,
        label: METRIC_LABELS[metric],
        used,
        limit,
        remaining: limit != null ? Math.max(0, limit - used) : null,
      };
    });

    return {
      periodKey,
      breakdown,
      outreachCredits,
      filters: {
        userId: query.userId || null,
        organizationId: query.organizationId || null,
        from: query.from || null,
        to: query.to || null,
      },
    };
  },

  async listHistory(query: {
    userId?: string;
    from?: string;
    to?: string;
    organizationId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const userFilter = buildUserFilter(query.userId);
    const orgFilter =
      query.organizationId && mongoose.isValidObjectId(query.organizationId)
        ? { organizationId: new mongoose.Types.ObjectId(query.organizationId) }
        : {};
    const createdAt = buildDateFilter(query.from, query.to);

    const filter: Record<string, unknown> = {
      status: 'committed',
      action: 'commit',
      ...userFilter,
      ...orgFilter,
    };
    if (createdAt) filter.createdAt = createdAt;

    const [entries, total] = await Promise.all([
      UsageLedgerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UsageLedgerModel.countDocuments(filter),
    ]);

    const userIds = [
      ...new Set(
        entries
          .map((entry) => (entry.userId ? String(entry.userId) : null))
          .filter(Boolean) as string[]
      ),
    ];
    const users = userIds.length
      ? await UserModel.find({ _id: { $in: userIds } })
          .select('firstName lastName email')
          .lean()
      : [];
    const userMap = new Map(
      users.map((user) => [
        String(user._id),
        {
          name: maskAdminName(`${user.firstName || ''} ${user.lastName || ''}`.trim()),
          email: maskAdminEmail(user.email),
        },
      ])
    );

    const history: UsageHistoryEntry[] = entries.map((entry) => {
      const userKey = entry.userId ? String(entry.userId) : null;
      const user = userKey ? userMap.get(userKey) : null;
      const metric = entry.metric as UsageMetric;
      return {
        id: String(entry._id),
        createdAt: entry.createdAt.toISOString(),
        userId: userKey,
        userName: user?.name ?? null,
        userEmail: user?.email ?? null,
        metric,
        activity: METRIC_LABELS[metric] ?? metric,
        units: entry.quantity,
        relatedEntityType: entry.relatedEntityType ?? null,
        relatedEntityId: entry.relatedEntityId ?? null,
      };
    });

    return {
      history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  },
};
