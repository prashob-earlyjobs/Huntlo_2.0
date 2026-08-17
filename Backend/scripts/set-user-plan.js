/**
 * Manual CLI: assign a pricing plan to a user workspace.
 *
 * Usage (from Backend/):
 *   node scripts/set-user-plan.js
 *   node scripts/set-user-plan.js neha@earlyjobs.in starter
 *
 * Standalone cmd tool — does not import app source.
 */
import dns from 'node:dns';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { config as loadDotenv } from 'dotenv';
import { MongoClient } from 'mongodb';

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: join(__dirname, '..', '.env') });

const ORG_PLANS = ['Trial', 'Starter', 'Growth', 'Scale', 'Enterprise'];
const DEFAULT_TRIAL_DAYS = 7;

function hardenDns(uri) {
  if (!uri.startsWith('mongodb+srv://')) return;
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch {
    // ignore
  }
  const preferred = ['8.8.8.8', '1.1.1.1'];
  dns.setServers([...new Set([...preferred, ...dns.getServers()])]);
}

function ask(rl, question) {
  return rl.question(question).then((value) => value.trim());
}

function toOrgPlanLabel(plan) {
  const byName = ORG_PLANS.find((name) => name.toLowerCase() === String(plan.name || '').trim().toLowerCase());
  if (byName) return byName;
  const byCode = ORG_PLANS.find((name) => name.toLowerCase() === String(plan.code || '').toLowerCase());
  if (byCode) return byCode;
  return 'Starter';
}

function periodEnd(start, plan) {
  const end = new Date(start);
  const isTrial = Boolean(plan.isTrialPlan) || plan.code === 'trial';
  if (isTrial) {
    const days = plan.trialDays > 0 ? plan.trialDays : DEFAULT_TRIAL_DAYS;
    end.setUTCDate(end.getUTCDate() + days);
    return end;
  }
  end.setUTCMonth(end.getUTCMonth() + 1);
  return end;
}

function printPlans(plans) {
  console.log('\nAvailable plans:');
  for (const plan of plans) {
    const flags = [plan.active ? null : 'inactive', plan.isTrialPlan ? 'trial' : null].filter(Boolean);
    const suffix = flags.length ? `  (${flags.join(', ')})` : '';
    console.log(`  ${String(plan.code).padEnd(14)} ${plan.name}${suffix}`);
  }
  console.log('');
}

function currentPlanLabel(orgPlan, pricingPlan) {
  if (pricingPlan) return `${pricingPlan.name} (${pricingPlan.code})`;
  return orgPlan || 'unknown';
}

async function applyPlan({ db, email, userId, organizationId, orgPlanBefore, plan }) {
  const orgPlan = toOrgPlanLabel(plan);
  const isTrial = Boolean(plan.isTrialPlan) || plan.code === 'trial';
  const now = new Date();
  const end = periodEnd(now, plan);
  const status = isTrial ? 'trialing' : 'active';

  const subs = db.collection('workspacesubscriptions');
  const existingSub = await subs.findOne(
    {
      organizationId,
      status: { $in: ['active', 'trialing', 'past_due', 'incomplete'] },
    },
    { sort: { updatedAt: -1 } }
  );

  const planIdBefore = existingSub?.planId ?? null;
  const beforePlan = planIdBefore
    ? await db.collection('pricingplans').findOne({ _id: planIdBefore })
    : null;

  const subFields = {
    planId: plan._id,
    billingProvider: 'manual',
    billingCycle: 'monthly',
    status,
    currentPeriodStart: now,
    currentPeriodEnd: end,
    cancelAtPeriodEnd: false,
    updatedAt: now,
  };

  let savedId;
  if (existingSub) {
    await subs.updateOne({ _id: existingSub._id }, { $set: subFields });
    savedId = existingSub._id;
  } else {
    const created = await subs.insertOne({
      organizationId,
      ...subFields,
      providerCustomerId: null,
      providerSubscriptionId: null,
      createdAt: now,
    });
    savedId = created.insertedId;
  }

  await subs.updateMany(
    {
      organizationId,
      _id: { $ne: savedId },
      status: { $in: ['active', 'trialing', 'past_due', 'incomplete'] },
    },
    { $set: { status: 'cancelled', cancelAtPeriodEnd: true, updatedAt: now } }
  );

  await db.collection('organizations').updateOne({ _id: organizationId }, { $set: { plan: orgPlan, updatedAt: now } });
  await db.collection('users').updateMany(
    { organizationId, deletedAt: null },
    { $set: { planId: plan._id, updatedAt: now } }
  );

  await db.collection('planhistories').insertOne({
    organizationId,
    userId,
    planIdBefore,
    planIdAfter: plan._id,
    planCodeBefore: beforePlan?.code ?? (String(orgPlanBefore || '').toLowerCase() || null),
    planCodeAfter: plan.code,
    performedBy: userId,
    paymentOrderId: null,
    reason: 'manual_cli',
    createdAt: now,
    updatedAt: now,
  });

  return {
    email,
    organizationId: String(organizationId),
    previousOrgPlan: orgPlanBefore,
    previousPlanCode: beforePlan?.code ?? null,
    plan: orgPlan,
    pricingPlanCode: plan.code,
    pricingPlanName: plan.name,
    subscriptionStatus: status,
    periodEnd: end.toISOString(),
  };
}

