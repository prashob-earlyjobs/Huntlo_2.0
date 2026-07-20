import { AppError } from '../../shared/errors/app-error.js';
import {
  buildOrganizationInitials,
} from '../../shared/auth/crypto.js';
import { OrganizationMemberModel } from '../organizations/member.model.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import type { RequestContext } from './auth.types.js';
import type { OnboardingAnswers } from './onboarding.constants.js';
import { OnboardingModel } from './onboarding.model.js';
import {
  accountRoleForUser,
  isOnboardingComplete,
  toPublicUser,
  UserModel,
  type UserDocument,
} from './user.model.js';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

async function uniqueOrganizationSlug(base: string): Promise<string> {
  const root = slugify(base) || 'workspace';
  let candidate = root;
  let suffix = 1;
  while (await OrganizationModel.exists({ slug: candidate })) {
    candidate = `${root}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function organizationNameForOwner(user: UserDocument): string {
  return (
    user.companyName?.trim() ||
    `${user.firstName} ${user.lastName}`.trim() ||
    'Workspace'
  );
}

async function createOrganizationForOwner(user: UserDocument) {
  if (user.organizationId) {
    const existing = await OrganizationModel.findById(user.organizationId);
    if (existing && !existing.deletedAt) {
      const name = organizationNameForOwner(user);
      if (!existing.ownerUserId) {
        existing.ownerUserId = user._id;
      }
      if (name && existing.name !== name && !existing.name) {
        existing.name = name;
        existing.initials = buildOrganizationInitials(name);
      }
      await existing.save();

      const member = await OrganizationMemberModel.findOne({
        organizationId: existing._id,
        userId: user._id,
      });
      if (!member) {
        await OrganizationMemberModel.create({
          organizationId: existing._id,
          userId: user._id,
          role: 'owner',
          permissions: [],
          status: 'active',
          joinedAt: new Date(),
        });
      }

      return existing;
    }
  }

  const name = organizationNameForOwner(user);
  try {
    const organization = await OrganizationModel.create({
      name,
      slug: await uniqueOrganizationSlug(name),
      plan: 'Trial',
      initials: buildOrganizationInitials(name),
      timezone: user.timezone || 'Asia/Kolkata',
      defaultTimezone: user.timezone || 'Asia/Kolkata',
      currency: 'INR',
      country: 'IN',
      status: 'active',
      ownerUserId: user._id,
      companyType: user.onboardingCompanyType ?? null,
      settings: {
        companyType: user.onboardingCompanyType ?? null,
        hiringVolume: user.onboardingHiringVolume ?? null,
        hiringChallenges: user.onboardingHiringChallenges ?? [],
        outreachChannels: user.onboardingOutreachChannels ?? [],
      },
    });

    user.organizationId = organization._id;
    user.role = 'owner';
    await user.save();

    await OrganizationMemberModel.create({
      organizationId: organization._id,
      userId: user._id,
      role: 'owner',
      permissions: [],
      status: 'active',
      joinedAt: new Date(),
    });

    return organization;
  } catch (error) {
    throw new AppError(
      500,
      'ONBOARDING_ORGANIZATION_CREATION_FAILED',
      'Failed to create organisation workspace',
      { cause: error }
    );
  }
}

export class OnboardingService {
  async get(context: RequestContext) {
    const user = await UserModel.findById(context.userId);
    if (!user || user.deletedAt) {
      throw AppError.notFound('User not found');
    }

    const onboarding = await OnboardingModel.findOne({ userId: context.userId });

    return {
      completed: isOnboardingComplete(user),
      completedAt: user.onboardingCompletedAt?.toISOString() ?? onboarding?.completedAt?.toISOString() ?? null,
      companyType: user.onboardingCompanyType ?? null,
      hiringChallenges: user.onboardingHiringChallenges ?? [],
      outreachChannels: user.onboardingOutreachChannels ?? [],
      hiringVolume: user.onboardingHiringVolume ?? null,
      // Legacy fields retained for older clients
      currentStep: onboarding?.currentStep ?? 1,
      personalDetails: onboarding?.personalDetails ?? {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      organisationDetails: onboarding?.organisationDetails ?? {
        name: user.companyName,
      },
    };
  }

  async patch(context: RequestContext, input: Record<string, unknown>) {
    const hasCompletionAnswers =
      typeof input.companyType === 'string' &&
      Array.isArray(input.hiringChallenges) &&
      Array.isArray(input.outreachChannels) &&
      typeof input.hiringVolume === 'string';

    if (hasCompletionAnswers) {
      return this.completeOwnerOnboarding(context, {
        companyType: input.companyType as OnboardingAnswers['companyType'],
        hiringChallenges: input.hiringChallenges as OnboardingAnswers['hiringChallenges'],
        outreachChannels: input.outreachChannels as OnboardingAnswers['outreachChannels'],
        hiringVolume: input.hiringVolume as OnboardingAnswers['hiringVolume'],
      });
    }

    // Draft persistence for in-progress wizard (partial answers)
    const user = await UserModel.findById(context.userId);
    if (!user || user.deletedAt) {
      throw AppError.notFound('User not found');
    }
    if (user.platformAdmin) {
      throw new AppError(409, 'ONBOARDING_NOT_REQUIRED', 'Admins do not require onboarding');
    }
    if (accountRoleForUser(user) === 'member') {
      throw new AppError(403, 'ONBOARDING_FORBIDDEN_FOR_MEMBER', 'Team members do not require onboarding');
    }
    if (isOnboardingComplete(user)) {
      return this.completeOwnerOnboarding(context, {
        companyType: (user.onboardingCompanyType ?? 'startup') as OnboardingAnswers['companyType'],
        hiringChallenges: (user.onboardingHiringChallenges ?? ['finding_qualified']) as OnboardingAnswers['hiringChallenges'],
        outreachChannels: (user.onboardingOutreachChannels ?? ['email']) as OnboardingAnswers['outreachChannels'],
        hiringVolume: (user.onboardingHiringVolume ?? '1_5') as OnboardingAnswers['hiringVolume'],
      });
    }

    if (typeof input.companyType === 'string') {
      user.onboardingCompanyType = input.companyType as UserDocument['onboardingCompanyType'];
    }
    if (Array.isArray(input.hiringChallenges)) {
      user.onboardingHiringChallenges =
        input.hiringChallenges as UserDocument['onboardingHiringChallenges'];
    }
    if (Array.isArray(input.outreachChannels)) {
      user.onboardingOutreachChannels =
        input.outreachChannels as UserDocument['onboardingOutreachChannels'];
    }
    if (typeof input.hiringVolume === 'string') {
      user.onboardingHiringVolume = input.hiringVolume as UserDocument['onboardingHiringVolume'];
    }
    if (user.onboardingStatus === 'not_started') {
      user.onboardingStatus = 'in_progress';
    }
    await user.save();

    const onboarding = await OnboardingModel.findOne({ userId: context.userId });
    if (onboarding && !onboarding.completed) {
      if (typeof input.currentStep === 'number') onboarding.currentStep = input.currentStep;
      await onboarding.save();
    }

    return this.get(context);
  }

  async complete(context: RequestContext, answers?: OnboardingAnswers) {
    if (!answers) {
      const user = await UserModel.findById(context.userId);
      if (!user || user.deletedAt) throw AppError.notFound('User not found');
      if (
        user.onboardingCompanyType &&
        user.onboardingHiringChallenges?.length &&
        user.onboardingOutreachChannels?.length &&
        user.onboardingHiringVolume
      ) {
        return this.completeOwnerOnboarding(context, {
          companyType: user.onboardingCompanyType as OnboardingAnswers['companyType'],
          hiringChallenges: user.onboardingHiringChallenges as OnboardingAnswers['hiringChallenges'],
          outreachChannels: user.onboardingOutreachChannels as OnboardingAnswers['outreachChannels'],
          hiringVolume: user.onboardingHiringVolume as OnboardingAnswers['hiringVolume'],
        });
      }
      throw new AppError(422, 'VALIDATION_ERROR', 'Onboarding answers are required');
    }
    return this.completeOwnerOnboarding(context, answers);
  }

  async completeOwnerOnboarding(context: RequestContext, answers: OnboardingAnswers) {
    const user = await UserModel.findById(context.userId);
    if (!user || user.deletedAt) {
      throw AppError.notFound('User not found');
    }

    if (user.platformAdmin) {
      throw new AppError(409, 'ONBOARDING_NOT_REQUIRED', 'Admins do not require onboarding');
    }

    if (accountRoleForUser(user) === 'member') {
      throw new AppError(
        403,
        'ONBOARDING_FORBIDDEN_FOR_MEMBER',
        'Team members cannot complete owner onboarding'
      );
    }

    if (user._id.toHexString() !== context.userId) {
      throw AppError.forbidden('Cannot complete onboarding for another user');
    }

    if (isOnboardingComplete(user) && user.organizationId) {
      const organization = await OrganizationModel.findById(user.organizationId);
      return {
        user: toPublicUser(user, organization?.plan),
        organization: organization
          ? {
              id: organization._id.toHexString(),
              name: organization.name,
              slug: organization.slug,
            }
          : null,
        redirectPath: '/dashboard',
        completed: true,
      };
    }

    user.onboardingCompanyType = answers.companyType;
    user.onboardingHiringChallenges = answers.hiringChallenges;
    user.onboardingOutreachChannels = answers.outreachChannels;
    user.onboardingHiringVolume = answers.hiringVolume;
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();
    user.onboardingStatus = 'completed';
    user.role = 'owner';
    await user.save();

    let organization;
    try {
      organization = await createOrganizationForOwner(user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        500,
        'ONBOARDING_ORGANIZATION_CREATION_FAILED',
        'Failed to create organisation workspace',
        { cause: error }
      );
    }

    organization.companyType = answers.companyType;
    const settings = (organization.settings ?? {}) as Record<string, unknown>;
    organization.settings = {
      ...settings,
      companyType: answers.companyType,
      hiringVolume: answers.hiringVolume,
      hiringChallenges: answers.hiringChallenges,
      outreachChannels: answers.outreachChannels,
    } as typeof organization.settings;
    if (user.companyName?.trim()) {
      organization.name = user.companyName.trim();
      organization.initials = buildOrganizationInitials(organization.name);
    }
    await organization.save();

    const onboarding = await OnboardingModel.findOne({ userId: user._id });
    if (onboarding) {
      onboarding.completed = true;
      onboarding.currentStep = 5;
      onboarding.completedAt = user.onboardingCompletedAt;
      await onboarding.save();
    }

    return {
      user: toPublicUser(user, organization.plan),
      organization: {
        id: organization._id.toHexString(),
        name: organization.name,
        slug: organization.slug,
      },
      redirectPath: '/dashboard',
      completed: true,
    };
  }
}

export const onboardingService = new OnboardingService();
