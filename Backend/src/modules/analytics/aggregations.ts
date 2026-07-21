import mongoose from 'mongoose';

import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import { RevealedContactModel } from '../candidates/revealed-contact.model.js';
import { JobModel } from '../jobs/job.model.js';
import { CampaignJobModel } from '../outreach/campaign-job.model.js';
import { OutreachCampaignModel } from '../outreach/campaign.model.js';
import { OutreachEnrollmentModel } from '../outreach/enrollment.model.js';
import { ScreeningCandidateModel } from '../screening/screening-candidate.model.js';
import { InterviewModel } from '../scheduling/interview.model.js';
import { UsageLedgerModel } from '../../shared/usage/usage-ledger.model.js';
import { AuditLogModel } from '../../shared/audit/audit.service.js';
import { UserModel } from '../auth/user.model.js';
import {
  createdAtRange,
  orgMatch,
  previousCreatedAtRange,
  type ResolvedAnalyticsFilters,
} from './filters.js';
import { median, rate } from './format.js';

const MESSAGE_JOB_TYPES = [
  'send_email',
  'send_whatsapp',
  'launch_voice',
  'send_scheduling_link',
] as const;

/** Map campaign job type → dashboard channel bucket. */
function channelFromJobTypeExpr() {
  return {
    $switch: {
      branches: [
        {
          case: { $in: ['$jobType', ['send_email', 'send_scheduling_link']] },
          then: 'email',
        },
        { case: { $eq: ['$jobType', 'send_whatsapp'] }, then: 'whatsapp' },
        { case: { $eq: ['$jobType', 'launch_voice'] }, then: 'voice' },
      ],
      default: 'other',
    },
  };
}

function candidateMatch(filters: ResolvedAnalyticsFilters, previous = false) {
  const match: Record<string, unknown> = {
    ...orgMatch(filters),
    ...(previous ? previousCreatedAtRange(filters) : createdAtRange(filters)),
  };
  if (filters.jobId) match.jobIds = filters.jobId;
  if (filters.candidateStatus) match.status = filters.candidateStatus;
  if (filters.location) {
    match.location = { $regex: filters.location, $options: 'i' };
  }
  return match;
}

function campaignMatch(filters: ResolvedAnalyticsFilters) {
  const match: Record<string, unknown> = {
    organizationId: filters.organizationId,
    deletedAt: null,
    sourceModule: 'outreach',
  };
  if (filters.jobId) match.jobId = filters.jobId;
  if (filters.campaignId) match._id = filters.campaignId;
  if (filters.recruiterId) match.ownerUserId = filters.recruiterId;
  if (filters.channel === 'email') match['channelConfig.email.enabled'] = true;
  if (filters.channel === 'whatsapp') match['channelConfig.whatsapp.enabled'] = true;
  if (filters.channel === 'ai_voice') match['channelConfig.ai_voice.enabled'] = true;
  return match;
}

function periodRange(
  filters: ResolvedAnalyticsFilters,
  previous: boolean,
  field = 'updatedAt'
): Record<string, unknown> {
  return previous
    ? previousCreatedAtRange(filters, field)
    : createdAtRange(filters, field);
}

async function resolveCampaignIds(
  filters: ResolvedAnalyticsFilters
): Promise<mongoose.Types.ObjectId[]> {
  return OutreachCampaignModel.find(campaignMatch(filters)).distinct('_id');
}

export type CoreMetricCounts = {
  candidatesSourced: number;
  contactsRevealed: number;
  delivered: number;
  replies: number;
  positiveReplies: number;
  qualified: number;
  screeningsCompleted: number;
  shortlisted: number;
  interviewsScheduled: number;
  hired: number;
  activeJobs: number;
  activeCampaigns: number;
  sent: number;
  /** Failed / dead message send attempts in the period (for delivery rate). */
  failedSends: number;
};

