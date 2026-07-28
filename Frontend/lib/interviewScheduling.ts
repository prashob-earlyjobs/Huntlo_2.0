import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const INTERVIEW_SCHEDULING_PATH = "/interview-scheduling";

export const INTERVIEW_SCHEDULING_SEO = {
  title: "Scheduling Intelligence & Interview Scheduling | Huntlo",
  description:
    "Huntlo Scheduling Intelligence helps recruiting teams create seamless candidate experiences — combining workflow intelligence, hiring readiness, and interview intelligence for faster hiring velocity.",
  ogTitle: "Great Hiring Doesn't Begin With Better Scheduling. It Begins With Better Candidate Experiences.",
  ogDescription:
    "Candidates shouldn't experience scheduling. They should experience great hiring. Explore Huntlo Scheduling Intelligence.",
} as const;

export function interviewSchedulingMetadata() {
  return buildPageMetadata({
    title: INTERVIEW_SCHEDULING_SEO.title,
    description: INTERVIEW_SCHEDULING_SEO.description,
    ogTitle: INTERVIEW_SCHEDULING_SEO.ogTitle,
    ogDescription: INTERVIEW_SCHEDULING_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: INTERVIEW_SCHEDULING_PATH,
  });
}

export const INTERVIEW_SCHEDULING_GEO = {
  askTopic: "Huntlo Scheduling Intelligence",
  askPrompt:
    "What is Huntlo Scheduling Intelligence on /interview-scheduling (https://www.huntlo.ai/interview-scheduling)? How is it different from interview scheduling software like Calendly, and how does it improve candidate experiences and hiring velocity?",
} as const;

