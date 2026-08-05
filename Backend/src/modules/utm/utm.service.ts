import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import {
  UtmCampaignModel,
  type UtmCampaignDocument,
  type UtmCampaignStatus,
} from './utm-campaign.model.js';
import { UtmEventModel, type UtmEventType } from './utm-event.model.js';
import { UtmVisitModel } from './utm-visit.model.js';
import type {
  CreateUtmCampaignInput,
  UpdateUtmCampaignInput,
  UtmDateRangeQuery,
} from './utm.validation.js';

function clean(value: unknown, max = 160): string | null {
  const text = String(value ?? '')
    .trim()
    .slice(0, max);
  return text || null;
}

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function hasAttribution(input: {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
}): boolean {
  return Boolean(
    input.utmSource ||
      input.utmMedium ||
      input.utmCampaign ||
      input.utmContent ||
      input.utmTerm
  );
}

function percentChange(current: number, previous: number): {
  change: string;
  trend: 'up' | 'down' | 'flat';
} {
  if (previous <= 0 && current <= 0) {
    return { change: '0%', trend: 'flat' };
  }
  if (previous <= 0) {
    return { change: '+100%', trend: 'up' };
  }
  const raw = ((current - previous) / previous) * 100;
  const rounded = Math.round(raw * 10) / 10;
  if (rounded === 0) return { change: '0%', trend: 'flat' };
  return {
    change: `${rounded > 0 ? '+' : ''}${rounded}%`,
    trend: rounded > 0 ? 'up' : 'down',
  };
}

function windowRange(input: {
  from?: string;
  to?: string;
  days?: number;
} | number) {
  const params = typeof input === 'number' ? { days: input } : input;

  let from = params.from;
  let to = params.to;

  if (!from || !to) {
    const windowDays = Math.min(365, Math.max(1, Math.floor(params.days ?? 30)));
    const end = new Date();
    to = utcDayKey(end);
    const start = new Date(`${to}T00:00:00.000Z`);
    start.setUTCDate(start.getUTCDate() - (windowDays - 1));
    from = utcDayKey(start);
  }

  const currentStart = new Date(`${from}T00:00:00.000Z`);
  const rangeEnd = new Date(`${to}T23:59:59.999Z`);
  const windowDays =
    Math.round(
      (new Date(`${to}T00:00:00.000Z`).getTime() - currentStart.getTime()) /
        86_400_000
    ) + 1;
  const previousStart = new Date(
    currentStart.getTime() - windowDays * 86_400_000
  );
  return {
    windowDays,
    now: rangeEnd,
    currentStart,
    previousStart,
  };
}

function normalizeAttribution(input: {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
}) {
  return {
    utmSource: clean(input.utmSource, 120),
    utmMedium: clean(input.utmMedium, 120),
    utmCampaign: clean(input.utmCampaign, 160),
    utmContent: clean(input.utmContent, 160),
    utmTerm: clean(input.utmTerm, 160),
  };
}

function campaignKey(source: string, medium: string, campaign: string) {
  return `${source}\0${medium}\0${campaign}`;
}

function normalizeLandingPath(path: string | null | undefined): string {
  const cleaned = clean(path, 300) || '/';
  const withSlash = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  if (withSlash.includes('://') || withSlash.includes('?')) {
    throw new AppError(400, 'VALIDATION_ERROR', 'landingPath must be a path only');
  }
  return withSlash;
}

function serializeCampaign(doc: UtmCampaignDocument) {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    utmSource: doc.utmSource,
    utmMedium: doc.utmMedium,
    utmCampaign: doc.utmCampaign,
    utmContent: doc.utmContent,
    utmTerm: doc.utmTerm,
    landingPath: doc.landingPath,
    notes: doc.notes,
    status: doc.status,
    createdBy: doc.createdBy ? doc.createdBy.toHexString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
  );
}

