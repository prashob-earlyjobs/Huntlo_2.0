import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

export const FOLLOW_UP_AUTOMATION_PATH = "/follow-up-automation";

export const FOLLOW_UP_AUTOMATION_SEO = {
  title: "Hiring Momentum Intelligence & Follow-up Automation | Huntlo",
  description:
    "Huntlo Hiring Momentum Intelligence helps recruiting teams keep hiring moving — combining conversation intelligence, readiness, and engagement so candidate experiences stay seamless and hiring velocity improves.",
  ogTitle: "Great Hiring Doesn't Slow Down. Great Hiring Maintains Momentum.",
  ogDescription:
    "Hiring doesn't break because of talent. It breaks because momentum is lost. Explore Huntlo Hiring Momentum Intelligence.",
} as const;

export function followUpAutomationMetadata() {
  return buildPageMetadata({
    title: FOLLOW_UP_AUTOMATION_SEO.title,
    description: FOLLOW_UP_AUTOMATION_SEO.description,
    ogTitle: FOLLOW_UP_AUTOMATION_SEO.ogTitle,
    ogDescription: FOLLOW_UP_AUTOMATION_SEO.ogDescription,
    ogImage: OG_IMAGES.platform,
    path: FOLLOW_UP_AUTOMATION_PATH,
  });
}

export const FOLLOW_UP_AUTOMATION_GEO = {
  askTopic: "Huntlo Hiring Momentum Intelligence",
  askPrompt:
    "What is Huntlo Hiring Momentum Intelligence on /follow-up-automation (https://www.huntlo.ai/follow-up-automation)? How is it different from follow-up automation, and how does it improve hiring velocity and candidate experiences?",
} as const;

export const HERO_MOMENTUM_FLOW = [
  "Candidate Discovery",
  "Candidate Conversations",
  "Response Intelligence",
  "Hiring Readiness",
  "Scheduling Intelligence",
  "Interview Intelligence",
  "Hiring Momentum",
  "Hiring Outcomes",
  "Huntlo",
] as const;

export const TRADITIONAL_FLOW = [
  "Candidate found",
  "Message sent",
  "Waiting",
  "Follow up",
  "Waiting again",
  "Interview scheduled",
  "Waiting again",
  "Repeat",
] as const;

export const MODERN_FLOW = [
  "Discovery",
  "Conversations",
  "Hiring Readiness",
  "Scheduling",
  "Interviews",
  "Hiring Decisions",
  "Offers",
  "Hiring Outcomes",
] as const;

export const MOMENTUM_STRUGGLES = [
  "Delayed responses",
  "Missed follow-ups",
  "Fragmented communication",
  "Candidate drop-offs",
  "Interview delays",
  "Recruiter productivity",
  "Longer hiring cycles",
] as const;

export const MOMENTUM_COMBINES = [
  "Candidate Context",
  "Conversation Intelligence",
  "Hiring Readiness",
  "Interview Intelligence",
  "Candidate Engagement",
  "Business Priorities",
  "Hiring Velocity",
] as const;

export const CANDIDATES_REMEMBER = [
  "Responsiveness",
  "Consistency",
  "Transparency",
  "Communication",
  "Experiences",
] as const;

export const MEET_HUNTLO_FLOW = [
  "Candidate Discovery",
  "Candidate Intelligence",
  "Conversation Intelligence",
  "Hiring Momentum Intelligence",
  "AI Recruiting Agents",
  "Hiring Outcomes",
  "AI Hiring Infrastructure",
] as const;

export const MOMENTUM_IMPROVES = [
  "Candidate experiences",
  "Recruiter productivity",
  "Hiring velocity",
  "Candidate engagement",
  "Business outcomes",
  "Talent relationships",
] as const;

export const AGENT_FLOW = [
  "AI Engagement Agent",
  "Conversation Intelligence",
  "Hiring Momentum",
  "Interview Intelligence",
  "Candidate Experiences",
  "Hiring Outcomes",
  "Recruiter Productivity",
] as const;

export const INFRA_CHANGES = [
  "Hiring velocity",
  "Recruiter productivity",
  "Candidate experiences",
  "Business outcomes",
] as const;

export const FUTURE_EQUATION = [
  "People",
  "Relationships",
  "Context",
  "Experiences",
  "Hiring Velocity",
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
  "Hiring Momentum Intelligence",
  "Hiring Intelligence",
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
  "Enterprise governance",
  "Scalability",
  "Integrations",
  "Compliance",
  "Recruiter productivity",
  "Workflow intelligence",
] as const;

