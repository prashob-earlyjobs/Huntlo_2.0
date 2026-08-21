import mongoose from 'mongoose';

import { AppError } from '../../shared/errors/app-error.js';
import { isValidObjectId } from '../../shared/validation/object-id.js';
import {
  FEATURE_CATALOG,
  effectiveFeatureAccess,
  isFeatureKey,
  toPublicOverrides,
  type FeatureOverride,
} from '../../shared/usage/features.js';
import {
  DEFAULT_CANDIDATE_SEARCH_VENDOR,
  normalizeCandidateSearchVendor,
  type CandidateSearchVendor,
} from '../../shared/candidate-search-vendors.js';
import { UserModel } from '../auth/user.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { plansService } from '../plans/plans.service.js';

function parseExpiresAt(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw AppError.badRequest('Invalid expiresAt date');
  }
  return parsed;
}

function asOverrides(
  value: unknown
): Record<string, FeatureOverride> {
  if (!value || typeof value !== 'object') return {};
  return value as Record<string, FeatureOverride>;
}

async function ownerForOrg(org: {
  _id: mongoose.Types.ObjectId;
  ownerUserId?: mongoose.Types.ObjectId | null;
}) {
  const owner = org.ownerUserId
    ? await UserModel.findById(org.ownerUserId).select('email firstName lastName')
    : await UserModel.findOne({ organizationId: org._id, deletedAt: null })
        .sort({ createdAt: 1 })
        .select('email firstName lastName');
  if (!owner) {
    return { ownerEmail: null as string | null, ownerName: null as string | null };
  }
  return {
    ownerEmail: owner.email,
    ownerName: `${owner.firstName} ${owner.lastName}`.trim(),
  };
}

async function serializeWorkspace(org: {
  _id: mongoose.Types.ObjectId;
  name: string;
  plan: string;
  ownerUserId?: mongoose.Types.ObjectId | null;
  featureAccessOverrides?: unknown;
}) {
  const organizationId = org._id.toHexString();
  const [{ planAccess, planCode, overrides }, owner] = await Promise.all([
    quotaService.getFeatureAccessState(organizationId),
    ownerForOrg(org),
  ]);
  const stored = toPublicOverrides(asOverrides(org.featureAccessOverrides ?? overrides));
  return {
    organizationId,
    name: org.name,
    plan: org.plan,
    planCode,
    ownerEmail: owner.ownerEmail,
    ownerName: owner.ownerName,
    overrides: stored,
    planAccess,
    effectiveAccess: effectiveFeatureAccess(planAccess, planCode, overrides),
  };
}

async function serializeSearchVendorUser(user: {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: mongoose.Types.ObjectId;
  candidateSearchVendor?: string | null;
}) {
  const org = await OrganizationModel.findById(user.organizationId).select('name');
  return {
    id: user._id.toHexString(),
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    organisation: org?.name || '—',
    organizationId: String(user.organizationId),
    candidateSearchVendor: normalizeCandidateSearchVendor(user.candidateSearchVendor),
  };
}