const EVENT_OUTCOME_LABEL: Record<UtmEventType, string> = {
  signup: 'Signup',
  demo_clicked: 'Demo click',
  conversion: 'Conversion',
};

export const utmService = {
  async recordVisit(input: {
    sessionId: string;
    visitorId?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    landingPage?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
  }) {
    const sessionId = clean(input.sessionId, 120);
    if (!sessionId) {
      throw AppError.badRequest('sessionId is required.');
    }

    const attribution = normalizeAttribution(input);
    if (!hasAttribution(attribution)) {
      return { recorded: false, reason: 'missing_utm' as const };
    }

    const dayKey = utcDayKey();
    const payload = {
      sessionId,
      visitorId: clean(input.visitorId, 120),
      ...attribution,
      landingPage: clean(input.landingPage, 500),
      referrer: clean(input.referrer, 1000),
      userAgent: clean(input.userAgent, 500),
      dayKey,
    };

    try {
      await UtmVisitModel.updateOne(
        { sessionId, dayKey },
        { $setOnInsert: payload },
        { upsert: true }
      );
      return { recorded: true as const, dayKey };
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        Number((error as { code?: number }).code) === 11000
      ) {
        return { recorded: true as const, dayKey };
      }
      throw error;
    }
  },

  async recordEvent(input: {
    eventType: UtmEventType;
    sessionId?: string | null;
    visitorId?: string | null;
    userId?: string | null;
    organizationId?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    utmContent?: string | null;
    utmTerm?: string | null;
    landingPage?: string | null;
    referrer?: string | null;
    userAgent?: string | null;
    meta?: Record<string, unknown> | null;
  }) {
    const attribution = normalizeAttribution(input);
    if (!hasAttribution(attribution)) {
      return { recorded: false, reason: 'missing_utm' as const };
    }

    const userId =
      input.userId && mongoose.Types.ObjectId.isValid(input.userId)
        ? new mongoose.Types.ObjectId(input.userId)
        : null;
    const organizationId =
      input.organizationId && mongoose.Types.ObjectId.isValid(input.organizationId)
        ? new mongoose.Types.ObjectId(input.organizationId)
        : null;

    const doc = await UtmEventModel.create({
      eventType: input.eventType,
      sessionId: clean(input.sessionId, 120),
      visitorId: clean(input.visitorId, 120),
      userId,
      organizationId,
      ...attribution,
      landingPage: clean(input.landingPage, 500),
      referrer: clean(input.referrer, 1000),
      userAgent: clean(input.userAgent, 500),
      meta: input.meta || null,
    });

    return {
      recorded: true as const,
      id: String(doc._id),
      eventType: doc.eventType,
    };
  },

  async getAttributedVisitsSummary(range: UtmDateRangeQuery | number = 30) {
    const { windowDays, now, currentStart, previousStart } = windowRange(range);

    const [current, previous] = await Promise.all([
      UtmVisitModel.countDocuments({ createdAt: { $gte: currentStart, $lte: now } }),
      UtmVisitModel.countDocuments({
        createdAt: { $gte: previousStart, $lt: currentStart },
      }),
    ]);

    const delta = percentChange(current, previous);
    return {
      attributedVisits: current,
      previousAttributedVisits: previous,
      windowDays,
      change: delta.change,
      trend: delta.trend,
      comparison: `vs prior ${windowDays} days`,
      updatedAt: now.toISOString(),
    };
  },

  async getOverview(range: UtmDateRangeQuery | number = 30) {
    const { windowDays, now, currentStart, previousStart } = windowRange(range);
    const currentMatch = { createdAt: { $gte: currentStart, $lte: now } };
    const previousMatch = { createdAt: { $gte: previousStart, $lt: currentStart } };

    const [
      visitsCurrent,
      visitsPrevious,
      signupsCurrent,
      signupsPrevious,
      demosCurrent,
      demosPrevious,
      conversionsCurrent,
      conversionsPrevious,
      visitCampaigns,
      eventCampaigns,
      recentEvents,
      visitsByDay,
      eventsByDay,
    ] = await Promise.all([
      UtmVisitModel.countDocuments(currentMatch),
      UtmVisitModel.countDocuments(previousMatch),
      UtmEventModel.countDocuments({ ...currentMatch, eventType: 'signup' }),
      UtmEventModel.countDocuments({ ...previousMatch, eventType: 'signup' }),
      UtmEventModel.countDocuments({ ...currentMatch, eventType: 'demo_clicked' }),
      UtmEventModel.countDocuments({ ...previousMatch, eventType: 'demo_clicked' }),
      UtmEventModel.countDocuments({ ...currentMatch, eventType: 'conversion' }),
      UtmEventModel.countDocuments({ ...previousMatch, eventType: 'conversion' }),
      UtmVisitModel.aggregate<{
        _id: { source: string; medium: string; campaign: string };
        visits: number;
      }>([
        { $match: currentMatch },
        {
          $group: {
            _id: {
              source: { $ifNull: ['$utmSource', '(not set)'] },
              medium: { $ifNull: ['$utmMedium', '(not set)'] },
              campaign: { $ifNull: ['$utmCampaign', '(not set)'] },
            },
            visits: { $sum: 1 },
          },
        },
      ]),
      UtmEventModel.aggregate<{
        _id: {
          source: string;
          medium: string;
          campaign: string;
          eventType: UtmEventType;
        };
        count: number;
      }>([
        { $match: currentMatch },
        {
          $group: {
            _id: {
              source: { $ifNull: ['$utmSource', '(not set)'] },
              medium: { $ifNull: ['$utmMedium', '(not set)'] },
              campaign: { $ifNull: ['$utmCampaign', '(not set)'] },
              eventType: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
      ]),
      UtmEventModel.find(currentMatch)
        .sort({ createdAt: -1 })
        .limit(25)
        .select(
          'eventType utmSource utmMedium utmCampaign landingPage createdAt'
        )
        .lean(),
      UtmVisitModel.aggregate<{ _id: string; visits: number }>([
        { $match: currentMatch },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            visits: { $sum: 1 },
          },
        },
      ]),
      UtmEventModel.aggregate<{
        _id: { day: string; eventType: UtmEventType };
        count: number;
      }>([
        { $match: currentMatch },
        {
          $group: {
            _id: {
              day: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              eventType: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const campaignMap = new Map<
      string,
      {
        source: string;
        medium: string;
        campaign: string;
        content: string;
        term: string;
        visits: number;
        signups: number;
        demos: number;
        conversions: number;
      }
    >();

    for (const row of visitCampaigns) {
      const source = String(row._id.source || '(not set)');
      const medium = String(row._id.medium || '(not set)');
      const campaign = String(row._id.campaign || '(not set)');
      const key = campaignKey(source, medium, campaign);
      campaignMap.set(key, {
        source,
        medium,
        campaign,
        content: '—',
        term: '—',
        visits: row.visits,
        signups: 0,
        demos: 0,
        conversions: 0,
      });
    }

    for (const row of eventCampaigns) {
      const source = String(row._id.source || '(not set)');
      const medium = String(row._id.medium || '(not set)');
      const campaign = String(row._id.campaign || '(not set)');
      const key = campaignKey(source, medium, campaign);
      const existing = campaignMap.get(key) ?? {
        source,
        medium,
        campaign,
        content: '—',
        term: '—',
        visits: 0,
        signups: 0,
        demos: 0,
        conversions: 0,
      };
      if (row._id.eventType === 'signup') existing.signups += row.count;
      if (row._id.eventType === 'demo_clicked') existing.demos += row.count;
      if (row._id.eventType === 'conversion') existing.conversions += row.count;
      campaignMap.set(key, existing);
    }

    const campaigns = [...campaignMap.values()].sort(
      (a, b) =>
        b.visits + b.signups + b.demos + b.conversions -
        (a.visits + a.signups + a.demos + a.conversions)
    );

    const metric = (current: number, previous: number, comparison: string) => {
      const delta = percentChange(current, previous);
      return {
        value: current,
        previous,
        change: delta.change,
        trend: delta.trend,
        comparison,
      };
    };

    const visitsDayMap = new Map(
      visitsByDay.map((row) => [row._id, row.visits] as const)
    );
    const eventsDayMap = new Map<string, { signups: number; demos: number; conversions: number }>();
    for (const row of eventsByDay) {
      const day = row._id.day;
      const existing = eventsDayMap.get(day) ?? {
        signups: 0,
        demos: 0,
        conversions: 0,
      };
      if (row._id.eventType === 'signup') existing.signups += row.count;
      if (row._id.eventType === 'demo_clicked') existing.demos += row.count;
      if (row._id.eventType === 'conversion') existing.conversions += row.count;
      eventsDayMap.set(day, existing);
    }

    const daily: Array<{
      date: string;
      label: string;
      visits: number;
      signups: number;
      demos: number;
      conversions: number;
    }> = [];
    for (let i = 0; i < windowDays; i += 1) {
      const day = new Date(currentStart.getTime() + i * 86_400_000);
      const date = utcDayKey(day);
      const events = eventsDayMap.get(date) ?? {
        signups: 0,
        demos: 0,
        conversions: 0,
      };
      daily.push({
        date,
        label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        visits: visitsDayMap.get(date) ?? 0,
        signups: events.signups,
        demos: events.demos,
        conversions: events.conversions,
      });
    }

    return {
      windowDays,
      visits: metric(visitsCurrent, visitsPrevious, `vs prior ${windowDays} days`),
      signups: metric(signupsCurrent, signupsPrevious, 'attributed signups'),
      demos: metric(demosCurrent, demosPrevious, 'Book Demo clicks'),
      conversions: metric(
        conversionsCurrent,
        conversionsPrevious,
        'signup conversions'
      ),
      daily,
      campaigns: campaigns.map((row, index) => ({
        id: `camp_${index}`,
        ...row,
      })),
      recentEvents: recentEvents.map((row) => ({
        id: String(row._id),
        when: row.createdAt.toISOString(),
        touch: 'Last' as const,
        source: row.utmSource || '(not set)',
        medium: row.utmMedium || '(not set)',
        campaign: row.utmCampaign || '(not set)',
        landingPage: row.landingPage || '—',
        outcome: EVENT_OUTCOME_LABEL[row.eventType] || row.eventType,
        eventType: row.eventType,
      })),
      updatedAt: now.toISOString(),
    };
  },

  async getAttributedVisitsBreakdown(
    range: UtmDateRangeQuery | number = 30,
    recentLimit = 25
  ) {
    const { windowDays, now, currentStart } = windowRange(range);
    const limit = Math.min(100, Math.max(1, Math.floor(recentLimit)));
    const match = { createdAt: { $gte: currentStart, $lte: now } };

    const [total, bySource, byMedium, byCampaign, recent] = await Promise.all([
      UtmVisitModel.countDocuments(match),
      UtmVisitModel.aggregate<{ _id: string | null; visits: number }>([
        { $match: match },
        {
          $group: {
            _id: { $ifNull: ['$utmSource', '(not set)'] },
            visits: { $sum: 1 },
          },
        },
        { $sort: { visits: -1, _id: 1 } },
        { $limit: 50 },
      ]),
      UtmVisitModel.aggregate<{ _id: string | null; visits: number }>([
        { $match: match },
        {
          $group: {
            _id: { $ifNull: ['$utmMedium', '(not set)'] },
            visits: { $sum: 1 },
          },
        },
        { $sort: { visits: -1, _id: 1 } },
        { $limit: 50 },
      ]),
      UtmVisitModel.aggregate<{
        _id: {
          source: string | null;
          medium: string | null;
          campaign: string | null;
        };
        visits: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              source: { $ifNull: ['$utmSource', '(not set)'] },
              medium: { $ifNull: ['$utmMedium', '(not set)'] },
              campaign: { $ifNull: ['$utmCampaign', '(not set)'] },
            },
            visits: { $sum: 1 },
          },
        },
        { $sort: { visits: -1 } },
        { $limit: 50 },
      ]),
      UtmVisitModel.find(match)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(
          'utmSource utmMedium utmCampaign utmContent utmTerm landingPage referrer createdAt'
        )
        .lean(),
    ]);

    return {
      windowDays,
      total,
      bySource: bySource.map((row) => ({
        source: String(row._id || '(not set)'),
        visits: row.visits,
      })),
      byMedium: byMedium.map((row) => ({
        medium: String(row._id || '(not set)'),
        visits: row.visits,
      })),
      byCampaign: byCampaign.map((row) => ({
        source: String(row._id.source || '(not set)'),
        medium: String(row._id.medium || '(not set)'),
        campaign: String(row._id.campaign || '(not set)'),
        visits: row.visits,
      })),
      recent: recent.map((row) => ({
        id: String(row._id),
        source: row.utmSource || '(not set)',
        medium: row.utmMedium || '(not set)',
        campaign: row.utmCampaign || '(not set)',
        content: row.utmContent || null,
        term: row.utmTerm || null,
        landingPage: row.landingPage || null,
        referrer: row.referrer || null,
        createdAt: row.createdAt.toISOString(),
      })),
      updatedAt: now.toISOString(),
    };
  },

  async createCampaign(input: CreateUtmCampaignInput, createdBy?: string | null) {
    const utmSource = clean(input.utmSource, 120);
    const utmMedium = clean(input.utmMedium, 120);
    const utmCampaign = clean(input.utmCampaign, 160);
    if (!utmSource || !utmMedium || !utmCampaign) {
      throw new AppError(400, 'VALIDATION_ERROR', 'utmSource, utmMedium, and utmCampaign are required');
    }

    try {
      const doc = await UtmCampaignModel.create({
        name: String(input.name).trim().slice(0, 160),
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent: clean(input.utmContent, 160),
        utmTerm: clean(input.utmTerm, 160),
        landingPath: normalizeLandingPath(input.landingPath),
        notes: clean(input.notes, 2000),
        status: 'active' as UtmCampaignStatus,
        createdBy:
          createdBy && mongoose.isValidObjectId(createdBy)
            ? new mongoose.Types.ObjectId(createdBy)
            : null,
      });
      return serializeCampaign(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw AppError.conflict(
          'A campaign with this source / medium / campaign already exists'
        );
      }
      throw error;
    }
  },

  async listCampaigns(
    input: UtmDateRangeQuery & {
      status?: 'active' | 'archived' | 'all';
    } = { days: 30 }
  ) {
    const { windowDays, now, currentStart } = windowRange(input);
    const statusFilter =
      input.status === 'all'
        ? {}
        : { status: (input.status ?? 'active') as UtmCampaignStatus };

    const campaigns = await UtmCampaignModel.find(statusFilter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    if (campaigns.length === 0) {
      return {
        windowDays,
        items: [],
        updatedAt: now.toISOString(),
      };
    }

    const orFilters = campaigns.map((row) => ({
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
    }));
    const match = {
      createdAt: { $gte: currentStart, $lte: now },
      $or: orFilters,
    };

    const [visitStats, eventStats] = await Promise.all([
      UtmVisitModel.aggregate<{
        _id: { source: string | null; medium: string | null; campaign: string | null };
        visits: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              source: '$utmSource',
              medium: '$utmMedium',
              campaign: '$utmCampaign',
            },
            visits: { $sum: 1 },
          },
        },
      ]),
      UtmEventModel.aggregate<{
        _id: {
          source: string | null;
          medium: string | null;
          campaign: string | null;
          eventType: UtmEventType;
        };
        count: number;
      }>([
        { $match: match },
        {
          $group: {
            _id: {
              source: '$utmSource',
              medium: '$utmMedium',
              campaign: '$utmCampaign',
              eventType: '$eventType',
            },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statsMap = new Map<
      string,
      { visits: number; signups: number; demos: number; conversions: number }
    >();

    for (const row of visitStats) {
      const key = campaignKey(
        String(row._id.source || ''),
        String(row._id.medium || ''),
        String(row._id.campaign || '')
      );
      const existing = statsMap.get(key) ?? {
        visits: 0,
        signups: 0,
        demos: 0,
        conversions: 0,
      };
      existing.visits += row.visits;
      statsMap.set(key, existing);
    }

    for (const row of eventStats) {
      const key = campaignKey(
        String(row._id.source || ''),
        String(row._id.medium || ''),
        String(row._id.campaign || '')
      );
      const existing = statsMap.get(key) ?? {
        visits: 0,
        signups: 0,
        demos: 0,
        conversions: 0,
      };
      if (row._id.eventType === 'signup') existing.signups += row.count;
      if (row._id.eventType === 'demo_clicked') existing.demos += row.count;
      if (row._id.eventType === 'conversion') existing.conversions += row.count;
      statsMap.set(key, existing);
    }

    return {
      windowDays,
      items: campaigns.map((row) => {
        const key = campaignKey(row.utmSource, row.utmMedium, row.utmCampaign);
        const stats = statsMap.get(key) ?? {
          visits: 0,
          signups: 0,
          demos: 0,
          conversions: 0,
        };
        return {
          id: String(row._id),
          name: row.name,
          utmSource: row.utmSource,
          utmMedium: row.utmMedium,
          utmCampaign: row.utmCampaign,
          utmContent: row.utmContent,
          utmTerm: row.utmTerm,
          landingPath: row.landingPath,
          notes: row.notes,
          status: row.status,
          createdBy: row.createdBy ? String(row.createdBy) : null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
          stats,
        };
      }),
      updatedAt: now.toISOString(),
    };
  },

  async updateCampaign(id: string, input: UpdateUtmCampaignInput) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Campaign not found');
    }
    const doc = await UtmCampaignModel.findById(id);
    if (!doc) throw AppError.notFound('Campaign not found');

    if (input.name !== undefined) doc.name = String(input.name).trim().slice(0, 160);
    if (input.utmSource !== undefined) {
      const value = clean(input.utmSource, 120);
      if (!value) throw new AppError(400, 'VALIDATION_ERROR', 'utmSource is required');
      doc.utmSource = value;
    }
    if (input.utmMedium !== undefined) {
      const value = clean(input.utmMedium, 120);
      if (!value) throw new AppError(400, 'VALIDATION_ERROR', 'utmMedium is required');
      doc.utmMedium = value;
    }
    if (input.utmCampaign !== undefined) {
      const value = clean(input.utmCampaign, 160);
      if (!value) throw new AppError(400, 'VALIDATION_ERROR', 'utmCampaign is required');
      doc.utmCampaign = value;
    }
    if (input.utmContent !== undefined) doc.utmContent = clean(input.utmContent, 160);
    if (input.utmTerm !== undefined) doc.utmTerm = clean(input.utmTerm, 160);
    if (input.landingPath !== undefined) {
      doc.landingPath = normalizeLandingPath(input.landingPath);
    }
    if (input.notes !== undefined) doc.notes = clean(input.notes, 2000);
    if (input.status !== undefined) doc.status = input.status;

    try {
      await doc.save();
      return serializeCampaign(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw AppError.conflict(
          'A campaign with this source / medium / campaign already exists'
        );
      }
      throw error;
    }
  },

  async archiveCampaign(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Campaign not found');
    }
    const doc = await UtmCampaignModel.findById(id);
    if (!doc) throw AppError.notFound('Campaign not found');
    doc.status = 'archived';
    await doc.save();
    return serializeCampaign(doc);
  },
};