export async function aggregateCoreMetrics(
  filters: ResolvedAnalyticsFilters,
  previous = false
): Promise<CoreMetricCounts> {
  const range = previous ? previousCreatedAtRange(filters) : createdAtRange(filters);
  const candMatch = candidateMatch(filters, previous);
  const campMatch = campaignMatch(filters);
  const jobTime = periodRange(filters, previous, 'updatedAt');
  const replyTime = periodRange(filters, previous, 'replyState.repliedAt');
  const qualTime = periodRange(filters, previous, 'updatedAt');

  const campaignIds = await resolveCampaignIds(filters);
  const hasCampaigns = campaignIds.length > 0;

  const [
    candidatesSourced,
    contactsRevealed,
    outreachTruth,
    screeningsCompleted,
    shortlisted,
    interviewsScheduled,
    hired,
    activeJobs,
    activeCampaigns,
  ] = await Promise.all([
    SavedCandidateModel.countDocuments(candMatch),
    RevealedContactModel.countDocuments({
      organizationId: filters.organizationId,
      ...range,
    }),
    hasCampaigns
      ? Promise.all([
          CampaignJobModel.countDocuments({
            organizationId: filters.organizationId,
            campaignId: { $in: campaignIds },
            status: 'succeeded',
            'result.delivery': 'sent',
            jobType: { $in: [...MESSAGE_JOB_TYPES] },
            ...jobTime,
          }),
          CampaignJobModel.countDocuments({
            organizationId: filters.organizationId,
            campaignId: { $in: campaignIds },
            status: { $in: ['failed', 'dead'] },
            jobType: { $in: [...MESSAGE_JOB_TYPES] },
            ...jobTime,
          }),
          OutreachEnrollmentModel.aggregate<{
            replies: number;
            interested: number;
            qualified: number;
          }>([
            {
              $match: {
                organizationId: filters.organizationId,
                campaignId: { $in: campaignIds },
              },
            },
            {
              $facet: {
                replies: [
                  {
                    $match: {
                      $or: [
                        { 'replyState.hasReply': true, ...replyTime },
                        {
                          hasReply: true,
                          'replyState.repliedAt': null,
                          ...qualTime,
                        },
                        { status: 'replied', ...qualTime },
                      ],
                    },
                  },
                  { $count: 'n' },
                ],
                interested: [
                  {
                    $match: {
                      $or: [
                        {
                          'replyState.disposition': 'interested',
                          ...replyTime,
                        },
                        {
                          replyDisposition: 'interested',
                          ...qualTime,
                        },
                        { status: 'interested', ...qualTime },
                      ],
                    },
                  },
                  { $count: 'n' },
                ],
                qualified: [
                  {
                    $match: {
                      $or: [
                        {
                          'qualificationState.status': 'qualified',
                          ...qualTime,
                        },
                        { status: 'qualified', ...qualTime },
                      ],
                    },
                  },
                  { $count: 'n' },
                ],
              },
            },
            {
              $project: {
                replies: { $ifNull: [{ $arrayElemAt: ['$replies.n', 0] }, 0] },
                interested: {
                  $ifNull: [{ $arrayElemAt: ['$interested.n', 0] }, 0],
                },
                qualified: {
                  $ifNull: [{ $arrayElemAt: ['$qualified.n', 0] }, 0],
                },
              },
            },
          ]),
        ]).then(([sent, failedSends, replyAgg]) => ({
          sent,
          failedSends,
          replies: replyAgg[0]?.replies || 0,
          interested: replyAgg[0]?.interested || 0,
          qualified: replyAgg[0]?.qualified || 0,
        }))
      : Promise.resolve({
          sent: 0,
          failedSends: 0,
          replies: 0,
          interested: 0,
          qualified: 0,
        }),
    ScreeningCandidateModel.countDocuments({
      organizationId: filters.organizationId,
      callStatus: 'completed',
      ...(previous
        ? previousCreatedAtRange(filters, 'completedAt')
        : createdAtRange(filters, 'completedAt')),
    }),
    SavedCandidateModel.countDocuments({
      ...candMatch,
      status: { $in: ['shortlisted', 'interview_scheduled'] },
    }),
    InterviewModel.countDocuments({
      organizationId: filters.organizationId,
      status: { $in: ['scheduled', 'rescheduled', 'completed'] },
      ...(previous
        ? previousCreatedAtRange(filters, 'startAt')
        : { startAt: { $gte: filters.from, $lt: filters.to } }),
      ...(filters.jobId ? { jobId: filters.jobId } : {}),
      ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
    }),
    SavedCandidateModel.countDocuments({
      ...orgMatch(filters),
      status: 'hired',
      ...range,
      ...(filters.jobId ? { jobIds: filters.jobId } : {}),
    }),
    JobModel.countDocuments({
      organizationId: filters.organizationId,
      deletedAt: null,
      status: 'active',
      ...(filters.jobId ? { _id: filters.jobId } : {}),
      ...(filters.recruiterId ? { recruiterIds: filters.recruiterId } : {}),
      ...(filters.location
        ? { locations: { $elemMatch: { $regex: filters.location, $options: 'i' } } }
        : {}),
    }),
    OutreachCampaignModel.countDocuments({
      ...campMatch,
      status: { $in: ['running', 'scheduled'] },
    }),
  ]);

  return {
    candidatesSourced,
    contactsRevealed,
    delivered: outreachTruth.sent,
    replies: outreachTruth.replies,
    positiveReplies: outreachTruth.interested,
    qualified: outreachTruth.qualified,
    screeningsCompleted,
    shortlisted,
    interviewsScheduled,
    hired,
    activeJobs,
    activeCampaigns,
    sent: outreachTruth.sent,
    failedSends: outreachTruth.failedSends,
  };
}