class FeatureAccessService {
  async getOverview() {
    await plansService.ensureDefaultPlans();
    const [plans, exceptionOrgs] = await Promise.all([
      plansService.listAdminPlans(),
      OrganizationModel.find({
        deletedAt: null,
        $expr: {
          $gt: [
            {
              $size: {
                $objectToArray: { $ifNull: ['$featureAccessOverrides', {}] },
              },
            },
            0,
          ],
        },
      })
        .sort({ updatedAt: -1 })
        .limit(200),
    ]);

    const exceptions = await Promise.all(exceptionOrgs.map((org) => serializeWorkspace(org)));
    const vendorUsers = await UserModel.find({
      deletedAt: null,
      candidateSearchVendor: 'brightdata',
    })
      .select('firstName lastName email organizationId candidateSearchVendor')
      .sort({ updatedAt: -1 })
      .limit(200);

    return {
      features: FEATURE_CATALOG.map(({ key, label, description }) => ({
        key,
        label,
        description,
      })),
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        code: plan.code,
        active: plan.active,
        public: plan.public,
        sortOrder: plan.sortOrder,
        featureAccess: (plan.featureAccess ?? {}) as Record<string, boolean>,
      })),
      exceptions,
      searchVendor: {
        defaultVendor: DEFAULT_CANDIDATE_SEARCH_VENDOR,
        exceptions: await Promise.all(vendorUsers.map((user) => serializeSearchVendorUser(user))),
      },
    };
  }

  async searchWorkspaces(query: { q?: string; limit?: number }) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const q = query.q?.trim() ?? '';
    const clauses: Record<string, unknown>[] = [];

    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      clauses.push({ name: regex }, { slug: regex });
      const users = await UserModel.find({ deletedAt: null, email: regex })
        .select('organizationId')
        .limit(limit)
        .lean();
      const matchedOrgIds = users
        .map((user) => user.organizationId)
        .filter(Boolean);
      if (matchedOrgIds.length) {
        clauses.push({ _id: { $in: matchedOrgIds } });
      }
    }

    const orgFilter: Record<string, unknown> = { deletedAt: null };
    if (clauses.length) orgFilter.$or = clauses;

    const orgs = await OrganizationModel.find(orgFilter).sort({ name: 1 }).limit(limit);

    return {
      items: await Promise.all(orgs.map((org) => serializeWorkspace(org))),
    };
  }

  async getWorkspace(organizationId: string) {
    if (!isValidObjectId(organizationId)) throw AppError.badRequest('Invalid organization id');
    const org = await OrganizationModel.findById(organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    return serializeWorkspace(org);
  }

  async setPlanFeature(planId: string, feature: string, enabled: boolean) {
    if (!isFeatureKey(feature)) throw AppError.badRequest('Unknown feature');
    const plan = await plansService.updatePlan(planId, {
      featureAccess: { [feature]: enabled },
    });
    return {
      id: plan.id,
      name: plan.name,
      code: plan.code,
      active: plan.active,
      featureAccess: (plan.featureAccess ?? {}) as Record<string, boolean>,
    };
  }

  async upsertWorkspaceOverrides(
    organizationId: string,
    input: {
      overrides: Record<
        string,
        { enabled: boolean; note?: string | null; expiresAt?: string | null } | null
      >;
    }
  ) {
    if (!isValidObjectId(organizationId)) throw AppError.badRequest('Invalid organization id');
    const org = await OrganizationModel.findById(organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');

    const current = asOverrides(org.featureAccessOverrides);
    const next: Record<string, FeatureOverride> = { ...current };

    for (const [feature, value] of Object.entries(input.overrides ?? {})) {
      if (!isFeatureKey(feature)) {
        throw AppError.badRequest(`Unknown feature: ${feature}`);
      }
      if (value == null) {
        delete next[feature];
        continue;
      }
      next[feature] = {
        enabled: Boolean(value.enabled),
        note: value.note?.trim() || null,
        expiresAt: parseExpiresAt(value.expiresAt),
        updatedAt: new Date(),
      };
    }

    org.set('featureAccessOverrides', next);
    org.markModified('featureAccessOverrides');
    await org.save();
    return serializeWorkspace(org);
  }

  async clearWorkspaceOverrides(organizationId: string) {
    if (!isValidObjectId(organizationId)) throw AppError.badRequest('Invalid organization id');
    const org = await OrganizationModel.findById(organizationId);
    if (!org || org.deletedAt) throw AppError.notFound('Organization not found');
    org.set('featureAccessOverrides', {});
    org.markModified('featureAccessOverrides');
    await org.save();
    return serializeWorkspace(org);
  }

  async searchUsers(query: { q?: string; limit?: number }) {
    const limit = Math.min(Math.max(query.limit ?? 20, 1), 50);
    const q = query.q?.trim() ?? '';
    const filter: Record<string, unknown> = { deletedAt: null };
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ email: regex }, { firstName: regex }, { lastName: regex }];
    }
    const users = await UserModel.find(filter)
      .select('firstName lastName email organizationId candidateSearchVendor')
      .sort({ email: 1 })
      .limit(limit);
    return {
      items: await Promise.all(users.map((user) => serializeSearchVendorUser(user))),
    };
  }

  async setUserSearchVendor(userId: string, vendor: CandidateSearchVendor) {
    if (!isValidObjectId(userId)) throw AppError.badRequest('Invalid user id');
    const user = await UserModel.findById(userId);
    if (!user || user.deletedAt) throw AppError.notFound('User not found');
    user.candidateSearchVendor = normalizeCandidateSearchVendor(vendor);
    await user.save();
    return serializeSearchVendorUser(user);
  }
}

export const featureAccessService = new FeatureAccessService();
