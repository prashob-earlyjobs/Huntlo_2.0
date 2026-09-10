import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { SavedCandidateModel } from '../candidates/saved-candidate.model.js';
import type { IntegrationProviderId } from './user-integration.model.js';
import type { AtsApplicationSummary } from './providers/types.js';

async function upsertOne(options: {
  organizationId: string;
  userId: string;
  provider: IntegrationProviderId;
  jobId: string;
  huntloJobId: string | null;
  app: AtsApplicationSummary;
}): Promise<{ id: string; created: boolean }> {
  const orgOid = new mongoose.Types.ObjectId(options.organizationId);
  const userOid = new mongoose.Types.ObjectId(options.userId);
  // Amplify historically used `zwayam:` — keep that for existing pool rows.
  const externalId =
    options.provider === 'zwayam-amplify'
      ? `zwayam:${options.app.id}`
      : `${options.provider}:${options.app.id}`;
  const email = options.app.email?.trim().toLowerCase() || null;

  let existing = await SavedCandidateModel.findOne({
    organizationId: orgOid,
    externalCandidateId: externalId,
    deletedAt: null,
  });

  if (!existing && email) {
    existing = await SavedCandidateModel.findOne({
      organizationId: orgOid,
      email,
      deletedAt: null,
    });
  }

  const huntloJobOid =
    options.huntloJobId && mongoose.Types.ObjectId.isValid(options.huntloJobId)
      ? new mongoose.Types.ObjectId(options.huntloJobId)
      : null;

  if (existing) {
    existing.name = options.app.name || existing.name;
    if (options.app.email) existing.email = options.app.email;
    if (options.app.phone) existing.phone = options.app.phone;
    if (options.app.headline) existing.headline = options.app.headline;
    if (options.app.currentTitle) existing.currentTitle = options.app.currentTitle;
    if (options.app.currentCompany) existing.currentCompany = options.app.currentCompany;
    if (options.app.location) existing.location = options.app.location;
    if (options.app.experienceYears != null) {
      existing.experienceYears = options.app.experienceYears;
    }
    existing.externalCandidateId = externalId;
    existing.sourceType = 'ats';
    existing.sourceId = options.jobId;
    existing.customFields = {
      ...(existing.customFields && typeof existing.customFields === 'object'
        ? (existing.customFields as Record<string, unknown>)
        : {}),
      atsProvider: options.provider,
      atsApplyId: options.app.id,
      atsJobId: options.jobId,
      atsResumeUrl: options.app.resumeUrl,
      atsStage: options.app.stage,
    };
    if (huntloJobOid) {
      const ids = new Set((existing.jobIds || []).map((id) => String(id)));
      if (!ids.has(String(huntloJobOid))) {
        existing.jobIds = [...(existing.jobIds || []), huntloJobOid];
      }
    }
    existing.lastActivityAt = new Date();
    await existing.save();
    return { id: String(existing._id), created: false };
  }

  const created = await SavedCandidateModel.create({
    organizationId: orgOid,
    ownerUserId: userOid,
    name: options.app.name || 'Unknown applicant',
    email,
    phone: options.app.phone,
    headline: options.app.headline,
    currentTitle: options.app.currentTitle,
    currentCompany: options.app.currentCompany,
    location: options.app.location,
    experienceYears: options.app.experienceYears,
    externalCandidateId: externalId,
    sourceType: 'ats',
    sourceId: options.jobId,
    status: 'new',
    jobIds: huntloJobOid ? [huntloJobOid] : [],
    customFields: {
      atsProvider: options.provider,
      atsApplyId: options.app.id,
      atsJobId: options.jobId,
      atsResumeUrl: options.app.resumeUrl,
      atsStage: options.app.stage,
    },
    lastActivityAt: new Date(),
  });

  return { id: String(created._id), created: true };
}

export const atsImportService = {
  async importApplications(input: {
    organizationId: string;
    userId: string;
    provider: IntegrationProviderId;
    jobId: string;
    applicationIds: string[];
    huntloJobId?: string | null;
    listApplications: (args: {
      jobId: string;
      page?: number;
      pageSize?: number;
    }) => Promise<{
      applications: AtsApplicationSummary[];
      page: number;
      pageSize: number;
      total: number | null;
    }>;
  }) {
    const jobId = String(input.jobId || '').trim();
    const applicationIds = [
      ...new Set(input.applicationIds.map((id) => String(id).trim()).filter(Boolean)),
    ];
    if (!jobId) throw new AppError(400, 'JOB_ID_REQUIRED', 'ATS job id is required.');
    if (applicationIds.length === 0) {
      throw new AppError(400, 'APPLICATIONS_REQUIRED', 'Select at least one application.');
    }

    const listed = await input.listApplications({
      jobId,
      page: 1,
      pageSize: 200,
    });
    const byId = new Map(listed.applications.map((app) => [app.id, app]));

    let page = 2;
    while (applicationIds.some((id) => !byId.has(id)) && page <= 20) {
      const more = await input.listApplications({ jobId, page, pageSize: 200 });
      if (more.applications.length === 0) break;
      for (const app of more.applications) byId.set(app.id, app);
      if (more.applications.length < 200) break;
      page += 1;
    }

    const selected: AtsApplicationSummary[] = [];
    const missing: string[] = [];
    for (const id of applicationIds) {
      const app = byId.get(id);
      if (app) selected.push(app);
      else missing.push(id);
    }
    if (selected.length === 0) {
      throw new AppError(
        404,
        'APPLICATIONS_NOT_FOUND',
        'None of the selected ATS applications could be loaded.'
      );
    }

    const candidates: Array<{ id: string; created: boolean; applyId: string; name: string }> =
      [];
    for (const app of selected) {
      const result = await upsertOne({
        organizationId: input.organizationId,
        userId: input.userId,
        provider: input.provider,
        jobId,
        huntloJobId: input.huntloJobId ?? null,
        app,
      });
      candidates.push({
        id: result.id,
        created: result.created,
        applyId: app.id,
        name: app.name,
      });
    }

    return {
      provider: input.provider,
      jobId,
      imported: candidates.length,
      created: candidates.filter((c) => c.created).length,
      updated: candidates.filter((c) => !c.created).length,
      missing,
      candidates,
    };
  },
};
