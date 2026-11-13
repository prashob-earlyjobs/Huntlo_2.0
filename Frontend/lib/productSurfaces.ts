import type { ProductSurface } from "@/lib/productSurfaceTypes";

/* Platform and category pages */

export const PLATFORM_PIPELINE_SURFACE: ProductSurface = {
  workspace: "Senior Backend Engineer",
  view: "Pipeline",
  status: "Live",
  alt: "Huntlo pipeline for one role: a recruiter writes the role brief, AI agents discover candidates, run personalised outreach, screen and book interviews, and the recruiter reviews the shortlist and decides.",
  blocks: [
    {
      type: "stages",
      items: [
        {
          step: "01",
          title: "Role brief",
          actor: "recruiter",
          lines: ["Go, distributed systems, 6+ yrs", "Payments experience preferred", "Bengaluru or remote"],
        },
        {
          step: "02",
          title: "Candidate discovery",
          actor: "ai",
          lines: ["148 profiles matched", "Ranked by skill depth and trajectory", "Recruiter approves 24"],
        },
        {
          step: "03",
          title: "Personalised outreach",
          actor: "ai",
          lines: ["Email + WhatsApp sequence", "Approved template, 3 steps", "9 replies so far"],
        },
        {
          step: "04",
          title: "Screening",
          actor: "ai",
          lines: ["Voice screen: notice, pay, interest", "Transcript and rubric attached", "6 meet criteria"],
        },
        {
          step: "05",
          title: "Booked interview",
          actor: "ai",
          lines: ["Self-booked on panel calendars", "Reminders scheduled", "Thu 11:00 · Panel 2"],
        },
        {
          step: "06",
          title: "Recruiter review",
          actor: "recruiter",
          lines: ["Shortlist reviewed", "Advance, hold or decline", "Decision stays human"],
        },
      ],
    },
  ],
};

export const INFRASTRUCTURE_ARCHITECTURE_SURFACE: ProductSurface = {
  workspace: "Huntlo",
  view: "System architecture",
  alt: "Huntlo architecture: communication channels feed AI agents for sourcing, outreach, screening and scheduling, which read and write one shared hiring context governed by recruiter controls, alongside the customer's ATS.",
  blocks: [
    {
      type: "layers",
      items: [
        { label: "Channels", items: ["Email (Gmail)", "WhatsApp", "Calendar (Calendly)", "Voice"] },
        {
          label: "AI agents",
          accent: true,
          items: ["Sourcing agent", "Outreach agent", "Screening agent", "Scheduling agent"],
        },
        {
          label: "Shared hiring context",
          accent: true,
          items: ["Role brief", "Candidate record", "Conversation history", "Pipeline state"],
        },
        {
          label: "Recruiter controls",
          items: ["Approved templates", "Review gates", "Role-based permissions", "Audit trail"],
        },
        { label: "Systems of record", items: ["Your ATS", "Your HRIS", "Works alongside, not instead"] },
      ],
    },
    {
      type: "note",
      tone: "review",
      text: "Agents act on the same context; recruiters approve what reaches candidates and decide who advances.",
    },
  ],
};

export const AGENT_ACTIVITY_SURFACE: ProductSurface = {
  workspace: "Product Designer · Remote",
  view: "Agent activity",
  status: "Live",
  alt: "Agent activity log for one candidate: matched to a role, recruiter-approved campaign sent, candidate replied, voice screen completed, recruiter review requested and interview booked within about thirty minutes.",
  blocks: [
    {
      type: "timeline",
      label: "Today · one candidate",
      items: [
        { time: "09:02", text: "Candidate matched to role", actor: "ai" },
        { time: "09:03", text: "Recruiter-approved campaign triggered", actor: "ai" },
        { time: "09:08", text: "Candidate replied on WhatsApp", actor: "candidate" },
        { time: "09:08", text: "Screening workflow opened", actor: "ai" },
        { time: "09:21", text: "Voice screen completed, transcript saved", actor: "ai" },
        { time: "09:22", text: "Recruiter review requested", actor: "system" },
        { time: "09:30", text: "Recruiter advanced candidate", actor: "recruiter" },
        { time: "09:34", text: "Interview slot booked", actor: "candidate" },
      ],
    },
    { type: "note", tone: "review", text: "Shortlist and hiring decisions wait for a recruiter." },
  ],
};

