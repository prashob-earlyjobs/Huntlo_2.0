export const TEMPLATE_TYPES = [
  "Email",
  "WhatsApp",
  "Voice Script",
  "Qualification Questions",
  "Scheduling Message",
] as const;

export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export interface OutreachTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string | null;
  body: string;
  owner: string;
  updated: string;
  usedInCampaigns: number;
  archived: boolean;
  /** Live API fields (optional for mocks). */
  channel?: string;
  category?: string;
  status?: string;
  variables?: string[];
  generation?: {
    isDraft: boolean;
    action: string | null;
    model: string | null;
    generatedAt: string | null;
    summary: string | null;
  } | null;
}

export const TEMPLATES: OutreachTemplate[] = [
  {
    id: "tpl-1",
    name: "Intro — role pitch (short)",
    type: "Email",
    subject: "Quick question about your next role, {{first_name}}",
    body: "Hi {{first_name}},\n\nI came across your work at {{company_name}} and think you'd be a great fit for our {{job_title}} role in {{location}}.\n\nOpen to a quick chat this week?\n\nBest,\n{{recruiter_name}}",
    owner: "Ananya Sharma",
    updated: "2d ago",
    usedInCampaigns: 4,
    archived: false,
  },
  {
    id: "tpl-2",
    name: "Intro — role pitch (detailed)",
    type: "Email",
    subject: "{{job_title}} at Victaman — why you specifically",
    body: "Hi {{first_name}},\n\nI'll keep this concrete. We're hiring a {{job_title}} and three things about your profile stood out:\n\n1. Your work at {{company_name}}\n2. Your ownership of production systems\n3. Your location fit for {{location}}\n\nThe team is 12 engineers, ships weekly, and the comp band is competitive. Worth a 20-minute call?\n\n{{recruiter_name}}",
    owner: "Ananya Sharma",
    updated: "1w ago",
    usedInCampaigns: 2,
    archived: false,
  },
  {
    id: "tpl-3",
    name: "Follow-up — gentle nudge",
    type: "WhatsApp",
    subject: null,
    body: "Hi {{first_name}}, just following up on my email about the {{job_title}} role — happy to share details here if that's easier. – {{recruiter_name}}",
    owner: "Neha Gupta",
    updated: "3d ago",
    usedInCampaigns: 5,
    archived: false,
  },
  {
    id: "tpl-4",
    name: "Follow-up — final check-in",
    type: "WhatsApp",
    subject: null,
    body: "Hi {{first_name}}, closing the loop on the {{job_title}} role. If the timing isn't right, no worries — should I check back in a few months?",
    owner: "Neha Gupta",
    updated: "2w ago",
    usedInCampaigns: 3,
    archived: false,
  },
  {
    id: "tpl-5",
    name: "Voice — screening script v2",
    type: "Voice Script",
    subject: null,
    body: "Introduce yourself as the AI assistant for {{recruiter_name}} at {{company_name}}. Confirm the candidate has 2 minutes. Cover: interest in {{job_title}}, notice period, expected compensation, and preferred work mode in {{location}}. Close by offering a recruiter call slot.",
    owner: "Rohan Desai",
    updated: "5d ago",
    usedInCampaigns: 2,
    archived: false,
  },
  {
    id: "tpl-6",
    name: "Backend hiring — knockout set",
    type: "Qualification Questions",
    subject: null,
    body: "1. What is your notice period in days? (Number · knockout if > 60)\n2. Are you open to hybrid from {{location}}? (Yes/No · knockout if No)\n3. What is your expected annual compensation? (Short text)\n4. Years of production experience with distributed systems? (Number)",
    owner: "Ananya Sharma",
    updated: "1w ago",
    usedInCampaigns: 3,
    archived: false,
  },
  {
    id: "tpl-7",
    name: "Scheduling — Calendly invite",
    type: "Scheduling Message",
    channel: "email",
    category: "scheduling",
    subject: null,
    body: "Great news {{first_name}} — you're through to the next step for {{job_title}}! {{scheduling_details}}",
    owner: "Rohan Desai",
    updated: "4d ago",
    usedInCampaigns: 6,
    archived: false,
  },
  {
    id: "tpl-8",
    name: "2025 intro — old branding",
    type: "Email",
    subject: "Opportunity at Victaman",
    body: "Hi {{first_name}}, we have an exciting opportunity…",
    owner: "Rohan Desai",
    updated: "6mo ago",
    usedInCampaigns: 0,
    archived: true,
  },
];
