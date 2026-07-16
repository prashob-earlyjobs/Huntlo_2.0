import { AppError } from '../../shared/errors/app-error.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import type { RequestContext } from './auth.types.js';
import { onboardingStepKey, OnboardingModel } from './onboarding.model.js';
import { toPublicUser, UserModel } from './user.model.js';

export class OnboardingService {
  async get(context: RequestContext) {
    const onboarding = await OnboardingModel.findOne({ userId: context.userId });
    if (!onboarding) {
      throw AppError.notFound('Onboarding record not found');
    }

    return {
      currentStep: onboarding.currentStep,
      currentStepKey: onboardingStepKey(onboarding.currentStep),
      completed: onboarding.completed,
      personalDetails: onboarding.personalDetails,
      organisationDetails: onboarding.organisationDetails,
      recruitingGoals: onboarding.recruitingGoals,
      teamSize: onboarding.teamSize,
      hiringLocations: onboarding.hiringLocations,
      modulePreferences: onboarding.modulePreferences,
      initialIntegrations: onboarding.initialIntegrations,
      completedAt: onboarding.completedAt?.toISOString() ?? null,
    };
  }

  async patch(context: RequestContext, input: Record<string, unknown>) {
    const onboarding = await OnboardingModel.findOne({ userId: context.userId });
    if (!onboarding) {
      throw AppError.notFound('Onboarding record not found');
    }
    if (onboarding.completed) {
      throw AppError.conflict('Onboarding is already completed');
    }

    if (typeof input.currentStep === 'number') {
      onboarding.currentStep = input.currentStep;
    }
    if (input.personalDetails && typeof input.personalDetails === 'object') {
      onboarding.personalDetails = {
        ...onboarding.personalDetails,
        ...(input.personalDetails as object),
      };
    }
    if (input.organisationDetails && typeof input.organisationDetails === 'object') {
      onboarding.organisationDetails = {
        ...onboarding.organisationDetails,
        ...(input.organisationDetails as object),
      };
    }
    if (Array.isArray(input.recruitingGoals)) onboarding.recruitingGoals = input.recruitingGoals as string[];
    if (input.teamSize !== undefined) onboarding.teamSize = input.teamSize as string | null;
    if (Array.isArray(input.hiringLocations)) onboarding.hiringLocations = input.hiringLocations as string[];
    if (Array.isArray(input.modulePreferences)) onboarding.modulePreferences = input.modulePreferences as string[];
    if (Array.isArray(input.initialIntegrations)) {
      onboarding.initialIntegrations = input.initialIntegrations as string[];
    }

    await onboarding.save();

    const user = await UserModel.findById(context.userId);
    if (user && user.onboardingStatus === 'not_started') {
      user.onboardingStatus = 'in_progress';
      await user.save();
    }

    if (input.personalDetails && user) {
      const details = input.personalDetails as Record<string, string | null | undefined>;
      if (details.firstName) user.firstName = details.firstName;
      if (details.lastName) user.lastName = details.lastName;
      if (details.jobTitle !== undefined) user.jobTitle = details.jobTitle;
      if (details.phone !== undefined) user.phone = details.phone;
      if (details.timezone) user.timezone = details.timezone;
      await user.save();
    }

    if (input.organisationDetails) {
      const org = await OrganizationModel.findById(context.organizationId);
      const details = input.organisationDetails as Record<string, string | null | undefined>;
      if (org) {
        if (details.name) org.name = details.name;
        if (details.industry !== undefined) org.industry = details.industry;
        if (details.website !== undefined) org.website = details.website;
        if (details.companySize !== undefined) org.companySize = details.companySize;
        await org.save();
      }
    }

    return this.get(context);
  }

  async complete(context: RequestContext) {
    const onboarding = await OnboardingModel.findOne({ userId: context.userId });
    if (!onboarding) {
      throw AppError.notFound('Onboarding record not found');
    }

    onboarding.completed = true;
    onboarding.currentStep = 8;
    onboarding.completedAt = new Date();
    await onboarding.save();

    const user = await UserModel.findById(context.userId);
    if (!user) throw AppError.notFound('User not found');
    user.onboardingStatus = 'completed';
    await user.save();

    const organization = await OrganizationModel.findById(context.organizationId);

    return {
      completed: true,
      user: toPublicUser(user, organization?.plan),
    };
  }
}

export const onboardingService = new OnboardingService();
