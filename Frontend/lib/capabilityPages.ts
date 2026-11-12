import { CAPABILITIES_PATH } from "@/lib/capabilities";

export type CapabilityIconLabel = {
  icon: string;
  label: string;
};

export type CapabilityTag = {
  label: string;
  icon?: string;
  highlight?: boolean;
};

export type CapabilityCard = {
  icon: string;
  title: string;
  body: string;
};

export type CapabilityLink = {
  name: string;
  href: string;
  icon: string;
  description: string;
};

export type CapabilityFaq = {
  question: string;
  answer: string;
};

export type CapabilityPageContent = {
  slug: string;
  name: string;
  /** Plural names ("AI Voice Interviews") take plural verbs in generated headings. */
  plural?: boolean;
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
  };
  hero: {
    summary: string;
    chips: string[];
  };
  visual: {
    input: { label: string; text: string };
    middle: { label: string; items: CapabilityIconLabel[] };
    output: { label: string; liveLabel: string; pills: [string, string]; note: string };
    flow: string[];
  };
  overview: {
    /** Wrap phrases in **double asterisks** to render them in bold. */
    paragraphs: string[];
    concepts: CapabilityCard[];
  };
  challenge: {
    title: string;
    intro: string;
    items: CapabilityCard[];
  };
  workflow: {
    intro: string;
    steps: CapabilityCard[];
  };
  useCases: {
    featured: CapabilityCard & { tiles: CapabilityIconLabel[] };
    secondary: [CapabilityCard & { tags: CapabilityTag[] }, CapabilityCard & { tags: CapabilityTag[] }];
  };
  verified: {
    intro: string;
    points: string[];
    qualification: string;
  };
  comparison: {
    /** Defaults to "How {name} Differs". */
    title?: string;
    dimension: string;
    conventional: { title?: string; summary: string; items: string[] };
    huntlo: { title: string; summary: string; items: string[] };
  };
  faqs: CapabilityFaq[];
  /** Related links shown after the capabilities hub card. */
  related: CapabilityLink[];
  cta: { title: string; body: string };
};

const HUB_LINK: CapabilityLink = {
  name: "AI Hiring Capabilities",
  href: CAPABILITIES_PATH,
  icon: "apps",
  description: "Overview of all 13 connected AI hiring capabilities.",
};

const LINKS = {
  sourcing: {
    name: "AI Candidate Sourcing",
    href: "/capabilities/ai-candidate-sourcing",
    icon: "person_search",
    description: "Intent-driven discovery of active and passive talent.",
  },
  vibe: {
    name: "Vibe Sourcing",
    href: "/capabilities/vibe-sourcing",
    icon: "psychology",
    description: "Culture-first discovery beyond resume keywords.",
  },
  screening: {
    name: "AI Candidate Screening",
    href: "/capabilities/ai-candidate-screening",
    icon: "fact_check",
    description: "Objective rubric-based evaluation of sourced applicants.",
  },
  matching: {
    name: "AI Candidate Matching",
    href: "/capabilities/ai-candidate-matching",
    icon: "hub",
    description: "Compatibility between candidates and open requisitions.",
  },
  outreach: {
    name: "AI Candidate Outreach",
    href: "/capabilities/ai-candidate-outreach",
    icon: "send",
    description: "Personalized multi-channel engagement for sourced talent.",
  },
  engagement: {
    name: "AI Candidate Engagement",
    href: "/capabilities/ai-candidate-engagement",
    icon: "forum",
    description: "Well-timed follow-ups that keep candidates engaged.",
  },
  scheduling: {
    name: "AI Interview Scheduling",
    href: "/capabilities/ai-interview-scheduling",
    icon: "event_available",
    description: "Candidate self-booking coordinated with panel calendars.",
  },
  voice: {
    name: "AI Voice Interviews",
    href: "/capabilities/ai-voice-interviews",
    icon: "record_voice_over",
    description: "Structured preliminary phone screens with transcripts.",
  },
  assessments: {
    name: "AI Recruitment Assessments",
    href: "/capabilities/ai-recruitment-assessments",
    icon: "quiz",
    description: "Role-based skill evaluations before panel interviews.",
  },
  crm: {
    name: "AI Recruitment CRM",
    href: "/capabilities/ai-recruitment-crm",
    icon: "contacts",
    description: "One living record for every candidate relationship.",
  },
  talentPool: {
    name: "AI Talent Pool Management",
    href: "/capabilities/ai-talent-pool-management",
    icon: "groups",
    description: "Organized, reusable talent pools for future roles.",
  },
  analytics: {
    name: "AI Recruitment Analytics",
    href: "/capabilities/ai-recruitment-analytics",
    icon: "query_stats",
    description: "Visibility into outreach, replies and pipeline progression.",
  },
  automation: {
    name: "Recruitment Workflow Automation",
    href: "/capabilities/recruitment-workflow-automation",
    icon: "schema",
    description: "Cross-stage triggers and automated status progression.",
  },
  platform: {
    name: "Huntlo Platform",
    href: "/platform",
    icon: "hub",
    description: "Platform overview of connected hiring execution.",
  },
} satisfies Record<string, CapabilityLink>;

