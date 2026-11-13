import { SOLUTIONS_NAV_ITEMS, type SolutionsNavItem } from "@/lib/solutionsNav";

export type SolutionMetric = {
  value: string;
  label: string;
};

export type SolutionWorkflowStep = {
  title: string;
  description: string;
};

export type SolutionHeroPreviewItem = {
  icon: string;
  text: string;
};

export type SolutionHeroPreview = {
  label: string;
  icon: string;
  title: string;
  items: SolutionHeroPreviewItem[];
  activeCampaigns: string;
};

export type SolutionFaqItem = {
  question: string;
  answer: string;
};

export type SolutionPageData = SolutionsNavItem & {
  /** SEO H1 — defaults to `title` when omitted. */
  h1?: string;
  /** Breadcrumb / hero segment label — defaults to `title` without the "For " prefix. */
  breadcrumbLabel?: string;
  metaTitle: string;
  metaDescription: string;
  /** Open Graph description — defaults to `metaDescription` when omitted. */
  ogDescription?: string;
  /** Twitter card description — defaults to `metaDescription` when omitted. */
  twitterDescription?: string;
  /** Open Graph / Twitter site_name override (defaults to Huntlo). */
  ogSiteName?: string;
  /** Visible FAQ + FAQPage schema — answers must match verbatim. */
  faq?: SolutionFaqItem[];
  /** Pre-filled prompt for footer AI-platform GEO deep links. */
  geoAskPrompt?: string;
  /** e.g. "Huntlo AI for Enterprise Hiring" → "Ask ChatGPT about …". */
  geoAskTopic?: string;
  heroAccent: string;
  heroLead: string;
  heroSupport: string;
  heroPills: string[];
  heroPreview: SolutionHeroPreview;
  overviewTitle: string;
  intro: string;
  highlights: string[];
  metrics: SolutionMetric[];
  workflowSteps: SolutionWorkflowStep[];
  challenges: string[];
  capabilities: string[];
  outcomes: string[];
};

export const SOLUTION_PAGE_SLUGS = SOLUTIONS_NAV_ITEMS.map((item) => item.id);