export const HERO_SCHEDULING_FLOW = [
  "Candidate Discovery",
  "Candidate Conversations",
  "Hiring Readiness",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "Candidate Experiences",
  "Hiring Velocity",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const POSITIONING_JOURNEY = [
  "Scheduling Intelligence",
  "Candidate Experiences",
  "Hiring Velocity",
  "Recruiter Productivity",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const RECRUITER_COORDINATES = [
  "Candidate availability",
  "Hiring managers",
  "Interview panels",
  "Follow-ups",
  "Scheduling changes",
  "Communication workflows",
  "Hiring timelines",
] as const;

export const CANDIDATE_FEELS = [
  "Delays",
  "Fragmented communication",
  "Inconsistent scheduling",
  "Poor experiences",
  "Interview confusion",
] as const;

export const TEAMS_OPTIMIZE = [
  "Sourcing",
  "Engagement",
  "Screening",
  "Assessments",
  "Interviews",
] as const;

export const FRICTION_CHAIN = [
  "Candidate available?",
  "Hiring manager available?",
  "Interview slots?",
  "Follow-ups?",
  "Rescheduling?",
  "Candidate updates?",
  "Repeat",
] as const;

export const SCHEDULING_INTELLIGENCE_COMBINES = [
  "Candidate Context",
  "Candidate Availability",
  "Workflow Intelligence",
  "Interview Intelligence",
  "Business Priorities",
  "Hiring Velocity",
  "Candidate Experiences",
] as const;

export const EARLIER_LOOP = [
  "Candidate Signals",
  "Conversation Intelligence",
  "Hiring Readiness",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "Business Alignment",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Candidate Intelligence",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "AI Recruiting Agents",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const SCHEDULING_IMPROVES = [
  "Recruiter productivity",
  "Candidate experiences",
  "Hiring confidence",
  "Hiring velocity",
  "Business outcomes",
] as const;

export const AGENT_FLOW = [
  "AI Scheduling Agent",
  "Candidate Context",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "Hiring Velocity",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const CANDIDATES_REMEMBER = [
  "Responsiveness",
  "Transparency",
  "Communication",
  "Experiences",
  "Relationships",
] as const;

export const INFRA_CHANGES = [
  "Recruiter productivity",
  "Hiring velocity",
  "Candidate experiences",
  "Business outcomes",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Context",
  "Experiences",
  "Relationships",
  "Intelligence",
  "Hiring Outcomes",
] as const;

export const STRATEGIC_STACK = [
  "AI Hiring Intelligence Infrastructure",
  "Candidate Discovery",
  "Candidate Context Intelligence",
  "Conversation Intelligence",
  "Response Intelligence",
  "Hiring Readiness Intelligence",
  "Hiring Confidence Intelligence",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "Business Alignment Intelligence",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const ENTERPRISE_BUILT_FOR = [
  { label: "Enterprise hiring", href: "/solutions/enterprise-hiring" },
  { label: "GCC hiring", href: "/solutions/gccs" },
  { label: "Technical hiring", href: "/solutions/startups" },
  { label: "Executive hiring", href: "/solutions/executive-search" },
  { label: "Staffing firms", href: "/solutions/staffing-agencies" },
  { label: "Recruitment agencies", href: "/solutions/recruitment-firms" },
  { label: "High-volume hiring", href: "/solutions" },
] as const;

export const ENTERPRISE_SUPPORTS = [
  "Enterprise workflows",
  "Governance",
  "Integrations",
  "Compliance",
  "Scalability",
  "Recruiter productivity",
] as const;

export const INTERVIEW_SCHEDULING_FAQS = [
  {
    question: "What is Scheduling Intelligence?",
    answer:
      "Scheduling Intelligence helps recruiting teams create seamless candidate experiences by understanding candidate context, availability, workflow intelligence, and hiring velocity — before interviews are scheduled — so hiring moves faster without operational chaos.",
  },
  {
    question: "How is it different from interview scheduling software?",
    answer:
      "Interview scheduling software focuses on calendar slots, invites, and availability. Scheduling Intelligence focuses on which candidate interaction should happen next — improving experiences, velocity, and hiring outcomes as part of AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "Is Huntlo like Calendly for recruiting?",
    answer:
      "No. Calendly sells scheduling. Huntlo sells Hiring Intelligence — Scheduling Intelligence is one layer that connects conversations, readiness, interviews, experiences, and outcomes.",
  },
  {
    question: "Can Huntlo automate candidate scheduling?",
    answer:
      "Huntlo helps reduce fragmented coordination across candidates, hiring managers, panels, and follow-ups through intelligent workflows. Recruiters stay accountable for relationships and decisions while systems reduce operational complexity.",
  },
  {
    question: "How does Huntlo improve hiring velocity?",
    answer:
      "By reducing the cycle of availability checks, rescheduling, and fragmented updates — connecting scheduling intelligence with readiness, interview intelligence, and candidate experiences so hiring moves with less friction.",
  },
  {
    question: "Can enterprises customize hiring workflows?",
    answer:
      "Yes. Enterprise teams can operate connected scheduling and interview workflows with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "How do AI Recruiting Agents improve scheduling?",
    answer:
      "AI Scheduling Agents help improve when and how candidate interactions are coordinated using context and workflow intelligence. Humans remain responsible for relationships, judgment, and hiring decisions.",
  },
  {
    question: "What role does Candidate Context play?",
    answer:
      "Candidate Context helps scheduling begin with understanding — readiness, signals, and priorities — so interactions feel seamless rather than like disconnected calendar logistics.",
  },
  {
    question: "Why isn't scheduling a calendar problem?",
    answer:
      "Recruiters coordinate availability, panels, follow-ups, and timelines while candidates experience delays and fragmentation. The gap is usually workflow intelligence and candidate experience — not calendars alone.",
  },
  {
    question: "What should teams ask instead of which slot to send?",
    answer:
      "Ask which candidate experience should be created next — based on context, readiness, business priorities, and hiring velocity.",
  },
  {
    question: "Is Scheduling Intelligence becoming infrastructure?",
    answer:
      "Yes. Future teams will ask which candidate interaction should happen next, not only which interview slot is available. That shift makes scheduling part of hiring infrastructure.",
  },
  {
    question: "Who is Scheduling Intelligence built for?",
    answer:
      "Enterprise hiring teams, GCC leaders, technical recruiters, executive hiring teams, staffing firms, recruitment agencies, and high-volume teams that need better experiences and velocity — not more calendar tools.",
  },
  {
    question: "Does Huntlo replace human coordination?",
    answer:
      "No. Huntlo is designed so AI improves timing, context, and workflow continuity while humans remain responsible for relationships, judgment, and hiring outcomes.",
  },
  {
    question: "How does this fit Huntlo's broader positioning?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure — connecting Candidate Discovery, Context, Conversation and Response Intelligence, Hiring Readiness and Confidence, Scheduling Intelligence, Interview Intelligence, Business Alignment, and Hiring Outcomes.",
  },
  {
    question: "What do candidates remember about scheduling?",
    answer:
      "Candidates don't remember calendar invites. They remember responsiveness, transparency, communication, experiences, and relationships. Future teams optimize experiences, not only schedules.",
  },
  {
    question: "How does scheduling become hiring intelligence?",
    answer:
      "Future teams won't optimize calendar workflows alone. They'll optimize hiring velocity — improving productivity, experiences, confidence, and business outcomes together.",
  },
  {
    question: "Will recruiters still manage interview logistics?",
    answer:
      "Yes. Logistics remain part of hiring. Scheduling Intelligence helps ensure the right interactions happen next with less fragmentation and better candidate experiences.",
  },
  {
    question: "How does Huntlo connect scheduling to hiring outcomes?",
    answer:
      "By connecting discovery, conversations, readiness, scheduling intelligence, interview intelligence, experiences, velocity, and recruiter productivity into one intelligence layer behind hiring decisions.",
  },
  {
    question: "Can Huntlo support high-volume interview operations?",
    answer:
      "Yes. The approach is built for enterprise, GCC, technical, executive, staffing, agency, and high-volume environments with governance, compliance, integrations, and scale.",
  },
  {
    question: "Is Huntlo building sourcing plus automation tools?",
    answer:
      "No. Huntlo is not a stack of sourcing, email, WhatsApp, scheduling, and screening features alone. It is building AI Hiring Intelligence Infrastructure for better hiring decisions and experiences.",
  },
  {
    question: "How does Scheduling Intelligence relate to Interview Intelligence?",
    answer:
      "Scheduling Intelligence improves when and how interactions move forward. Interview Intelligence deepens the quality of hiring conversations. Together they improve velocity, confidence, and outcomes.",
  },
  {
    question: "How do I get started with Huntlo Scheduling Intelligence?",
    answer:
      "Book a demo to see Scheduling Intelligence in your hiring process, explore related hiring intelligence pages, or create an account to get started.",
  },
] as const;