export const CAPABILITY_PAGES: CapabilityPageContent[] = [
  {
    slug: "ai-candidate-sourcing",
    name: "AI Candidate Sourcing",
    seo: {
      title: "AI Candidate Sourcing | Huntlo AI Hiring Capabilities",
      description:
        "AI candidate sourcing turns natural-language role criteria into multi-dimensional talent signals, surfacing verified active and passive candidates across professional networks and technical communities as part of Huntlo's connected hiring execution platform.",
      ogTitle: "AI Candidate Sourcing for Connected Hiring Execution",
      ogDescription:
        "Discover how Huntlo AI candidate sourcing surfaces verified talent and feeds it directly into outreach, screening, and scheduling workflows within one connected hiring infrastructure.",
    },
    hero: {
      summary:
        "Intent-driven talent discovery that helps recruiters find relevant active and passive candidates beyond traditional keyword searches.",
      chips: [
        "Intent-driven discovery",
        "Natural-language criteria",
        "Multi-dimensional signals",
        "Active & passive talent",
      ],
    },
    visual: {
      input: {
        label: "Role brief · plain language",
        text: "Hiring criteria, must-have skills, seniority, and context",
      },
      middle: {
        label: "Multi-dimensional talent signals",
        items: [
          { icon: "timeline", label: "Career trajectory" },
          { icon: "code", label: "Technical contributions" },
          { icon: "speed", label: "Company velocity" },
          { icon: "workspace_premium", label: "Domain expertise" },
        ],
      },
      output: {
        label: "Verified talent",
        liveLabel: "Live talent mapping",
        pills: ["Active applicants", "Passive candidates"],
        note: "Professional networks · Technical communities",
      },
      flow: ["Outreach", "Screening", "Scheduling", "CRM"],
    },
    overview: {
      paragraphs: [
        "AI Candidate Sourcing is **intent-driven talent discovery**. It synthesizes **natural-language role criteria** into **multi-dimensional talent signals**, surfacing verified passive and **active candidates** across professional networks and technical communities.",
        "Sourced talent flows directly into outreach, screening, interview scheduling, and the recruitment CRM — with full context preserved across every stage.",
        "The result is a shortlist of high-signal candidates who match the real requirements of a requisition, delivered as the first stage of **connected hiring execution** instead of a disconnected Boolean-search exercise.",
      ],
      concepts: [
        {
          icon: "travel_explore",
          title: "Intent-driven talent discovery",
          body: "Replaces static Boolean keyword searches.",
        },
        {
          icon: "chat",
          title: "Natural-language role criteria",
          body: "Describe the role, must-have skills, seniority, and context in plain language.",
        },
        {
          icon: "insights",
          title: "Multi-dimensional talent signals",
          body: "Career trajectory, technical contributions, company velocity, and domain expertise.",
        },
        {
          icon: "groups",
          title: "Active and passive candidates",
          body: "Surfaced across professional networks and technical communities.",
        },
        {
          icon: "account_tree",
          title: "Connected hiring execution",
          body: "Sourced talent flows into outreach, screening, interview scheduling, and the recruitment CRM.",
        },
      ],
    },
    challenge: {
      title: "The sourcing challenge for recruiting teams",
      intro:
        "Most sourcing still begins with static keyword searches, Boolean strings, and passive job-board postings. Recruiters rebuild lists and re-search the same networks repeatedly, and struggle to surface passive talent whose experience does not mirror the exact wording of a job description.",
      items: [
        {
          icon: "visibility_off",
          title: "Passive talent is invisible to keyword-only matching",
          body: "High-quality passive talent does not surface through rigid Boolean matching, so strong candidates never enter the funnel.",
        },
        {
          icon: "person_off",
          title: "Non-traditional backgrounds are filtered out",
          body: "Candidates whose experience does not mirror the exact wording of a job description are rejected before a human ever reviews them.",
        },
        {
          icon: "hourglass_empty",
          title: "Manual list building consumes recruiter hours",
          body: "Recruiters rebuild lists and re-search the same networks for every requisition instead of spending time on candidate relationships and closing.",
        },
      ],
    },
    workflow: {
      intro:
        "AI candidate sourcing connects intent to discovery in four connected steps, keeping the recruiter in control at every stage.",
      steps: [
        {
          icon: "edit_note",
          title: "Describe the role in plain language",
          body: "Enter hiring criteria, must-have skills, seniority, and context. Huntlo converts the brief into multi-dimensional talent signals instead of fixed keywords.",
        },
        {
          icon: "travel_explore",
          title: "Discover verified active and passive talent",
          body: "The engine maps professional networks and technical communities to surface candidates whose trajectory and signals match the role.",
        },
        {
          icon: "checklist",
          title: "Review and prioritize the shortlist",
          body: "Recruiters review AI-ranked profiles, enrich context, and select candidates to enroll in outreach — all inside one shared workspace.",
        },
        {
          icon: "conversion_path",
          title: "Hand off to downstream workflows",
          body: "Selected candidates flow directly into outreach, screening, and scheduling with full profile context preserved — no re-keying.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "insights",
        title: "Multi-dimensional Talent Signals",
        body: "Surfaces candidates based on career trajectory, technical contributions, company velocity, and domain expertise — not just resume keyword matches.",
        tiles: [
          { icon: "timeline", label: "Career trajectory" },
          { icon: "code", label: "Technical contributions" },
          { icon: "speed", label: "Company velocity" },
          { icon: "workspace_premium", label: "Domain expertise" },
        ],
      },
      secondary: [
        {
          icon: "verified_user",
          title: "Verified Active and Passive Discovery",
          body: "Identifies both active applicants and passive candidates across professional networks and technical communities for open roles.",
          tags: [
            { label: "Active applicants" },
            { label: "Passive candidates", highlight: true },
          ],
        },
        {
          icon: "conversion_path",
          title: "Connected Downstream Handoff",
          body: "Sourced profiles carry full context into AI Candidate Outreach, AI Candidate Screening, AI Interview Scheduling, and AI Recruitment CRM.",
          tags: [
            { icon: "send", label: "AI Candidate Outreach" },
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI candidate sourcing forms the initial intake engine of the recruitment funnel, transforming slow manual Boolean searches into real-time, high-precision candidate discovery.",
      points: [
        "Intent-driven talent discovery replaces static Boolean keyword searches.",
        "Multi-dimensional signals surface verified active and passive talent.",
        "Profile context flows into outreach, screening, scheduling, and CRM without re-entry.",
      ],
      qualification:
        "Outputs depend on the role criteria provided and network coverage; results are estimates and are not guaranteed placement volumes. Recruiters should still verify role-critical details during screening and interviews.",
    },
    comparison: {
      title: "How Sourcing Differs",
      dimension: "Discovery method",
      conventional: {
        title: "Conventional sourcing",
        summary: "Static Boolean keywords and passive job-board postings",
        items: ["Static Boolean keywords", "Passive job-board postings"],
      },
      huntlo: {
        title: "Huntlo AI candidate sourcing",
        summary: "Multi-dimensional signal matching, Vibe Sourcing, and live talent mapping",
        items: ["Multi-dimensional signal matching", "Vibe Sourcing", "Live talent mapping"],
      },
    },
    faqs: [
      {
        question: "What is AI candidate sourcing?",
        answer:
          "AI candidate sourcing transforms traditional keyword-based Boolean search into intent-driven talent discovery. Instead of matching simple text strings on resumes, Huntlo analyzes multi-dimensional signals — including career trajectories, technical contributions, company velocity, and domain expertise — across verified talent networks to surface high-signal active and passive candidates who match a role's technical and cultural requirements.",
      },
      {
        question: "How does AI candidate sourcing fit into Huntlo's hiring workflow?",
        answer:
          "Sourcing is the first stage of Huntlo's connected hiring execution. Candidate profiles discovered through AI sourcing flow directly into outreach, screening, interview scheduling, and the recruitment CRM — with full context preserved so nothing is re-keyed or lost between stages.",
      },
      {
        question: "Does Huntlo source candidates as a managed service?",
        answer:
          "No. Huntlo is AI Hiring Intelligence Infrastructure your own recruiting team operates. AI surfaces and ranks talent; recruiters review, prioritize, and personally engage the candidates who move forward.",
      },
      {
        question: "Which downstream activities does sourcing connect to?",
        answer:
          "Sourced profiles connect to AI Candidate Outreach for multi-channel engagement, AI Candidate Screening for objective qualification, AI Interview Scheduling for panel booking, and AI Recruitment CRM for living candidate records — all within one shared operational state.",
      },
    ],
    related: [LINKS.vibe, LINKS.screening, LINKS.outreach, LINKS.platform],
    cta: {
      title: "Start sourcing with connected intelligence",
      body: "Surface verified active and passive talent and move candidates through outreach, screening, and scheduling — all inside one hiring platform.",
    },
  },

  {
    slug: "vibe-sourcing",
    name: "Vibe Sourcing",
    seo: {
      title: "Vibe Sourcing | Huntlo AI Hiring Capabilities",
      description:
        "Vibe Sourcing lets recruiters describe who would succeed in a role in plain language, so Huntlo can discover candidates by working style, trajectory and team fit instead of rigid keyword filters.",
      ogTitle: "Vibe Sourcing: Intent-Driven Discovery Beyond Keywords",
      ogDescription:
        "See how Vibe Sourcing turns hiring intent into culture-aware talent discovery inside Huntlo's connected AI hiring workflow.",
    },
    hero: {
      summary:
        "Intent-driven discovery that finds candidates by how they work, what they have built and where they are heading — not just the keywords on their profile.",
      chips: [
        "Plain-language intent",
        "Working style & culture",
        "Trajectory alignment",
        "Fewer false negatives",
      ],
    },
    visual: {
      input: {
        label: "Hiring intent · plain language",
        text: "“Someone who has built high-performing GTM teams”",
      },
      middle: {
        label: "Context Vibe Sourcing combines",
        items: [
          { icon: "diversity_3", label: "Working style" },
          { icon: "groups", label: "Team autonomy" },
          { icon: "trending_up", label: "Career trajectory" },
          { icon: "lightbulb", label: "Problem-solving ethos" },
        ],
      },
      output: {
        label: "Discovery shortlist",
        liveLabel: "Recruiter-calibrated",
        pills: ["Skills match", "Culture & fit"],
        note: "Reviewed by recruiters before outreach",
      },
      flow: ["Shortlist", "Outreach", "Screening", "CRM"],
    },
    overview: {
      paragraphs: [
        "**Vibe Sourcing** is Huntlo's intent-driven approach to talent discovery. Instead of assembling a stack of titles, skills, locations and Boolean strings, recruiters **describe who would succeed in the role in plain language** — for example, “someone who can build outbound motions from zero to one.”",
        "Huntlo interprets that intent alongside **working style, team autonomy preferences, problem-solving ethos and career trajectory**, so candidates whose experience does not mirror a job description's exact wording can still be discovered.",
        "Recruiters stay in control: they lead the intent, review the shortlist and adjust signals, while Vibe Sourcing feeds **culture-aware discovery** into the same connected workflow used for outreach, screening and scheduling.",
      ],
      concepts: [
        {
          icon: "chat",
          title: "Plain-language hiring intent",
          body: "Describe who would succeed instead of building keyword stacks.",
        },
        {
          icon: "diversity_3",
          title: "Working style and culture signals",
          body: "Team autonomy preferences, problem-solving ethos and communication style.",
        },
        {
          icon: "trending_up",
          title: "Trajectory alignment",
          body: "Where a candidate's career is heading, not only their last title.",
        },
        {
          icon: "block",
          title: "Fewer false negatives",
          body: "Strong candidates are not lost because their profile uses different wording.",
        },
        {
          icon: "person_check",
          title: "Recruiter-led judgment",
          body: "Humans set the intent and make decisions; AI adds context.",
        },
      ],
    },
    challenge: {
      title: "Why keyword filters miss great-fit candidates",
      intro:
        "Keyword filters describe a profile, not a person. Recruiters know the kind of person who will thrive on a team, but search tools force that understanding into titles, skills, locations and years of experience.",
      items: [
        {
          icon: "filter_alt_off",
          title: "Great fits hide behind different wording",
          body: "Candidates who have done the work but describe it differently never match a rigid keyword stack.",
        },
        {
          icon: "diversity_3",
          title: "Culture fit is assessed too late",
          body: "Working style and team fit usually surface only in interviews, after hours have already been invested.",
        },
        {
          icon: "tune",
          title: "Search strings grow instead of improving",
          body: "Recruiters keep adding filters and Boolean operators instead of expressing what success in the role actually looks like.",
        },
      ],
    },
    workflow: {
      intro:
        "Vibe Sourcing turns a recruiter's understanding of the role into discovery in four steps, with the recruiter steering at every stage.",
      steps: [
        {
          icon: "edit_note",
          title: "Describe who would succeed",
          body: "Write the hiring intent in plain language — the outcomes, environment and kind of person the team needs — instead of a keyword list.",
        },
        {
          icon: "psychology",
          title: "Combine intent with candidate context",
          body: "Huntlo reads the intent alongside working style, trajectory and skills context to understand what a strong match looks like for this team.",
        },
        {
          icon: "tune",
          title: "Review and calibrate the shortlist",
          body: "Recruiters review prioritized candidates, adjust signal weights and refine the intent until the shortlist reflects the role.",
        },
        {
          icon: "conversion_path",
          title: "Continue into connected workflows",
          body: "Selected candidates move into outreach, screening and scheduling with the discovery context attached.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "psychology",
        title: "Culture-aware Talent Discovery",
        body: "Discovers candidates based on engineering philosophy, company cultural velocity and trajectory alignment rather than rigid keyword matching.",
        tiles: [
          { icon: "diversity_3", label: "Working style" },
          { icon: "groups", label: "Team autonomy" },
          { icon: "lightbulb", label: "Problem-solving ethos" },
          { icon: "trending_up", label: "Career trajectory" },
        ],
      },
      secondary: [
        {
          icon: "chat",
          title: "Plain-language Intent Prompts",
          body: "Recruiters describe talent the way they would brief a colleague — for example, someone who can scale engineering teams globally.",
          tags: [{ label: "Keyword stack" }, { label: "Intent prompt", highlight: true }],
        },
        {
          icon: "person_check",
          title: "False-negative Reduction",
          body: "Identifies high-potential candidates whose mindset, problem-solving craft and communication style mirror the team's ethos, even when their profile wording differs.",
          tags: [{ label: "Different wording" }, { label: "Still discovered", highlight: true }],
        },
      ],
    },
    verified: {
      intro:
        "Vibe Sourcing adds an intent layer to discovery: it helps recruiters express who to find before searching, and keeps that context attached as candidates move forward.",
      points: [
        "Recruiters describe talent in plain language instead of assembling keyword stacks.",
        "Discovery considers working style, team fit and trajectory alongside skills.",
        "Recruiters lead the intent and review every shortlist; AI adds context, not final decisions.",
      ],
      qualification:
        "Working-style and culture signals are indicators drawn from available professional information, not definitive assessments of a person. Recruiters should validate fit through conversations, screening and interviews.",
    },
    comparison: {
      dimension: "Discovery input",
      conventional: {
        summary: "Titles, skills, location and experience filters assembled into Boolean strings",
        items: ["Keyword and title filters", "Boolean search strings"],
      },
      huntlo: {
        title: "Huntlo Vibe Sourcing",
        summary: "Plain-language hiring intent combined with working style, trajectory and skills context",
        items: ["Plain-language intent prompts", "Working style and team-fit signals", "Trajectory alignment"],
      },
    },
    faqs: [
      {
        question: "What is Vibe Sourcing?",
        answer:
          "Vibe Sourcing is Huntlo's intent-driven approach to talent discovery. Recruiters describe who would succeed in a role in plain language, and Huntlo discovers candidates based on working style, team autonomy preferences, problem-solving ethos and career trajectory alongside skills — rather than rigid titles and keyword checklists.",
      },
      {
        question: "How is Vibe Sourcing different from AI candidate sourcing?",
        answer:
          "AI Candidate Sourcing turns role criteria into multi-dimensional talent signals to surface active and passive candidates. Vibe Sourcing adds an intent and culture layer: it focuses on how a candidate works and whether they are likely to thrive in a specific team environment. Both feed the same connected workflow.",
      },
      {
        question: "Is Vibe Sourcing just Boolean search with AI?",
        answer:
          "No. Boolean search matches strings of text. Vibe Sourcing starts from the recruiter's description of who would succeed and interprets that intent, so strong candidates are not excluded simply because their profile uses different wording.",
      },
      {
        question: "Does Vibe Sourcing replace recruiter judgment?",
        answer:
          "No. Recruiters lead the hiring intent, calibrate signals and decide who moves forward. Vibe Sourcing amplifies their understanding with additional context; it does not make hiring decisions.",
      },
    ],
    related: [
      {
        name: "Vibe Sourcing Overview",
        href: "/vibe-sourcing",
        icon: "auto_awesome",
        description: "The full story behind intent-driven talent discovery.",
      },
      LINKS.sourcing,
      LINKS.matching,
      LINKS.outreach,
    ],
    cta: {
      title: "Discover talent by intent, not keywords",
      body: "Describe who would succeed in the role and let Huntlo surface candidates who fit how your team works — inside one connected hiring platform.",
    },
  },

  {
    slug: "ai-candidate-screening",
    name: "AI Candidate Screening",
    seo: {
      title: "AI Candidate Screening | Huntlo AI Hiring Capabilities",
      description:
        "AI candidate screening evaluates inbound applicants and sourced profiles against role criteria with context-aware rubrics, voice screening and recruiter review, so qualified talent reaches interviews with clear evidence.",
      ogTitle: "AI Candidate Screening for Consistent, Context-Aware Qualification",
      ogDescription:
        "See how Huntlo evaluates candidates against role criteria and hands qualified talent to assessments and interviews with full context.",
    },
    hero: {
      summary:
        "Context-aware evaluation of applicants and sourced profiles against your role criteria, so every candidate gets a consistent first review before recruiters decide who advances.",
      chips: ["Rubric-based evaluation", "Role criteria matching", "Voice screening", "Recruiter review"],
    },
    visual: {
      input: {
        label: "Role criteria",
        text: "Skills, experience, availability, compensation and location",
      },
      middle: {
        label: "Context-aware evaluation",
        items: [
          { icon: "school", label: "Skills" },
          { icon: "work_history", label: "Experience" },
          { icon: "event_available", label: "Availability" },
          { icon: "payments", label: "Compensation" },
        ],
      },
      output: {
        label: "Qualification profile",
        liveLabel: "Recruiter review",
        pills: ["Not a fit", "Qualified"],
        note: "Every outcome visible to recruiters",
      },
      flow: ["Assessments", "Interviews", "Scheduling", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Candidate Screening** evaluates inbound applicants and sourced profiles against **objective job requirements, core competencies and career milestones** using **context-aware rubric analysis** — not keyword counts.",
        "Huntlo assesses criteria such as skills, experience, availability, compensation expectations, location and culture fit, can run **initial screening conversations through AI voice workflows**, and combines sourcing context, candidate responses and AI outcomes into **one qualification profile**.",
        "Recruiters keep **full visibility into screening outcomes** and make the call on who advances. Qualified candidates move into assessments, interviews and scheduling with their context intact.",
      ],
      concepts: [
        {
          icon: "rule",
          title: "Rubric-based evaluation",
          body: "Candidates are assessed against defined role criteria, not keyword counts.",
        },
        {
          icon: "checklist",
          title: "Role criteria matching",
          body: "Skills, experience, availability, compensation, location and culture fit.",
        },
        {
          icon: "record_voice_over",
          title: "Voice screening workflows",
          body: "Initial screening conversations can run through AI voice.",
        },
        {
          icon: "fact_check",
          title: "Single qualification profile",
          body: "Sourcing context, responses and AI outcomes in one place.",
        },
        {
          icon: "visibility",
          title: "Recruiter review",
          body: "Recruiters see every outcome and decide who advances.",
        },
      ],
    },
    challenge: {
      title: "The screening challenge for recruiting teams",
      intro:
        "Screening is where pipelines stall. Applicant volumes rise, criteria are applied inconsistently, and strong candidates can be rejected by keyword filters before a recruiter ever reviews their experience.",
      items: [
        {
          icon: "filter_alt",
          title: "Keyword filters reject good candidates",
          body: "Resume parsing that counts keywords filters out high-calibre, non-traditional talent whose experience is described differently.",
        },
        {
          icon: "balance",
          title: "Criteria are applied inconsistently",
          body: "Different reviewers weigh the same requirements differently, so candidates do not receive the same baseline evaluation.",
        },
        {
          icon: "phone_in_talk",
          title: "Preliminary screens consume recruiter time",
          body: "Repetitive first-round calls to confirm basics take time away from evaluating and engaging qualified candidates.",
        },
      ],
    },
    workflow: {
      intro:
        "Screening runs as a structured stage between outreach and interviews, with recruiters reviewing every outcome.",
      steps: [
        {
          icon: "tune",
          title: "Define role criteria",
          body: "Set the requirements that matter — skills, experience, availability, compensation, location and fit — so every candidate is evaluated against the same rubric.",
        },
        {
          icon: "fact_check",
          title: "Evaluate candidates in context",
          body: "Huntlo assesses applicants and sourced profiles against the criteria, considering contextual experience and skill depth rather than keyword counts.",
        },
        {
          icon: "record_voice_over",
          title: "Capture candidate responses",
          body: "Initial screening conversations can run through AI voice workflows, and candidate answers are evaluated before recruiter review.",
        },
        {
          icon: "how_to_reg",
          title: "Review and advance",
          body: "Recruiters review the qualification profile, then advance qualified candidates to assessments and interviews or mark them as not a fit.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "rule",
        title: "Context-aware Qualification",
        body: "Evaluates inbound applicants and sourced profiles against objective job requirements, core competencies and career milestones using context-aware rubric analysis.",
        tiles: [
          { icon: "school", label: "Skills" },
          { icon: "work_history", label: "Experience" },
          { icon: "event_available", label: "Availability" },
          { icon: "location_on", label: "Location" },
        ],
      },
      secondary: [
        {
          icon: "record_voice_over",
          title: "Voice Screening Conversations",
          body: "Runs initial screening conversations with AI voice workflows and evaluates candidate answers before recruiter review.",
          tags: [{ label: "Voice responses" }, { label: "Evaluated answers", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Structured Handoff to Interviews",
          body: "Moves candidates from sourcing and outreach into structured screening before assessments and interviews.",
          tags: [
            { icon: "quiz", label: "AI Recruitment Assessments" },
            { icon: "record_voice_over", label: "AI Voice Interviews" },
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI candidate screening calibrates applicant pools against role requirements so every profile receives a thorough, consistent baseline evaluation.",
      points: [
        "Candidates are evaluated against role criteria with context-aware rubrics, not keyword counts.",
        "Sourcing context, candidate responses and AI outcomes combine into one qualification profile.",
        "Recruiters keep full visibility into screening outcomes and make the final decision.",
      ],
      qualification:
        "Screening outcomes depend on the criteria you define and the information candidates provide. AI evaluations support — and do not replace — recruiter and hiring-manager judgment; role-critical details should be verified in interviews.",
    },
    comparison: {
      dimension: "Screening method",
      conventional: {
        summary: "Keyword resume parsing and manual preliminary phone calls",
        items: ["Keyword resume parsing", "Manual preliminary phone calls"],
      },
      huntlo: {
        title: "Huntlo AI candidate screening",
        summary: "Objective rubric qualification and AI voice screening conversations",
        items: ["Context-aware rubric evaluation", "AI voice screening workflows", "Recruiter-reviewed outcomes"],
      },
    },
    faqs: [
      {
        question: "What is AI candidate screening?",
        answer:
          "AI candidate screening is the structured evaluation of applicants and sourced profiles against defined role requirements. Huntlo uses context-aware rubric analysis to assess skills, experience depth, career milestones and practical criteria such as availability and compensation, rather than rejecting candidates based on keyword counts.",
      },
      {
        question: "How does AI candidate screening support recruiters?",
        answer:
          "It performs objective, rubric-based evaluations of applicant profiles against role criteria. Instead of rejecting candidates based on keyword counts, Huntlo evaluates contextual experience, skill depth and problem-solving background, so high-potential candidates from non-traditional paths receive a fair and consistent review.",
      },
      {
        question: "Does Huntlo replace recruiter or hiring-manager judgment?",
        answer:
          "No. Screening improves context and consistency, but recruiters and hiring managers own the final decision. Every screening outcome is visible for review, and recruiters decide who advances.",
      },
      {
        question: "What happens after a candidate is screened?",
        answer:
          "Qualified candidates move forward into AI Recruitment Assessments, AI Voice Interviews and AI Interview Scheduling, with their qualification profile and sourcing context carried into the AI Recruitment CRM.",
      },
    ],
    related: [
      {
        name: "Screening Overview",
        href: "/screening",
        icon: "verified",
        description: "Product overview of Huntlo screening workflows.",
      },
      LINKS.matching,
      LINKS.voice,
      LINKS.assessments,
    ],
    cta: {
      title: "Screen every candidate against the same bar",
      body: "Evaluate applicants against your role criteria and advance qualified talent into interviews with clear context — inside one hiring platform.",
    },
  },

  {
    slug: "ai-candidate-matching",
    name: "AI Candidate Matching",
    seo: {
      title: "AI Candidate Matching | Huntlo AI Hiring Capabilities",
      description:
        "AI candidate matching compares candidate career trajectories with requisition requirements across skill depth, seniority and domain relevance, helping recruiters prioritize the most aligned candidates for review.",
      ogTitle: "AI Candidate Matching: Prioritize the Most Aligned Candidates",
      ogDescription:
        "See how Huntlo compares candidate profiles with open requisitions to help recruiters focus on the strongest fits.",
    },
    hero: {
      summary:
        "Compatibility scoring between candidate career trajectories and open requisitions, so recruiters spend their attention on the candidates most aligned with the role.",
      chips: ["Bi-directional compatibility", "Skill depth & seniority", "Domain relevance", "Prioritized review"],
    },
    visual: {
      input: {
        label: "Open requisition",
        text: "Required skills, seniority, domain and role context",
      },
      middle: {
        label: "Compatibility dimensions",
        items: [
          { icon: "school", label: "Skill depth" },
          { icon: "stairs", label: "Seniority" },
          { icon: "domain", label: "Domain relevance" },
          { icon: "timeline", label: "Career trajectory" },
        ],
      },
      output: {
        label: "Prioritized candidates",
        liveLabel: "Recruiter-reviewed",
        pills: ["Skill overlap", "Strong alignment"],
        note: "Profile alignment scored against role rubrics",
      },
      flow: ["Screening", "Outreach", "Interviews", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Candidate Matching** computes **bi-directional match compatibility** between candidate career trajectories and requisition requirements, balancing **skill depth, seniority and domain relevance**.",
        "Huntlo scores profile alignment against role rubrics and identifies potential **skill overlaps**, so recruiters can **prioritize the candidates most likely to be a mutual fit** instead of reviewing every profile with equal effort.",
        "Matching also extends to your existing talent: candidates saved in **talent pools can be considered again when relevant roles open**, connecting matching with talent pool management and the recruitment CRM.",
      ],
      concepts: [
        {
          icon: "compare_arrows",
          title: "Bi-directional compatibility",
          body: "Fit is considered from both the role's and the candidate's perspective.",
        },
        {
          icon: "school",
          title: "Skill depth",
          body: "How deeply a candidate has applied the skills a role needs.",
        },
        {
          icon: "stairs",
          title: "Seniority alignment",
          body: "Whether the candidate's level matches the requisition.",
        },
        {
          icon: "domain",
          title: "Domain relevance",
          body: "Experience in the industry or problem space the role sits in.",
        },
        {
          icon: "sort",
          title: "Prioritized review",
          body: "Recruiters focus attention on the strongest alignment first.",
        },
      ],
    },
    challenge: {
      title: "The matching challenge for recruiting teams",
      intro:
        "When many profiles look similar on paper, recruiters spend their time sorting rather than engaging. Title and keyword overlap say little about whether a candidate's experience truly fits the requisition.",
      items: [
        {
          icon: "badge",
          title: "Title matches hide real fit",
          body: "Two candidates with the same title can have very different depth, seniority and domain experience.",
        },
        {
          icon: "hourglass_empty",
          title: "Equal effort on every profile",
          body: "Without prioritization, recruiters spend the same time on weak and strong fits before deciding where to focus.",
        },
        {
          icon: "history",
          title: "Past candidates are forgotten",
          body: "Strong runners-up from earlier searches are rarely reconsidered when a similar role opens.",
        },
      ],
    },
    workflow: {
      intro: "Matching sits between discovery and screening, helping recruiters decide where to focus first.",
      steps: [
        {
          icon: "description",
          title: "Define the requisition",
          body: "Capture the skills, seniority, domain and context the role requires so candidates are compared against a clear target.",
        },
        {
          icon: "compare_arrows",
          title: "Compute compatibility",
          body: "Huntlo compares each candidate's career trajectory with the requisition, balancing skill depth, seniority and domain relevance.",
        },
        {
          icon: "sort",
          title: "Review prioritized candidates",
          body: "Recruiters review candidates ordered by alignment, see skill overlaps and apply their own judgment on growth potential.",
        },
        {
          icon: "conversion_path",
          title: "Advance the strongest fits",
          body: "Prioritized candidates move into outreach and screening with their matching context preserved.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "hub",
        title: "Multi-dimensional Compatibility",
        body: "Computes bi-directional match compatibility between candidate career trajectories and requisition requirements, balancing skill depth, seniority and domain relevance.",
        tiles: [
          { icon: "school", label: "Skill depth" },
          { icon: "stairs", label: "Seniority" },
          { icon: "domain", label: "Domain relevance" },
          { icon: "timeline", label: "Career trajectory" },
        ],
      },
      secondary: [
        {
          icon: "sort",
          title: "Recruiter Prioritization",
          body: "Prioritizes candidates with the strongest likelihood of mutual alignment, focusing recruiter attention on the most qualified prospects.",
          tags: [{ label: "All candidates" }, { label: "Strongest fits first", highlight: true }],
        },
        {
          icon: "history",
          title: "Talent Pool Re-matching",
          body: "Brings past candidates from your talent pools back into consideration when relevant roles open, so earlier sourcing work keeps its value.",
          tags: [
            { icon: "groups", label: "AI Talent Pool Management" },
            { icon: "contacts", label: "AI Recruitment CRM" },
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "send", label: "AI Candidate Outreach" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI candidate matching helps recruiters decide where to focus by comparing candidates with requisitions across the dimensions that matter for the role.",
      points: [
        "Compatibility considers skill depth, seniority and domain relevance, not just title overlap.",
        "Profile alignment is scored against role rubrics, with potential skill overlaps identified.",
        "Recruiters review prioritized candidates and apply judgment before anyone advances.",
      ],
      qualification:
        "Match scores are estimates based on the requisition details and profile information available. They indicate likely alignment, not certainty, and recruiters should confirm fit through screening and interviews.",
    },
    comparison: {
      dimension: "Matching approach",
      conventional: {
        summary: "Title and keyword overlap reviewed manually, profile by profile",
        items: ["Title and keyword overlap", "Manual profile-by-profile review"],
      },
      huntlo: {
        title: "Huntlo AI candidate matching",
        summary: "Compatibility across skill depth, seniority and domain relevance, prioritized for recruiter review",
        items: ["Bi-directional compatibility", "Skill depth, seniority and domain", "Prioritized recruiter review"],
      },
    },
    faqs: [
      {
        question: "What is AI candidate matching?",
        answer:
          "AI candidate matching compares candidate profiles with open requisitions to estimate fit. Huntlo computes bi-directional compatibility between a candidate's career trajectory and the role's requirements, balancing skill depth, seniority and domain relevance, so recruiters can prioritize the strongest alignment.",
      },
      {
        question: "How is matching different from screening?",
        answer:
          "Matching helps recruiters decide which candidates to focus on by comparing profiles with the requisition. Screening then evaluates those candidates against defined criteria — including their responses to screening questions — to decide who is qualified to advance.",
      },
      {
        question: "Do match scores make hiring decisions?",
        answer:
          "No. Match scores prioritize review; they do not decide outcomes. Recruiters apply judgment, context and the organization's appetite for growth trajectories before anyone moves forward.",
      },
      {
        question: "Can past candidates be matched to new roles?",
        answer:
          "Yes. Candidates saved in your talent pools can be considered again when relevant roles open, so strong runners-up from earlier searches are not lost.",
      },
    ],
    related: [
      LINKS.screening,
      LINKS.sourcing,
      LINKS.talentPool,
      {
        name: "Candidate Intelligence",
        href: "/candidate-intelligence",
        icon: "psychology",
        description: "How Huntlo understands candidate context beyond profiles.",
      },
    ],
    cta: {
      title: "Focus on the candidates who fit best",
      body: "Compare candidates with your requisitions and prioritize the strongest alignment — inside one connected hiring platform.",
    },
  },

  {
    slug: "ai-candidate-outreach",
    name: "AI Candidate Outreach",
    seo: {
      title: "AI Candidate Outreach | Huntlo AI Hiring Capabilities",
      description:
        "AI candidate outreach runs personalized, multi-touch engagement across Email and WhatsApp, using sourced profile context to start relevant conversations and automate follow-up timing.",
      ogTitle: "AI Candidate Outreach Across Email and WhatsApp",
      ogDescription:
        "See how Huntlo personalizes candidate outreach with profile context and keeps follow-ups and replies connected to screening and scheduling.",
    },
    hero: {
      summary:
        "Personalized, multi-touch engagement across Email and WhatsApp that starts conversations from real candidate context — not generic blast templates.",
      chips: ["Email & WhatsApp", "Profile-based personalization", "Automated follow-up timing", "Reply-triggered next steps"],
    },
    visual: {
      input: {
        label: "Sourced profile context",
        text: "Candidate background, role and recent work",
      },
      middle: {
        label: "Personalized multi-touch outreach",
        items: [
          { icon: "mail", label: "Email" },
          { icon: "chat", label: "WhatsApp" },
          { icon: "schedule_send", label: "Follow-up timing" },
          { icon: "forum", label: "Reply tracking" },
        ],
      },
      output: {
        label: "Candidate conversations",
        liveLabel: "Recruiter oversight",
        pills: ["Follow-up due", "Replied"],
        note: "Replies flow into screening and scheduling",
      },
      flow: ["Screening", "Scheduling", "Engagement", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Candidate Outreach** automates **personalized, multi-touch engagement across Email and WhatsApp**, with messaging rooted in each candidate's background and accomplishments.",
        "Because outreach is connected to sourcing, **candidate profile data informs the message** from the first touch. Huntlo **drafts tailored outreach and automates follow-up timing**, including follow-ups for candidates who have not replied and a respectful closing message.",
        "When a candidate replies, the conversation moves into **screening and interview scheduling** without manual handoffs, while recruiters step into high-priority conversations personally.",
      ],
      concepts: [
        {
          icon: "forum",
          title: "Multi-channel outreach",
          body: "Engagement across Email and WhatsApp in one sequence.",
        },
        {
          icon: "person",
          title: "Profile-based personalization",
          body: "Messages draw on sourced candidate context, not generic templates.",
        },
        {
          icon: "schedule_send",
          title: "Automated follow-up timing",
          body: "No-reply follow-ups and closing messages run on schedule.",
        },
        {
          icon: "verified",
          title: "Approved templates",
          body: "WhatsApp messages use Meta-approved templates.",
        },
        {
          icon: "conversion_path",
          title: "Reply-triggered handoff",
          body: "Replies move candidates into screening and scheduling.",
        },
      ],
    },
    challenge: {
      title: "The outreach challenge for recruiting teams",
      intro:
        "Passive candidates receive a steady stream of generic messages. Outreach that ignores a candidate's background is easy to dismiss, and manual follow-ups slip when recruiters manage many roles at once.",
      items: [
        {
          icon: "mark_email_unread",
          title: "Generic messages get ignored",
          body: "Mass templates that do not reference a candidate's work feel irrelevant and rarely start a conversation.",
        },
        {
          icon: "schedule",
          title: "Follow-ups slip",
          body: "Tracking who needs a second or third touch across many roles is hard to do consistently by hand.",
        },
        {
          icon: "link_off",
          title: "Replies are disconnected from next steps",
          body: "When a candidate responds, moving them into screening or scheduling often requires re-keying details across tools.",
        },
      ],
    },
    workflow: {
      intro: "Outreach picks up where sourcing ends and hands engaged candidates straight to the next stage.",
      steps: [
        {
          icon: "group_add",
          title: "Enroll sourced candidates",
          body: "Select candidates from a sourcing session or talent pool and enroll them into an outreach sequence with their profile context attached.",
        },
        {
          icon: "edit_note",
          title: "Personalize the opening message",
          body: "Huntlo drafts tailored outreach that references candidate background, delivered by Email or through Meta-approved WhatsApp templates.",
        },
        {
          icon: "schedule_send",
          title: "Automate follow-up timing",
          body: "Follow-ups for non-responders and a closing message are sent on schedule, so no candidate is left without a reply.",
        },
        {
          icon: "conversion_path",
          title: "Hand off on reply",
          body: "Candidates who respond move into screening and interview scheduling, with replies tracked in one place.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "send",
        title: "Personalized Multi-channel Sequences",
        body: "Automates personalized, multi-touch engagement campaigns across Email and WhatsApp with tailored messaging rooted in candidate accomplishments.",
        tiles: [
          { icon: "mail", label: "Email" },
          { icon: "chat", label: "WhatsApp" },
          { icon: "schedule_send", label: "Follow-ups" },
          { icon: "forum", label: "Reply tracking" },
        ],
      },
      secondary: [
        {
          icon: "person",
          title: "Context-driven Personalization",
          body: "Delivers individualized, respectful communications grounded in sourced profile context rather than generic blast templates.",
          tags: [{ label: "Generic template" }, { label: "Profile-based message", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Reply-to-Next-Step Handoff",
          body: "Candidate replies trigger the next stage, connecting outreach to screening, scheduling and the recruitment CRM.",
          tags: [
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "forum", label: "AI Candidate Engagement" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI candidate outreach starts first conversations by delivering individualized, respectful communications instead of generic blast templates.",
      points: [
        "Outreach runs across Email and WhatsApp, with WhatsApp messages sent through approved templates.",
        "Sourced profile context personalizes messages, and follow-up timing is automated.",
        "Replies move candidates into screening and scheduling without manual handoffs.",
      ],
      qualification:
        "Response levels vary by role, market, message quality and candidate availability; Huntlo does not guarantee reply rates. Recruiters should review messaging and step into high-priority conversations personally.",
    },
    comparison: {
      dimension: "Engagement approach",
      conventional: {
        summary: "Generic mass email blasts with manual follow-up",
        items: ["Generic mass email blasts", "Manual follow-up tracking"],
      },
      huntlo: {
        title: "Huntlo AI candidate outreach",
        summary: "Individualized, multi-channel engagement across Email and WhatsApp",
        items: ["Profile-based personalization", "Email and WhatsApp sequences", "Automated follow-up timing"],
      },
    },
    faqs: [
      {
        question: "What is AI candidate outreach?",
        answer:
          "AI candidate outreach is the personalized, automated engagement of candidates across communication channels. Huntlo runs multi-touch sequences across Email and WhatsApp, uses sourced profile context to tailor messages, and automates follow-up timing so conversations start from relevant context.",
      },
      {
        question: "Which channels does Huntlo outreach support?",
        answer:
          "Huntlo outreach supports Email and WhatsApp. WhatsApp outreach uses Meta-approved message templates, including an opening message, follow-ups for candidates who have not replied and a closing message.",
      },
      {
        question: "Does AI outreach replace recruiters?",
        answer:
          "No. AI drafts tailored messages and handles follow-up timing, while recruiters step into high-priority conversations, build relationships and decide who moves forward.",
      },
      {
        question: "What happens when a candidate replies?",
        answer:
          "Replies are tracked in one place, and engaged candidates move into AI Candidate Screening and AI Interview Scheduling with their profile context preserved — no re-keying between tools.",
      },
    ],
    related: [
      {
        name: "Email Outreach Overview",
        href: "/email-outreach",
        icon: "mail",
        description: "How Huntlo approaches intent-driven email outreach.",
      },
      LINKS.engagement,
      LINKS.sourcing,
      LINKS.scheduling,
    ],
    cta: {
      title: "Start conversations candidates want to answer",
      body: "Personalize outreach across Email and WhatsApp and move engaged candidates straight into screening and scheduling.",
    },
  },

  {
    slug: "ai-candidate-engagement",
    name: "AI Candidate Engagement",
    seo: {
      title: "AI Candidate Engagement | Huntlo AI Hiring Capabilities",
      description:
        "AI candidate engagement keeps candidates informed between first interest and interviews with smart follow-ups, role-inquiry responses and continuous touchpoints across Email, WhatsApp and voice.",
      ogTitle: "AI Candidate Engagement That Keeps Hiring Momentum",
      ogDescription:
        "See how Huntlo keeps candidate conversations, scheduling and interviews connected to reduce drop-offs between stages.",
    },
    hero: {
      summary:
        "Continuous, well-timed candidate touchpoints between first interest and the interview, so promising candidates stay informed and engaged instead of going quiet.",
      chips: ["Smart follow-ups", "Role inquiry responses", "Multi-channel touchpoints", "Fewer drop-offs"],
    },
    visual: {
      input: {
        label: "Interested candidate",
        text: "Replied to outreach, awaiting the next step",
      },
      middle: {
        label: "Continuous engagement",
        items: [
          { icon: "notifications_active", label: "Smart follow-ups" },
          { icon: "help", label: "Role inquiries" },
          { icon: "event_available", label: "Scheduling nudges" },
          { icon: "forum", label: "Status updates" },
        ],
      },
      output: {
        label: "Engaged pipeline",
        liveLabel: "Recruiter-owned relationships",
        pills: ["Re-engaged", "Active"],
        note: "Conversations stay connected across stages",
      },
      flow: ["Screening", "Scheduling", "Interviews", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Candidate Engagement** maintains candidate relationships through **smart follow-ups, automated responses to role inquiries and continuous interaction touchpoints**.",
        "It focuses on the gap between **initial interest and the formal interview stage**, where candidates most often lose momentum. Huntlo keeps **conversations, readiness, scheduling and interviews connected** across Email, WhatsApp and voice, so candidates are not left waiting for an update.",
        "Recruiters remain responsible for relationships and decisions; engagement improves **timing and continuity** so their attention goes to the conversations that need it.",
      ],
      concepts: [
        {
          icon: "notifications_active",
          title: "Smart follow-ups",
          body: "Timely nudges based on where each candidate is in the process.",
        },
        {
          icon: "help",
          title: "Role inquiry responses",
          body: "Common questions about the role are answered without delay.",
        },
        {
          icon: "forum",
          title: "Multi-channel touchpoints",
          body: "Engagement across Email, WhatsApp and voice.",
        },
        {
          icon: "link",
          title: "Connected stages",
          body: "Conversations, scheduling and interviews stay linked.",
        },
        {
          icon: "handshake",
          title: "Recruiter-owned relationships",
          body: "AI handles continuity; recruiters own the relationship.",
        },
      ],
    },
    challenge: {
      title: "The engagement challenge for recruiting teams",
      intro:
        "Candidates rarely drop out at one dramatic moment. They drift away during the quiet stretches — waiting for a reply, an update or a scheduling link — while recruiters juggle many open roles.",
      items: [
        {
          icon: "hourglass_empty",
          title: "Silence between stages",
          body: "Gaps between first interest and the interview leave candidates uncertain and open to competing offers.",
        },
        {
          icon: "notifications_off",
          title: "Missed follow-ups",
          body: "Manual reminders slip when recruiters manage many conversations across roles.",
        },
        {
          icon: "call_split",
          title: "Fragmented communication",
          body: "Updates spread across inboxes, chat apps and calendars make the candidate experience feel disjointed.",
        },
      ],
    },
    workflow: {
      intro: "Engagement runs alongside every stage, keeping each candidate's next step clear.",
      steps: [
        {
          icon: "track_changes",
          title: "Track each candidate's stage",
          body: "Huntlo follows where every candidate is — replied, screened, awaiting scheduling — so the next interaction is clear.",
        },
        {
          icon: "notifications_active",
          title: "Send well-timed follow-ups",
          body: "Follow-ups and scheduling nudges go out based on engagement and response behavior, across Email, WhatsApp or voice.",
        },
        {
          icon: "help",
          title: "Answer role inquiries",
          body: "Common candidate questions about the role are answered promptly, keeping interest high between recruiter conversations.",
        },
        {
          icon: "handshake",
          title: "Escalate to recruiters",
          body: "Candidates who need a personal conversation are surfaced to recruiters, with the full interaction history attached.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "forum",
        title: "Continuous Candidate Touchpoints",
        body: "Maintains persistent candidate relationships through smart follow-ups, automated role inquiry resolution and continuous interaction touchpoints.",
        tiles: [
          { icon: "mail", label: "Email" },
          { icon: "chat", label: "WhatsApp" },
          { icon: "call", label: "Voice" },
          { icon: "notifications_active", label: "Follow-ups" },
        ],
      },
      secondary: [
        {
          icon: "link",
          title: "Drop-off Prevention",
          body: "Helps prevent candidate ghosting between initial interest and formal interview stages by keeping every candidate informed of their next step.",
          tags: [{ label: "Waiting in silence" }, { label: "Next step shared", highlight: true }],
        },
        {
          icon: "event_available",
          title: "Engagement Through Scheduling",
          body: "Keeps engagement connected to interview scheduling, helping secure candidates soon after they qualify.",
          tags: [
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "send", label: "AI Candidate Outreach" },
            { icon: "record_voice_over", label: "AI Voice Interviews" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI candidate engagement reinforces a responsive candidate experience by reducing missed follow-ups and fragmented communication between stages.",
      points: [
        "Follow-ups are triggered by candidate engagement and response behavior.",
        "Engagement spans Email, WhatsApp and voice within the same workflow.",
        "Conversations, scheduling and interviews stay connected, with recruiters owning relationships.",
      ],
      qualification:
        "Engagement improves continuity but cannot guarantee candidate retention, which also depends on role, compensation, timing and competing opportunities. Recruiters should personally handle sensitive or high-priority conversations.",
    },
    comparison: {
      dimension: "Between-stage engagement",
      conventional: {
        summary: "Manual reminders and ad-hoc updates across separate inboxes",
        items: ["Manual reminder tracking", "Ad-hoc status updates"],
      },
      huntlo: {
        title: "Huntlo AI candidate engagement",
        summary: "Behavior-triggered follow-ups and connected touchpoints across channels",
        items: ["Engagement-triggered follow-ups", "Email, WhatsApp and voice touchpoints", "Connected scheduling and interviews"],
      },
    },
    faqs: [
      {
        question: "What is AI candidate engagement?",
        answer:
          "AI candidate engagement is the continuous, well-timed communication that keeps candidates informed and interested as they move through hiring. Huntlo maintains relationships through smart follow-ups, automated responses to role inquiries and touchpoints across Email, WhatsApp and voice.",
      },
      {
        question: "How is engagement different from outreach?",
        answer:
          "Outreach starts the conversation with a candidate. Engagement keeps it going — maintaining momentum after the first reply, through screening and scheduling, until the interview stage.",
      },
      {
        question: "How does Huntlo reduce candidate drop-offs?",
        answer:
          "By keeping conversations, readiness, scheduling and interviews connected, Huntlo reduces delays, missed follow-ups and inconsistent experiences between stages — the moments when candidates most often disengage.",
      },
      {
        question: "Can Huntlo automate all candidate communication?",
        answer:
          "Huntlo automates timing and continuity, such as follow-ups and routine updates. Recruiters remain responsible for relationships, sensitive conversations and hiring decisions.",
      },
    ],
    related: [
      {
        name: "Candidate Engagement Overview",
        href: "/candidate-engagement",
        icon: "favorite",
        description: "How Huntlo approaches candidate relationship intelligence.",
      },
      LINKS.outreach,
      LINKS.scheduling,
      LINKS.automation,
    ],
    cta: {
      title: "Keep every candidate moving forward",
      body: "Maintain momentum between first interest and the interview with connected, well-timed engagement — inside one hiring platform.",
    },
  },

  {
    slug: "ai-interview-scheduling",
    name: "AI Interview Scheduling",
    seo: {
      title: "AI Interview Scheduling | Huntlo AI Hiring Capabilities",
      description:
        "AI interview scheduling coordinates panel availability, candidate time zones and calendar holds into self-scheduling workflows, with automated confirmations and reminders connected to the rest of hiring.",
      ogTitle: "AI Interview Scheduling With Candidate Self-Booking",
      ogDescription:
        "See how Huntlo turns qualified candidates into booked interviews with panel calendar sync, self-booking and reminders.",
    },
    hero: {
      summary:
        "Self-scheduling that coordinates panel availability, candidate time zones and calendar holds, so qualified candidates book interviews without rounds of back-and-forth.",
      chips: ["Candidate self-booking", "Panel calendar sync", "Time zone handling", "Automated reminders"],
    },
    visual: {
      input: {
        label: "Qualified candidate",
        text: "Screening complete, ready for interview",
      },
      middle: {
        label: "Scheduling coordination",
        items: [
          { icon: "groups", label: "Panel availability" },
          { icon: "public", label: "Time zones" },
          { icon: "event", label: "Calendar holds" },
          { icon: "timer", label: "Interviewer buffers" },
        ],
      },
      output: {
        label: "Interview booked",
        liveLabel: "Reminders scheduled",
        pills: ["Reminder sent", "Confirmed"],
        note: "Pipeline status updated automatically",
      },
      flow: ["Interview", "Feedback", "Decision", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Interview Scheduling** harmonizes **panel availability, candidate time zones, interviewer buffers and calendar holds** into **automated self-scheduling workflows**.",
        "Once a candidate qualifies or replies, scheduling is **triggered without manual handoffs**: candidates choose a slot through **panel calendar sync**, receive confirmations, and get **automated reminders before the interview** — including WhatsApp invitations and reminders.",
        "Recruiters still manage interview logistics and prepare interviewers with evaluation guides, while Huntlo handles the coordination that usually slows hiring down.",
      ],
      concepts: [
        {
          icon: "event_available",
          title: "Candidate self-booking",
          body: "Candidates choose from available slots themselves.",
        },
        {
          icon: "sync",
          title: "Panel calendar sync",
          body: "Availability is checked against interviewer calendars.",
        },
        {
          icon: "public",
          title: "Time zone handling",
          body: "Slots are converted for candidates in other regions.",
        },
        {
          icon: "notifications_active",
          title: "Automated reminders",
          body: "Confirmations and reminders before each interview.",
        },
        {
          icon: "bolt",
          title: "Triggered scheduling",
          body: "Scheduling starts when a candidate qualifies or replies.",
        },
      ],
    },
    challenge: {
      title: "The scheduling challenge for recruiting teams",
      intro:
        "Scheduling is pure coordination, yet it regularly delays hiring. Every interview depends on several calendars, time zones and confirmations, and each round of back-and-forth risks losing a high-demand candidate.",
      items: [
        {
          icon: "forward_to_inbox",
          title: "Back-and-forth coordination",
          body: "Manually matching candidate and panel availability over email can take days for a single interview.",
        },
        {
          icon: "person_remove",
          title: "Candidates drop off while waiting",
          body: "High-demand candidates move on to other conversations when scheduling stalls after qualification.",
        },
        {
          icon: "event_busy",
          title: "Reschedules and no-shows",
          body: "Changes and missed reminders create rework and fragmented updates for recruiters and panels.",
        },
      ],
    },
    workflow: {
      intro:
        "Scheduling begins the moment a candidate is ready and keeps everyone informed until the interview takes place.",
      steps: [
        {
          icon: "bolt",
          title: "Trigger on qualification",
          body: "When a candidate qualifies or replies, Huntlo starts scheduling automatically — no manual handoff from screening.",
        },
        {
          icon: "sync",
          title: "Check panel availability",
          body: "Panel calendars are monitored, interviewer buffers respected and time zones converted for the candidate.",
        },
        {
          icon: "event_available",
          title: "Let the candidate self-book",
          body: "The candidate picks a slot that works, and the interview is confirmed for both sides.",
        },
        {
          icon: "notifications_active",
          title: "Confirm and remind",
          body: "Automated reminders go out before the interview, and pipeline status updates if the candidate reschedules.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "event_available",
        title: "Automated Self-scheduling",
        body: "Harmonizes panel availability, candidate time zones, interviewer buffers and calendar holds into automated self-scheduling workflows.",
        tiles: [
          { icon: "groups", label: "Panel availability" },
          { icon: "public", label: "Time zones" },
          { icon: "timer", label: "Interviewer buffers" },
          { icon: "event", label: "Calendar holds" },
        ],
      },
      secondary: [
        {
          icon: "notifications_active",
          title: "Confirmations and Reminders",
          body: "Sends interview invitations asking candidates to confirm availability, followed by automated reminders ahead of the interview.",
          tags: [{ label: "Invitation" }, { label: "Reminders sent", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Connected Interview Workflow",
          body: "Links scheduling with screening, engagement and the candidate record so nothing is re-entered.",
          tags: [
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "record_voice_over", label: "AI Voice Interviews" },
            { icon: "forum", label: "AI Candidate Engagement" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI interview scheduling helps secure interview slots soon after qualification, before competing offers or candidate drop-offs occur.",
      points: [
        "Scheduling is triggered when candidates qualify or reply, without manual handoffs.",
        "Candidates self-book through panel calendar sync, with time zones handled.",
        "Automated confirmations and reminders keep candidates and panels aligned.",
      ],
      qualification:
        "Booking speed depends on panel availability, calendar access and candidate responsiveness. Recruiters remain responsible for interview logistics, panel preparation and exceptions that need a personal touch.",
    },
    comparison: {
      dimension: "Coordination method",
      conventional: {
        summary: "Manual back-and-forth email coordination between candidates and panels",
        items: ["Email back-and-forth", "Manual reminders"],
      },
      huntlo: {
        title: "Huntlo AI interview scheduling",
        summary: "Real-time panel calendar sync with candidate self-booking",
        items: ["Panel calendar sync", "Candidate self-booking", "Automated reminders"],
      },
    },
    faqs: [
      {
        question: "What is AI interview scheduling?",
        answer:
          "AI interview scheduling automates the coordination needed to book interviews. Huntlo harmonizes panel availability, candidate time zones, interviewer buffers and calendar holds, then lets candidates self-book a slot and sends confirmations and reminders automatically.",
      },
      {
        question: "When does scheduling start?",
        answer:
          "Scheduling is triggered when a candidate qualifies through screening or replies to outreach, so there is no manual handoff between stages.",
      },
      {
        question: "Is Huntlo just a scheduling link tool?",
        answer:
          "No. Scheduling links focus on slots and invites. In Huntlo, scheduling is one connected layer of hiring: it is triggered by screening and outreach, keeps candidate context attached and updates the pipeline as interviews are booked or rescheduled.",
      },
      {
        question: "What do recruiters still handle?",
        answer:
          "Recruiters manage interview logistics and exceptions, prepare interviewers with calibrated evaluation guides and brief candidates on panel expectations. Huntlo handles the repetitive coordination.",
      },
    ],
    related: [
      {
        name: "Interview Scheduling Overview",
        href: "/interview-scheduling",
        icon: "calendar_month",
        description: "How Huntlo approaches scheduling intelligence.",
      },
      LINKS.screening,
      LINKS.voice,
      LINKS.engagement,
    ],
    cta: {
      title: "Book interviews while candidates are ready",
      body: "Turn qualified candidates into confirmed interviews with self-booking, calendar sync and reminders — inside one hiring platform.",
    },
  },

  {
    slug: "ai-voice-interviews",
    name: "AI Voice Interviews",
    plural: true,
    seo: {
      title: "AI Voice Interviews | Huntlo AI Hiring Capabilities",
      description:
        "AI voice interviews run structured preliminary phone screens that verify availability, notice period, salary expectations and role interest, producing transcripts and qualification summaries for recruiter review.",
      ogTitle: "AI Voice Interviews for Structured Preliminary Screening",
      ogDescription:
        "See how Huntlo runs structured voice screening calls and delivers transcripts, scores and qualification outcomes to recruiters.",
    },
    hero: {
      summary:
        "Structured, conversational preliminary phone screens that confirm the basics and capture role-relevant answers, so recruiters start deeper interviews with verified context.",
      chips: ["Structured phone screens", "Role-specific questions", "Transcripts & summaries", "Recruiter override"],
    },
    visual: {
      input: {
        label: "Screening criteria",
        text: "Availability, notice period, compensation and role interest",
      },
      middle: {
        label: "Structured voice screen",
        items: [
          { icon: "event_available", label: "Availability" },
          { icon: "schedule", label: "Notice period" },
          { icon: "payments", label: "Salary expectations" },
          { icon: "record_voice_over", label: "Communication" },
        ],
      },
      output: {
        label: "Qualification summary",
        liveLabel: "Logged to record",
        pills: ["Transcript", "Response scores"],
        note: "Recruiters can review and override outcomes",
      },
      flow: ["Scheduling", "Interviews", "Decision", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Voice Interviews** conduct **structured, conversational preliminary phone interviews** to verify **salary expectations, notice periods, role interest and spoken communication**.",
        "Recruiters set the qualification criteria for each role. The voice screen **asks role-specific questions, evaluates answers against those criteria** and produces **transcripts, response scores and structured qualification summaries**.",
        "Every AI screening action is logged in the candidate's record, giving recruiters a **complete audit trail and the ability to override or refine** assessments before candidates move on to panel interviews.",
      ],
      concepts: [
        {
          icon: "record_voice_over",
          title: "Structured phone screens",
          body: "Consistent preliminary conversations for every candidate.",
        },
        {
          icon: "quiz",
          title: "Role-specific questions",
          body: "Questions follow the criteria recruiters set for the role.",
        },
        {
          icon: "description",
          title: "Transcripts and summaries",
          body: "Each call produces a transcript and qualification summary.",
        },
        {
          icon: "grading",
          title: "Response scoring",
          body: "Answers are evaluated against the role's criteria.",
        },
        {
          icon: "manage_history",
          title: "Audit trail and override",
          body: "Actions are logged, and recruiters can override outcomes.",
        },
      ],
    },
    challenge: {
      title: "The preliminary screening challenge",
      intro:
        "Preliminary phone screens are necessary but repetitive. Recruiters spend hours confirming the same basics — availability, notice period, compensation — before they can focus on the conversations that require judgment.",
      items: [
        {
          icon: "phone_in_talk",
          title: "Repetitive first-round calls",
          body: "Confirming logistics candidate by candidate consumes time that could go to deeper evaluation and closing.",
        },
        {
          icon: "balance",
          title: "Inconsistent questions",
          body: "Different recruiters ask different questions, making candidates hard to compare fairly.",
        },
        {
          icon: "notes",
          title: "Notes are incomplete",
          body: "Key answers from phone screens are often summarized from memory or lost between tools.",
        },
      ],
    },
    workflow: {
      intro:
        "Voice interviews run as a structured preliminary stage, with recruiters reviewing every outcome before panels get involved.",
      steps: [
        {
          icon: "tune",
          title: "Set qualification criteria",
          body: "Recruiters define what the screen should verify for the role — availability, notice period, compensation expectations, experience and role fit.",
        },
        {
          icon: "record_voice_over",
          title: "Run the structured voice screen",
          body: "Huntlo conducts a conversational phone screen, asking role-specific questions consistently for every candidate.",
        },
        {
          icon: "grading",
          title: "Evaluate and summarize",
          body: "Answers are evaluated against the criteria, producing a transcript, response scores and a qualification summary.",
        },
        {
          icon: "how_to_reg",
          title: "Review, override and advance",
          body: "Recruiters review outcomes, override or refine assessments where needed, and move qualified candidates to scheduling.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "record_voice_over",
        title: "Structured Preliminary Screening",
        body: "Conducts structured, conversational preliminary phone interviews to verify salary expectations, notice periods, role interest and spoken communication skills.",
        tiles: [
          { icon: "event_available", label: "Availability" },
          { icon: "schedule", label: "Notice period" },
          { icon: "payments", label: "Salary expectations" },
          { icon: "interests", label: "Role interest" },
        ],
      },
      secondary: [
        {
          icon: "description",
          title: "Transcripts and Qualification Summaries",
          body: "Generates transcripts, response scores and structured insights for recruiters and hiring managers after every call.",
          tags: [{ label: "Call transcript" }, { label: "Qualification summary", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Connected to Interviews and Records",
          body: "Logs every screening action in the candidate's record and moves qualified candidates into interview scheduling.",
          tags: [
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "quiz", label: "AI Recruitment Assessments" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI voice interviews replace repetitive preliminary phone screens with consistent, documented conversations that recruiters can review.",
      points: [
        "Voice screens verify availability, notice period, compensation expectations and role interest.",
        "Each call produces a transcript, response scores and a structured qualification summary.",
        "Screening actions are logged with an audit trail, and recruiters can override AI assessments.",
      ],
      qualification:
        "Voice screening covers preliminary qualification only. Scores reflect answers to the configured questions and should be reviewed by recruiters; behavioral interviews, compensation negotiation and final decisions remain with your hiring team.",
    },
    comparison: {
      dimension: "Preliminary screening",
      conventional: {
        summary: "Manual phone calls with notes taken from memory",
        items: ["Manual first-round calls", "Inconsistent notes"],
      },
      huntlo: {
        title: "Huntlo AI voice interviews",
        summary: "Structured AI voice screens with transcripts, scores and audit trails",
        items: ["Consistent role-specific questions", "Transcripts and summaries", "Recruiter review and override"],
      },
    },
    faqs: [
      {
        question: "What are AI voice interviews?",
        answer:
          "AI voice interviews are structured, conversational preliminary phone screens run by AI. Huntlo asks role-specific questions to verify details such as availability, notice period, salary expectations and role interest, then produces a transcript and qualification summary for recruiters.",
      },
      {
        question: "What do recruiters see after a voice screen?",
        answer:
          "Recruiters see the call transcript, response scores and the qualification outcome. Every AI screening action is logged in the candidate's record, providing an audit trail and the ability to override or refine assessments.",
      },
      {
        question: "Do AI voice interviews replace human interviews?",
        answer:
          "No. They replace repetitive preliminary screens. Deep behavioral interviews, team and culture assessments, compensation negotiation and final decisions stay with recruiters and hiring managers.",
      },
      {
        question: "What happens after a candidate passes the voice screen?",
        answer:
          "Qualified candidates move into AI Interview Scheduling to choose an interview slot, with the transcript and summary attached to their record.",
      },
    ],
    related: [
      {
        name: "Interview Overview",
        href: "/interview",
        icon: "groups",
        description: "Interview coordination, scorecards and feedback in Huntlo.",
      },
      LINKS.screening,
      LINKS.scheduling,
      LINKS.assessments,
    ],
    cta: {
      title: "Let AI handle the first call",
      body: "Run structured preliminary voice screens and give recruiters transcripts and summaries before panel interviews.",
    },
  },

  {
    slug: "ai-recruitment-assessments",
    name: "AI Recruitment Assessments",
    plural: true,
    seo: {
      title: "AI Recruitment Assessments | Huntlo AI Hiring Capabilities",
      description:
        "AI recruitment assessments deliver role-based skill evaluations between screening and interviews, with automated scoring and candidate reports that give hiring teams clear skill signals.",
      ogTitle: "AI Recruitment Assessments for Role-Based Skill Signals",
      ogDescription:
        "See how Huntlo places role-based assessments between screening and interviews so panels meet candidates with objective skill context.",
    },
    hero: {
      summary:
        "Role-based skill evaluations calibrated to day-to-day job expectations, so hiring teams see objective competency signals before committing panel time.",
      chips: ["Role-based tests", "Technical & situational", "Automated scoring", "Candidate reports"],
    },
    visual: {
      input: {
        label: "Role expectations",
        text: "Day-to-day skills and problem-solving standards",
      },
      middle: {
        label: "Skill dimensions",
        items: [
          { icon: "code", label: "Technical depth" },
          { icon: "forum", label: "Communication" },
          { icon: "extension", label: "Problem solving" },
          { icon: "work", label: "Role fit" },
        ],
      },
      output: {
        label: "Candidate report",
        liveLabel: "Team review",
        pills: ["Skill scores", "Advance"],
        note: "Results inform interview preparation",
      },
      flow: ["Interviews", "Scheduling", "Decision", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Recruitment Assessments** deliver **scenario-based technical and situational skill evaluations** calibrated to **day-to-day job expectations and problem-solving standards**.",
        "Assessments sit **between screening and interviews**. Recruiters assign role-based tests, candidates complete them on their own schedule, and Huntlo produces **automated skill scores, breakdowns and performance summaries**.",
        "Results combine with sourcing context and screening outcomes into **one candidate profile**, giving hiring managers **objective competency data** before engineering and leadership hours go into panel interviews.",
      ],
      concepts: [
        {
          icon: "assignment",
          title: "Role-based tests",
          body: "Assessments matched to the role being hired.",
        },
        {
          icon: "code",
          title: "Technical and situational evaluation",
          body: "Coding, system design, problem-solving and scenario-based tasks.",
        },
        {
          icon: "grading",
          title: "Automated scoring",
          body: "Consistent scoring without manual grading overhead.",
        },
        {
          icon: "summarize",
          title: "Candidate reports",
          body: "Skill breakdowns and performance summaries for reviewers.",
        },
        {
          icon: "groups",
          title: "Team review",
          body: "Hiring teams compare results before advancing candidates.",
        },
      ],
    },
    challenge: {
      title: "The skill evaluation challenge",
      intro:
        "Without objective skill data, panel interviews become the first real test of competency — an expensive place to discover a mismatch.",
      items: [
        {
          icon: "schedule",
          title: "Panel time spent on mismatches",
          body: "Engineering and leadership interviewers spend hours with candidates who lack core role skills.",
        },
        {
          icon: "rate_review",
          title: "Subjective skill judgments",
          body: "Without a common evaluation, reviewers compare candidates on impressions rather than evidence.",
        },
        {
          icon: "pending_actions",
          title: "Manual grading overhead",
          body: "Scoring tests by hand is slow and inconsistent across reviewers.",
        },
      ],
    },
    workflow: {
      intro: "Assessments add an objective skill checkpoint between screening and interviews.",
      steps: [
        {
          icon: "assignment",
          title: "Assign a role-based assessment",
          body: "Send qualified candidates an assessment aligned with the role's technical and situational expectations.",
        },
        {
          icon: "computer",
          title: "Candidates complete on their schedule",
          body: "Candidates finish the assessment when it suits them, without coordinating a live session.",
        },
        {
          icon: "grading",
          title: "Score automatically",
          body: "Huntlo generates skill scores and breakdowns across dimensions such as technical depth, communication and problem solving.",
        },
        {
          icon: "how_to_reg",
          title: "Review and advance",
          body: "Hiring teams compare candidate reports and move the strongest performers into interviews.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "quiz",
        title: "Role-calibrated Skill Evaluations",
        body: "Delivers scenario-based technical and situational skill evaluations calibrated specifically to day-to-day job expectations and problem-solving standards.",
        tiles: [
          { icon: "code", label: "Technical depth" },
          { icon: "forum", label: "Communication" },
          { icon: "extension", label: "Problem solving" },
          { icon: "work", label: "Role fit" },
        ],
      },
      secondary: [
        {
          icon: "summarize",
          title: "Automated Scoring and Reports",
          body: "Scores candidates consistently and produces skill breakdowns and performance summaries without manual grading.",
          tags: [{ label: "Manual grading" }, { label: "Automated skill scores", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Evidence for Interview Panels",
          body: "Provides objective competency data before panel interviews, connected to the rest of the candidate record.",
          tags: [
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "record_voice_over", label: "AI Voice Interviews" },
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI recruitment assessments give hiring teams objective competency data before they commit time to in-depth panel interviews.",
      points: [
        "Assessments are role-based and sit between screening and interviews.",
        "Scoring is automated, with skill breakdowns and performance summaries.",
        "Assessment results join sourcing and screening context in one candidate profile.",
      ],
      qualification:
        "Assessment scores measure performance on the specific tasks assigned and should be one input among several. Configure assessments to reflect real job requirements, and confirm the assessment features available for your workspace with the Huntlo team.",
    },
    comparison: {
      dimension: "Skill evaluation",
      conventional: {
        summary: "Unstructured skill checks inside panel interviews, graded manually",
        items: ["Skills judged in interviews", "Manual grading"],
      },
      huntlo: {
        title: "Huntlo AI recruitment assessments",
        summary: "Role-based assessments with automated scoring before interviews",
        items: ["Role-calibrated tests", "Automated skill scoring", "Candidate reports for panels"],
      },
    },
    faqs: [
      {
        question: "What are AI recruitment assessments?",
        answer:
          "AI recruitment assessments are role-based skill evaluations that measure how candidates perform on tasks relevant to the job. Huntlo delivers technical and situational assessments, scores them automatically and summarizes results for hiring teams.",
      },
      {
        question: "Where do assessments fit in the hiring process?",
        answer:
          "Assessments sit between screening and interviews. Candidates who pass screening complete a role-based assessment, and the strongest performers advance to panel interviews with their results attached.",
      },
      {
        question: "What kinds of skills can be assessed?",
        answer:
          "Assessments can cover technical skills such as coding, system design and problem solving, as well as situational and role-specific skills. Reports break results down by dimension so reviewers can compare candidates consistently.",
      },
      {
        question: "Do assessment scores decide who gets hired?",
        answer:
          "No. Scores provide objective evidence for hiring teams, but they are one input alongside screening, interviews and recruiter judgment. Final decisions stay with your team.",
      },
    ],
    related: [
      {
        name: "Assessments Overview",
        href: "/assessments",
        icon: "assignment",
        description: "Product overview of role-based candidate assessments.",
      },
      LINKS.screening,
      LINKS.voice,
      LINKS.scheduling,
    ],
    cta: {
      title: "Bring skill evidence into every interview",
      body: "Assess candidates against real job expectations and give panels objective competency data — inside one hiring platform.",
    },
  },

  {
    slug: "ai-recruitment-crm",
    name: "AI Recruitment CRM",
    seo: {
      title: "AI Recruitment CRM | Huntlo AI Hiring Capabilities",
      description:
        "Huntlo's AI recruitment CRM centralizes candidate conversations, outreach history, screening transcripts and timelines into one searchable record that complements your existing ATS.",
      ogTitle: "AI Recruitment CRM: One Living Record for Every Candidate",
      ogDescription:
        "See how Huntlo keeps outreach, replies, screening and interview context together in a searchable candidate record.",
    },
    hero: {
      summary:
        "One living record for every candidate — conversations, outreach history, screening transcripts and timelines — so context is never lost between stages or requisitions.",
      chips: ["Unified candidate records", "Conversation history", "Campaign workspaces", "Works alongside your ATS"],
    },
    visual: {
      input: {
        label: "Candidate interactions",
        text: "Outreach, replies, screening calls and interview feedback",
      },
      middle: {
        label: "Unified candidate record",
        items: [
          { icon: "forum", label: "Conversations" },
          { icon: "send", label: "Outreach history" },
          { icon: "description", label: "Screening transcripts" },
          { icon: "timeline", label: "Timeline" },
        ],
      },
      output: {
        label: "Searchable recruitment memory",
        liveLabel: "Shared with your team",
        pills: ["Full history", "Silver medalist"],
        note: "Context reused across requisitions",
      },
      flow: ["Talent pools", "Matching", "Outreach", "Analytics"],
    },
    overview: {
      paragraphs: [
        "**AI Recruitment CRM** centralizes **candidate interaction records, conversation transcripts, outreach histories and relationship timelines** into a **searchable recruitment memory**.",
        "As candidates move through Huntlo, **screening transcripts, assessment results and candidate preferences flow into their record**. Replies across Email and WhatsApp are tracked in **unified campaign workspaces**, and every AI screening action is logged with an audit trail.",
        "The CRM is designed to **complement your existing ATS**, not replace it: Huntlo handles sourcing, outreach and screening context, while qualified candidates continue into the systems your team already uses.",
      ],
      concepts: [
        {
          icon: "contacts",
          title: "Unified candidate records",
          body: "One record per candidate across every stage.",
        },
        {
          icon: "forum",
          title: "Conversation history",
          body: "Email and WhatsApp replies tracked in one place.",
        },
        {
          icon: "folder_shared",
          title: "Campaign workspaces",
          body: "Each requisition gets its own workspace and pipeline view.",
        },
        {
          icon: "manage_history",
          title: "Audit trail",
          body: "AI screening actions are logged against the candidate.",
        },
        {
          icon: "integration_instructions",
          title: "Works alongside your ATS",
          body: "Complements existing ATS and CRM systems.",
        },
      ],
    },
    challenge: {
      title: "The candidate data challenge",
      intro:
        "Valuable candidate context is scattered. Conversations sit in personal inboxes, screening notes live in documents and interview feedback is trapped in separate tools — so every new requisition starts from zero.",
      items: [
        {
          icon: "inbox",
          title: "Context trapped in inboxes",
          body: "Conversation history and screening notes stay with individual recruiters instead of the team.",
        },
        {
          icon: "content_copy",
          title: "Redundant candidate touchpoints",
          body: "Without a shared record, candidates are contacted again without knowledge of earlier conversations.",
        },
        {
          icon: "history",
          title: "Institutional memory is lost",
          body: "When recruiters change roles or requisitions close, relationships and context disappear with them.",
        },
      ],
    },
    workflow: {
      intro: "The recruitment CRM builds itself as candidates move through connected Huntlo workflows.",
      steps: [
        {
          icon: "input",
          title: "Capture every interaction",
          body: "Outreach messages, replies, screening calls and interview context are recorded against the candidate as work happens.",
        },
        {
          icon: "forum",
          title: "Unify conversations",
          body: "Replies across Email and WhatsApp are tracked in one campaign workspace with pipeline visibility.",
        },
        {
          icon: "timeline",
          title: "Build the candidate timeline",
          body: "Transcripts, assessment results and milestones combine into a living record with a complete hiring history.",
        },
        {
          icon: "manage_search",
          title: "Reuse context across requisitions",
          body: "Recruiters search past interactions and resurface strong candidates when new roles open, without redundant outreach.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "contacts",
        title: "Living Candidate Records",
        body: "Centralizes candidate interaction records, conversation transcripts, outreach histories and relationship timelines into a searchable recruitment memory bank.",
        tiles: [
          { icon: "forum", label: "Conversations" },
          { icon: "send", label: "Outreach history" },
          { icon: "description", label: "Transcripts" },
          { icon: "timeline", label: "Timelines" },
        ],
      },
      secondary: [
        {
          icon: "folder_shared",
          title: "Campaign Workspaces",
          body: "Gives each requisition its own workspace with sourcing sessions, outreach sequences, reply tracking and pipeline visibility.",
          tags: [{ label: "Scattered threads" }, { label: "One workspace", highlight: true }],
        },
        {
          icon: "integration_instructions",
          title: "Connected to Your Hiring Stack",
          body: "Complements existing ATS and CRM systems and connects with email, WhatsApp Business APIs and calendar tools.",
          tags: [
            { icon: "mail", label: "Email providers" },
            { icon: "chat", label: "WhatsApp Business" },
            { icon: "event_available", label: "Calendly" },
            { icon: "api", label: "Enterprise API access" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "The AI recruitment CRM unifies dispersed talent interactions across requisitions, creating lasting institutional memory and reducing redundant candidate touchpoints.",
      points: [
        "Conversations, outreach history and screening transcripts are kept in one candidate record.",
        "Each requisition has a campaign workspace with reply tracking and pipeline visibility.",
        "Huntlo complements existing ATS and CRM systems rather than replacing them.",
      ],
      qualification:
        "Records reflect the interactions captured through Huntlo workflows and connected channels. Activity that happens outside connected tools must be added separately, and data handling should follow your organization's privacy policies.",
    },
    comparison: {
      dimension: "Candidate records",
      conventional: {
        summary: "Static resume archives and notes scattered across inboxes",
        items: ["Static resume archives", "Scattered inbox notes"],
      },
      huntlo: {
        title: "Huntlo AI recruitment CRM",
        summary: "Living records that capture conversations, transcripts and timelines as work happens",
        items: ["Automatic interaction capture", "Unified conversation history", "Searchable candidate timelines"],
      },
    },
    faqs: [
      {
        question: "What is an AI recruitment CRM?",
        answer:
          "An AI recruitment CRM is a system of record for candidate relationships. Huntlo centralizes interaction records, conversation transcripts, outreach histories and relationship timelines into a searchable record that updates as candidates move through hiring workflows.",
      },
      {
        question: "Does Huntlo replace my ATS?",
        answer:
          "No. Huntlo complements existing ATS and recruitment CRM systems. It handles sourcing, outreach and screening context, then feeds qualified candidates into the systems your team already uses.",
      },
      {
        question: "Which channels are captured in the candidate record?",
        answer:
          "Email and WhatsApp conversations are tracked in unified campaign workspaces, alongside screening transcripts, assessment results and interview context generated within Huntlo.",
      },
      {
        question: "How does the CRM help with future roles?",
        answer:
          "Because past conversations and outcomes are searchable, recruiters can resurface strong candidates — including silver medalists — when new roles open, without starting from scratch or repeating outreach blindly.",
      },
    ],
    related: [
      LINKS.talentPool,
      LINKS.outreach,
      LINKS.analytics,
      {
        name: "Integrations",
        href: "/integrations",
        icon: "integration_instructions",
        description: "Connect Huntlo with email, WhatsApp and calendar tools.",
      },
    ],
    cta: {
      title: "Keep every candidate relationship in one place",
      body: "Centralize conversations, transcripts and timelines into a living record your whole team can use.",
    },
  },

  {
    slug: "ai-talent-pool-management",
    name: "AI Talent Pool Management",
    seo: {
      title: "AI Talent Pool Management | Huntlo AI Hiring Capabilities",
      description:
        "AI talent pool management organizes saved candidates into reusable pools by role, skills and status, so teams can revisit past sourcing work and launch outreach when new roles open.",
      ogTitle: "AI Talent Pool Management: Start Every Search Warm",
      ogDescription:
        "See how Huntlo helps teams save, organize and reuse candidate pools across roles and campaigns.",
    },
    hero: {
      summary:
        "Organized, reusable talent pools built from your sourcing work, so every new requisition can start with candidates your team already knows.",
      chips: ["Saved candidates", "Tags & smart filters", "Shared team pools", "Campaign-ready"],
    },
    visual: {
      input: {
        label: "Sourcing sessions",
        text: "Candidates saved from searches across roles",
      },
      middle: {
        label: "Organized talent pools",
        items: [
          { icon: "bookmark", label: "Saved candidates" },
          { icon: "sell", label: "Tags" },
          { icon: "filter_list", label: "Smart filters" },
          { icon: "history", label: "Search history" },
        ],
      },
      output: {
        label: "Ready-to-engage pool",
        liveLabel: "Shared across team",
        pills: ["Contacted", "Shortlisted"],
        note: "Add pooled candidates to outreach in one step",
      },
      flow: ["Matching", "Outreach", "Screening", "CRM"],
    },
    overview: {
      paragraphs: [
        "**AI Talent Pool Management** organizes candidate databases into **dynamic talent pools**, so past candidates and silver medalists remain within reach when relevant roles open.",
        "Recruiters **save candidates from search sessions, organize them across roles and hiring priorities**, and use **tags and smart filters** by skills, location and status. **Search history** lets teams revisit and reuse earlier sourcing sessions.",
        "Pools are **shared across the recruiting team** and **campaign-ready**: pooled candidates can be added to outreach in one step and connect to matching and the recruitment CRM.",
      ],
      concepts: [
        {
          icon: "bookmark",
          title: "Saved candidates",
          body: "Keep promising profiles from every sourcing session.",
        },
        {
          icon: "sell",
          title: "Tags and smart filters",
          body: "Organize by role, skills, location and status.",
        },
        {
          icon: "group",
          title: "Shared pools",
          body: "Candidate pools and session history shared across the team.",
        },
        {
          icon: "history",
          title: "Reusable sourcing sessions",
          body: "Revisit or clone sessions for similar roles.",
        },
        {
          icon: "campaign",
          title: "Campaign-ready pools",
          body: "Add pooled candidates to outreach in one step.",
        },
      ],
    },
    challenge: {
      title: "The talent reuse challenge",
      intro:
        "Teams repeatedly source the same kinds of candidates from scratch. Past applicants and runners-up sit idle in archives, and good sourcing work disappears once a requisition closes.",
      items: [
        {
          icon: "inventory_2",
          title: "Past candidates sit idle",
          body: "Silver medalists and earlier applicants are rarely reconsidered when similar roles reopen.",
        },
        {
          icon: "replay",
          title: "Sourcing starts from zero",
          body: "Without saved sessions and pools, recruiters rebuild searches for every new requisition.",
        },
        {
          icon: "group_off",
          title: "Pools live with individuals",
          body: "Spreadsheets and personal lists make it hard for the team to share and reuse candidates.",
        },
      ],
    },
    workflow: {
      intro: "Talent pools turn each search into an asset the whole team can reuse.",
      steps: [
        {
          icon: "bookmark_add",
          title: "Save candidates from searches",
          body: "Save promising profiles from any sourcing session into a pool instead of losing them when the search ends.",
        },
        {
          icon: "sell",
          title: "Organize by role and priority",
          body: "Tag candidates and organize pools across roles and hiring priorities, with smart filters for skills, location and status.",
        },
        {
          icon: "manage_search",
          title: "Revisit when roles open",
          body: "When a new requisition opens, search existing pools and past sessions before sourcing from scratch.",
        },
        {
          icon: "campaign",
          title: "Launch outreach from the pool",
          body: "Add pooled candidates to an outreach campaign in one step, with their history carried into the CRM.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "groups",
        title: "Dynamic Talent Pools",
        body: "Organizes candidate databases into dynamic talent pools, keeping past candidates within reach when relevant roles open.",
        tiles: [
          { icon: "bookmark", label: "Saved candidates" },
          { icon: "sell", label: "Tags" },
          { icon: "filter_list", label: "Smart filters" },
          { icon: "history", label: "Search history" },
        ],
      },
      secondary: [
        {
          icon: "group",
          title: "Team-wide Shared Pools",
          body: "Shares candidate pools and session history across the recruiting team, and lets teams clone successful sourcing sessions for similar roles.",
          tags: [{ label: "Personal lists" }, { label: "Shared team pools", highlight: true }],
        },
        {
          icon: "campaign",
          title: "Campaign-ready Pipelines",
          body: "Keeps every pool ready for outreach and connects pooled candidates to matching and the candidate record.",
          tags: [
            { icon: "send", label: "AI Candidate Outreach" },
            { icon: "hub", label: "AI Candidate Matching" },
            { icon: "contacts", label: "AI Recruitment CRM" },
            { icon: "person_search", label: "AI Candidate Sourcing" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI talent pool management lets talent teams start searches with a warm, known community instead of sourcing from scratch every time.",
      points: [
        "Candidates can be saved from sourcing sessions and organized across roles and priorities.",
        "Tags and smart filters organize pools by skills, location and status.",
        "Pooled candidates can be added to outreach campaigns in one step.",
      ],
      qualification:
        "Pool quality depends on how consistently your team saves, tags and updates candidates. Candidate details change over time, so recruiters should confirm current availability and interest before outreach.",
    },
    comparison: {
      dimension: "Candidate reuse",
      conventional: {
        summary: "Stale resume archives and personal spreadsheets with little re-engagement",
        items: ["Stale resume archives", "Personal spreadsheets"],
      },
      huntlo: {
        title: "Huntlo AI talent pool management",
        summary: "Shared, organized pools that stay ready for the next requisition",
        items: ["Saved and tagged candidates", "Shared pools and session history", "One-step campaign enrollment"],
      },
    },
    faqs: [
      {
        question: "What is AI talent pool management?",
        answer:
          "AI talent pool management is the practice of organizing candidates into reusable pools for current and future roles. In Huntlo, recruiters save candidates from sourcing sessions, organize them with tags and smart filters, and add them to outreach when new roles open.",
      },
      {
        question: "How is a talent pool different from a recruitment CRM?",
        answer:
          "A talent pool groups candidates for reuse — by role, skill or priority. The AI Recruitment CRM holds the full interaction history for each candidate. Together, they help teams find the right people and understand their history before reaching out.",
      },
      {
        question: "Can the whole team use the same pools?",
        answer:
          "Yes. Candidate pools and sourcing session history are shared across the recruiting team, so good sourcing work is not locked inside one recruiter's account.",
      },
      {
        question: "How do I engage candidates from a pool?",
        answer:
          "Pooled candidates are campaign-ready: they can be added to an AI Candidate Outreach sequence in one step, with their context carried into the candidate record.",
      },
    ],
    related: [
      {
        name: "Candidate Pool Overview",
        href: "/candidate-pool",
        icon: "bookmarks",
        description: "Product overview of saving and organizing candidates.",
      },
      LINKS.crm,
      LINKS.matching,
      LINKS.sourcing,
    ],
    cta: {
      title: "Start every search with a warm pool",
      body: "Save, organize and reuse candidates across roles, and launch outreach from your pools in one step.",
    },
  },

  {
    slug: "ai-recruitment-analytics",
    name: "AI Recruitment Analytics",
    seo: {
      title: "AI Recruitment Analytics | Huntlo AI Hiring Capabilities",
      description:
        "AI recruitment analytics gives talent leaders visibility into outreach volume, replies, pipeline progression and recruiter activity across Huntlo workflows, supporting data-informed hiring decisions.",
      ogTitle: "AI Recruitment Analytics for Pipeline Visibility",
      ogDescription:
        "See how Huntlo connects outreach, replies and pipeline progression into visibility for recruiters and talent leaders.",
    },
    hero: {
      summary:
        "Visibility into outreach, replies and pipeline progression across connected hiring workflows, so talent leaders can manage pipelines with data instead of retrospective spreadsheets.",
      chips: ["Pipeline visibility", "Outreach & reply tracking", "Recruiter activity", "Leadership oversight"],
    },
    visual: {
      input: {
        label: "Workflow activity",
        text: "Outreach, replies, screening and interviews",
      },
      middle: {
        label: "Pipeline signals",
        items: [
          { icon: "send", label: "Outreach volume" },
          { icon: "forum", label: "Replies" },
          { icon: "conversion_path", label: "Stage progression" },
          { icon: "person", label: "Recruiter activity" },
        ],
      },
      output: {
        label: "Hiring visibility",
        liveLabel: "Team & leadership view",
        pills: ["Bottlenecks", "Pipeline health"],
        note: "Activity captured from connected workflows",
      },
      flow: ["Planning", "Sourcing", "Outreach", "Automation"],
    },
    overview: {
      paragraphs: [
        "**AI Recruitment Analytics** provides **funnel visibility** across Huntlo's connected workflows — tracking **outreach volume, replies, pipeline progression and recruiter activity**.",
        "Because sourcing, outreach, screening and scheduling share one operational state, activity is **captured as work happens** rather than compiled by hand. Managers gain **visibility into team outreach activity, reply rates and pipeline health**.",
        "The goal is to move recruitment leadership from **backward-looking retrospective reports** toward **proactive, data-informed pipeline governance**, while recruiters keep their focus on candidates.",
      ],
      concepts: [
        {
          icon: "query_stats",
          title: "Funnel visibility",
          body: "See how candidates progress through each stage.",
        },
        {
          icon: "forum",
          title: "Outreach and reply tracking",
          body: "Outreach volume and replies across campaigns.",
        },
        {
          icon: "conversion_path",
          title: "Stage progression",
          body: "Where candidates move forward and where they stall.",
        },
        {
          icon: "person",
          title: "Recruiter activity",
          body: "Team outreach activity and productivity in one view.",
        },
        {
          icon: "insights",
          title: "Data-informed governance",
          body: "Pipeline decisions based on live workflow data.",
        },
      ],
    },
    challenge: {
      title: "The recruitment reporting challenge",
      intro:
        "Recruitment reporting is usually assembled after the fact. Data is spread across sourcing tools, inboxes and spreadsheets, so leaders learn about pipeline problems long after they start.",
      items: [
        {
          icon: "table",
          title: "Reports built by hand",
          body: "Recruiters export and reconcile data from several tools to answer basic pipeline questions.",
        },
        {
          icon: "history",
          title: "Backward-looking insight",
          body: "Retrospective reports explain what happened last month rather than what needs attention now.",
        },
        {
          icon: "visibility_off",
          title: "Limited team visibility",
          body: "Managers struggle to see outreach activity, replies and pipeline health across recruiters and roles.",
        },
      ],
    },
    workflow: {
      intro: "Analytics draws on the activity already flowing through Huntlo workflows.",
      steps: [
        {
          icon: "input",
          title: "Capture activity as work happens",
          body: "Outreach, replies, screening outcomes and stage changes are recorded as candidates move through connected workflows.",
        },
        {
          icon: "query_stats",
          title: "Track the funnel",
          body: "Outreach volume, replies and pipeline progression are tracked by campaign and role.",
        },
        {
          icon: "groups",
          title: "Review team activity",
          body: "Managers review recruiter outreach activity, reply rates and pipeline health across the team.",
        },
        {
          icon: "insights",
          title: "Act on what needs attention",
          body: "Leaders identify stalled stages and adjust sourcing, outreach or automation to keep pipelines moving.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "query_stats",
        title: "Funnel and Pipeline Visibility",
        body: "Tracks outreach volume, replies and pipeline progression across connected hiring workflows, from first contact to interview.",
        tiles: [
          { icon: "send", label: "Outreach volume" },
          { icon: "forum", label: "Replies" },
          { icon: "conversion_path", label: "Stage progression" },
          { icon: "monitor_heart", label: "Pipeline health" },
        ],
      },
      secondary: [
        {
          icon: "groups",
          title: "Team and Leadership Oversight",
          body: "Gives managers visibility into team outreach activity, reply rates and pipeline health on supported plans.",
          tags: [{ label: "Scattered spreadsheets" }, { label: "Shared team view", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "Connected Workflow Data",
          body: "Draws on activity from sourcing, outreach, screening and scheduling so analysis reflects the real pipeline.",
          tags: [
            { icon: "person_search", label: "AI Candidate Sourcing" },
            { icon: "send", label: "AI Candidate Outreach" },
            { icon: "contacts", label: "AI Recruitment CRM" },
            { icon: "schema", label: "Recruitment Workflow Automation" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "AI recruitment analytics helps talent teams understand outreach, replies and pipeline progression using the activity captured in their Huntlo workflows.",
      points: [
        "Outreach volume, replies and pipeline progression are tracked across campaigns.",
        "Managers can see team outreach activity, reply rates and pipeline health on supported plans.",
        "Activity is captured from connected workflows rather than compiled manually.",
      ],
      qualification:
        "Analytics reflect only the activity recorded in Huntlo and connected channels, and available reports vary by plan and workspace. Metrics describe past and current activity; they are not forecasts or guaranteed outcomes. Confirm the reporting available for your workspace with the Huntlo team.",
    },
    comparison: {
      dimension: "Reporting approach",
      conventional: {
        summary: "Retrospective reports compiled manually from several tools",
        items: ["Manual data exports", "Month-end retrospectives"],
      },
      huntlo: {
        title: "Huntlo AI recruitment analytics",
        summary: "Visibility built from activity captured across connected workflows",
        items: ["Outreach and reply tracking", "Pipeline progression visibility", "Team activity oversight"],
      },
    },
    faqs: [
      {
        question: "What is AI recruitment analytics?",
        answer:
          "AI recruitment analytics is the measurement of hiring funnel activity using data captured from recruitment workflows. In Huntlo, it covers visibility into outreach volume, replies, pipeline progression and recruiter activity across connected sourcing, outreach and screening workflows.",
      },
      {
        question: "What can managers see?",
        answer:
          "On supported plans, managers get visibility into team outreach activity, reply rates and pipeline health, helping them understand where candidates are progressing and where attention is needed.",
      },
      {
        question: "Where does the data come from?",
        answer:
          "Analytics draws on activity recorded as candidates move through Huntlo — outreach, replies, screening outcomes and stage changes. Activity outside Huntlo and its connected channels is not included.",
      },
      {
        question: "Do analytics predict hiring outcomes?",
        answer:
          "No. Analytics describe recorded activity to support decisions. They are not guarantees of future performance, and leaders should interpret them alongside recruiter and hiring-manager input.",
      },
    ],
    related: [LINKS.crm, LINKS.automation, LINKS.outreach, LINKS.platform],
    cta: {
      title: "See your pipeline as it moves",
      body: "Bring outreach, replies and pipeline progression into one view for recruiters and talent leaders.",
    },
  },

  {
    slug: "recruitment-workflow-automation",
    name: "Recruitment Workflow Automation",
    seo: {
      title: "Recruitment Workflow Automation | Huntlo AI Hiring Capabilities",
      description:
        "Recruitment workflow automation connects sourcing, outreach, screening and scheduling with engagement-based triggers, automated follow-ups and status updates, so recruiters spend less time on manual coordination.",
      ogTitle: "Recruitment Workflow Automation Across the Hiring Pipeline",
      ogDescription:
        "See how Huntlo uses cross-stage triggers to move candidates from outreach to screening to scheduling without manual data entry.",
    },
    hero: {
      summary:
        "Cross-stage triggers, automated follow-ups and status progression that connect your hiring pipeline, so candidates move forward without manual data entry.",
      chips: ["Cross-stage triggers", "Automated follow-ups", "Status progression", "Reusable playbooks"],
    },
    visual: {
      input: {
        label: "Candidate event",
        text: "Replied, qualified, booked or no response",
      },
      middle: {
        label: "Automated actions",
        items: [
          { icon: "bolt", label: "Triggers" },
          { icon: "schedule_send", label: "Follow-ups" },
          { icon: "sync", label: "Status updates" },
          { icon: "notifications_active", label: "Team alerts" },
        ],
      },
      output: {
        label: "Pipeline in motion",
        liveLabel: "Recruiter oversight",
        pills: ["Scheduled", "Advanced"],
        note: "Approved templates enforced",
      },
      flow: ["Sourcing", "Outreach", "Screening", "Scheduling"],
    },
    overview: {
      paragraphs: [
        "**Recruitment Workflow Automation** executes **cross-stage conditional triggers, automated status progressions and team alerts** without manual recruiter data entry.",
        "Automation responds to **candidate engagement and response behavior**: follow-ups for non-responders, reply-driven qualification flows and scheduling nudges. After qualification, Huntlo can **send scheduling links, confirm times, send reminders and update pipeline status**.",
        "Teams standardize execution with **approved templates, reusable playbooks and role-based permissions**, while recruiters keep oversight of every automated step.",
      ],
      concepts: [
        {
          icon: "bolt",
          title: "Cross-stage triggers",
          body: "Candidate events start the next step automatically.",
        },
        {
          icon: "schedule_send",
          title: "Automated follow-ups",
          body: "No-reply follow-ups and scheduling nudges on time.",
        },
        {
          icon: "sync",
          title: "Status progression",
          body: "Pipeline status updates as candidates advance.",
        },
        {
          icon: "library_books",
          title: "Reusable playbooks",
          body: "Templates and repeatable sessions for similar roles.",
        },
        {
          icon: "admin_panel_settings",
          title: "Governed execution",
          body: "Approved templates and role-based permissions.",
        },
      ],
    },
    challenge: {
      title: "The coordination challenge for recruiting teams",
      intro:
        "Recruiters lose hours to coordination between tools: copying candidate details, chasing replies, sending reminders and updating statuses by hand. Each manual handoff is a chance for a candidate to fall through the cracks.",
      items: [
        {
          icon: "content_paste",
          title: "Manual handoffs between tools",
          body: "Candidate details are re-keyed from sourcing to outreach to scheduling, creating delays and errors.",
        },
        {
          icon: "notifications_off",
          title: "Follow-ups depend on memory",
          body: "Non-responders and pending confirmations are easy to miss without automated triggers.",
        },
        {
          icon: "rule_settings",
          title: "Inconsistent processes",
          body: "Each recruiter runs the pipeline differently, making quality and compliance hard to maintain.",
        },
      ],
    },
    workflow: {
      intro: "Automation connects each stage so the right next step happens when a candidate acts.",
      steps: [
        {
          icon: "library_books",
          title: "Set up the playbook",
          body: "Choose approved templates and define the sequence of steps for the role, from outreach to scheduling.",
        },
        {
          icon: "bolt",
          title: "Trigger on candidate behavior",
          body: "Replies, qualifications and non-responses trigger the next action — a follow-up, a qualification flow or a scheduling nudge.",
        },
        {
          icon: "sync",
          title: "Progress status automatically",
          body: "Scheduling links, confirmations, reminders and pipeline status updates happen without manual data entry.",
        },
        {
          icon: "visibility",
          title: "Keep recruiters in control",
          body: "Recruiters oversee automated steps, step in where judgment is needed and refine the playbook over time.",
        },
      ],
    },
    useCases: {
      featured: {
        icon: "schema",
        title: "Cross-stage Orchestration",
        body: "Executes cross-stage conditional triggers, automated status progressions and team alerts without manual recruiter data entry.",
        tiles: [
          { icon: "bolt", label: "Triggers" },
          { icon: "schedule_send", label: "Follow-ups" },
          { icon: "sync", label: "Status updates" },
          { icon: "notifications_active", label: "Team alerts" },
        ],
      },
      secondary: [
        {
          icon: "library_books",
          title: "Approved Templates and Playbooks",
          body: "Standardizes execution with approved templates, reusable playbooks and role-based permissions across teams and regions.",
          tags: [{ label: "Ad-hoc process" }, { label: "Shared playbook", highlight: true }],
        },
        {
          icon: "conversion_path",
          title: "End-to-end Pipeline Connections",
          body: "Connects sourcing, outreach, screening and scheduling so each stage hands off to the next automatically.",
          tags: [
            { icon: "send", label: "AI Candidate Outreach" },
            { icon: "fact_check", label: "AI Candidate Screening" },
            { icon: "event_available", label: "AI Interview Scheduling" },
            { icon: "contacts", label: "AI Recruitment CRM" },
          ],
        },
      ],
    },
    verified: {
      intro:
        "Recruitment workflow automation connects the recruitment pipeline into one execution loop, freeing recruiters to focus on candidate relationships and closing.",
      points: [
        "Follow-ups are triggered by candidate engagement and response behavior.",
        "After qualification, scheduling links, confirmations, reminders and status updates are automated.",
        "Approved templates and role-based permissions keep automated execution governed.",
      ],
      qualification:
        "Automations run the steps your team configures and depend on connected channels such as email, WhatsApp and calendar tools. Recruiters should review playbooks regularly and handle exceptions and sensitive conversations personally.",
    },
    comparison: {
      dimension: "Pipeline execution",
      conventional: {
        summary: "Manual handoffs, reminders and status updates across disconnected tools",
        items: ["Manual data re-entry", "Reminder tracking by hand"],
      },
      huntlo: {
        title: "Huntlo recruitment workflow automation",
        summary: "Engagement-triggered automation across connected hiring stages",
        items: ["Cross-stage triggers", "Automated status progression", "Governed, reusable playbooks"],
      },
    },
    faqs: [
      {
        question: "What is recruitment workflow automation?",
        answer:
          "Recruitment workflow automation uses triggers and rules to move candidates through hiring stages without manual coordination. In Huntlo, candidate events such as replies, qualifications and non-responses trigger follow-ups, scheduling and status updates across connected workflows.",
      },
      {
        question: "Does Huntlo automate follow-ups?",
        answer:
          "Yes. Follow-ups are triggered by candidate engagement and response behavior, including no-reply follow-ups, reply-driven qualification flows and scheduling nudges.",
      },
      {
        question: "How does Huntlo connect different recruitment workflows?",
        answer:
          "Through a shared operational state. When a candidate is sourced, their profile informs outreach; once they reply, interview scheduling can be triggered without manual handoffs; and screening and assessment context flows into the AI Recruitment CRM.",
      },
      {
        question: "Do recruiters lose control with automation?",
        answer:
          "No. Recruiters choose the templates and playbooks, oversee automated steps and step in where judgment, empathy or negotiation is needed. Automation handles repetitive coordination.",
      },
    ],
    related: [
      {
        name: "Workflow Orchestration Overview",
        href: "/workflow-orchestration",
        icon: "account_tree",
        description: "How Huntlo approaches hiring intelligence orchestration.",
      },
      LINKS.engagement,
      LINKS.scheduling,
      LINKS.analytics,
    ],
    cta: {
      title: "Connect every stage of your hiring pipeline",
      body: "Automate follow-ups, handoffs and status updates so recruiters can focus on candidates — inside one hiring platform.",
    },
  },
];

export const CAPABILITY_HUB_LINK = HUB_LINK;

export function capabilityPath(slug: string) {
  return `${CAPABILITIES_PATH}/${slug}`;
}

export function getCapabilityPage(slug: string) {
  return CAPABILITY_PAGES.find((page) => page.slug === slug);
}

export function getAdjacentCapabilities(slug: string) {
  const index = CAPABILITY_PAGES.findIndex((page) => page.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };
  const count = CAPABILITY_PAGES.length;
  return {
    previous: CAPABILITY_PAGES[(index - 1 + count) % count],
    next: CAPABILITY_PAGES[(index + 1) % count],
  };
}
