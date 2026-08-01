import mongoose from 'mongoose';

/** All editable template categories (drip sequences + one-shot events). */
export const EMAIL_TEMPLATE_TYPES = ['post_signup', 'event'] as const;
export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

/** Sequence enrollments only — subset of template types. */
export const EMAIL_SEQUENCE_TYPES = ['post_signup'] as const;
export type EmailSequenceType = (typeof EMAIL_SEQUENCE_TYPES)[number];

export const POST_SIGNUP_STEP_COUNT = 8;

const emailTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    type: {
      type: String,
      enum: EMAIL_TEMPLATE_TYPES,
      required: true,
      index: true,
    },
    dayOffset: { type: Number, required: true, min: 0, max: 30 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 300 },
    bodyHtml: { type: String, default: '', maxlength: 100_000 },
    bodyText: { type: String, default: '', maxlength: 50_000 },
    enabled: { type: Boolean, default: true },
    updatedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

emailTemplateSchema.index({ type: 1, dayOffset: 1 }, { unique: true });

export type EmailTemplateDocument = mongoose.InferSchemaType<typeof emailTemplateSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const EmailTemplateModel = (mongoose.models.EmailTemplate ??
  mongoose.model('EmailTemplate', emailTemplateSchema)) as mongoose.Model<EmailTemplateDocument>;