const SOLUTION_PAGES: Record<string, SolutionPageData> = {
  "staffing-agencies": {
    id: "staffing-agencies",
    title: "For Staffing Agencies",
    description:
      "Manage multiple client mandates, source candidates faster, and automate recruiter workflows.",
    href: "/solutions/staffing-agencies",
    h1: "Agentic AI Hiring Infrastructure for Staffing Agencies",
    metaTitle: "Agentic AI Hiring Infrastructure for Staffing Agencies | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for staffing agencies. Automate candidate sourcing, outreach, AI voice screening, AI video interviews, recruiter workflows, and hiring operations while keeping recruiters in control.",
    ogDescription:
      "Automate sourcing, outreach, AI interviews, recruiter workflows and hiring operations with Huntlo AI's Agentic AI Hiring Infrastructure for staffing agencies.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping staffing agencies automate sourcing, outreach, AI interviews and recruiter workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Staffing Agencies",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Staffing Agencies (https://huntlo.ai/solutions/staffing-agencies)? Explain how it helps staffing agencies automate candidate sourcing, outreach, AI voice screening, AI video interviews and recruiter workflows.",
    faq: [
      {
        question: "What is Huntlo AI for staffing agencies?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for staffing agencies. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, recruiter collaboration and hiring workflows while allowing recruiters to stay in control.",
      },
      {
        question: "Is Huntlo AI recruitment software or an ATS?",
        answer:
          "Huntlo AI goes beyond traditional recruitment software and ATS platforms. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive recruiting tasks while recruiters focus on relationship building and placements.",
      },
      {
        question: "How does Huntlo AI help staffing agencies hire faster?",
        answer:
          "Huntlo AI automates candidate sourcing, multichannel outreach, AI screening, interview scheduling and recruiter coordination, reducing manual work and accelerating placements.",
      },
      {
        question: "Can Huntlo AI work alongside existing ATS or CRM systems?",
        answer:
          "Yes. Huntlo AI complements existing ATS and recruitment CRM systems by adding AI-powered automation and agentic workflows without replacing established recruiting processes.",
      },
    ],
    heroAccent: "Fill every client mandate faster—with one recruiting workspace.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for staffing agencies—going beyond traditional AI Recruitment Software, Recruitment Platforms, ATS, and Recruitment CRM tools. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, recruiter workflows, and hiring operations while keeping recruiters in control.",
    heroSupport:
      "Whether you run high-volume temp or contract staffing, every client mandate gets its own campaign workspace—sourcing sessions, outreach sequences, reply tracking, and manager visibility in one place.",
    heroPills: [
      "Multi-mandate campaigns",
      "Email + WhatsApp outreach",
      "AI voice & video screening",
      "ATS / CRM complementary",
    ],
    heroPreview: {
      label: "Staffing workspace",
      icon: "groups",
      title: "Acme Corp · Senior React roles",
      items: [
        { icon: "travel_explore", text: "42 candidates sourced for 3 open mandates today" },
        { icon: "mark_email_read", text: "18 replies across email and WhatsApp follow-ups" },
        { icon: "visibility", text: "Manager view: activity and pipeline per client req" },
      ],
      activeCampaigns: "12 open",
    },
    overviewTitle: "Agentic AI Hiring Infrastructure for high-volume staffing desks",
    intro:
      "Staffing agencies juggle dozens of open roles, client SLAs, and recruiter bandwidth at once. Huntlo's Agentic AI Hiring Infrastructure gives your team one workspace to source across mandates, run outbound campaigns, and keep every client pipeline moving—without replacing your ATS or Recruitment CRM.",
    highlights: [
      "Spin up sourcing for a new client req in minutes with natural-language search",
      "Run Email and WhatsApp sequences with automated no-reply follow-ups",
      "Reveal contacts and enrich profiles without switching tools",
      "Complement existing ATS and recruitment CRM stacks used by staffing desks",
    ],
    metrics: [
      { value: "72%", label: "Avg. reply rate" },
      { value: "3x", label: "Faster req turnaround" },
      { value: "50+", label: "Mandates per team" },
    ],
    workflowSteps: [
      {
        title: "Describe the client role",
        description: "Use AI search to build a qualified shortlist for each open mandate.",
      },
      {
        title: "Launch multi-channel outreach",
        description: "Enroll candidates into campaigns with role-specific messaging and follow-ups.",
      },
      {
        title: "Track pipeline and placements",
        description: "Monitor replies, move talent forward, and report progress to clients.",
      },
    ],
    challenges: [
      "Switching between client reqs slows sourcing and outreach",
      "Recruiters spend hours on manual LinkedIn search and list building",
      "Follow-ups slip when teams manage high candidate volume across roles",
      "Hard to show clients consistent pipeline activity and response rates",
    ],
    capabilities: [
      "AI candidate search with natural-language prompts per client role",
      "Campaign-based outreach across Email and WhatsApp with follow-up sequences",
      "AI voice screening and AI video interviews for faster shortlisting",
      "Contact reveal and enrichment to reach candidates faster",
      "Shared candidate pools and session history across your recruiting team",
      "Workflows that complement existing ATS and recruitment CRM systems",
    ],
    outcomes: [
      "Fill more reqs per recruiter without expanding the team",
      "Respond to new client mandates in hours, not days",
      "Keep candidates warm with automated no-reply follow-ups",
      "Present a modern, proactive recruiting motion to clients",
    ],
  },
  "recruitment-firms": {
    id: "recruitment-firms",
    title: "For Recruitment Firms",
    description:
      "Scale candidate sourcing, outreach, and placements without growing your recruiting team.",
    href: "/solutions/recruitment-firms",
    h1: "Agentic AI Hiring Infrastructure for Recruitment Firms",
    metaTitle: "Agentic AI Hiring Infrastructure for Recruitment Firms | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for recruitment firms. Automate candidate sourcing, outreach, AI voice screening, AI video interviews, and placement workflows across contingency and permanent desks while keeping recruiters in control.",
    ogDescription:
      "Automate sourcing, outreach, AI interviews and placement workflows with Huntlo AI's Agentic AI Hiring Infrastructure for recruitment firms.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping recruitment firms automate sourcing, outreach, AI interviews and placement workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Recruitment Firms",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Recruitment Firms (https://huntlo.ai/solutions/recruitment-firms)? Explain how it helps recruitment firms automate candidate sourcing, outreach, AI voice screening, AI video interviews and placement workflows.",
    faq: [
      {
        question: "What is Huntlo AI for recruitment firms?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for recruitment firms. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, recruiter collaboration and placement workflows across contingency and permanent desks while allowing recruiters to stay in control.",
      },
      {
        question: "Is Huntlo AI recruitment software or an ATS?",
        answer:
          "Huntlo AI goes beyond traditional recruitment software and ATS platforms. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive sourcing and screening tasks while recruiters focus on client management and closing placements.",
      },
      {
        question: "How does Huntlo AI help recruitment firms place candidates faster?",
        answer:
          "Huntlo AI automates candidate sourcing, multichannel outreach, AI screening, interview scheduling and recruiter coordination, helping recruitment firms shorten time-to-fill across both contingency and retained mandates.",
      },
      {
        question: "Can Huntlo AI work alongside existing recruitment CRM or ATS systems?",
        answer:
          "Yes. Huntlo AI complements existing recruitment CRM and ATS systems by adding AI-powered automation and agentic workflows without replacing established recruiting processes or client reporting.",
      },
    ],
    heroAccent: "Scale contingency and permanent placements without scaling headcount.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for multi-desk recruitment firms—going beyond traditional Recruitment Software, Recruitment CRM, ATS, and Placement Software. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, and placement workflows across contingency and permanent desks while keeping recruiters in control.",
    heroSupport:
      "Clone winning sourcing sessions, standardize outreach across junior and senior recruiters, and measure volume, replies, and conversion across contingency and retained mandates from a single campaign operations layer.",
    heroPills: [
      "Contingency + permanent desks",
      "Repeatable sourcing playbooks",
      "AI voice & video screening",
      "Recruitment CRM complementary",
    ],
    heroPreview: {
      label: "Firm operations",
      icon: "trending_up",
      title: "Q2 placement drive · 8 active roles",
      items: [
        { icon: "content_copy", text: "Sourcing session cloned for 3 similar engineering reqs" },
        { icon: "campaign", text: "240 first-touch messages sent with auto follow-ups" },
        { icon: "leaderboard", text: "Consultant leaderboard: replies and pipeline conversion" },
      ],
      activeCampaigns: "8 open",
    },
    overviewTitle: "Agentic AI Hiring Infrastructure for multi-desk recruitment firms",
    intro:
      "Growth-stage recruitment firms need throughput across contingency and retained/permanent mandates without proportional hiring of sourcers and coordinators. Huntlo's Agentic AI Hiring Infrastructure automates discovery, outreach, screening, and placement prep so consultants focus on client management and closing—without replacing your Recruitment CRM or ATS.",
    highlights: [
      "Clone winning sourcing sessions for similar roles and verticals",
      "Standardize outreach quality across junior and senior consultants",
      "Run dedicated campaigns for contingency and permanent desks",
      "Complement existing recruitment CRM, ATS, and placement software stacks",
    ],
    metrics: [
      { value: "10x", label: "More outreach capacity" },
      { value: "75%", label: "More qualified candidates" },
      { value: "30%", label: "Lower cost per hire" },
    ],
    workflowSteps: [
      {
        title: "Open a campaign per role",
        description: "Add contacts, set job context, and align messaging to the search brief.",
      },
      {
        title: "Automate first touch and follow-up",
        description: "Run approved templates across email and WhatsApp with AI reply handling.",
      },
      {
        title: "Focus consultants on closing",
        description: "Spend time on client relationships and placements—not list building and admin.",
      },
    ],
    challenges: [
      "Revenue goals outpace recruiter capacity across contingency and permanent desks",
      "Outbound quality drops when teams rush to hit activity targets",
      "Sourcing and outreach live in disconnected tools and spreadsheets",
      "Hard to standardize process across junior and senior recruiters without losing placement quality",
    ],
    capabilities: [
      "Repeatable sourcing sessions you can clone for similar roles and mandates",
      "WhatsApp and email sequences with approved templates and AI reply flows",
      "AI voice screening and AI video interviews for faster shortlisting",
      "Campaign workspaces for contingency and retained/permanent roles",
      "Analytics on outreach volume, replies, and pipeline progression",
      "Workflows that complement existing recruitment CRM and ATS systems",
    ],
    outcomes: [
      "Increase placements per recruiter across contingency and permanent desks",
      "Shorten time-to-fill without growing sourcing headcount",
      "Improve reply rates with personalized, multi-step sequences",
      "Onboard new recruiters faster with a consistent multi-desk playbook",
    ],
  },
  "executive-search": {
    id: "executive-search",
    title: "For Executive Search",
    description:
      "Identify niche talent, build targeted pipelines, and engage passive candidates effectively.",
    href: "/solutions/executive-search",
    h1: "Agentic AI Hiring Infrastructure for Executive Search",
    metaTitle: "Agentic AI Hiring Infrastructure for Executive Search | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for executive search and retained search firms. Automate candidate mapping, confidential outreach, AI voice screening, AI video interviews, and search workflows while keeping consultants in control.",
    ogDescription:
      "Automate candidate mapping, confidential outreach, AI interviews, consultant workflows and search operations with Huntlo AI's Agentic AI Hiring Infrastructure for executive search firms.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping executive search firms automate candidate mapping, confidential outreach, AI interviews and consultant workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Executive Search",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Executive Search (https://huntlo.ai/solutions/executive-search)? Explain how it helps executive search firms automate candidate mapping, confidential outreach, AI voice screening, AI video interviews and consultant workflows.",
    faq: [
      {
        question: "What is Huntlo AI for executive search?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for executive search and retained search firms. It automates candidate mapping, confidential outreach, AI voice screening, AI video interviews, consultant collaboration and search workflows while allowing consultants to stay in control.",
      },
      {
        question: "Is Huntlo AI executive search software or a headhunting platform?",
        answer:
          "Huntlo AI goes beyond traditional executive search software and headhunting platforms. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive search tasks while consultants focus on client relationships and closing placements.",
      },
      {
        question: "How does Huntlo AI help executive search firms fill roles faster?",
        answer:
          "Huntlo AI automates candidate mapping, confidential multichannel outreach, AI screening, interview scheduling and consultant coordination, reducing manual research time and accelerating retained and contingency search mandates.",
      },
      {
        question: "Can Huntlo AI work alongside existing executive search CRM systems?",
        answer:
          "Yes. Huntlo AI complements existing executive search CRM and database systems by adding AI-powered automation and agentic workflows without replacing established search methodologies.",
      },
    ],
    heroAccent: "Run retained and contingency searches with confidential precision.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for executive search and retained search firms—going beyond traditional Executive Search Software, Headhunting Platforms, and Executive Search CRM tools. It automates candidate mapping, confidential outreach, AI voice screening, AI video interviews, and search workflows while keeping consultants in control.",
    heroSupport:
      "Every retained mandate stays discreet with private pipelines, senior-appropriate messaging, verified contact reveal, and reply-driven qualification before partners engage passive executives.",
    heroPills: [
      "Confidential retained search",
      "Discreet multichannel outreach",
      "AI voice & video screening",
      "Executive Search CRM complementary",
    ],
    heroPreview: {
      label: "Executive search",
      icon: "person_search",
      title: "CFO search · Fintech · APAC",
      items: [
        { icon: "filter_alt", text: "Longlist narrowed to 28 leaders by tenure and industry" },
        { icon: "contact_mail", text: "Direct lines revealed for 19 passive executives" },
        { icon: "forum", text: "4 qualified replies routed for partner follow-up" },
      ],
      activeCampaigns: "3 retained",
    },
    overviewTitle: "Confidential Agentic AI Hiring Infrastructure for search firms",
    intro:
      "Executive search depends on precision and discretion—finding the right leader in a narrow market and starting a confidential conversation. Huntlo's Agentic AI Hiring Infrastructure helps researchers map niche talent, enrich contacts, and run discreet outreach at scale without replacing your Executive Search CRM or established search methodology.",
    highlights: [
      "Map leaders by title, industry, tenure, and geography with semantic search",
      "Reveal verified email and phone for hard-to-reach passive executives",
      "Run confidential, senior-appropriate outreach that protects your firm's brand",
      "Keep private pipelines with full activity history per retained mandate",
    ],
    metrics: [
      { value: "92%", label: "Match accuracy" },
      { value: "2x", label: "Faster longlist builds" },
      { value: "48h", label: "To first outreach" },
    ],
    workflowSteps: [
      {
        title: "Map a targeted longlist",
        description: "Surface niche leaders who fit mandate criteria—not generic job board profiles.",
      },
      {
        title: "Enrich and verify contacts",
        description: "Unlock direct lines and personalize confidential outreach for passive senior talent.",
      },
      {
        title: "Engage with discretion",
        description: "Run thoughtful sequences and qualify interest before partner involvement.",
      },
    ],
    challenges: [
      "Niche retained searches require deep filtering beyond generic job boards",
      "Passive executives rarely respond to generic InMails or blasts",
      "Researchers lose time hunting for emails and direct lines",
      "Confidential mandates need controlled, professional communication",
    ],
    capabilities: [
      "Semantic candidate mapping by title, industry, tenure, and geography",
      "Verified email and phone reveal for hard-to-reach executives",
      "Discreet WhatsApp and email openers tailored to senior audiences",
      "AI voice screening and AI video interviews for qualified shortlists",
      "Role and mandate context stored per campaign for consistent messaging",
      "Private pipelines that complement existing Executive Search CRM systems",
    ],
    outcomes: [
      "Build qualified longlists faster for retained and contingency searches",
      "Increase response rates from passive senior talent with confidential outreach",
      "Reduce researcher time on admin and list hygiene",
      "Deliver a polished candidate experience that protects your brand",
    ],
  },
  startups: {
    id: "startups",
    title: "For Startups",
    description:
      "Build your first hiring engine and attract top talent without a large recruiting team.",
    href: "/solutions/startups",
    h1: "Agentic AI Hiring Infrastructure for Startups",
    metaTitle: "Agentic AI Hiring Infrastructure for Startups | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for startups. Automate candidate sourcing, outreach, AI voice screening, AI video interviews, and founder-led hiring workflows so lean teams can hire fast without a full recruiting team.",
    ogDescription:
      "Automate sourcing, outreach, AI interviews and founder-led hiring workflows with Huntlo AI's Agentic AI Hiring Infrastructure for startups.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping startups automate sourcing, outreach, AI interviews and founder-led hiring workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Startups",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Startups (https://huntlo.ai/solutions/startups)? Explain how it helps startups automate candidate sourcing, outreach, AI voice screening, AI video interviews and founder-led hiring workflows.",
    faq: [
      {
        question: "What is Huntlo AI for startups?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for startups. It automates candidate sourcing, outreach, AI voice screening, AI video interviews and hiring workflows so founders and small teams can hire without a dedicated recruiting function.",
      },
      {
        question: "Is Huntlo AI recruitment software or an ATS for startups?",
        answer:
          "Huntlo AI goes beyond traditional recruitment software and ATS platforms built for large teams. It acts as an Agentic AI Hiring Infrastructure where AI agents handle repetitive recruiting tasks so founders and hiring managers can focus on final-round decisions.",
      },
      {
        question: "How does Huntlo AI help startups hire without a recruiting team?",
        answer:
          "Huntlo AI automates candidate sourcing, personalized outreach, AI screening and interview scheduling, giving startups the output of a recruiting team without the headcount or cost of hiring in-house recruiters.",
      },
      {
        question: "Can Huntlo AI scale as a startup grows its hiring needs?",
        answer:
          "Yes. Huntlo AI is built to scale from a founder making the first few hires to a growing team running multiple roles at once, adding AI-powered automation and agentic workflows as hiring volume increases.",
      },
    ],
    heroAccent: "Hire critical roles before you hire a recruiting team.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for startups—going beyond traditional AI Recruitment Software, Recruiting Tools for Startups, ATS, and Applicant Tracking Systems built for large teams. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, and founder-led hiring workflows so lean teams can hire fast without a full recruiting team.",
    heroSupport:
      "Describe your ideal hire in plain English, reach strong candidates proactively, and book interviews faster with self-serve workflows—then reuse what works as you scale each new role.",
    heroPills: [
      "No recruiter required",
      "Trial plans for lean teams",
      "AI voice & video screening",
      "Founder-led hiring workflows",
    ],
    heroPreview: {
      label: "Startup hiring",
      icon: "rocket_launch",
      title: "Head of Engineering · Series A",
      items: [
        { icon: "search", text: "Shortlist of 15 senior engineers built in one session" },
        { icon: "send", text: "Personalized outreach sent before job post went live" },
        { icon: "event_available", text: "3 intro calls booked via Calendly this week" },
      ],
      activeCampaigns: "2 active",
    },
    overviewTitle: "Agentic AI Hiring Infrastructure for founder-led hiring",
    intro:
      "Early-stage teams rarely have dedicated recruiters—but every hire shapes the company. Huntlo's Agentic AI Hiring Infrastructure lets founders and early ops/people hires run a professional outbound hiring motion from day one: source builders, operators, and leaders, then engage them before competitors do—without agency fees or enterprise ATS sprawl.",
    highlights: [
      "Describe your ideal hire in plain English—no Boolean strings required",
      "Start on a trial plan sized for lean teams and first critical hires",
      "Run polished outreach that competes with larger employers",
      "Scale from first hires to multiple open roles with the same playbook",
    ],
    metrics: [
      { value: "Day 1", label: "Go-live speed" },
      { value: "72%", label: "Candidate reply rate" },
      { value: "5x", label: "Faster shortlists" },
    ],
    workflowSteps: [
      {
        title: "Search in natural language",
        description: "Describe the builder, operator, or leader you need—Huntlo finds the fit.",
      },
      {
        title: "Reach out proactively",
        description: "Contact strong candidates before they see your job post elsewhere.",
      },
      {
        title: "Build a repeatable playbook",
        description: "Reuse sessions, templates, and pools as you scale each new hire.",
      },
    ],
    challenges: [
      "Founders and hiring managers source between product and ops work",
      "Limited budget for agencies and premium recruiting tools for startups",
      "Hard to compete with larger employers for the same talent",
      "No structured process for outreach, follow-up, or pipeline tracking",
    ],
    capabilities: [
      "Natural-language search to describe the ideal hire in plain English",
      "Affordable trial and starter plans sized for lean teams",
      "Email and WhatsApp outreach without a separate sequencing tool",
      "AI voice screening and AI video interviews for faster shortlists",
      "Campaign view to track who was contacted, replied, and moved forward",
      "Self-serve workflows that scale as hiring volume increases",
    ],
    outcomes: [
      "Hire critical roles without hiring a recruiter first",
      "Reach candidates proactively instead of waiting on applications",
      "Look credible to senior hires with polished, personalized outreach",
      "Build a repeatable hiring playbook as you scale headcount",
    ],
  },
  "enterprise-hiring": {
    id: "enterprise-hiring",
    title: "For Enterprise Hiring",
    description:
      "Streamline sourcing, screening, and hiring operations across growing teams.",
    href: "/solutions/enterprise-hiring",
    h1: "Agentic AI Hiring Infrastructure for Enterprise Hiring",
    metaTitle: "Agentic AI Hiring Infrastructure for Enterprise Hiring | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for enterprise hiring teams. Automate candidate sourcing, outreach, AI voice screening, AI video interviews, and high-volume recruiter workflows across departments while keeping talent teams in control.",
    ogDescription:
      "Automate sourcing, outreach, AI interviews and high-volume recruiter workflows across departments with Huntlo AI's Agentic AI Hiring Infrastructure for enterprise hiring teams.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping enterprise talent teams automate sourcing, outreach, AI interviews and high-volume recruiter workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Enterprise Hiring",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Enterprise Hiring (https://huntlo.ai/solutions/enterprise-hiring)? Explain how it helps enterprise talent teams automate candidate sourcing, outreach, AI voice screening, AI video interviews and high-volume recruiter workflows.",
    faq: [
      {
        question: "What is Huntlo AI for enterprise hiring?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for enterprise talent acquisition teams. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, cross-departmental recruiter collaboration and high-volume hiring workflows while keeping talent teams in control.",
      },
      {
        question: "Is Huntlo AI recruitment software or an enterprise ATS?",
        answer:
          "Huntlo AI goes beyond traditional recruitment software and enterprise ATS platforms. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive, high-volume recruiting tasks while talent teams focus on hiring manager alignment and candidate experience.",
      },
      {
        question: "How does Huntlo AI help enterprises hire at scale?",
        answer:
          "Huntlo AI automates candidate sourcing, multichannel outreach, AI screening, interview scheduling and cross-team recruiter coordination, helping enterprise talent acquisition teams manage high requisition volume without proportionally increasing headcount.",
      },
      {
        question: "Can Huntlo AI integrate with existing enterprise ATS and HRIS systems?",
        answer:
          "Yes. Huntlo AI complements existing enterprise ATS, HRIS and recruitment CRM systems by adding AI-powered automation and agentic workflows without replacing established hiring processes or compliance requirements.",
      },
    ],
    heroAccent: "Scale TA across departments without losing control.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for enterprise talent acquisition teams—going beyond traditional Enterprise ATS, Recruitment CRM, HRIS, and Talent Acquisition Software. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, and high-volume recruiter workflows across departments while keeping talent teams in control.",
    heroSupport:
      "Standardize cross-departmental coordination, enforce approved messaging, integrate with your systems of record, and give TA leadership visibility into pipeline health and compliance posture at scale.",
    heroPills: [
      "Cross-department TA workflows",
      "ATS / HRIS complementary",
      "AI voice & video screening",
      "Governed outreach at scale",
    ],
    heroPreview: {
      label: "Enterprise TA",
      icon: "corporate_fare",
      title: "EMEA engineering hiring · Q3",
      items: [
        { icon: "groups", text: "14 recruiters on a shared sourcing and outreach playbook" },
        { icon: "verified", text: "Approved templates enforced across all regions" },
        { icon: "monitoring", text: "Leadership dashboard: outreach volume and reply rates" },
      ],
      activeCampaigns: "47 open",
    },
    overviewTitle: "Enterprise-grade Agentic AI Hiring Infrastructure",
    intro:
      "Enterprise TA teams coordinate across business units, regions, and hiring managers—while pressure to reduce time-to-fill never lets up. Huntlo's Agentic AI Hiring Infrastructure centralizes AI sourcing, governed outreach, AI interviews, and campaign execution so talent acquisition scales with organizational complexity—without replacing your Enterprise ATS or HRIS.",
    highlights: [
      "Give distributed recruiters a consistent sourcing and outreach playbook",
      "Enforce approved WhatsApp and email templates across regions",
      "Manage high-volume reqs with bulk contact and reveal workflows",
      "Complement existing ATS, HRIS, and recruitment CRM stacks",
    ],
    metrics: [
      { value: "40%", label: "Shorter time-to-shortlist" },
      { value: "5+", label: "Team seats on Growth" },
      { value: "1K+", label: "Outreach credits / mo" },
    ],
    workflowSteps: [
      {
        title: "Standardize how teams source",
        description: "Shared workflows, templates, and campaign structure across business units.",
      },
      {
        title: "Run governed outreach at scale",
        description: "Approved messaging, sub-user access, and quota-aware operations.",
      },
      {
        title: "Report to hiring leadership",
        description: "Track campaign activity, replies, and recruiter productivity centrally.",
      },
    ],
    challenges: [
      "Distributed recruiters use inconsistent sourcing and outreach methods",
      "High requisition volume creates bottlenecks in sourcing and scheduling",
      "Hard to enforce messaging standards across regions and brands",
      "Legacy ATS and HRIS tools don't connect sourcing, outreach, and pipeline in one flow",
    ],
    capabilities: [
      "Team workspaces with sub-users and role-based access on higher tiers",
      "Standardized outreach sequences with approved WhatsApp templates",
      "AI voice screening and AI video interviews for high-volume pipelines",
      "High-volume contact management with reveal jobs and sync workflows",
      "Email campaign reporting and activity tracking for TA leadership",
      "ATS- and HRIS-friendly workflows that complement enterprise systems of record",
    ],
    outcomes: [
      "Reduce time-to-shortlist across high-volume requisitions",
      "Give TA leaders visibility into team outreach and pipeline health",
      "Improve candidate experience with timely, relevant follow-ups",
      "Scale hiring operations without proportional headcount or tool sprawl",
    ],
  },
  gccs: {
    id: "gccs",
    title: "For GCCs",
    description:
      "Accelerate high-volume hiring with AI-powered sourcing, outreach, and talent intelligence.",
    href: "/solutions/gccs",
    h1: "Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs)",
    breadcrumbLabel: "Global Capability Centers",
    metaTitle:
      "Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs) | Huntlo AI",
    metaDescription:
      "Huntlo AI is an Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs). Automate candidate sourcing, outreach, AI voice screening, AI video interviews, and high-volume hiring workflows for GCC talent teams while keeping recruiters in control.",
    ogDescription:
      "Automate sourcing, outreach, AI interviews and high-volume hiring workflows with Huntlo AI's Agentic AI Hiring Infrastructure for Global Capability Centers.",
    twitterDescription:
      "Modern Agentic AI Hiring Infrastructure helping Global Capability Centers automate sourcing, outreach, AI interviews and high-volume hiring workflows.",
    ogSiteName: "Huntlo AI",
    geoAskTopic: "Huntlo AI for Global Capability Centers",
    geoAskPrompt:
      "What is Huntlo AI Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs) (https://huntlo.ai/solutions/gccs)? Explain how it helps GCCs automate candidate sourcing, outreach, AI voice screening, AI video interviews and high-volume hiring workflows.",
    faq: [
      {
        question: "What is Huntlo AI for Global Capability Centers (GCCs)?",
        answer:
          "Huntlo AI is an Agentic AI Hiring Infrastructure built for Global Capability Centers. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, recruiter collaboration and high-volume hiring workflows while keeping talent teams in control.",
      },
      {
        question: "Is Huntlo AI recruitment software or an ATS for GCCs?",
        answer:
          "Huntlo AI goes beyond traditional recruitment software and ATS platforms used by GCCs. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive, high-volume recruiting tasks while talent teams focus on stakeholder alignment with global headquarters and hiring quality.",
      },
      {
        question: "How does Huntlo AI help GCCs hire at scale?",
        answer:
          "Huntlo AI automates candidate sourcing, multichannel outreach, AI screening, interview scheduling and recruiter coordination, helping Global Capability Centers ramp up niche and high-volume roles quickly while maintaining consistent hiring standards across functions.",
      },
      {
        question: "Can Huntlo AI integrate with existing GCC ATS and HR systems?",
        answer:
          "Yes. Huntlo AI complements existing ATS, HRIS and recruitment CRM systems used by GCCs by adding AI-powered automation and agentic hiring workflows without replacing established processes or global reporting requirements.",
      },
    ],
    heroAccent: "Ramp niche and high-volume roles while reporting cleanly to global HQ.",
    heroLead:
      "Huntlo AI is Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs)—going beyond traditional Recruitment Software, ATS, Recruitment CRM, and Talent Acquisition Platforms. It automates candidate sourcing, outreach, AI voice screening, AI video interviews, and high-volume hiring workflows while keeping recruiters in control.",
    heroSupport:
      "Hit aggressive India/APAC hiring targets with WhatsApp-first automation, repeatable playbooks across functions, and consistent hiring standards your global headquarters can trust.",
    heroPills: [
      "High-volume GCC hiring",
      "WhatsApp at scale",
      "ATS / HRIS complementary",
      "Consistent cross-function standards",
    ],
    heroPreview: {
      label: "GCC operations",
      icon: "hub",
      title: "Engineering batch · Bangalore hub",
      items: [
        { icon: "group_add", text: "1,200 candidates loaded across 6 parallel role families" },
        { icon: "chat", text: "WhatsApp sequences running with template follow-ups" },
        { icon: "speed", text: "Pipeline moving 3x faster vs. manual outreach desk" },
      ],
      activeCampaigns: "24 drives",
    },
    overviewTitle: "Agentic AI Hiring Infrastructure built for Global Capability Centers",
    intro:
      "Global Capability Centers (GCCs) hire at scale across engineering, operations, finance, and shared services—often under aggressive timelines set by global HQ. Huntlo's Agentic AI Hiring Infrastructure helps GCC talent teams ramp niche and high-volume roles quickly with consistent hiring standards across functions—without replacing your ATS, HRIS, or recruitment CRM.",
    highlights: [
      "Source large candidate pools with skills, location, and experience filters",
      "Operationalize WhatsApp at scale with compliant, template-based sequences",
      "Bulk add, reveal, and enroll contacts into parallel hiring campaigns",
      "Complement existing ATS, HRIS, and recruitment CRM stacks used by GCCs",
    ],
    metrics: [
      { value: "1000+", label: "Candidates per campaign" },
      { value: "500+", label: "WhatsApp outreaches / mo" },
      { value: "30%", label: "Lower cost per hire" },
    ],
    workflowSteps: [
      {
        title: "Discover talent at volume",
        description: "Load large shortlists per role family with AI-powered filtering.",
      },
      {
        title: "Automate WhatsApp-first outreach",
        description: "Run template sequences with follow-ups tuned for high-volume programs.",
      },
      {
        title: "Move thousands through pipeline",
        description: "Track replies, qualification, and handoff across parallel hiring drives.",
      },
    ],
    challenges: [
      "Mass hiring targets require more throughput than manual sourcing allows",
      "WhatsApp is critical in many GCC markets but hard to operationalize at scale",
      "Recruiter teams need consistent standards across functions for global HQ reporting",
      "Legacy ATS and Talent Acquisition Platforms don't connect sourcing, outreach, and pipeline in one flow",
    ],
    capabilities: [
      "Large session results with filters for skills, location, and experience",
      "WhatsApp campaign sequences with no-reply follow-ups and reply qualification",
      "AI voice screening and AI video interviews for high-volume pipelines",
      "Bulk contact add, reveal, and campaign enrollment workflows",
      "Multi-role campaign management for parallel hiring drives",
      "ATS- and HRIS-friendly workflows that support global reporting requirements",
    ],
    outcomes: [
      "Ramp niche and high-volume roles faster without proportional headcount",
      "Run compliant, template-based WhatsApp outreach at GCC scale",
      "Maintain consistent hiring standards across functions and locations",
      "Shorten time from req open to engaged candidate pipeline",
    ],
  },
};

export function getSolutionPage(slug: string): SolutionPageData | null {
  const key = String(slug || "").trim().toLowerCase();
  return SOLUTION_PAGES[key] ?? null;
}

export function listSolutionPages(): SolutionPageData[] {
  return SOLUTION_PAGE_SLUGS.map((slug) => SOLUTION_PAGES[slug]).filter(Boolean);
}

/** Display name for CollectionPage ItemList entries on /solutions. */
export function solutionCollectionItemName(page: SolutionPageData): string {
  if (page.id === "gccs") return "Global Capability Centers (GCCs)";
  return page.breadcrumbLabel ?? page.title.replace(/^For /, "");
}

/** Visible FAQ + FAQPage schema for the /solutions hub. */
export const SOLUTIONS_INDEX_FAQ: SolutionFaqItem[] = [
  {
    question: "What is Huntlo AI?",
    answer:
      "Huntlo AI is an Agentic AI Hiring Infrastructure that automates candidate sourcing, outreach, AI voice screening, AI video interviews, and recruiter or hiring team workflows while keeping humans in control of final decisions.",
  },
  {
    question: "Who is Huntlo AI built for?",
    answer:
      "Huntlo AI is built for every type of hiring team, including staffing agencies, recruitment firms, executive search consultants, startup founders, enterprise talent acquisition teams, and Global Capability Centers.",
  },
  {
    question: "Is Huntlo AI recruitment software or an ATS?",
    answer:
      "Huntlo AI goes beyond traditional recruitment software and ATS platforms. It acts as an Agentic AI Hiring Infrastructure where AI agents automate repetitive recruiting tasks while people focus on relationships, judgment calls, and closing hires.",
  },
  {
    question: "Can Huntlo AI integrate with the tools my team already uses?",
    answer:
      "Yes. Huntlo AI complements existing ATS, recruitment CRM, and HRIS systems by adding AI-powered automation and agentic hiring workflows without replacing established processes.",
  },
];
