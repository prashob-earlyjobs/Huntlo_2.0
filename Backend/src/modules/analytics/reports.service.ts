import { Readable } from 'node:stream';

import { AppError } from '../../shared/errors/app-error.js';
import { analyticsService } from './analytics.service.js';
import { analyticsFiltersSchema } from './filters.js';
import {
  AnalyticsReportModel,
  REPORT_TYPES,
  type ReportType,
} from './report.model.js';
import { z } from 'zod';

export const generateReportSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  type: z.enum(REPORT_TYPES).default('overview'),
  filters: analyticsFiltersSchema.partial().optional(),
});

function toPublicReport(doc: {
  _id: { toHexString(): string };
  name: string;
  type: string;
  status: string;
  filters: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  rowCount: number;
  expiresAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  createdBy: { toHexString(): string };
}) {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    type: doc.type,
    status: doc.status,
    filters: doc.filters,
    result: doc.result,
    error: doc.error,
    rowCount: doc.rowCount,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    completedAt: doc.completedAt?.toISOString() ?? null,
    createdAt: doc.createdAt.toISOString(),
    createdBy: doc.createdBy.toHexString(),
  };
}

async function runReportAggregation(
  organizationId: string,
  type: ReportType,
  filters: Record<string, unknown>
) {
  switch (type) {
    case 'pipeline':
      return analyticsService.pipeline(organizationId, filters);
    case 'channels':
      return analyticsService.channels(organizationId, filters);
    case 'jobs':
      return analyticsService.jobs(organizationId, filters);
    case 'recruiters':
      return analyticsService.recruiters(organizationId, filters);
    case 'screening':
      return analyticsService.screening(organizationId, filters);
    case 'scheduling':
      return analyticsService.scheduling(organizationId, filters);
    case 'usage':
      return analyticsService.usage(organizationId, filters);
    case 'overview':
    default:
      return analyticsService.overview(organizationId, filters);
  }
}

function countRows(result: unknown): number {
  if (!result || typeof result !== 'object') return 0;
  const obj = result as Record<string, unknown>;
  if (Array.isArray(obj.items)) return obj.items.length;
  if (Array.isArray(obj.stages)) return obj.stages.length;
  if (Array.isArray(obj.comparison)) return obj.comparison.length;
  if (Array.isArray(obj.consumption)) return obj.consumption.length;
  return 1;
}

function flattenForCsv(result: unknown): { headers: string[]; rows: string[][] } {
  if (!result || typeof result !== 'object') {
    return { headers: ['value'], rows: [[JSON.stringify(result)]] };
  }
  const obj = result as Record<string, unknown>;
  const list =
    (Array.isArray(obj.items) && obj.items) ||
    (Array.isArray(obj.stages) && obj.stages) ||
    (Array.isArray(obj.comparison) && obj.comparison) ||
    (Array.isArray(obj.consumption) && obj.consumption) ||
    null;

  if (list && list.length > 0 && typeof list[0] === 'object') {
    const headers = Object.keys(list[0] as object);
    const rows = list.map((row) =>
      headers.map((h) => {
        const value = (row as Record<string, unknown>)[h];
        if (value == null) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );
    return { headers, rows };
  }

  return {
    headers: ['key', 'value'],
    rows: Object.entries(obj).map(([k, v]) => [
      k,
      typeof v === 'object' ? JSON.stringify(v) : String(v),
    ]),
  };
}

export class ReportsService {
  async list(organizationId: string) {
    const rows = await AnalyticsReportModel.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(50);
    return rows.map(toPublicReport);
  }

  async generate(
    organizationId: string,
    userId: string,
    input: z.infer<typeof generateReportSchema>
  ) {
    const type = input.type;
    const name =
      input.name ||
      `${type.charAt(0).toUpperCase()}${type.slice(1)} report · ${new Date().toLocaleDateString('en-IN')}`;
    const filters = input.filters || {};

    const doc = await AnalyticsReportModel.create({
      organizationId,
      createdBy: userId,
      name,
      type,
      status: 'running',
      filters,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    try {
      const result = await runReportAggregation(organizationId, type, filters);
      doc.status = 'ready';
      doc.result = result as Record<string, unknown>;
      doc.rowCount = countRows(result);
      doc.completedAt = new Date();
      await doc.save();
    } catch (error) {
      doc.status = 'failed';
      doc.error = error instanceof Error ? error.message : 'Report generation failed';
      await doc.save();
      throw error;
    }

    return toPublicReport(doc);
  }

  async get(organizationId: string, reportId: string) {
    const doc = await AnalyticsReportModel.findOne({
      _id: reportId,
      organizationId,
    });
    if (!doc) throw AppError.notFound('Report not found');
    return toPublicReport(doc);
  }

  async exportStream(organizationId: string, reportId: string) {
    const doc = await AnalyticsReportModel.findOne({
      _id: reportId,
      organizationId,
    });
    if (!doc) throw AppError.notFound('Report not found');
    if (doc.status !== 'ready' || !doc.result) {
      throw AppError.badRequest('Report is not ready for export');
    }

    const { headers, rows } = flattenForCsv(doc.result);
    const escape = (cell: string) => {
      if (/[",\n]/.test(cell)) return `"${cell.replace(/"/g, '""')}"`;
      return cell;
    };
    const lines = [
      headers.map(escape).join(','),
      ...rows.map((row) => row.map(escape).join(',')),
    ];
    const body = `${lines.join('\n')}\n`;
    const stream = Readable.from([body]);
    return {
      stream,
      filename: `${doc.name.replace(/[^\w.-]+/g, '_')}.csv`,
      contentType: 'text/csv; charset=utf-8',
    };
  }
}

export const reportsService = new ReportsService();