export async function aggregatePipelineStages(filters: ResolvedAnalyticsFilters) {
  const match = {
    ...orgMatch(filters),
    ...(filters.jobId ? { jobIds: filters.jobId } : {}),
    ...(filters.location
      ? { location: { $regex: filters.location, $options: 'i' } }
      : {}),
    ...(filters.candidateStatus ? { status: filters.candidateStatus } : {}),
  };

  const rows = await SavedCandidateModel.aggregate<{ _id: string; count: number }>([
    { $match: match },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of rows) byStatus[row._id] = row.count;

  const sourced = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const contacted =
    (byStatus.contacted || 0) +
    (byStatus.interested || 0) +
    (byStatus.qualified || 0) +
    (byStatus.screening || 0) +
    (byStatus.shortlisted || 0) +
    (byStatus.interview_scheduled || 0) +
    (byStatus.hired || 0);
  const replied =
    (byStatus.interested || 0) +
    (byStatus.qualified || 0) +
    (byStatus.screening || 0) +
    (byStatus.shortlisted || 0) +
    (byStatus.interview_scheduled || 0) +
    (byStatus.hired || 0);
  const qualified =
    (byStatus.qualified || 0) +
    (byStatus.screening || 0) +
    (byStatus.shortlisted || 0) +
    (byStatus.interview_scheduled || 0) +
    (byStatus.hired || 0);
  const screened =
    (byStatus.screening || 0) +
    (byStatus.shortlisted || 0) +
    (byStatus.interview_scheduled || 0) +
    (byStatus.hired || 0);
  const scheduled =
    (byStatus.interview_scheduled || 0) + (byStatus.hired || 0);

  return [
    { id: 'sourced', label: 'Sourced', count: sourced },
    { id: 'contacted', label: 'Contacted', count: contacted },
    { id: 'replied', label: 'Replied', count: replied },
    { id: 'qualified', label: 'Qualified', count: qualified },
    { id: 'screened', label: 'Screened', count: screened },
    { id: 'scheduled', label: 'Scheduled', count: scheduled },
  ];
}

export async function aggregateChannelPerformance(filters: ResolvedAnalyticsFilters) {
  const empty = () => [
    { metric: 'Delivery rate', email: 0, whatsapp: 0, voice: 0 },
    { metric: 'Reply rate', email: 0, whatsapp: 0, voice: 0 },
    { metric: 'Positive reply rate', email: 0, whatsapp: 0, voice: 0 },
  ];

  const campaignIds = await resolveCampaignIds(filters);
  if (campaignIds.length === 0) return empty();

  const timeRange = { $gte: filters.from, $lt: filters.to };
  const buckets: Record<
    string,
    { sent: number; failed: number; replies: number; positive: number }
  > = {
    email: { sent: 0, failed: 0, replies: 0, positive: 0 },
    whatsapp: { sent: 0, failed: 0, replies: 0, positive: 0 },
    voice: { sent: 0, failed: 0, replies: 0, positive: 0 },
  };

  const [sentRows, failedRows, replyRows] = await Promise.all([
    CampaignJobModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          organizationId: filters.organizationId,
          campaignId: { $in: campaignIds },
          status: 'succeeded',
          'result.delivery': 'sent',
          jobType: { $in: [...MESSAGE_JOB_TYPES] },
          updatedAt: timeRange,
        },
      },
      { $group: { _id: channelFromJobTypeExpr(), count: { $sum: 1 } } },
    ]),
    CampaignJobModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          organizationId: filters.organizationId,
          campaignId: { $in: campaignIds },
          status: { $in: ['failed', 'dead'] },
          jobType: { $in: [...MESSAGE_JOB_TYPES] },
          updatedAt: timeRange,
        },
      },
      { $group: { _id: channelFromJobTypeExpr(), count: { $sum: 1 } } },
    ]),
    // Attribute each reply to the channel of the last successful send for that enrollment.
    OutreachEnrollmentModel.aggregate<{
      _id: string;
      replies: number;
      positive: number;
    }>([
      {
        $match: {
          organizationId: filters.organizationId,
          campaignId: { $in: campaignIds },
          $or: [
            {
              'replyState.hasReply': true,
              'replyState.repliedAt': timeRange,
            },
            {
              hasReply: true,
              'replyState.repliedAt': null,
              updatedAt: timeRange,
            },
          ],
        },
      },
      {
        $lookup: {
          from: CampaignJobModel.collection.name,
          let: {
            enrollmentId: '$_id',
            repliedAt: '$replyState.repliedAt',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$enrollmentId', '$$enrollmentId'] },
                    { $eq: ['$status', 'succeeded'] },
                    { $eq: ['$result.delivery', 'sent'] },
                    { $in: ['$jobType', [...MESSAGE_JOB_TYPES]] },
                    {
                      $or: [
                        { $eq: ['$$repliedAt', null] },
                        { $lte: ['$updatedAt', '$$repliedAt'] },
                      ],
                    },
                  ],
                },
              },
            },
            { $sort: { updatedAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                channel: channelFromJobTypeExpr(),
              },
            },
          ],
          as: 'lastSend',
        },
      },
      {
        $addFields: {
          channel: {
            $ifNull: [{ $arrayElemAt: ['$lastSend.channel', 0] }, 'email'],
          },
        },
      },
      {
        $group: {
          _id: '$channel',
          replies: { $sum: 1 },
          positive: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ['$replyState.disposition', 'interested'] },
                    { $eq: ['$replyDisposition', 'interested'] },
                    { $eq: ['$status', 'interested'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  for (const row of sentRows) {
    const bucket = buckets[row._id];
    if (bucket) bucket.sent += row.count;
  }
  for (const row of failedRows) {
    const bucket = buckets[row._id];
    if (bucket) bucket.failed += row.count;
  }
  for (const row of replyRows) {
    const bucket = buckets[row._id];
    if (!bucket) continue;
    bucket.replies += row.replies;
    bucket.positive += row.positive;
  }

  const point = (
    metric: string,
    pick: (b: {
      sent: number;
      failed: number;
      replies: number;
      positive: number;
    }) => number
  ) => ({
    metric,
    email: Number(pick(buckets.email!).toFixed(1)),
    whatsapp: Number(pick(buckets.whatsapp!).toFixed(1)),
    voice: Number(pick(buckets.voice!).toFixed(1)),
  });

  return [
    point('Delivery rate', (b) =>
      rate(b.sent, Math.max(b.sent + b.failed, 1))
    ),
    point('Reply rate', (b) => rate(b.replies, Math.max(b.sent, 1))),
    point('Positive reply rate', (b) =>
      rate(b.positive, Math.max(b.replies, 1))
    ),
  ];
}

export async function aggregateMedianStageDurations(filters: ResolvedAnalyticsFilters) {
  const enrollments = await OutreachEnrollmentModel.find({
    organizationId: filters.organizationId,
    ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
    'replyState.repliedAt': { $ne: null },
    createdAt: { $gte: filters.from, $lt: filters.to },
  })
    .select('createdAt replyState.repliedAt updatedAt status qualificationState screeningState')
    .limit(2000)
    .lean();

  const toDays = (start: Date, end: Date | null | undefined) => {
    if (!end) return null;
    const ms = end.getTime() - start.getTime();
    if (ms < 0) return null;
    return ms / (24 * 60 * 60 * 1000);
  };

  const sourcedToReply: number[] = [];
  const replyToQualified: number[] = [];
  const qualifiedToScreened: number[] = [];

  for (const row of enrollments) {
    const created = row.createdAt ? new Date(row.createdAt) : null;
    const replied = row.replyState?.repliedAt
      ? new Date(row.replyState.repliedAt)
      : null;
    if (created && replied) {
      const d = toDays(created, replied);
      if (d != null) sourcedToReply.push(d);
    }
    if (replied && row.qualificationState?.status === 'qualified') {
      const d = toDays(replied, row.updatedAt ? new Date(row.updatedAt) : null);
      if (d != null) replyToQualified.push(d);
    }
    if (
      replied &&
      (row.screeningState?.status === 'completed' || row.status === 'completed')
    ) {
      const d = toDays(replied, row.updatedAt ? new Date(row.updatedAt) : null);
      if (d != null) qualifiedToScreened.push(d);
    }
  }

  return [
    {
      id: 'sourced_to_replied',
      label: 'Sourced → replied',
      medianDays: median(sourcedToReply),
      sampleSize: sourcedToReply.length,
    },
    {
      id: 'replied_to_qualified',
      label: 'Replied → qualified',
      medianDays: median(replyToQualified),
      sampleSize: replyToQualified.length,
    },
    {
      id: 'qualified_to_screened',
      label: 'Qualified → screened',
      medianDays: median(qualifiedToScreened),
      sampleSize: qualifiedToScreened.length,
    },
  ];
}

export async function aggregateJobsTable(filters: ResolvedAnalyticsFilters) {
  const match: Record<string, unknown> = {
    organizationId: filters.organizationId,
    deletedAt: null,
    status: { $in: ['active', 'paused', 'draft'] },
  };
  if (filters.jobId) match._id = filters.jobId;
  if (filters.recruiterId) match.recruiterIds = filters.recruiterId;
  if (filters.location) {
    match.locations = { $elemMatch: { $regex: filters.location, $options: 'i' } };
  }

  const jobs = await JobModel.find(match)
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const managerIds = [
    ...new Set(
      jobs
        .map((j) => (j.hiringManagerId ? String(j.hiringManagerId) : null))
        .filter(Boolean) as string[]
    ),
  ];
  const managers = managerIds.length
    ? await UserModel.find({ _id: { $in: managerIds } })
        .select('firstName lastName')
        .lean()
    : [];
  const managerMap = new Map(
    managers.map((u) => [
      String(u._id),
      `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—',
    ])
  );

  return jobs.map((job) => {
    const stats = job.stats || {};
    const status =
      job.status === 'active'
        ? 'Active'
        : job.status === 'paused'
          ? 'Paused'
          : job.status === 'draft'
            ? 'Draft'
            : 'Closed';
    return {
      id: String(job._id),
      title: job.title,
      location: (job.locations && job.locations[0]) || '—',
      hiringManager: job.hiringManagerId
        ? managerMap.get(String(job.hiringManagerId)) || '—'
        : '—',
      sourced: stats.candidatesSourced || 0,
      interested: stats.positiveReplies || stats.qualified || 0,
      screened: stats.screened || 0,
      interviews: stats.interviews || 0,
      hired: stats.hired || 0,
      status,
      lastActivity: job.updatedAt
        ? new Date(job.updatedAt).toISOString()
        : new Date().toISOString(),
    };
  });
}

export async function aggregateRecruiterWorkload(filters: ResolvedAnalyticsFilters) {
  const jobs = await JobModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    jobs: number;
    sourced: number;
    interviews: number;
  }>([
    {
      $match: {
        organizationId: filters.organizationId,
        deletedAt: null,
        ...(filters.jobId ? { _id: filters.jobId } : {}),
      },
    },
    { $unwind: '$recruiterIds' },
    ...(filters.recruiterId
      ? [{ $match: { recruiterIds: filters.recruiterId } }]
      : []),
    {
      $group: {
        _id: '$recruiterIds',
        jobs: { $sum: 1 },
        sourced: { $sum: { $ifNull: ['$stats.candidatesSourced', 0] } },
        interviews: { $sum: { $ifNull: ['$stats.interviews', 0] } },
      },
    },
  ]);

  const userIds = jobs.map((j) => j._id);
  const users = userIds.length
    ? await UserModel.find({ _id: { $in: userIds } })
        .select('firstName lastName email')
        .lean()
    : [];
  const userMap = new Map(
    users.map((u) => [
      String(u._id),
      {
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
      },
    ])
  );

  return jobs.map((row) => {
    const user = userMap.get(String(row._id));
    return {
      recruiterId: String(row._id),
      name: user?.name || 'Unknown',
      email: user?.email || null,
      activeJobs: row.jobs,
      candidatesSourced: row.sourced,
      interviewsScheduled: row.interviews,
    };
  });
}

export async function aggregateUsageConsumption(filters: ResolvedAnalyticsFilters) {
  const rows = await UsageLedgerModel.aggregate<{
    _id: string;
    quantity: number;
  }>([
    {
      $match: {
        organizationId: filters.organizationId,
        status: 'committed',
        createdAt: { $gte: filters.from, $lt: filters.to },
        ...(filters.recruiterId ? { userId: filters.recruiterId } : {}),
      },
    },
    {
      $group: {
        _id: '$metric',
        quantity: { $sum: '$quantity' },
      },
    },
  ]);

  return rows.map((row) => ({
    metric: row._id,
    quantity: row.quantity,
  }));
}

export async function aggregateRecentActivity(
  filters: ResolvedAnalyticsFilters,
  limit = 20
) {
  const logs = await AuditLogModel.find({
    organizationId: filters.organizationId,
    createdAt: { $gte: filters.from, $lt: filters.to },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map((log) => ({
    id: String(log._id),
    title: log.action,
    description: log.module,
    time: log.createdAt ? new Date(log.createdAt).toISOString() : null,
    module: log.module,
    metadata: log.metadata || {},
  }));
}

export async function ensureAnalyticsIndexes(): Promise<void> {
  await Promise.all([
    SavedCandidateModel.collection.createIndex({
      organizationId: 1,
      createdAt: -1,
      status: 1,
    }),
    InterviewModel.collection.createIndex({
      organizationId: 1,
      startAt: 1,
      status: 1,
    }),
    OutreachCampaignModel.collection.createIndex({
      organizationId: 1,
      deletedAt: 1,
      status: 1,
    }),
    CampaignJobModel.collection.createIndex({
      organizationId: 1,
      campaignId: 1,
      status: 1,
      jobType: 1,
      updatedAt: -1,
    }),
    OutreachEnrollmentModel.collection.createIndex({
      organizationId: 1,
      campaignId: 1,
      'replyState.repliedAt': -1,
    }),
    UsageLedgerModel.collection.createIndex({
      organizationId: 1,
      createdAt: -1,
      metric: 1,
      status: 1,
    }),
    AuditLogModel.collection.createIndex({
      organizationId: 1,
      createdAt: -1,
    }),
  ]).catch(() => undefined);
}