export const SHARED_CONTEXT_SURFACE: ProductSurface = {
  workspace: "Data Analyst · Pune",
  view: "Shared candidate context",
  alt: "One candidate record shared by AI agents and recruiters, showing every module and person who acted on it, from sourcing and outreach to voice screening and interview notes.",
  blocks: [
    {
      type: "rows",
      items: [
        {
          title: "Ananya Rao",
          subtitle: "Data Analyst · 4 yrs · SQL, Python, Tableau",
          badge: "Screened",
          accent: true,
        },
      ],
    },
    {
      type: "timeline",
      label: "Who acted on this record",
      items: [
        { time: "10:12", text: "Added to pipeline from role brief", actor: "ai" },
        { time: "10:15", text: "Approved outreach sequence", actor: "recruiter" },
        { time: "14:40", text: "Replied on WhatsApp", actor: "candidate" },
        { time: "09:05", text: "Voice screen transcript attached", actor: "ai" },
        { time: "09:30", text: "Interview notes added", actor: "recruiter" },
      ],
    },
    {
      type: "chips",
      label: "Modules reading the same record",
      items: [
        { text: "Discovery", accent: true },
        { text: "Engagement", accent: true },
        { text: "Screening", accent: true },
        { text: "Scheduling" },
        { text: "Analytics" },
      ],
    },
  ],
};

export const HUMAN_AI_SPLIT_SURFACE: ProductSurface = {
  workspace: "Huntlo",
  view: "Responsibilities by stage",
  alt: "Split of responsibilities: the AI agent discovers candidates, drafts outreach, runs preliminary screens, coordinates calendars and updates the workflow; the recruiter calibrates requirements, approves strategy, reviews outcomes, leads interviews and decides.",
  blocks: [
    {
      type: "split",
      leftLabel: "AI agent",
      rightLabel: "Recruiter",
      items: [
        { left: "Discover candidates", right: "Calibrate requirements" },
        { left: "Draft outreach", right: "Approve strategy" },
        { left: "Run preliminary screens", right: "Review outcomes" },
        { left: "Coordinate calendars", right: "Lead interviews" },
        { left: "Update workflow", right: "Decide and close" },
      ],
    },
    { type: "note", tone: "review", text: "Hiring decisions are made by recruiters, never by the AI agent." },
  ],
};

export const AUTONOMOUS_RULE_SURFACE: ProductSurface = {
  workspace: "Customer Success Manager",
  view: "Workflow rule",
  status: "Active",
  alt: "A recruiter-defined workflow rule: when a candidate replies with confirmed interest, start the screening workflow, require review before shortlist, owned by a senior recruiter; below it, an execution log of each automated step.",
  blocks: [
    {
      type: "rules",
      label: "Rule · reply to screen",
      items: [
        { key: "WHEN", value: "Candidate replies" },
        { key: "IF", value: "Role interest = confirmed" },
        { key: "THEN", value: "Start screening workflow" },
        { key: "REVIEW", value: "Required before shortlist" },
        { key: "OWNER", value: "Senior recruiter" },
      ],
    },
    {
      type: "timeline",
      label: "Execution log",
      items: [
        { time: "14:02", text: "Reply received", actor: "candidate" },
        { time: "14:02", text: "Rule matched: interest confirmed", actor: "system" },
        { time: "14:03", text: "Voice screen invitation sent", actor: "ai" },
        { time: "14:31", text: "Voice screen completed, transcript saved", actor: "ai" },
        { time: "14:32", text: "Waiting for recruiter review", actor: "system" },
      ],
    },
    {
      type: "actions",
      items: [{ label: "Approve shortlist", primary: true }, { label: "Edit rule" }, { label: "Pause rule" }],
    },
  ],
};

export const STACK_ERAS_SURFACE: ProductSurface = {
  workspace: "Hiring infrastructure",
  view: "How the stack evolved",
  alt: "Three eras of hiring infrastructure: systems of record, point solutions and connected intelligence, compared by architecture, where context lives and what recruiters spend time on.",
  blocks: [
    {
      type: "table",
      columns: ["Era", "Architecture", "Context lives in", "Recruiter time"],
      rows: [
        ["Systems of record", "ATS + job boards", "The ATS", "Data entry"],
        ["Point solutions", "One tool per stage", "Each tool separately", "Coordination"],
        ["Connected intelligence", "Shared layer + agents", "One shared state", "Judgment"],
      ],
    },
    {
      type: "note",
      tone: "info",
      text: "Framework for discussion: most teams today run a mix of the first two eras.",
    },
  ],
};

