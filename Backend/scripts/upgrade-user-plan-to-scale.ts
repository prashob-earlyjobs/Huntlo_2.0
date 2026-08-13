/**
 * One-off: upgrade a workspace to Scale so Huntlo 360 featureAccess applies.
 * Usage: npx tsx scripts/upgrade-user-plan-to-scale.ts gokul@earlyjobs.ai
 */
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { UserModel } from '../src/modules/auth/user.model.js';
import { OrganizationModel } from '../src/modules/organizations/organization.model.js';
import { PricingPlanModel } from '../src/modules/plans/pricing-plan.model.js';
import { WorkspaceSubscriptionModel } from '../src/modules/plans/subscription.model.js';
import { plansService } from '../src/modules/plans/plans.service.js';
import { quotaService } from '../src/shared/usage/quota.service.js';

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npx tsx scripts/upgrade-user-plan-to-scale.ts <email>');
    process.exit(1);
  }

  await connectDatabase();
  await plansService.ensureDefaultPlans();

  const user = await UserModel.findOne({ email });
  if (!user || user.deletedAt) {
    throw new Error(`User not found: ${email}`);
  }

  const org = await OrganizationModel.findById(user.organizationId);
  if (!org) {
    throw new Error(`Organization not found for ${email}`);
  }

  const scale =
    (await PricingPlanModel.findOne({ code: 'scale', active: true })) ||
    (await PricingPlanModel.findOne({ name: 'Scale', active: true }));
  if (!scale) {
    throw new Error('Scale pricing plan not found');
  }

  // Ensure Huntlo 360 is on for Scale (in case an older seed left it off).
  if (scale.featureAccess?.huntlo360 !== true) {
    scale.featureAccess = { ...(scale.featureAccess ?? {}), huntlo360: true };
    await scale.save();
  }

  const previousPlan = org.plan;
  org.plan = 'Scale';
  await org.save();

  const subscription = await plansService.ensureSubscription(org._id.toHexString());
  subscription.planId = scale._id;
  if (subscription.status === 'trialing') {
    subscription.status = 'active';
  }
  await subscription.save();

  // Drop other concurrent active/trialing rows if any (should be rare).
  await WorkspaceSubscriptionModel.updateMany(
    {
      organizationId: org._id,
      _id: { $ne: subscription._id },
      status: { $in: ['active', 'trialing', 'past_due'] },
    },
    { $set: { status: 'cancelled', cancelAtPeriodEnd: true } }
  );

  const orgId = org._id.toHexString();
  const has360 = await quotaService.checkFeatureAccess(orgId, 'huntlo360');

  console.log(
    JSON.stringify(
      {
        email,
        organizationId: orgId,
        previousPlan,
        plan: org.plan,
        pricingPlanCode: scale.code,
        subscriptionId: subscription._id.toHexString(),
        subscriptionStatus: subscription.status,
        huntlo360Enabled: has360,
      },
      null,
      2
    )
  );

  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await disconnectDatabase();
  } catch {
    // ignore
  }
  process.exit(1);
});
