/**
 * Outreach combo smoke test — standalone JS. Does NOT modify any app source files.
 *
 * Prerequisites (already running):
 *   - API:   npm run dev
 *   - Worker: npm run worker
 *   - Redis:  redis-server
 *   - Connected Email / WhatsApp / Voice integrations
 *
 * Usage (from Backend/):
 *   node scripts/outreach-combo-smoke.js
 *
 * Edit the HARDCODED CONFIG block below before running.
 */

/* ------------------------------------------------------------------ */
/* HARDCODED CONFIG — edit these                                        */
/* ------------------------------------------------------------------ */

const API = 'http://127.0.0.1:4000';

/** Huntlo workspace account that owns integrations / launches campaigns */
const LOGIN_EMAIL = 'pmgokul7@gmail.com';
const LOGIN_PASSWORD = 'Admin@123';

/** Recipient for smoke sends */
const TARGET_NAME = 'Gokul';
const TARGET_EMAIL = 'pmgokul7@gmail.com';
const TARGET_PHONE = '918592929642';

/** "all" or comma list of combo ids (see ALL_COMBOS below) */
const COMBOS_RAW = 'all';
/** true = create campaigns + audience only, skip launch */
const DRY_RUN = false;

/** Pause between launches (ms) */
const STAGGER_MS = 4000;

/** Approved Meta template ids used for WhatsApp steps */
const WA_OPENING = 'opening_message_01';
const WA_FOLLOWUP = 'recruitment_update_reminder_v1';

/* ------------------------------------------------------------------ */

const ALL_COMBOS = [
  // {
  //   id: 'single-email',
  //   label: 'Single · Email',
  //   campaignType: 'single_channel',
  //   channels: ['email'],
  //   steps: [
  //     {
  //       type: 'email',
  //       delayMinutes: 0,
  //       subject: '[SMOKE] Single Email — {{FirstName}}',
  //       body:
  //         'Hi {{FirstName}},\n\nThis is a Huntlo smoke-test email (single channel).\nPlease reply "Yes interested" so AI qualification can fire.\n\n— Huntlo Smoke',
  //     },
  //   ],
  //   enableQualification: true,
  // },
  {
    id: 'single-whatsapp',
    label: 'Single · WhatsApp',
    campaignType: 'single_channel',
    channels: ['whatsapp'],
    steps: [
      {
        type: 'whatsapp',
        delayMinutes: 0,
        templateId: WA_OPENING,
        body: null,
      },
    ],
    enableQualification: true,
  },
  // {
  //   id: 'single-whatsapp-multi',
  //   label: 'Single · WhatsApp (multi-step / follow-ups)',
  //   campaignType: 'single_channel',
  //   channels: ['whatsapp'],
  //   steps: [
  //     { type: 'whatsapp', delayMinutes: 0, templateId: WA_OPENING },
  //     { type: 'whatsapp', delayMinutes: 2, templateId: WA_FOLLOWUP },
  //   ],
  //   enableQualification: true,
  // },
  // {
  //   id: 'single-voice',
  //   label: 'Single · AI Voice',
  //   campaignType: 'single_channel',
  //   channels: ['ai_voice'],
  //   steps: [
  //     {
  //       type: 'ai_voice',
  //       delayMinutes: 0,
  //       body: 'Smoke-test AI voice dial for {{FirstName}} — NodeJS Developer role.',
  //     },
  //   ],
  //   enableQualification: false,
  // },
  // {
  //   id: 'multi-email-whatsapp',
  //   label: 'Multi · Email + WhatsApp',
  //   campaignType: 'multi_channel',
  //   channels: ['email', 'whatsapp'],
  //   steps: [
  //     {
  //       type: 'email',
  //       delayMinutes: 0,
  //       subject: '[SMOKE] Multi Email+WA — {{FirstName}}',
  //       body: 'Hi {{FirstName}},\n\nSmoke multi-channel step 1 (email). Reply to continue.\n',
  //     },
  //     { type: 'whatsapp', delayMinutes: 2, templateId: WA_FOLLOWUP },
  //   ],
  //   enableQualification: true,
  // },
  // {
  //   id: 'multi-email-voice',
  //   label: 'Multi · Email + AI Voice',
  //   campaignType: 'multi_channel',
  //   channels: ['email', 'ai_voice'],
  //   steps: [
  //     {
  //       type: 'email',
  //       delayMinutes: 0,
  //       subject: '[SMOKE] Multi Email+Voice — {{FirstName}}',
  //       body: 'Hi {{FirstName}},\n\nSmoke multi-channel email before voice.\n',
  //     },
  //     {
  //       type: 'ai_voice',
  //       delayMinutes: 2,
  //       body: 'Smoke voice follow-up for {{FirstName}}.',
  //     },
  //   ],
  //   enableQualification: true,
  // },
  // {
  //   id: 'multi-whatsapp-voice',
  //   label: 'Multi · WhatsApp + AI Voice',
  //   campaignType: 'multi_channel',
  //   channels: ['whatsapp', 'ai_voice'],
  //   steps: [
  //     { type: 'whatsapp', delayMinutes: 0, templateId: WA_OPENING },
  //     {
  //       type: 'ai_voice',
  //       delayMinutes: 2,
  //       body: 'Smoke voice after WhatsApp for {{FirstName}}.',
  //     },
  //   ],
  //   enableQualification: true,
  // },
  // {
  //   id: 'multi-all',
  //   label: 'Multi · Email + WhatsApp + AI Voice',
  //   campaignType: 'multi_channel',
  //   channels: ['email', 'whatsapp', 'ai_voice'],
  //   steps: [
  //     {
  //       type: 'email',
  //       delayMinutes: 0,
  //       subject: '[SMOKE] Multi All — {{FirstName}}',
  //       body: 'Hi {{FirstName}},\n\nSmoke all-channels opener (email).\n',
  //     },
  //     { type: 'whatsapp', delayMinutes: 2, templateId: WA_FOLLOWUP },
  //     {
  //       type: 'ai_voice',
  //       delayMinutes: 4,
  //       body: 'Smoke final voice step for {{FirstName}}.',
  //     },
  //   ],
  //   enableQualification: true,
  // },
];