/* Capability pages, keyed by capability slug */

export const CAPABILITY_SURFACES: Record<string, ProductSurface> = {
  "ai-candidate-sourcing": {
    workspace: "Senior Backend Engineer",
    view: "Ranked results",
    status: "Live",
    alt: "A plain-language role brief is interpreted into skill, domain and seniority signals, producing a ranked list of candidates with match scores and an action to add them to outreach.",
    blocks: [
      {
        type: "prompt",
        label: "Role brief · plain language",
        text: "Backend engineer who has scaled payment systems, strong in Go or Java, 5–8 years, open to Bengaluru.",
      },
      {
        type: "chips",
        label: "Interpreted signals",
        items: [
          { text: "Go / Java", accent: true },
          { text: "Payments domain", accent: true },
          { text: "5–8 yrs seniority" },
          { text: "Scaled systems" },
          { text: "Bengaluru" },
        ],
      },
      {
        type: "rows",
        label: "148 candidates · ranked",
        items: [
          { title: "Arjun Mehta", subtitle: "Senior Engineer · Payments platform", meta: "6 yrs", score: 94, accent: true },
          { title: "Sneha Iyer", subtitle: "Backend Lead · Fintech", meta: "7 yrs", score: 91 },
          { title: "Rahul Verma", subtitle: "Software Engineer II · E-commerce", meta: "5 yrs", score: 86 },
          { title: "Kavya Nair", subtitle: "Platform Engineer · Banking", meta: "8 yrs", score: 83 },
        ],
      },
      { type: "actions", items: [{ label: "Add 3 to outreach", primary: true }, { label: "Save to talent pool" }] },
    ],
  },
  "vibe-sourcing": {
    workspace: "Founding Product Designer",
    view: "Vibe Sourcing",
    alt: "A description of who succeeds in the role is interpreted into working-style signals such as early-stage tenure and rapid iteration, surfacing candidates that keyword filters would miss.",
    blocks: [
      {
        type: "prompt",
        label: "Describe who succeeds",
        text: "Someone who thrives in ambiguity, ships scrappy prototypes fast, and has grown with an early-stage team.",
      },
      {
        type: "chips",
        label: "Working-style signals inferred",
        items: [
          { text: "Early-stage tenure", accent: true },
          { text: "Rapid iteration", accent: true },
          { text: "Zero-to-one products" },
          { text: "Cross-functional ownership" },
          { text: "Upward trajectory" },
        ],
      },
      {
        type: "rows",
        label: "Surfaced beyond keyword filters",
        items: [
          { title: "Meera Pillai", subtitle: "Designer · seed-stage SaaS, 2 → 40 people", badge: "Strong fit", accent: true },
          { title: "Dev Malhotra", subtitle: "UX Engineer · prototyping-heavy roles", badge: "Strong fit" },
          { title: "Tara Singh", subtitle: "Product Designer · switched from research", badge: "Overlooked" },
        ],
      },
      {
        type: "note",
        tone: "info",
        text: "Working-style signals are prompts for recruiter review, not verdicts.",
      },
    ],
  },
  "ai-candidate-screening": {
    workspace: "Customer Support Lead",
    view: "Screening rubric",
    alt: "A screening rubric for one applicant listing each role criterion, the evidence found and the result, with actions for the recruiter to advance, override or hold.",
    blocks: [
      {
        type: "rows",
        items: [
          { title: "Nikhil Rao", subtitle: "Applied · 5 yrs support leadership", badge: "4 of 5 criteria", accent: true },
        ],
      },
      {
        type: "table",
        label: "Rubric · evidence",
        columns: ["Criterion", "Evidence", "Result"],
        rows: [
          ["Team leadership", "Led a 12-person L1/L2 team", "Meets"],
          ["CSAT ownership", "Owned team CSAT targets", "Meets"],
          ["Helpdesk tools", "3 yrs Freshdesk admin", "Meets"],
          ["Weekend rota", "Alternate weekends only", "Partial"],
          ["Notice period", "60 days", "Review"],
        ],
      },
      {
        type: "actions",
        items: [{ label: "Advance", primary: true }, { label: "Override result" }, { label: "Hold" }],
      },
      { type: "note", tone: "review", text: "The recruiter decides who advances and can override any rubric result." },
    ],
  },
  "ai-candidate-matching": {
    workspace: "ML Engineer · Hyderabad",
    view: "Match rationale",
    alt: "A match rationale panel explaining why a candidate ranks highly across skill depth, seniority, domain relevance and career trajectory, with a flagged gap to probe in screening.",
    blocks: [
      {
        type: "rows",
        items: [
          { title: "Ishaan Kapoor", subtitle: "ML Engineer · Computer vision · 4 yrs", score: 88, accent: true },
        ],
      },
      {
        type: "bars",
        label: "Why this candidate ranks highly",
        items: [
          { label: "Skill depth · PyTorch, model serving", value: 92, display: "Strong" },
          { label: "Seniority alignment", value: 84, display: "Good" },
          { label: "Domain relevance · vision, retail", value: 79, display: "Good" },
          { label: "Career trajectory", value: 90, display: "Strong" },
        ],
      },
      { type: "note", tone: "info", text: "Gap flagged: no production MLOps ownership. Probe in screening." },
      { type: "actions", items: [{ label: "Shortlist", primary: true }, { label: "Compare with #2" }] },
    ],
  },
  "ai-candidate-outreach": {
    workspace: "Sales Development Lead",
    view: "Outreach sequence",
    status: "Running",
    alt: "A three-step Email and WhatsApp outreach sequence built from an approved template, with a personalised first message, a candidate reply and an automatic hand-off to screening on reply.",
    blocks: [
      {
        type: "table",
        label: "Sequence · approved template",
        columns: ["Step", "Channel", "Timing", "Status"],
        rows: [
          ["1 · Intro", "Email", "Day 0", "Sent"],
          ["2 · Nudge", "WhatsApp", "Day 2", "Sent"],
          ["3 · Follow-up", "Email", "Day 5", "Scheduled"],
          ["On reply", "—", "Instant", "Start screening"],
        ],
      },
      {
        type: "messages",
        label: "Personalised from candidate context",
        items: [
          {
            from: "huntlo",
            channel: "Email",
            text: "Hi Riya, your work building a mid-market pipeline at a Series B SaaS company stood out. We're hiring an SDR lead to do the same.",
          },
          { from: "candidate", channel: "WhatsApp", text: "Thanks! Open to hearing more. What's the range?" },
        ],
      },
    ],
  },
  "ai-candidate-engagement": {
    workspace: "Frontend Developer",
    view: "Candidate conversation",
    alt: "A conversation timeline for one candidate between first reply and interview, mixing automated follow-ups, reminders and a personal recruiter note across Email and WhatsApp.",
    blocks: [
      {
        type: "timeline",
        label: "Between first reply and interview",
        items: [
          { time: "Mon", text: "Replied: interested", actor: "candidate" },
          { time: "Mon", text: "Role details and salary band shared", actor: "ai" },
          { time: "Tue", text: "Reminder to complete voice screen", actor: "ai" },
          { time: "Wed", text: "Voice screen completed", actor: "candidate" },
          { time: "Thu", text: "Interview slot options sent", actor: "ai" },
          { time: "Thu", text: "Personal note from hiring team added", actor: "recruiter" },
        ],
      },
      {
        type: "messages",
        items: [
          {
            from: "huntlo",
            channel: "WhatsApp",
            time: "Thu",
            text: "Hi Aman, your interview with the frontend team is confirmed for Thursday 4 PM. Reply 1 to reschedule.",
          },
        ],
      },
      {
        type: "chips",
        label: "Connected channels",
        items: [{ text: "Email", accent: true }, { text: "WhatsApp", accent: true }, { text: "Calendar" }],
      },
    ],
  },
  "ai-interview-scheduling": {
    workspace: "Data Engineer · Panel 2",
    view: "Self-booking",
    alt: "A weekly panel availability grid showing open, busy and booked slots, with a candidate's confirmed self-booked interview and automatic time-zone handling and reminders.",
    blocks: [
      {
        type: "calendar",
        label: "Panel availability",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        times: ["10:00", "11:30", "14:00", "16:00"],
        cells: [
          ["busy", "open", "busy", "open", "none"],
          ["open", "busy", "open", "booked", "open"],
          ["none", "open", "busy", "open", "busy"],
          ["open", "busy", "open", "busy", "open"],
        ],
      },
      {
        type: "rows",
        items: [
          { title: "Pooja Desai", subtitle: "Thu 11:30 IST · 2 interviewers", badge: "Confirmed", accent: true },
        ],
      },
      {
        type: "chips",
        items: [{ text: "IST ↔ GMT handled", accent: true }, { text: "Reminder 24 h before" }, { text: "Reschedule link sent" }],
      },
    ],
  },
  "ai-voice-interviews": {
    workspace: "Field Sales Executive",
    view: "Voice screen · completed",
    alt: "A completed AI voice screen with call duration, a transcript excerpt about notice period and travel, a rubric of configured criteria and a summary routed to the recruiter.",
    blocks: [
      {
        type: "stats",
        items: [
          { label: "Duration", value: "6m 42s" },
          { label: "Criteria met", value: "4 / 5" },
          { label: "Status", value: "Review" },
        ],
      },
      {
        type: "messages",
        label: "Transcript excerpt",
        items: [
          { from: "huntlo", text: "What is your current notice period?" },
          { from: "candidate", text: "Thirty days, and I can negotiate it down to two weeks." },
          { from: "huntlo", text: "Are you comfortable travelling across the Pune region?" },
          { from: "candidate", text: "Yes, I've covered Pune and Nashik for two years." },
        ],
      },
      {
        type: "table",
        label: "Rubric",
        columns: ["Criterion", "Response", "Result"],
        rows: [
          ["Availability", "30 days", "Meets"],
          ["Travel", "Confirmed", "Meets"],
          ["Compensation", "Within band", "Meets"],
          ["Vehicle", "Not answered", "Review"],
        ],
      },
      { type: "note", tone: "review", text: "Summary goes to the recruiter, who decides next steps." },
    ],
  },
  "ai-recruitment-assessments": {
    workspace: "Java Developer",
    view: "Assessment report",
    alt: "An assessment report for one candidate showing an overall score, a skill breakdown across Java, SQL, debugging and system design, and task-level evidence shared with the interview panel.",
    blocks: [
      { type: "rows", items: [{ title: "Farhan Ali", subtitle: "Completed · 52 min", score: 81, accent: true }] },
      {
        type: "bars",
        label: "Skill breakdown",
        items: [
          { label: "Java & Spring Boot", value: 86 },
          { label: "SQL & data modelling", value: 78 },
          { label: "Debugging scenario", value: 74 },
          { label: "System design · situational", value: 82 },
        ],
      },
      {
        type: "table",
        label: "Evidence",
        columns: ["Task", "Result"],
        rows: [
          ["Fix failing REST endpoint", "9 of 10 tests pass"],
          ["Optimise slow query", "2.1 s → 180 ms"],
          ["Incident scenario", "Clear escalation plan"],
        ],
      },
      { type: "note", tone: "info", text: "Report shared with the interview panel before round two." },
    ],
  },
  "ai-recruitment-crm": {
    workspace: "Candidate record",
    view: "Arjun Mehta",
    alt: "A unified candidate record showing the requisitions a candidate is active in and a single history of sourcing, outreach replies, voice screen transcripts and recruiter notes across roles.",
    blocks: [
      {
        type: "rows",
        items: [
          { title: "Arjun Mehta", subtitle: "Senior Engineer · Payments · Bengaluru", badge: "Active in 2 roles", accent: true },
        ],
      },
      {
        type: "chips",
        label: "Requisitions",
        items: [{ text: "Senior Backend Engineer · Screened", accent: true }, { text: "Platform Lead · Sourced" }],
      },
      {
        type: "timeline",
        label: "Unified history",
        items: [
          { time: "Mar 12", text: "Sourced for Senior Backend Engineer", actor: "ai" },
          { time: "Mar 13", text: "Replied to Email + WhatsApp outreach", actor: "candidate" },
          { time: "Mar 15", text: "Voice screen transcript saved", actor: "ai" },
          { time: "Apr 02", text: "Re-engaged for Platform Lead", actor: "ai" },
          { time: "Apr 03", text: "Note: strong on payments reliability", actor: "recruiter" },
        ],
      },
      { type: "actions", items: [{ label: "Message" }, { label: "Add to pool" }, { label: "Open transcript" }] },
    ],
  },
  "ai-talent-pool-management": {
    workspace: "Talent pools",
    view: "Payments engineers · Bengaluru",
    alt: "A saved talent pool with filters for domain, seniority and prior engagement, pool statistics and a campaign-ready shortlist of warm, screened and new candidates.",
    blocks: [
      {
        type: "chips",
        label: "Filters",
        items: [
          { text: "Payments domain", accent: true },
          { text: "5–10 yrs", accent: true },
          { text: "Replied before" },
          { text: "Open to relocate" },
        ],
      },
      {
        type: "stats",
        items: [
          { label: "In pool", value: "212" },
          { label: "Engaged before", value: "87" },
          { label: "Updated", value: "2 days" },
        ],
      },
      {
        type: "rows",
        label: "Campaign-ready shortlist",
        items: [
          { title: "Sneha Iyer", subtitle: "Backend Lead · last contact 3 months ago", badge: "Warm", accent: true },
          { title: "Kavya Nair", subtitle: "Platform Engineer · screened in January", badge: "Screened" },
          { title: "Rohan Das", subtitle: "Site Reliability Engineer · new to pool", badge: "New" },
        ],
      },
      { type: "actions", items: [{ label: "Start campaign", primary: true }, { label: "Share pool" }] },
    ],
  },
  "ai-recruitment-analytics": {
    workspace: "Hiring analytics",
    view: "This week · all roles",
    status: "Live",
    alt: "A recruiting activity dashboard with weekly outreach, reply, screen and interview counts, a pipeline funnel and a table of roles where candidates are waiting at a stage.",
    blocks: [
      {
        type: "stats",
        items: [
          { label: "Outreach sent", value: "640" },
          { label: "Replies", value: "158" },
          { label: "Screens", value: "72" },
          { label: "Interviews", value: "31" },
        ],
      },
      {
        type: "bars",
        label: "Pipeline funnel",
        items: [
          { label: "Contacted", value: 100, display: "640" },
          { label: "Replied", value: 25, display: "158" },
          { label: "Screened", value: 11, display: "72" },
          { label: "Interviewing", value: 5, display: "31" },
        ],
      },
      {
        type: "table",
        label: "Where candidates are waiting",
        columns: ["Role", "Stage", "Waiting"],
        rows: [
          ["Data Engineer", "Recruiter review", "9 · 3 days"],
          ["SDR Lead", "Scheduling", "5 · 2 days"],
        ],
      },
    ],
  },
  "recruitment-workflow-automation": {
    workspace: "Workflow automation",
    view: "Reply → screen → schedule",
    status: "Active",
    alt: "A trigger and action builder connecting a candidate reply to a voice screen, interview slot offer and recruiter approval, with an execution log of each automated step.",
    blocks: [
      {
        type: "rules",
        label: "Trigger and actions",
        items: [
          { key: "WHEN", value: "Candidate replies “interested”" },
          { key: "THEN", value: "Send voice-screen link" },
          { key: "IF", value: "Screen meets criteria" },
          { key: "THEN", value: "Offer panel interview slots" },
          { key: "REVIEW", value: "Recruiter approves shortlist" },
        ],
      },
      {
        type: "timeline",
        label: "Execution log",
        items: [
          { time: "11:04", text: "Reply detected, rule triggered", actor: "system" },
          { time: "11:04", text: "Voice-screen link sent on WhatsApp", actor: "ai" },
          { time: "11:47", text: "Screen completed, criteria met", actor: "ai" },
          { time: "11:48", text: "Slots offered from panel calendar", actor: "ai" },
          { time: "12:10", text: "Shortlist approved", actor: "recruiter" },
        ],
      },
      { type: "actions", items: [{ label: "Pause" }, { label: "Edit rule" }, { label: "View audit trail" }] },
    ],
  },
};

