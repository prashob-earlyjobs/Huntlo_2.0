import { ROUTES, type RouteKey } from "@/lib/routes";
import type { PlaceholderChart, PlaceholderTable } from "@/lib/types";

export interface ModuleMetric {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
  hint?: string;
}

export interface ModuleEmptyState {
  title: string;
  description: string;
  actionLabel?: string;
}

export interface ModulePageData {
  href: (typeof ROUTES)[RouteKey];
  title: string;
  description: string;
  metrics: ModuleMetric[];
  table?: PlaceholderTable & { title: string; description?: string };
  chart?: PlaceholderChart;
  empty: ModuleEmptyState;
}

const pipelineChart: PlaceholderChart = {
  type: "area",
  title: "Pipeline activity",
  description: "Candidates engaged vs qualified over the last 8 weeks",
  series: { primary: "Engaged", secondary: "Qualified" },
  data: [
    { label: "W1", primary: 180, secondary: 42 },
    { label: "W2", primary: 220, secondary: 58 },
    { label: "W3", primary: 205, secondary: 61 },
    { label: "W4", primary: 260, secondary: 74 },
    { label: "W5", primary: 248, secondary: 70 },
    { label: "W6", primary: 310, secondary: 92 },
    { label: "W7", primary: 296, secondary: 88 },
    { label: "W8", primary: 342, secondary: 104 },
  ],
};

