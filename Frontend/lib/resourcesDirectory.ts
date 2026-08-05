export type ResourcesDirectoryItem = {
  label: string;
  href: string;
  description: string;
};

export type ResourcesDirectoryGroup = {
  title: string;
  items: ResourcesDirectoryItem[];
};

/** All new category / intelligence pages — linked from /resources, not the footer. */
export const RESOURCES_DIRECTORY: ResourcesDirectoryGroup[] = [
  {
    title: "Hiring intelligence foundation",
    items: [
      {
        label: "AI Hiring Intelligence Infrastructure",
        href: "/ai-hiring-infrastructure",
        description: "The intelligence layer for Human + AI Hiring.",
      },
      {
        label: "Agentic Hiring™",
        href: "/agentic-hiring",
        description: "Human Intelligence and AI continuously moving hiring forward.",
      },
      {
        label: "Hiring OS",
        href: "/hiring-os",
        description: "AI Native Hiring Operating System.",
      },
      {
        label: "Intelligent Hiring Workflows™",
        href: "/hiring-workflows",
        description: "Workflow Intelligence that moves outcomes forward.",
      },
      {
        label: "Hiring Intelligence Orchestration™",
        href: "/workflow-orchestration",
        description: "People, context, conversations, and outcomes — connected.",
      },
      {
        label: "Huntlo360",
        href: "/huntlo360",
        description: "Hiring Operating System for Human + AI hiring.",
      },
      {
        label: "GCC Recruitment Software",
        href: "/gcc-recruitment-software",
        description: "AI recruiting platform for Global Capability Centers.",
      },
      {
        label: "GCC Hiring Platform",
        href: "/gcc-hiring-platform",
        description: "One enterprise hiring platform for every GCC workflow.",
      },
      {
        label: "AI Recruiting for GCCs",
        href: "/ai-recruiting-for-gccs",
        description: "AI recruiting agents that make recruiters more productive.",
      },
      {
        label: "GCC Talent Intelligence",
        href: "/gcc-talent-intelligence",
        description: "AI talent intelligence for skills, pipelines, and hiring performance.",
      },
      {
        label: "GCC Sourcing Automation",
        href: "/gcc-sourcing-automation",
        description: "AI candidate discovery that replaces manual sourcing workflows.",
      },
    ],
  },
  {
    title: "Talent discovery & intelligence",
    items: [
      {
        label: "AI Native Candidate Discovery™",
        href: "/candidate-sourcing",
        description: "Discover exceptional talent — not keyword searches.",
      },
      {
        label: "Talent Discovery Intelligence™",
        href: "/talent-discovery",
        description: "Exceptional talent is intelligently discovered.",
      },
      {
        label: "Talent Intelligence™",
        href: "/talent-intelligence",
        description: "Understand talent more intelligently.",
      },
      {
        label: "Candidate Intelligence™",
        href: "/candidate-intelligence",
        description: "Understand people — not just resumes.",
      },
      {
        label: "Talent Intelligence Networks™",
        href: "/talent-pipeline",
        description: "Talent relationships, intent, and momentum.",
      },
      {
        label: "Vibe Sourcing",
        href: "/vibe-sourcing",
        description: "Intent Driven Talent Discovery.",
      },
      {
        label: "AI Talent Discovery Agents™",
        href: "/ai-sourcing-agent",
        description: "Agents that discover exceptional people.",
      },
    ],
  },
  {
    title: "Conversations & relationships",
    items: [
      {
        label: "Conversation Intelligence™",
        href: "/outreach-engine",
        description: "Meaningful conversations — not outreach volume.",
      },
      {
        label: "Intent Driven Outreach™",
        href: "/email-outreach",
        description: "Start better conversations with candidate intent.",
      },
      {
        label: "Real-Time Hiring Intelligence™",
        href: "/whatsapp-recruiting",
        description: "Hiring momentum in real time.",
      },
      {
        label: "Candidate Relationship Intelligence™",
        href: "/candidate-engagement",
        description: "Relationships that create hiring momentum.",
      },
      {
        label: "Candidate Experience Intelligence™",
        href: "/candidate-orchestration",
        description: "Exceptional candidate experiences end to end.",
      },
      {
        label: "Hiring Momentum",
        href: "/follow-up-automation",
        description: "Keep hiring moving between conversations.",
      },
    ],
  },
  {
    title: "Decisions, capability & interviews",
    items: [
      {
        label: "Hiring Confidence Intelligence™",
        href: "/screening-engine",
        description: "Better hiring decisions — not faster filters.",
      },
      {
        label: "Capability Intelligence™",
        href: "/assessment-engine",
        description: "Understand capability beyond scores.",
      },
      {
        label: "Interview Intelligence™",
        href: "/interview-orchestration",
        description: "Interviews that create hiring confidence.",
      },
      {
        label: "Scheduling Intelligence",
        href: "/interview-scheduling",
        description: "Seamless interview experiences and velocity.",
      },
    ],
  },
  {
    title: "Operations & excellence",
    items: [
      {
        label: "Hiring Operations Intelligence™",
        href: "/talent-operations",
        description: "Scale hiring intelligence — not headcount alone.",
      },
      {
        label: "Recruiting Excellence Intelligence™",
        href: "/recruitment-operations",
        description: "Amplify recruiter productivity and outcomes.",
      },
    ],
  },
  {
    title: "AI Hiring Intelligence Agents",
    items: [
      {
        label: "AI Hiring Intelligence Agents™",
        href: "/ai-recruiting-agent",
        description: "Huntlo’s flagship Human + AI Hiring narrative.",
      },
      {
        label: "AI Outreach Agents",
        href: "/ai-outreach-agent",
        description: "Candidate conversation intelligence agents.",
      },
      {
        label: "AI Screening Agents",
        href: "/ai-screening-agent",
        description: "Hiring decision intelligence agents.",
      },
      {
        label: "AI Interview Agents",
        href: "/ai-interview-agent",
        description: "Hiring conversation intelligence agents.",
      },
      {
        label: "AI Workflow Intelligence",
        href: "/ai-scheduling-agent",
        description: "Agents that move hiring workflows forward.",
      },
      {
        label: "AI Recruiting Agents",
        href: "/recruiting-agents",
        description: "Agentic Hiring across the recruiting stack.",
      },
    ],
  },
  {
    title: "Guides & support",
    items: [
      {
        label: "Documentation",
        href: "/docs",
        description: "Product guides and reference.",
      },
      {
        label: "Blog",
        href: "/blog",
        description: "Playbooks for modern hiring teams.",
      },
      {
        label: "FAQs",
        href: "/faqs",
        description: "Answers about Huntlo AI recruiting.",
      },
    ],
  },
] as const;