/* Solution pages, keyed by solution slug */

export const SOLUTION_SURFACES: Record<string, ProductSurface> = {
  rpo: {
    workspace: "RPO delivery",
    view: "Client workspaces",
    status: "Live",
    alt: "Three client workspaces side by side for an RPO delivery team, each with open requisitions and sourced, screened and interview counts, plus today's activity and a recruiter review gate before submission.",
    blocks: [
      {
        type: "panels",
        label: "Active client programs",
        items: [
          {
            title: "Client A · Retail",
            subtitle: "Store operations · 3 cities",
            badge: "14 reqs",
            stats: [
              { label: "Sourced", value: "420" },
              { label: "Screened", value: "96" },
              { label: "Interviews", value: "38" },
            ],
          },
          {
            title: "Client B · Fintech",
            subtitle: "Engineering",
            badge: "9 reqs",
            stats: [
              { label: "Sourced", value: "260" },
              { label: "Screened", value: "41" },
              { label: "Interviews", value: "17" },
            ],
          },
          {
            title: "Client C · Logistics",
            subtitle: "Warehouse supervisors",
            badge: "6 reqs",
            stats: [
              { label: "Sourced", value: "180" },
              { label: "Screened", value: "52" },
              { label: "Interviews", value: "22" },
            ],
          },
        ],
      },
      {
        type: "timeline",
        label: "Today across programs",
        items: [
          { time: "10:20", text: "Client B shortlist ready for review", actor: "system" },
          { time: "10:24", text: "4 profiles submitted to Client B", actor: "recruiter" },
          { time: "11:02", text: "18 voice screens completed for Client A", actor: "ai" },
        ],
      },
      { type: "note", tone: "review", text: "Recruiters review every candidate before client submission." },
    ],
  },
  "executive-search": {
    workspace: "Confidential search · CFO",
    view: "Market map",
    status: "Confidential",
    alt: "A confidential executive search workspace with a company map of target organisations, trajectory and domain filters, a senior longlist and a consultant approval step before any outreach.",
    blocks: [
      {
        type: "table",
        label: "Company map",
        columns: ["Target segment", "Leaders mapped", "Priority"],
        rows: [
          ["Listed NBFCs", "14", "High"],
          ["PE-backed fintechs", "11", "High"],
          ["Insurance carriers", "9", "Medium"],
        ],
      },
      {
        type: "chips",
        label: "Filters",
        items: [
          { text: "Trajectory: CFO-ready", accent: true },
          { text: "Domain: lending", accent: true },
          { text: "Listed-company experience" },
          { text: "Mumbai or remote" },
        ],
      },
      {
        type: "rows",
        label: "Senior longlist",
        items: [
          { title: "V. Krishnan", subtitle: "Deputy CFO · listed NBFC", badge: "Priority", accent: true },
          { title: "S. Banerjee", subtitle: "Finance Director · insurer", badge: "Review" },
          { title: "A. Kulkarni", subtitle: "CFO · PE-backed fintech", badge: "Review" },
        ],
      },
      { type: "note", tone: "review", text: "No approach is sent until the consultant approves it." },
    ],
  },
  "it-staffing": {
    workspace: "Client req · React Native Developer",
    view: "Submission shortlist",
    alt: "An IT staffing shortlist for a client requisition with skill-depth filters and a table of candidates whose availability and rate were confirmed in voice screens, ready for recruiter-reviewed submission.",
    blocks: [
      {
        type: "chips",
        label: "Skill depth",
        items: [
          { text: "React Native 3+ yrs", accent: true },
          { text: "TypeScript", accent: true },
          { text: "Published apps" },
          { text: "Contract or C2H" },
        ],
      },
      {
        type: "table",
        label: "Confirmed in voice screens",
        columns: ["Candidate", "Availability", "Rate", "Status"],
        rows: [
          ["Aditya S.", "Immediate", "Within budget", "Ready"],
          ["Neha G.", "15 days", "Within budget", "Ready"],
          ["Karan P.", "30 days", "Above budget", "Review"],
        ],
      },
      { type: "actions", items: [{ label: "Submit 2 to client", primary: true }, { label: "Request rate change" }] },
      { type: "note", tone: "review", text: "A recruiter reviews every profile before client submission." },
    ],
  },
  "healthcare-recruitment": {
    workspace: "Staff Nurse · ICU",
    view: "Candidate pipeline",
    alt: "A healthcare pipeline with shift preferences and availability confirmed by voice screen, licence status marked for recruiter verification, and a WhatsApp scheduling message.",
    blocks: [
      {
        type: "table",
        label: "Confirmed by voice screen",
        columns: ["Candidate", "Shift", "Available", "Licence"],
        rows: [
          ["Anjali M.", "Night", "2 weeks", "Recruiter to verify"],
          ["Joseph T.", "Rotating", "Immediate", "Recruiter to verify"],
          ["Fatima K.", "Day", "1 month", "Verified by recruiter"],
        ],
      },
      {
        type: "messages",
        items: [
          {
            from: "huntlo",
            channel: "WhatsApp",
            text: "Hi Anjali, thanks for confirming night-shift availability. Pick an interview time that fits your roster.",
          },
        ],
      },
      { type: "note", tone: "review", text: "Licence and credential verification stays with recruiters." },
    ],
  },
  "manufacturing-recruitment": {
    workspace: "Plant hiring",
    view: "Site dashboard",
    status: "Live",
    alt: "A site-by-site manufacturing hiring dashboard showing roles at three plants with screened and booked counts, shift and location fit confirmed, and plant teams retaining skills and safety decisions.",
    blocks: [
      {
        type: "table",
        label: "Sites",
        columns: ["Site", "Role", "Screened", "Booked"],
        rows: [
          ["Pune Plant", "CNC Operator", "18", "7"],
          ["Chennai Plant", "Maintenance Tech", "9", "4"],
          ["Ahmedabad Plant", "Quality Engineer", "6", "3"],
        ],
      },
      {
        type: "chips",
        label: "Confirmed in voice screens",
        items: [{ text: "Shift fit", accent: true }, { text: "Commute to site", accent: true }, { text: "Joining date" }],
      },
      { type: "note", tone: "review", text: "Skills, safety and trade tests stay with plant teams." },
    ],
  },
  "bpo-recruitment": {
    workspace: "CX Associate · Voice process",
    view: "High-volume pipeline",
    status: "Live",
    alt: "A high-volume BPO pipeline with applicant, voice screen, assessment-ready and booked counts, a per-shift intake table, and a note that the voice screen is not a certified language assessment.",
    blocks: [
      {
        type: "stats",
        items: [
          { label: "Applicants", value: "1,240" },
          { label: "Voice screens", value: "486" },
          { label: "For assessment", value: "172" },
          { label: "Booked", value: "94" },
        ],
      },
      {
        type: "table",
        label: "Monday intake by shift",
        columns: ["Shift", "Screened", "Booked"],
        rows: [
          ["Morning", "164", "38"],
          ["Evening", "198", "41"],
          ["Night", "124", "15"],
        ],
      },
      {
        type: "note",
        tone: "info",
        text: "The voice screen captures spoken responses; it is not a certified language assessment.",
      },
    ],
  },
  "global-capability-centers": {
    workspace: "GCC hiring · Bengaluru centre",
    view: "Team view",
    status: "Live",
    alt: "A Global Capability Center hiring view with engineering, data and finance operations teams, each showing open roles and sourced, screening and offer counts, governed by approved templates and audit trails.",
    blocks: [
      {
        type: "panels",
        label: "Hiring by capability team",
        items: [
          {
            title: "Engineering",
            subtitle: "Platform and cloud",
            badge: "22 roles",
            stats: [
              { label: "Sourced", value: "640" },
              { label: "In screening", value: "88" },
              { label: "Offers", value: "6" },
            ],
          },
          {
            title: "Data & AI",
            subtitle: "Analytics and ML",
            badge: "11 roles",
            stats: [
              { label: "Sourced", value: "310" },
              { label: "In screening", value: "37" },
              { label: "Offers", value: "3" },
            ],
          },
          {
            title: "Finance ops",
            subtitle: "R2R and FP&A",
            badge: "8 roles",
            stats: [
              { label: "Sourced", value: "190" },
              { label: "In screening", value: "29" },
              { label: "Offers", value: "2" },
            ],
          },
        ],
      },
      {
        type: "chips",
        label: "Governed automation",
        items: [
          { text: "Approved templates", accent: true },
          { text: "Role-based permissions", accent: true },
          { text: "Audit trail for AI actions" },
        ],
      },
    ],
  },
  "campus-recruitment": {
    workspace: "Campus drive 2026",
    view: "Institutions",
    status: "Live",
    alt: "A campus drive tracker across three institutions with registered, assessed and interview counts, and a timeline of results publishing, interview invitations and hiring manager feedback.",
    blocks: [
      {
        type: "table",
        label: "Drive tracker",
        columns: ["Institution", "Registered", "Assessed", "Interviews"],
        rows: [
          ["Institute A · Pune", "420", "312", "48"],
          ["Institute B · Chennai", "380", "251", "36"],
          ["Institute C · Jaipur", "290", "198", "27"],
        ],
      },
      {
        type: "timeline",
        label: "Round two",
        items: [
          { time: "09:00", text: "Assessment results shared with recruiters", actor: "system" },
          { time: "09:15", text: "Interview slots sent to 111 students", actor: "ai" },
          { time: "13:40", text: "Hiring manager feedback recorded", actor: "recruiter" },
        ],
      },
      { type: "note", tone: "review", text: "Recruiters and hiring managers select every hire." },
    ],
  },
};