export const FOLLOW_UP_AUTOMATION_FAQS = [
  {
    question: "What is Hiring Momentum Intelligence?",
    answer:
      "Hiring Momentum Intelligence helps recruiting teams keep hiring moving by understanding candidate context, conversations, readiness, engagement, and business priorities — so workflows don't stall between stages.",
  },
  {
    question: "How is it different from follow-up automation?",
    answer:
      "Follow-up automation focuses on reminders and sequences. Hiring Momentum Intelligence focuses on which candidate interaction should happen next — maintaining experiences, velocity, and outcomes as part of AI Hiring Intelligence Infrastructure.",
  },
  {
    question: "Can Huntlo automate candidate engagement?",
    answer:
      "Huntlo helps reduce missed follow-ups and fragmented communication through intelligent momentum across conversations, scheduling, and interviews. Recruiters remain responsible for relationships and decisions.",
  },
  {
    question: "How does Huntlo improve hiring velocity?",
    answer:
      "By reducing the wait-follow-up-wait cycle and connecting discovery, conversations, readiness, scheduling, interviews, and decisions without losing momentum between stages.",
  },
  {
    question: "Can enterprises customize workflows?",
    answer:
      "Yes. Enterprise teams can operate connected hiring momentum workflows with governance, compliance, integrations, scalability, and multi-recruiter support.",
  },
  {
    question: "How do AI Recruiting Agents maintain candidate momentum?",
    answer:
      "AI Engagement Agents help improve when and how candidate interactions continue using conversation intelligence and hiring momentum signals. Humans remain accountable for judgment and relationships.",
  },
  {
    question: "What role does Candidate Context play?",
    answer:
      "Candidate Context helps the next interaction begin with understanding — so engagement feels continuous and relevant rather than like another disconnected reminder.",
  },
  {
    question: "How does Huntlo reduce candidate drop-offs?",
    answer:
      "By keeping conversations, readiness, scheduling, and interviews connected — reducing delays, fragmentation, and inconsistent experiences that cause candidates to disengage.",
  },
  {
    question: "Is Hiring Momentum the same as reminder sequences?",
    answer:
      "No. Candidates don't remember how many reminders were sent. They remember responsiveness, consistency, transparency, communication, and experiences. Momentum is experience-driven, not reminder-driven.",
  },
  {
    question: "Why does hiring break even when talent is strong?",
    answer:
      "Great candidates don't disappear overnight. Hiring slows when conversations stop, follow-ups are delayed, interviews are missed, and experiences become fragmented. The gap is momentum.",
  },
  {
    question: "What should teams ask instead of did we send another reminder?",
    answer:
      "Ask which candidate interaction should happen next — based on context, readiness, engagement, and hiring velocity.",
  },
  {
    question: "Is Hiring Momentum becoming infrastructure?",
    answer:
      "Yes. Modern recruiting is becoming momentum driven, not follow-up driven. Future hiring connects people, relationships, context, experiences, velocity, and outcomes into AI Hiring Infrastructure.",
  },
  {
    question: "Who is Hiring Momentum Intelligence built for?",
    answer:
      "Enterprise hiring teams, GCC leaders, technical recruiters, executive hiring teams, staffing firms, recruitment agencies, and high-volume teams that need continuous hiring motion — not more reminder tools.",
  },
  {
    question: "Does Huntlo replace human follow-up?",
    answer:
      "No. Huntlo is designed so AI improves timing and continuity while humans remain responsible for relationships, judgment, and hiring decisions.",
  },
  {
    question: "How does this fit Huntlo's broader positioning?",
    answer:
      "Huntlo is AI Hiring Intelligence Infrastructure — connecting Candidate Discovery, Context, Conversation and Response Intelligence, Hiring Readiness and Confidence, Scheduling, Interview, Hiring Momentum, Hiring Intelligence, Business Alignment, and Hiring Outcomes.",
  },
  {
    question: "Is Huntlo still an AI recruiting platform?",
    answer:
      "Huntlo's positioning has evolved. It is AI Hiring Intelligence Infrastructure — focused on better hiring decisions and continuous momentum, not only recruiting automation features.",
  },
  {
    question: "How do candidates experience hiring without fragmentation?",
    answer:
      "When discovery, conversations, readiness, scheduling, interviews, decisions, and offers stay connected without losing momentum — candidates experience conversations, not disconnected workflows.",
  },
  {
    question: "Will recruiters still manage engagement manually?",
    answer:
      "Recruiters stay accountable for relationships and decisions. Intelligent systems help maintain which interactions should happen next so momentum isn't lost between stages.",
  },
  {
    question: "How does momentum create better hiring outcomes?",
    answer:
      "Future teams optimize hiring momentum rather than follow-up sequences — continuously improving experiences, productivity, velocity, engagement, outcomes, and talent relationships.",
  },
  {
    question: "How does Hiring Momentum relate to Scheduling and Interview Intelligence?",
    answer:
      "Scheduling and Interview Intelligence improve when and how conversations happen. Hiring Momentum Intelligence keeps those stages connected so hiring doesn't stall between them.",
  },
  {
    question: "Can Huntlo support high-volume hiring operations?",
    answer:
      "Yes. The approach is built for enterprise, GCC, technical, executive, staffing, agency, and high-volume environments with governance, compliance, integrations, and scale.",
  },
  {
    question: "How do I get started with Huntlo Hiring Momentum Intelligence?",
    answer:
      "Book a demo to see Hiring Momentum in your process, explore related hiring intelligence pages, or create an account to get started.",
  },
] as const;