/* ------------------------------------------------------------------ */
/* HTTP helpers                                                         */
/* ------------------------------------------------------------------ */

let accessToken = '';
let organizationId = '';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(method, pathName, body) {
  const headers = {
    Accept: 'application/json',
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (organizationId) headers['X-Workspace-Id'] = organizationId;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API}/api/v1${pathName}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (json && json.error && json.error.message) ||
      `HTTP ${res.status} ${method} ${pathName}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json;
    throw err;
  }

  return json.data;
}

/* ------------------------------------------------------------------ */
/* Domain helpers                                                       */
/* ------------------------------------------------------------------ */

function selectedCombos() {
  if (!COMBOS_RAW || COMBOS_RAW === 'all') return ALL_COMBOS;
  const wanted = new Set(
    COMBOS_RAW.split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const picked = ALL_COMBOS.filter((c) => wanted.has(c.id));
  if (!picked.length) {
    throw new Error(
      `No combos matched COMBOS_RAW=${COMBOS_RAW}. Valid ids:\n` +
        ALL_COMBOS.map((c) => `  - ${c.id}`).join('\n')
    );
  }
  return picked;
}

function channelConfig(channels) {
  return {
    email: { enabled: channels.includes('email') },
    whatsapp: { enabled: channels.includes('whatsapp') },
    ai_voice: { enabled: channels.includes('ai_voice') },
    timezone: 'Asia/Kolkata',
  };
}

function sequenceSteps(combo) {
  return combo.steps.map((step, index) => ({
    id: `smoke-${combo.id}-${index + 1}`,
    order: index,
    type: step.type,
    delayDays: step.delayMinutes,
    delayUnit: 'minutes',
    templateId: step.templateId ?? null,
    subject: step.subject ?? null,
    body: step.body ?? null,
    stopOnReply: true,
    note: null,
    sendWindow: null,
  }));
}

function qualificationConfig(enabled) {
  if (!enabled) {
    return {
      enabled: false,
      questions: [],
      aiReplyEnabled: false,
      autoScreening: false,
    };
  }
  return {
    enabled: true,
    aiReplyEnabled: true,
    autoScreening: false,
    takeoverCondition: null,
    questions: [
      {
        id: 'q-notice',
        title: 'Notice period',
        prompt: 'What is your notice period (in days)?',
        answerType: 'number',
        knockout: false,
        knockoutCondition: null,
      },
      {
        id: 'q-location',
        title: 'Location',
        prompt: 'Are you open to working from Bengaluru (hybrid)?',
        answerType: 'yes_no',
        knockout: true,
        knockoutCondition: 'reject if no',
      },
      {
        id: 'q-lpa',
        title: 'Expected CTC',
        prompt: 'What is your expected CTC in LPA (lakhs per annum)?',
        answerType: 'number',
        knockout: true,
        knockoutCondition: 'more than 5',
      },
    ],
  };
}

async function login() {
  const data = await api('POST', '/auth/login', {
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
  });
  accessToken = data.accessToken;
  organizationId = (data.organization && data.organization.id) || '';
  if (!accessToken) throw new Error('Login succeeded but no accessToken returned');
  console.log(`✓ Logged in as ${LOGIN_EMAIL} (org ${organizationId || 'from JWT'})`);
}

async function upsertTargetCandidate() {
  const listed = await api(
    'GET',
    `/candidate-pool?limit=50&search=${encodeURIComponent(TARGET_EMAIL || TARGET_PHONE || TARGET_NAME)}`
  );
  const items = Array.isArray(listed) ? listed : listed.items || [];
  const existing = items.find((row) => {
    const email = String(row.email || '').toLowerCase();
    const phone = String(row.phone || '').replace(/\D/g, '');
    const targetPhone = TARGET_PHONE.replace(/\D/g, '');
    return (
      (TARGET_EMAIL && email === TARGET_EMAIL.toLowerCase()) ||
      (targetPhone && phone.endsWith(targetPhone.slice(-10)))
    );
  });

  if (existing && existing.id) {
    await api('PATCH', `/candidate-pool/${existing.id}`, {
      name: TARGET_NAME,
      email: TARGET_EMAIL || null,
      phone: TARGET_PHONE || null,
      currentTitle: 'Smoke Test Role',
      currentCompany: 'Smoke Co',
    }).catch(() => undefined);
    console.log(`✓ Using existing candidate ${existing.id}`);
    return existing.id;
  }

  const created = await api('POST', '/candidate-pool', {
    name: TARGET_NAME,
    email: TARGET_EMAIL || null,
    phone: TARGET_PHONE || null,
    currentTitle: 'Smoke Test Role',
    currentCompany: 'Smoke Co',
    sourceType: 'manual',
    tags: ['smoke-test'],
  });
  console.log(`✓ Created candidate ${created.id}`);
  return created.id;
}

async function runCombo(combo, candidateId) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = `[SMOKE] ${combo.label} · ${stamp}`;

  console.log(`\n→ ${combo.label}`);

  const campaign = await api('POST', '/outreach-campaigns', {
    name,
    description: `Standalone smoke test — ${combo.id}. Safe to delete.`,
    objective: 'Smoke verification of outbound + AI replies',
    campaignType: combo.campaignType,
    channelConfig: channelConfig(combo.channels),
    sequenceSteps: sequenceSteps(combo),
    qualificationConfig: qualificationConfig(combo.enableQualification),
    candidateSource: {
      type: 'manual',
      candidateIds: [candidateId],
    },
  });

  console.log(`  campaign ${campaign.id} created`);

  await api('POST', `/outreach-campaigns/${campaign.id}/audience`, {
    candidateIds: [candidateId],
    replace: true,
  });
  console.log(`  audience attached`);

  if (DRY_RUN) {
    console.log(`  DRY_RUN — skipped launch`);
    return { combo: combo.id, campaignId: campaign.id, launched: false };
  }

  try {
    const launched = await api('POST', `/outreach-campaigns/${campaign.id}/launch`);
    console.log(`  launched (status=${launched.status || 'ok'})`);
    return { combo: combo.id, campaignId: campaign.id, launched: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  LAUNCH FAILED: ${message}`);
    if (err && typeof err === 'object' && err.body) {
      console.error(`  details:`, JSON.stringify(err.body, null, 2));
    }
    return {
      combo: combo.id,
      campaignId: campaign.id,
      launched: false,
      error: message,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Huntlo outreach combo smoke test (standalone JS)');
  console.log('═══════════════════════════════════════════════════');
  console.log(` API:     ${API}`);
  console.log(` Target:  ${TARGET_NAME} <${TARGET_EMAIL}> ${TARGET_PHONE}`);
  console.log(` Dry run: ${DRY_RUN}`);
  console.log(` Combos:  ${COMBOS_RAW}`);

  if (!LOGIN_EMAIL || !LOGIN_PASSWORD || LOGIN_PASSWORD === 'YOUR_PASSWORD_HERE') {
    throw new Error(
      'Edit HARDCODED CONFIG at the top of scripts/outreach-combo-smoke.js — set LOGIN_EMAIL and LOGIN_PASSWORD.'
    );
  }
  if (!TARGET_EMAIL && !TARGET_PHONE) {
    throw new Error('Set TARGET_EMAIL and/or TARGET_PHONE in the HARDCODED CONFIG block.');
  }

  const combos = selectedCombos();
  console.log(
    ` Running ${combos.length} combo(s):\n` +
      combos.map((c) => `   • ${c.id} — ${c.label}`).join('\n')
  );

  await login();
  const candidateId = await upsertTargetCandidate();

  const results = [];

  for (let i = 0; i < combos.length; i += 1) {
    const combo = combos[i];
    const result = await runCombo(combo, candidateId);
    results.push(result);
    if (i < combos.length - 1 && STAGGER_MS > 0) {
      await sleep(STAGGER_MS);
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(' Summary');
  console.log('═══════════════════════════════════════════════════');
  for (const row of results) {
    const mark = row.launched ? '✓' : row.error ? '✗' : '○';
    console.log(
      ` ${mark} ${row.combo}  campaign=${row.campaignId}` +
        (row.error ? `  (${row.error})` : '')
    );
  }
  console.log(`
Next:
  1. Keep \`npm run worker\` running (BullMQ processes sends).
  2. Check inbox / WhatsApp / voice provider for the target contact.
  3. Reply to email/WA with "Yes interested" to exercise AI qualification.
  4. Admin → Worker tasks (BullMQ) for queue status.
  5. Delete [SMOKE] campaigns when done.
`);

  const failed = results.filter((r) => r.error);
  if (failed.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error('\nSmoke test aborted:', err instanceof Error ? err.message : err);
  process.exit(1);
});