export const MODULE_PAGES: Record<RouteKey, ModulePageData> = {
  home: {
    href: ROUTES.home,
    title: "Home",
    description:
      "Your recruiting command centre — sourcing, outreach, screening and scheduling at a glance.",
    metrics: [
      { label: "Active jobs", value: "8", change: "+2 this week", trend: "up" },
      { label: "Candidates in pipeline", value: "1,284", change: "+96", trend: "up" },
      { label: "Interviews this week", value: "14", change: "3 today", trend: "flat" },
    ],
    chart: pipelineChart,
    empty: {
      title: "Bring your pipeline to life",
      description:
        "Create a job and run your first AI candidate search to see live activity here.",
      actionLabel: "Create Job",
    },
  },
  jobs: {
    href: ROUTES.jobs,
    title: "Jobs",
    description: "Create and manage hiring requirements across your workspace.",
    metrics: [
      { label: "Open jobs", value: "8", change: "+2", trend: "up" },
      { label: "Avg. days open", value: "17", change: "-3 vs last month", trend: "up" },
      { label: "Offers accepted", value: "5", hint: "This quarter" },
    ],
    table: {
      title: "Recent jobs",
      columns: [
        { key: "job", label: "Job" },
        { key: "location", label: "Location" },
        { key: "pipeline", label: "In pipeline", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          job: "Senior Backend Engineer",
          location: "Bengaluru",
          pipeline: 214,
          status: { kind: "status", value: "Active" },
        },
        {
          job: "Product Designer",
          location: "Remote",
          pipeline: 158,
          status: { kind: "status", value: "Active" },
        },
        {
          job: "Engineering Manager",
          location: "Hyderabad",
          pipeline: 74,
          status: { kind: "status", value: "Paused" },
        },
        {
          job: "Data Engineer",
          location: "Pune",
          pipeline: 191,
          status: { kind: "status", value: "Draft" },
        },
      ],
    },
    empty: {
      title: "No jobs yet",
      description: "Create your first hiring requirement to start sourcing candidates.",
      actionLabel: "Create Job",
    },
  },
  jobsNew: {
    href: ROUTES.jobsNew,
    title: "Create Job",
    description: "Define a hiring requirement for sourcing, outreach and screening.",
    metrics: [],
    empty: {
      title: "Create a job",
      description: "Fill in the hiring requirement details to publish a new job.",
      actionLabel: "Back to Jobs",
    },
  },
  search: {
    href: ROUTES.search,
    title: "AI Candidate Search",
    description:
      "Describe who you're hiring in plain language and let Huntlo find matching candidates.",
    metrics: [
      { label: "Searches remaining", value: "7,420", hint: "Growth Plan" },
      { label: "Searches this month", value: "312", change: "+18%", trend: "up" },
      { label: "Avg. match quality", value: "84", hint: "Across recent searches" },
    ],
    table: {
      title: "Top matches from your last search",
      description: "“Senior backend engineers with Go and Kubernetes in Bengaluru”",
      columns: [
        { key: "name", label: "Candidate" },
        { key: "title", label: "Current role" },
        { key: "score", label: "Match", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          name: "Priya Nair",
          title: "Senior Backend Engineer · Finovate Labs",
          score: { kind: "score", value: 92 },
          status: { kind: "status", value: "Shortlisted" },
        },
        {
          name: "Karthik Iyer",
          title: "Staff Engineer · Loopworks",
          score: { kind: "score", value: 89 },
          status: { kind: "status", value: "Contacted" },
        },
        {
          name: "Divya Rao",
          title: "Backend Engineer · Paystream",
          score: { kind: "score", value: 81 },
          status: { kind: "status", value: "Awaiting Response" },
        },
      ],
    },
    empty: {
      title: "Start a new search",
      description:
        "Try “Frontend engineers with React and 5+ years in fintech, open to Bengaluru”.",
      actionLabel: "New Search",
    },
  },
  searchHistory: {
    href: ROUTES.searchHistory,
    title: "Search History",
    description: "Revisit, refine and rerun your previous candidate searches.",
    metrics: [
      { label: "Saved searches", value: "24" },
      { label: "Searches this week", value: "38", change: "+6", trend: "up" },
      { label: "Reused searches", value: "11", hint: "Last 30 days" },
    ],
    table: {
      title: "Recent searches",
      columns: [
        { key: "query", label: "Query" },
        { key: "results", label: "Results", align: "right" },
        { key: "when", label: "Run" },
      ],
      rows: [
        {
          query: "Senior backend engineers, Go + Kubernetes, Bengaluru",
          results: 214,
          when: "2h ago",
        },
        {
          query: "Product designers, healthcare, remote-friendly",
          results: 158,
          when: "Yesterday",
        },
        {
          query: "Data engineers, Spark + Airflow, Pune or remote",
          results: 191,
          when: "3d ago",
        },
      ],
    },
    empty: {
      title: "No search history",
      description: "Your recent AI candidate searches will appear here for quick reuse.",
      actionLabel: "Start Searching",
    },
  },
  candidates: {
    href: ROUTES.candidates,
    title: "Candidate Pool",
    description: "Review, enrich and reveal contact details for sourced candidates.",
    metrics: [
      { label: "Candidates", value: "12,847", change: "+312 this week", trend: "up" },
      { label: "Emails revealed", value: "640", hint: "1,860 remaining" },
      { label: "Mobiles revealed", value: "260", hint: "940 remaining" },
    ],
    table: {
      title: "Recently added",
      columns: [
        { key: "name", label: "Candidate" },
        { key: "company", label: "Company" },
        { key: "score", label: "Match", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          name: "Priya Nair",
          company: "Finovate Labs",
          score: { kind: "score", value: 92 },
          status: { kind: "status", value: "Interview Scheduled" },
        },
        {
          name: "Rohan Mehta",
          company: "Cartwheel",
          score: { kind: "score", value: 87 },
          status: { kind: "status", value: "Interested" },
        },
        {
          name: "Sneha Kulkarni",
          company: "Mural Health",
          score: { kind: "score", value: 78 },
          status: { kind: "status", value: "Contacted" },
        },
        {
          name: "Arjun Verma",
          company: "Zenlytic",
          score: { kind: "score", value: 84 },
          status: { kind: "status", value: "Screening" },
        },
      ],
    },
    empty: {
      title: "Your pool is empty",
      description: "Run an AI candidate search to start building your talent pool.",
      actionLabel: "Search Candidates",
    },
  },
  saved: {
    href: ROUTES.saved,
    title: "Saved Lists",
    description: "Organise candidates into reusable talent pools and shortlists.",
    metrics: [
      { label: "Lists", value: "16" },
      { label: "Candidates saved", value: "1,908" },
      { label: "Shared with team", value: "6" },
    ],
    table: {
      title: "Your lists",
      columns: [
        { key: "list", label: "List" },
        { key: "candidates", label: "Candidates", align: "right" },
        { key: "updated", label: "Updated" },
      ],
      rows: [
        { list: "Backend bench — Bengaluru", candidates: 214, updated: "2h ago" },
        { list: "Design leaders 2026", candidates: 88, updated: "Yesterday" },
        { list: "Data platform shortlist", candidates: 132, updated: "4d ago" },
      ],
    },
    empty: {
      title: "No saved lists",
      description: "Save candidates from search results into lists you can reuse across jobs.",
      actionLabel: "Create List",
    },
  },
  outreachNew: {
    href: ROUTES.outreachNew,
    title: "Create Campaign",
    description:
      "Build a multi-channel outreach sequence with qualification and review.",
    metrics: [],
    empty: {
      title: "Create a campaign",
      description:
        "Set up audience, channels and sequence to start reaching candidates.",
      actionLabel: "Back to Outreach",
    },
  },
  huntlo360New: {
    href: ROUTES.huntlo360New,
    title: "Create Workflow",
    description:
      "Build an end-to-end workflow from outreach to scheduled interviews.",
    metrics: [],
    empty: {
      title: "Create a workflow",
      description:
        "Configure outreach, qualification, screening and scheduling in seven steps.",
      actionLabel: "Back to Huntlo 360",
    },
  },
  peopleScout: {
    href: ROUTES.peopleScout,
    title: "People Scout",
    description:
      "Always-on agentic sourcing that discovers new matching candidates while you sleep.",
    metrics: [
      { label: "Active scouts", value: "4" },
      { label: "New candidates found", value: "127", change: "+41 this week", trend: "up" },
      { label: "Auto-shortlisted", value: "23" },
    ],
    table: {
      title: "Scout runs",
      columns: [
        { key: "scout", label: "Scout" },
        { key: "found", label: "Found", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          scout: "Backend Engineer — Bengaluru",
          found: 48,
          status: { kind: "status", value: "Running" },
        },
        {
          scout: "Product Designer — Remote",
          found: 31,
          status: { kind: "status", value: "Running" },
        },
        {
          scout: "Engineering Manager — Hyderabad",
          found: 12,
          status: { kind: "status", value: "Paused" },
        },
      ],
    },
    empty: {
      title: "Set up your first scout",
      description:
        "Define an ideal profile once and People Scout will keep discovering matches.",
      actionLabel: "Create Scout",
    },
  },
  outreach: {
    href: ROUTES.outreach,
    title: "Outreach",
    description: "Run multi-step email, WhatsApp and AI voice campaigns.",
    metrics: [
      { label: "Active campaigns", value: "6" },
      { label: "Reply rate", value: "31.4%", change: "+4.2 pts", trend: "up" },
      { label: "Messages sent", value: "4,812", hint: "Last 30 days" },
    ],
    table: {
      title: "Campaigns",
      columns: [
        { key: "campaign", label: "Campaign" },
        { key: "channel", label: "Channel" },
        { key: "replies", label: "Replies", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          campaign: "Backend Engineer — Sequence A",
          channel: { kind: "channel", value: "Email" },
          replies: 46,
          status: { kind: "status", value: "Running" },
        },
        {
          campaign: "Data Engineer — WhatsApp blast",
          channel: { kind: "channel", value: "WhatsApp" },
          replies: 38,
          status: { kind: "status", value: "Running" },
        },
        {
          campaign: "EM voice screen invite",
          channel: { kind: "channel", value: "AI Voice" },
          replies: 12,
          status: { kind: "status", value: "Scheduled" },
        },
        {
          campaign: "Design leads Q2",
          channel: { kind: "channel", value: "Email" },
          replies: 74,
          status: { kind: "status", value: "Completed" },
        },
      ],
    },
    empty: {
      title: "No campaigns yet",
      description: "Create an outreach campaign to start engaging saved candidates.",
      actionLabel: "Create Campaign",
    },
  },
  huntlo360: {
    href: ROUTES.huntlo360,
    title: "Huntlo 360",
    description:
      "Orchestrate sourcing, outreach, screening and scheduling as one continuous agentic flow.",
    metrics: [
      { label: "Active flows", value: "2" },
      { label: "Candidates in flows", value: "356" },
      { label: "Fully automated hires", value: "3", hint: "This quarter" },
    ],
    chart: {
      type: "bar",
      title: "Flow throughput",
      description: "Candidates advanced per stage this week",
      series: { primary: "Advanced" },
      data: [
        { label: "Sourced", primary: 356 },
        { label: "Contacted", primary: 288 },
        { label: "Replied", primary: 112 },
        { label: "Screened", primary: 64 },
        { label: "Qualified", primary: 38 },
        { label: "Scheduled", primary: 21 },
      ],
    },
    empty: {
      title: "Launch your first 360 flow",
      description:
        "Connect search, outreach, screening and scheduling into a single automated pipeline.",
      actionLabel: "Create Flow",
    },
  },
  conversations: {
    href: ROUTES.conversations,
    title: "Conversations",
    description: "Every candidate reply across email, WhatsApp and voice in one inbox.",
    metrics: [
      { label: "Unread", value: "12", change: "+5 today", trend: "up" },
      { label: "Awaiting your reply", value: "7" },
      { label: "Avg. response time", value: "1.8h", change: "-22%", trend: "up" },
    ],
    table: {
      title: "Latest replies",
      columns: [
        { key: "candidate", label: "Candidate" },
        { key: "channel", label: "Channel" },
        { key: "preview", label: "Message" },
        { key: "when", label: "Received" },
      ],
      rows: [
        {
          candidate: "Rohan Mehta",
          channel: { kind: "channel", value: "WhatsApp" },
          preview: "Yes, I'm open to discussing the role…",
          when: "38m ago",
        },
        {
          candidate: "Sneha Kulkarni",
          channel: { kind: "channel", value: "Email" },
          preview: "Sharing my updated portfolio here.",
          when: "3h ago",
        },
        {
          candidate: "Arjun Verma",
          channel: { kind: "channel", value: "AI Voice" },
          preview: "Screening call completed · 14 min",
          when: "1d ago",
        },
      ],
    },
    empty: {
      title: "No conversations",
      description: "Candidate replies from your campaigns will land here.",
    },
  },
  templates: {
    href: ROUTES.templates,
    title: "Templates",
    description: "Reusable message, screening and scheduling templates for your team.",
    metrics: [
      { label: "Templates", value: "32" },
      { label: "Team shared", value: "18" },
      { label: "Best reply rate", value: "44%", hint: "“Warm intro — backend”" },
    ],
    table: {
      title: "Popular templates",
      columns: [
        { key: "template", label: "Template" },
        { key: "channel", label: "Channel" },
        { key: "replyRate", label: "Reply rate", align: "right" },
      ],
      rows: [
        {
          template: "Warm intro — backend",
          channel: { kind: "channel", value: "Email" },
          replyRate: "44%",
        },
        {
          template: "Quick check-in",
          channel: { kind: "channel", value: "WhatsApp" },
          replyRate: "38%",
        },
        {
          template: "Screen invite — voice",
          channel: { kind: "channel", value: "AI Voice" },
          replyRate: "29%",
        },
      ],
    },
    empty: {
      title: "No templates yet",
      description: "Create templates to keep outreach consistent and fast.",
      actionLabel: "New Template",
    },
  },
  screening: {
    href: ROUTES.screening,
    title: "AI Screening",
    description: "Screen candidates at scale with conversational AI voice agents.",
    metrics: [
      { label: "Voice minutes left", value: "480", hint: "Growth Plan" },
      { label: "Screens completed", value: "164", change: "+38 this week", trend: "up" },
      { label: "Qualification rate", value: "41%" },
    ],
    table: {
      title: "Screening batches",
      columns: [
        { key: "batch", label: "Batch" },
        { key: "completed", label: "Completed", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          batch: "Backend Engineer — Round 1",
          completed: "18 / 20",
          status: { kind: "status", value: "Running" },
        },
        {
          batch: "Data Engineer — Round 1",
          completed: "24 / 24",
          status: { kind: "status", value: "Completed" },
        },
        {
          batch: "Design — Portfolio check",
          completed: "0 / 15",
          status: { kind: "status", value: "Scheduled" },
        },
      ],
    },
    empty: {
      title: "No screenings yet",
      description: "Select candidates and let the AI voice agent qualify them for you.",
      actionLabel: "Start Screening",
    },
  },
  screeningNew: {
    href: ROUTES.screeningNew,
    title: "Create Screening",
    description:
      "Configure a voice screening batch: agent, questions, evaluation and call settings.",
    metrics: [],
    empty: {
      title: "Create a screening",
      description:
        "Set up the voice agent, questions and evaluation rules to start calling candidates.",
      actionLabel: "Back to AI Screening",
    },
  },
  screeningResults: {
    href: ROUTES.screeningResults,
    title: "Screening Results",
    description: "Qualification outcomes, transcripts and AI recommendations.",
    metrics: [
      { label: "Qualified", value: "67", change: "+12", trend: "up" },
      { label: "Not a fit", value: "58" },
      { label: "Needs review", value: "9", hint: "Low-confidence outcomes" },
    ],
    table: {
      title: "Latest results",
      columns: [
        { key: "candidate", label: "Candidate" },
        { key: "batch", label: "Batch" },
        { key: "score", label: "Score", align: "right" },
        { key: "status", label: "Outcome" },
      ],
      rows: [
        {
          candidate: "Priya Nair",
          batch: "Backend R1",
          score: { kind: "score", value: 92 },
          status: { kind: "status", value: "Qualified" },
        },
        {
          candidate: "Arjun Verma",
          batch: "Backend R1",
          score: { kind: "score", value: 84 },
          status: { kind: "status", value: "Qualified" },
        },
        {
          candidate: "Nikhil Bose",
          batch: "Backend R1",
          score: { kind: "score", value: 52 },
          status: { kind: "status", value: "Rejected" },
        },
      ],
    },
    empty: {
      title: "No results yet",
      description: "Run an AI screening batch to see qualification outcomes here.",
    },
  },
  assessments: {
    href: ROUTES.assessments,
    title: "Assessments",
    description: "Structured skill assessments and scorecards for shortlisted candidates.",
    metrics: [
      { label: "Active assessments", value: "5" },
      { label: "Completion rate", value: "76%" },
      { label: "Avg. score", value: "71", hint: "Across all assessments" },
    ],
    table: {
      title: "Assessments",
      columns: [
        { key: "assessment", label: "Assessment" },
        { key: "invited", label: "Invited", align: "right" },
        { key: "completed", label: "Completed", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          assessment: "Go systems design",
          invited: 32,
          completed: 24,
          status: { kind: "status", value: "Active" },
        },
        {
          assessment: "SQL & data modelling",
          invited: 28,
          completed: 22,
          status: { kind: "status", value: "Active" },
        },
        {
          assessment: "Design critique",
          invited: 15,
          completed: 0,
          status: { kind: "status", value: "Draft" },
        },
      ],
    },
    empty: {
      title: "No assessments",
      description: "Create an assessment to evaluate shortlisted candidates consistently.",
      actionLabel: "Create Assessment",
    },
  },
  interviews: {
    href: ROUTES.interviews,
    title: "Interviews",
    description: "Track upcoming interviews and send scheduling links.",
    metrics: [
      { label: "Today", value: "3" },
      { label: "This week", value: "14", change: "+4 vs last week", trend: "up" },
      { label: "No-show rate", value: "6%", change: "-2 pts", trend: "up" },
    ],
    table: {
      title: "Upcoming interviews",
      columns: [
        { key: "candidate", label: "Candidate" },
        { key: "job", label: "Job" },
        { key: "when", label: "When" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          candidate: "Priya Nair",
          job: "Senior Backend Engineer",
          when: "Tomorrow, 11:00 AM",
          status: { kind: "status", value: "Scheduled" },
        },
        {
          candidate: "Rohan Mehta",
          job: "Data Engineer",
          when: "Thu, 3:30 PM",
          status: { kind: "status", value: "Awaiting Response" },
        },
        {
          candidate: "Meera Pillai",
          job: "Product Designer",
          when: "Fri, 10:00 AM",
          status: { kind: "status", value: "Scheduled" },
        },
      ],
    },
    empty: {
      title: "No interviews scheduled",
      description: "Send scheduling links to qualified candidates to fill your calendar.",
      actionLabel: "Schedule Interview",
    },
  },
  calendar: {
    href: ROUTES.calendar,
    title: "Calendar",
    description: "A shared view of interviews across your hiring team.",
    metrics: [
      { label: "Interviews this month", value: "52" },
      { label: "Panel hours booked", value: "39h" },
      { label: "Reschedules", value: "4", hint: "This month" },
    ],
    chart: {
      type: "bar",
      title: "Interview load by day",
      description: "This week across all interviewers",
      series: { primary: "Interviews" },
      data: [
        { label: "Mon", primary: 4 },
        { label: "Tue", primary: 6 },
        { label: "Wed", primary: 3 },
        { label: "Thu", primary: 7 },
        { label: "Fri", primary: 5 },
      ],
    },
    empty: {
      title: "Calendar is clear",
      description: "Scheduled interviews will appear on the team calendar.",
    },
  },
  availability: {
    href: ROUTES.availability,
    title: "Availability",
    description: "Manage scheduling links, working hours and interviewer capacity.",
    metrics: [
      { label: "Active scheduling links", value: "7" },
      { label: "Bookable hours / week", value: "22h" },
      { label: "Link conversion", value: "63%", hint: "Bookings per link visit" },
    ],
    table: {
      title: "Scheduling links",
      columns: [
        { key: "link", label: "Link" },
        { key: "duration", label: "Duration" },
        { key: "bookings", label: "Bookings", align: "right" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          link: "Screening call — 30 min",
          duration: "30 min",
          bookings: 41,
          status: { kind: "status", value: "Active" },
        },
        {
          link: "Panel interview — 60 min",
          duration: "60 min",
          bookings: 18,
          status: { kind: "status", value: "Active" },
        },
        {
          link: "Founder chat — 20 min",
          duration: "20 min",
          bookings: 6,
          status: { kind: "status", value: "Paused" },
        },
      ],
    },
    empty: {
      title: "No scheduling links",
      description: "Create a scheduling link to let candidates pick a time that works.",
      actionLabel: "Create Link",
    },
  },
  analytics: {
    href: ROUTES.analytics,
    title: "Analytics",
    description: "Funnel performance across sourcing, outreach, screening and hiring.",
    metrics: [
      { label: "Sourced → replied", value: "23%", change: "+3 pts", trend: "up" },
      { label: "Replied → qualified", value: "41%", change: "+1.5 pts", trend: "up" },
      { label: "Qualified → hired", value: "12%", change: "-0.8 pts", trend: "down" },
    ],
    chart: pipelineChart,
    empty: {
      title: "Not enough data yet",
      description: "Run campaigns and screenings to unlock funnel analytics.",
    },
  },
  reports: {
    href: ROUTES.reports,
    title: "Reports",
    description: "Exportable summaries for stakeholders and hiring reviews.",
    metrics: [
      { label: "Saved reports", value: "9" },
      { label: "Scheduled emails", value: "3", hint: "Weekly digests" },
      { label: "Last export", value: "2d ago" },
    ],
    table: {
      title: "Recent reports",
      columns: [
        { key: "report", label: "Report" },
        { key: "range", label: "Range" },
        { key: "status", label: "Status" },
      ],
      rows: [
        {
          report: "Q3 hiring funnel",
          range: "Jul – Sep",
          status: { kind: "status", value: "Completed" },
        },
        {
          report: "Outreach performance — June",
          range: "Jun",
          status: { kind: "status", value: "Completed" },
        },
        {
          report: "Weekly sourcing digest",
          range: "Rolling 7 days",
          status: { kind: "status", value: "Scheduled" },
        },
      ],
    },
    empty: {
      title: "No reports",
      description: "Build a report once and schedule it to send itself.",
      actionLabel: "New Report",
    },
  },
  integrations: {
    href: ROUTES.integrations,
    title: "Integrations",
    description: "Connect email, WhatsApp, voice, calendars and your ATS.",
    metrics: [
      { label: "Connected", value: "2" },
      { label: "Available", value: "14" },
      { label: "Sync health", value: "100%", hint: "No failing syncs" },
    ],
    empty: {
      title: "Connect your stack",
      description: "Hook up Google Workspace, WhatsApp Business, Calendly and your ATS.",
      actionLabel: "Browse Integrations",
    },
  },
  team: {
    href: ROUTES.team,
    title: "Team",
    description: "Manage members, roles and seat usage for Acme Talent Partners.",
    metrics: [
      { label: "Members", value: "9", hint: "of 12 seats" },
      { label: "Admins", value: "2" },
      { label: "Pending invites", value: "1" },
    ],
    table: {
      title: "Members",
      columns: [
        { key: "member", label: "Member" },
        { key: "role", label: "Role" },
        { key: "lastActive", label: "Last active" },
      ],
      rows: [
        { member: "Ananya Sharma", role: "Admin · Senior Recruiter", lastActive: "Now" },
        { member: "Vikram Shah", role: "Admin", lastActive: "1h ago" },
        { member: "Neha Gupta", role: "Recruiter", lastActive: "Yesterday" },
        { member: "Aditya Rao", role: "Hiring Manager", lastActive: "3d ago" },
      ],
    },
    empty: {
      title: "Invite your team",
      description: "Collaborate on jobs, share lists and split outreach work.",
      actionLabel: "Invite Member",
    },
  },
  plans: {
    href: ROUTES.plans,
    title: "Plans & Usage",
    description: "Your Growth Plan subscription, credit balances and usage trends.",
    metrics: [
      { label: "Candidate searches left", value: "7,420", hint: "of 10,000" },
      { label: "Email reveals left", value: "1,860", hint: "of 2,500" },
      { label: "AI voice minutes left", value: "480", hint: "of 600" },
    ],
    chart: {
      type: "bar",
      title: "Credit consumption",
      description: "Credits used per week, all types",
      series: { primary: "Credits used" },
      data: [
        { label: "W1", primary: 820 },
        { label: "W2", primary: 1140 },
        { label: "W3", primary: 960 },
        { label: "W4", primary: 1275 },
      ],
    },
    empty: {
      title: "Usage details",
      description: "Detailed per-member and per-job usage breakdowns are coming soon.",
    },
  },
  profile: {
    href: ROUTES.profile,
    title: "Profile",
    description: "Your personal details, signature and notification preferences.",
    metrics: [
      { label: "Campaigns owned", value: "6" },
      { label: "Candidates sourced", value: "1,204" },
      { label: "Hires influenced", value: "8", hint: "Last 12 months" },
    ],
    empty: {
      title: "Profile settings",
      description: "Update your name, title, signature and notification preferences here.",
      actionLabel: "Edit Profile",
    },
  },
  settings: {
    href: ROUTES.settings,
    title: "Settings",
    description: "Workspace defaults, branding, compliance and data controls.",
    metrics: [
      { label: "Workspace members", value: "9" },
      { label: "Data region", value: "IN" },
      { label: "Retention policy", value: "24 mo" },
    ],
    empty: {
      title: "Workspace settings",
      description:
        "Configure sending domains, compliance footers and default working hours.",
      actionLabel: "Open Settings",
    },
  },
};