async function main() {
  const argvEmail = (process.argv[2] || '').trim();
  const argvPlan = (process.argv[3] || '').trim();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set (check Backend/.env).');
  }

  const rl = createInterface({ input, output });
  hardenDns(uri);
  const client = new MongoClient(uri, { family: 4, serverSelectionTimeoutMS: 10_000 });

  try {
    console.log('\nHuntlo plan updater (manual CLI)\n');

    const emailRaw = argvEmail || (await ask(rl, 'Email: '));
    if (!emailRaw.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    const email = emailRaw.toLowerCase();

    await client.connect();
    const db = client.db();

    const user = await db.collection('users').findOne({ email, deletedAt: null });
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    const org = await db.collection('organizations').findOne({ _id: user.organizationId, deletedAt: null });
    if (!org) {
      throw new Error(`No organization found for email: ${email}`);
    }

    const subscription = await db.collection('workspacesubscriptions').findOne(
      {
        organizationId: org._id,
        status: { $in: ['active', 'trialing', 'past_due', 'incomplete'] },
      },
      { sort: { updatedAt: -1 } }
    );

    const pricingPlan = subscription?.planId
      ? await db.collection('pricingplans').findOne({ _id: subscription.planId })
      : user.planId
        ? await db.collection('pricingplans').findOne({ _id: user.planId })
        : null;

    const current = currentPlanLabel(org.plan, pricingPlan);
    console.log(
      `\nFound ${user.firstName} ${user.lastName} <${email}>\n` +
        `  org:    ${org.name}\n` +
        `  plan:   ${current}\n` +
        `  status: ${subscription?.status ?? 'none'}\n`
    );

    const plans = await db.collection('pricingplans').find({}).sort({ sortOrder: 1, name: 1 }).toArray();
    if (plans.length === 0) {
      throw new Error('No pricing plans exist in the database.');
    }
    printPlans(plans);

    const planRaw = argvPlan || (await ask(rl, 'To plan (code or name): '));
    const needle = planRaw.trim().toLowerCase();
    if (!needle) {
      throw new Error('Plan is required (code or name, e.g. starter).');
    }
    const plan =
      plans.find((item) => String(item.code).toLowerCase() === needle) ||
      plans.find((item) => String(item.name).trim().toLowerCase() === needle);
    if (!plan) {
      throw new Error(
        `No plan found for "${planRaw}". Use a code from the list (trial, starter, growth, scale, enterprise).`
      );
    }

    const confirm = await ask(rl, `Update ${email} from ${current} → ${plan.name} (${plan.code})? [y/N] `);
    if (!['y', 'yes'].includes(confirm.toLowerCase())) {
      console.log('Cancelled.');
      return;
    }

    const result = await applyPlan({
      db,
      email,
      userId: user._id,
      organizationId: org._id,
      orgPlanBefore: org.plan,
      plan,
    });

    console.log('\nUpdated:');
    console.log(JSON.stringify(result, null, 2));
  } finally {
    rl.close();
    await client.close().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