export function toPublicEmailTemplate(doc: EmailTemplateDocument) {
  return {
    id: doc._id.toHexString(),
    key: doc.key,
    type: doc.type as EmailTemplateType,
    dayOffset: doc.dayOffset,
    name: doc.name,
    subject: doc.subject,
    bodyHtml: doc.bodyHtml || '',
    bodyText: doc.bodyText || '',
    enabled: Boolean(doc.enabled),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export type PublicEmailTemplate = ReturnType<typeof toPublicEmailTemplate>;

type TemplateDefault = {
  key: string;
  type: EmailTemplateType;
  dayOffset: number;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  enabled: boolean;
};

/** Predefined post-signup drip steps (content editable; timing fixed). */
export const POST_SIGNUP_TEMPLATE_DEFAULTS: TemplateDefault[] = [
  {
    key: 'post_signup.day_0',
    type: 'post_signup',
    dayOffset: 0,
    name: 'Day 0 — Welcome',
    subject: "Let's find your first candidate today.",
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Welcome to Huntlo.</p>',
      '<p>You\'re one step closer to simplifying your hiring workflow.</p>',
      '<p>The fastest way to experience Huntlo is simple:</p>',
      '<p>✓ Describe who you\'re hiring<br/>✓ Review AI-matched candidates<br/>✓ Launch your first outreach campaign</p>',
      '<p>Let\'s get your first candidate conversation started.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Start Hiring &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Welcome to Huntlo.',
      '',
      "You're one step closer to simplifying your hiring workflow.",
      '',
      'The fastest way to experience Huntlo is simple:',
      '',
      "✓ Describe who you're hiring",
      '✓ Review AI-matched candidates',
      '✓ Launch your first outreach campaign',
      '',
      "Let's get your first candidate conversation started.",
      '',
      'Start Hiring →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'post_signup.day_1',
    type: 'post_signup',
    dayOffset: 1,
    name: 'Day 1 — First search nudge',
    subject: 'Stop searching with filters. Start hiring with intent.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Instead of writing:</p>',
      '<p>Backend<br/>AND<br/>Node<br/>NOT<br/>PHP</p>',
      '<p>Simply describe your ideal hire.</p>',
      '<p>Example</p>',
      '<p>Backend Engineer<br/>3–5 Years<br/>Bangalore<br/>Node.js<br/>Startup Experience</p>',
      '<p>We\'ll do the rest.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Start AI Search &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Instead of writing:',
      '',
      'Backend',
      'AND',
      'Node',
      'NOT',
      'PHP',
      '',
      'Simply describe your ideal hire.',
      '',
      'Example',
      '',
      'Backend Engineer',
      '3–5 Years',
      'Bangalore',
      'Node.js',
      'Startup Experience',
      '',
      "We'll do the rest.",
      '',
      'Start AI Search →',
      'https://www.huntlo.ai',
    ].join('\n'),
    // Replaced by event.no_search (2h cool-off after first login).
    enabled: false,
  },
  {
    key: 'post_signup.day_2',
    type: 'post_signup',
    dayOffset: 2,
    name: 'Day 2 — People Scout nudge',
    subject: 'Found someone on LinkedIn?',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Found someone on LinkedIn?</p>',
      '<p>Paste their profile into Huntlo and instantly reveal verified contact details.</p>',
      '<p>No switching tools.<br/>No manual research.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Try People Scout &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Found someone on LinkedIn?',
      '',
      'Paste their profile into Huntlo and instantly reveal verified contact details.',
      '',
      'No switching tools.',
      'No manual research.',
      '',
      'Try People Scout →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: false,
  },
  {
    key: 'post_signup.day_3',
    type: 'post_signup',
    dayOffset: 3,
    name: 'Day 3 — Social proof (staffing)',
    subject: 'Recruitment agencies spend most of their time finding people — not recruiting',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p><strong>Recruitment agencies spend most of their time:</strong></p>',
      '<p>Finding people<br/>Following up<br/>Managing conversations</p>',
      '<p>Not actually recruiting.</p>',
      '<p>Huntlo was built to change that.</p>',
      '<p>Launch your first outreach campaign today and let Huntlo handle the follow-ups.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Launch outreach campaign &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Recruitment agencies spend most of their time:',
      '',
      'Finding people',
      'Following up',
      'Managing conversations',
      '',
      'Not actually recruiting.',
      '',
      'Huntlo was built to change that.',
      '',
      'Launch your first outreach campaign today and let Huntlo handle the follow-ups.',
      '',
      'Launch outreach campaign →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: false,
  },
  {
    key: 'post_signup.day_4',
    type: 'post_signup',
    dayOffset: 4,
    name: 'Day 4 — Campaigns',
    subject: "The best candidates don't wait.",
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>The best candidates don\'t wait.</p>',
      '<p>Here\'s what usually happens.</p>',
      '<p>Candidate identified<br/>↓<br/>Follow-up delayed<br/>↓<br/>Opportunity missed.</p>',
      '<p>With Huntlo you can launch Email and WhatsApp outreach in minutes while AI handles the follow-ups.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Launch Campaign &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      "The best candidates don't wait.",
      '',
      "Here's what usually happens.",
      '',
      'Candidate identified',
      '↓',
      'Follow-up delayed',
      '↓',
      'Opportunity missed.',
      '',
      'With Huntlo you can launch Email and WhatsApp outreach in minutes while AI handles the follow-ups.',
      '',
      'Launch Campaign →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: false,
  },
  {
    key: 'post_signup.day_5',
    type: 'post_signup',
    dayOffset: 5,
    name: 'Day 5 — AI magic moment',
    subject: '142 candidates. 34 replies. 5 interviews. Without chasing follow-ups.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Imagine this.</p>',
      '<p>142 candidates sourced.<br/>↓<br/>34 replies.<br/>↓<br/>12 interested.<br/>↓<br/>5 interviews.<br/>↓<br/>Without chasing follow-ups.</p>',
      '<p>That\'s what we\'re building Huntlo for.</p>',
      '<p>Let\'s help you get there.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Get started &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Imagine this.',
      '',
      '142 candidates sourced.',
      '↓',
      '34 replies.',
      '↓',
      '12 interested.',
      '↓',
      '5 interviews.',
      '↓',
      'Without chasing follow-ups.',
      '',
      "That's what we're building Huntlo for.",
      '',
      "Let's help you get there.",
      '',
      'Get started →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: false,
  },
  {
    key: 'post_signup.day_6',
    type: 'post_signup',
    dayOffset: 6,
    name: 'Day 6 — 48 hours left',
    subject: "You're almost there.",
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>You\'re almost there.</p>',
      '<p>Before your trial ends, complete these milestones.</p>',
      '<p>✓ AI Search<br/>✓ Candidate Unlock<br/>✓ Campaign<br/>✓ First Reply<br/>✓ AI Voice</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Continue exploring &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      "You're almost there.",
      '',
      'Before your trial ends, complete these milestones.',
      '',
      '✓ AI Search',
      '✓ Candidate Unlock',
      '✓ Campaign',
      '✓ First Reply',
      '✓ AI Voice',
      '',
      'Continue exploring →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'post_signup.day_7',
    type: 'post_signup',
    dayOffset: 7,
    name: 'Day 7 — Last day',
    subject: 'Your Huntlo trial ends today.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>You\'ve experienced a new way to hire.</p>',
      '<p>Less searching.<br/>Less follow-ups.<br/>More conversations.</p>',
      '<p>Continue building your hiring workflows.</p>',
      '<p><a href="https://www.huntlo.ai" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;">Upgrade &rarr;</a></p>',
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      "You've experienced a new way to hire.",
      '',
      'Less searching.',
      'Less follow-ups.',
      'More conversations.',
      '',
      'Continue building your hiring workflows.',
      '',
      'Upgrade →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
];

const CTA_STYLE =
  'display:inline-block;padding:12px 20px;background-color:#0866fc;color:#ffffff;text-decoration:none;font-family:Arial, Helvetica, sans-serif;font-size:14px;font-weight:bold;border:0;';

function cta(label: string, href = 'https://www.huntlo.ai'): string {
  return `<p><a href="${href}" target="_blank" rel="noopener noreferrer" style="${CTA_STYLE}">${label}</a></p>`;
}

/** One-shot product-event emails (editable; triggered by app events). dayOffset must be unique within type=event. */
export const EVENT_TEMPLATE_DEFAULTS: TemplateDefault[] = [
  {
    key: 'event.first_search_completed',
    type: 'event',
    dayOffset: 0,
    name: 'Search completed · unlock nudge',
    subject: 'Your shortlist is ready.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Great start.</p>',
      '<p>Now unlock a profile to view verified contact details and continue your hiring workflow.</p>',
      cta('Unlock Candidate &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Great start.',
      '',
      'Now unlock a profile to view verified contact details and continue your hiring workflow.',
      '',
      'Unlock Candidate →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.no_search',
    type: 'event',
    dayOffset: 1,
    name: 'No search · cool-off nudge',
    subject: 'Stop searching with filters. Start hiring with intent.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Instead of writing:</p>',
      '<p>Backend<br/>AND<br/>Node<br/>NOT<br/>PHP</p>',
      '<p>Simply describe your ideal hire.</p>',
      '<p>Example</p>',
      '<p>Backend Engineer<br/>3–5 Years<br/>Bangalore<br/>Node.js<br/>Startup Experience</p>',
      '<p>We\'ll do the rest.</p>',
      cta('Start AI Search &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Instead of writing:',
      '',
      'Backend',
      'AND',
      'Node',
      'NOT',
      'PHP',
      '',
      'Simply describe your ideal hire.',
      '',
      'Example',
      '',
      'Backend Engineer',
      '3–5 Years',
      'Bangalore',
      'Node.js',
      'Startup Experience',
      '',
      "We'll do the rest.",
      '',
      'Start AI Search →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.campaign_draft',
    type: 'event',
    dayOffset: 2,
    name: 'Campaign draft · launch nudge',
    subject: 'Your campaign is almost ready.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Don\'t let great candidates wait.</p>',
      '<p>Review and launch your campaign today.</p>',
      cta('Launch Campaign &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      "Don't let great candidates wait.",
      '',
      'Review and launch your campaign today.',
      '',
      'Launch Campaign →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.campaign_live',
    type: 'event',
    dayOffset: 3,
    name: 'Campaign live · confirmation',
    subject: 'Your campaign is live.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>We\'ll automatically reach out to candidates while you focus on hiring.</p>',
      '<p>We\'ll notify you as replies arrive.</p>',
      cta('View Campaign &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      "We'll automatically reach out to candidates while you focus on hiring.",
      '',
      "We'll notify you as replies arrive.",
      '',
      'View Campaign →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.no_replies',
    type: 'event',
    dayOffset: 4,
    name: 'No replies · optimize nudge',
    subject: "Let's improve your response rate.",
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Small improvements in messaging can increase candidate engagement.</p>',
      '<p>Review your campaign and continue hiring.</p>',
      cta('Optimize Campaign &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Small improvements in messaging can increase candidate engagement.',
      '',
      'Review your campaign and continue hiring.',
      '',
      'Optimize Campaign →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.first_reply',
    type: 'event',
    dayOffset: 5,
    name: 'First reply · habit loop',
    subject: 'Someone replied.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Great news.</p>',
      '<p>Continue the conversation inside Huntlo.</p>',
      cta('Open Conversation &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Great news.',
      '',
      'Continue the conversation inside Huntlo.',
      '',
      'Open Conversation →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
  {
    key: 'event.try_ai_voice',
    type: 'event',
    dayOffset: 6,
    name: 'Try AI Voice · cool-off nudge',
    subject: 'Let AI qualify candidates for you.',
    bodyHtml: [
      '<p>Hi {{firstName}},</p>',
      '<p>Instead of scheduling every screening call manually,</p>',
      '<p>let Huntlo\'s AI Voice Recruiter handle the first conversation.</p>',
      cta('Try AI Voice &rarr;'),
    ].join(''),
    bodyText: [
      'Hi {{firstName}},',
      '',
      'Instead of scheduling every screening call manually,',
      "let Huntlo's AI Voice Recruiter handle the first conversation.",
      '',
      'Try AI Voice →',
      'https://www.huntlo.ai',
    ].join('\n'),
    enabled: true,
  },
];

export const ALL_EMAIL_TEMPLATE_DEFAULTS: TemplateDefault[] = [
  ...POST_SIGNUP_TEMPLATE_DEFAULTS,
  ...EVENT_TEMPLATE_DEFAULTS,
];
